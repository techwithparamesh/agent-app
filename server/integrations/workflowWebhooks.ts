import { Router } from 'express';
import { storage } from '../storage';
import { runWorkflow } from './workflowRunner';

const router = Router();

function findTriggerNode(workflow: any) {
  const nodes = Array.isArray(workflow?.nodes) ? workflow.nodes : [];
  return nodes.find((n: any) => n?.type === 'trigger') || null;
}

function getTriggerAppId(triggerNode: any): string {
  return String(triggerNode?.appId || triggerNode?.config?.appId || '');
}

function getTriggerId(triggerNode: any): string {
  return String(
    triggerNode?.triggerId ||
      triggerNode?.config?.selectedTriggerId ||
      triggerNode?.config?.triggerId ||
      triggerNode?.config?.id ||
      ''
  );
}

function getTriggerType(triggerNode: any, workflow: any): string {
  return String(triggerNode?.config?.triggerType || workflow?.triggerType || '');
}

function normalizeHeaders(headers: any): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers || {})) {
    if (Array.isArray(v)) out[k.toLowerCase()] = v.join(',');
    else if (v != null) out[k.toLowerCase()] = String(v);
  }
  return out;
}

function matchWebhookEvent(appId: string, triggerId: string, req: any): boolean {
  if (!appId || !triggerId) return true;

  const headers = normalizeHeaders(req.headers);
  const body = req.body;

  if (appId === 'paypal') {
    const eventType = String(body?.event_type || '').toUpperCase();
    const map: Record<string, string[]> = {
      payment_completed: ['PAYMENT.CAPTURE.COMPLETED', 'CHECKOUT.ORDER.APPROVED', 'CHECKOUT.ORDER.COMPLETED'],
      payment_refunded: ['PAYMENT.CAPTURE.REFUNDED', 'PAYMENT.SALE.REFUNDED'],
      subscription_activated: ['BILLING.SUBSCRIPTION.ACTIVATED'],
      subscription_cancelled: ['BILLING.SUBSCRIPTION.CANCELLED'],
    };
    const allowed = map[triggerId];
    if (!allowed) return true;
    return allowed.some((x) => eventType === x);
  }

  if (appId === 'zoom') {
    const event = String(body?.event || '').toLowerCase();
    const map: Record<string, string[]> = {
      meeting_started: ['meeting.started'],
      meeting_ended: ['meeting.ended'],
      participant_joined: ['meeting.participant_joined', 'meeting.participant_joined'],
      recording_completed: ['recording.completed'],
      webinar_registered: ['webinar.registration_created', 'webinar.registration_created'],
    };
    const allowed = map[triggerId];
    if (!allowed) return true;
    return allowed.some((x) => event === x);
  }

  if (appId === 'woocommerce') {
    const topic = String(headers['x-wc-webhook-topic'] || '').toLowerCase();
    const map: Record<string, string[]> = {
      order_created: ['order.created'],
      order_updated: ['order.updated'],
      customer_created: ['customer.created'],
      product_created: ['product.created'],
    };
    const allowed = map[triggerId];
    if (!allowed) return true;
    return allowed.some((x) => topic === x);
  }

  return true;
}

async function executeWebhookWorkflow(workflow: any, req: any) {
  const triggerNode = findTriggerNode(workflow);
  const triggerAppId = triggerNode ? getTriggerAppId(triggerNode) : '';
  const triggerId = triggerNode ? getTriggerId(triggerNode) : '';
  const triggerType = triggerNode ? getTriggerType(triggerNode, workflow) : String(workflow?.triggerType || '');

  if (triggerType && triggerType !== 'webhook') {
    return { status: 'skipped', reason: `Workflow triggerType is ${triggerType}, not webhook` };
  }

  if (triggerNode && !matchWebhookEvent(triggerAppId, triggerId, req)) {
    return { status: 'skipped', reason: `Webhook does not match configured trigger (${triggerAppId}:${triggerId})` };
  }

  const triggerData = {
    appId: triggerAppId,
    triggerId,
    headers: normalizeHeaders(req.headers),
    query: req.query || {},
    body: req.body,
    rawBody: req.rawBody ? Buffer.from(req.rawBody as any).toString('base64') : undefined,
    receivedAt: new Date().toISOString(),
  };

  const execution = await storage.createExecution({
    workflowId: workflow.id,
    status: 'pending',
    triggerType: 'webhook',
    triggerData,
    startedAt: new Date(),
  });

  const startedAtMs = Date.now();
  await storage.updateExecution(execution.id, { status: 'running' });

  try {
    const result = await runWorkflow({
      userId: workflow.userId,
      workflowId: workflow.id,
      nodes: workflow.nodes || [],
      connections: workflow.connections || [],
      triggerType: 'webhook',
      triggerData,
    });

    const duration = Date.now() - startedAtMs;
    await storage.updateExecution(execution.id, {
      status: 'success',
      completedAt: new Date(),
      duration,
      outputData: result.outputData,
      nodeExecutions: result.nodeExecutions,
    });

    await storage.updateWorkflow(workflow.id, {
      executionCount: (workflow.executionCount || 0) + 1,
      lastExecutedAt: new Date(),
      lastExecutionStatus: 'success',
    });

    return { status: 'success', executionId: execution.id };
  } catch (error: any) {
    const duration = Date.now() - startedAtMs;
    await storage.updateExecution(execution.id, {
      status: 'error',
      completedAt: new Date(),
      duration,
      errorMessage: error?.message || 'Workflow execution failed',
      errorStack: error?.stack ? String(error.stack) : undefined,
    });

    await storage.updateWorkflow(workflow.id, {
      executionCount: (workflow.executionCount || 0) + 1,
      lastExecutedAt: new Date(),
      lastExecutionStatus: 'error',
    });

    throw error;
  }
}

// Public workflow webhook endpoint
router.all('/workflow/:webhookId', async (req: any, res) => {
  try {
    const webhookId = String(req.params.webhookId || '');
    if (!webhookId) return res.status(400).json({ message: 'Missing webhookId' });

    const workflow = await storage.getWorkflowByWebhookId(webhookId);
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });

    if (!workflow.isActive) {
      return res.status(200).json({ status: 'skipped', reason: 'Workflow is inactive' });
    }

    const result = await executeWebhookWorkflow(workflow, req);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Workflow Webhook] error:', error);
    return res.status(500).json({ message: error?.message || 'Failed to execute webhook workflow' });
  }
});

export default router;
