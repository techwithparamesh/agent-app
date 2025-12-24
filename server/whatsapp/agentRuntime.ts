/**
 * Agent Runtime Engine
 * Core orchestrator that processes WhatsApp messages end-to-end
 * Implements one agent cycle per message
 */

import { eventGateway } from './eventGateway';
import { agentResolver, type ResolvedAgent } from './agentResolver';
import { stateManager, type ConversationData } from './stateManager';
import { aiDecisionLayer } from './aiDecisionLayer';
import { toolEngine } from './toolEngine';
import { knowledgeInjection } from './knowledgeInjection';
import { responseComposer } from './responseComposer';
import { whatsappDispatcher } from './whatsappDispatcher';
import { decrypt } from '../utils/encryption';
import type {
  NormalizedMessage,
  AIDecision,
  ToolResult,
  RuntimeContext,
  ConversationState,
  FlowType,
  Intent,
  ToolName,
} from './types';

interface ProcessResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class AgentRuntime {
  // Intent to tool mapping
  private readonly intentToolMap: Partial<Record<Intent, ToolName>> = {
    book_appointment: 'book_appointment',
    check_availability: 'check_availability',
    cancel_appointment: 'cancel_appointment',
    reschedule_appointment: 'reschedule_appointment',
    human_handoff: 'human_handoff',
    ask_question: 'search_knowledge',
    check_status: 'get_appointment_status',
  };

  // Intent to flow mapping
  private readonly intentFlowMap: Partial<Record<Intent, FlowType>> = {
    book_appointment: 'appointment_booking',
    provide_info: 'lead_capture',
    ask_question: 'inquiry',
    feedback: 'feedback',
  };

  // Required fields for each flow
  private readonly flowRequiredFields: Record<FlowType, string[]> = {
    appointment_booking: ['name', 'phone', 'date', 'time'],
    lead_capture: ['name', 'phone'],
    inquiry: [],
    order: ['name', 'phone', 'items'],
    support: [],
    feedback: ['rating', 'comments'],
  };

  /**
   * Process a single incoming message
   * This is the main entry point for the agent runtime
   */
  async processMessage(message: NormalizedMessage): Promise<ProcessResult> {
    console.log(`[AgentRuntime] Processing message from ${message.from}`);

    try {
      // Step 1: Resolve agent from phone number
      const resolvedAgent = await agentResolver.resolveByPhoneNumberId(message.phoneNumberId);
      
      if (!resolvedAgent) {
        console.error(`[AgentRuntime] No agent found for phone number ID: ${message.phoneNumberId}`);
        return { success: false, error: 'No agent configured for this number' };
      }

      // Step 2: Get or create conversation
      const conversationData = await stateManager.getOrCreateConversation(
        resolvedAgent.agent.id,
        message.from,
        message.from, // whatsappUserId is same as phone for now
        message.userName
      );

      // Step 3: Save incoming message
      await stateManager.saveMessage(conversationData.conversation.id, {
        whatsappMessageId: message.messageId,
        direction: 'inbound',
        messageType: message.type,
        content: message.content,
        mediaUrl: message.mediaUrl,
      });

      // Step 4: Build runtime context
      const runtimeContext: RuntimeContext = {
        agent: resolvedAgent.config,
        conversation: {
          id: conversationData.conversation.id,
          state: (conversationData.conversation.state as ConversationState) || 'idle',
          context: conversationData.context,
          currentFlow: conversationData.conversation.currentFlow as FlowType | undefined,
          flowStep: conversationData.conversation.flowStep || 0,
        },
        message,
        user: {
          phone: message.from,
          name: message.userName || conversationData.conversation.userName || undefined,
          whatsappId: message.from,
        },
      };

      // Step 5: Execute agent cycle
      const response = await this.executeAgentCycle(runtimeContext, resolvedAgent);

      // Step 6: Send response
      if (response) {
        // Decrypt access token before use
        const encryptedToken = resolvedAgent.whatsappConfig?.accessToken || '';
        const accessToken = encryptedToken ? decrypt(encryptedToken) : '';
        
        const sendResult = await whatsappDispatcher.send(response, {
          phoneNumberId: resolvedAgent.whatsappConfig?.whatsappPhoneNumberId || '',
          accessToken,
        });

        if (sendResult.success) {
          // Save outbound message
          await stateManager.saveMessage(conversationData.conversation.id, {
            whatsappMessageId: sendResult.messageId,
            direction: 'outbound',
            messageType: response.type,
            content: response.text?.body || 
                     response.interactive?.body.text || 
                     '[Interactive message]',
          });

          return { success: true, messageId: sendResult.messageId };
        }

        return { success: false, error: sendResult.error };
      }

      return { success: true };
    } catch (error) {
      console.error('[AgentRuntime] Error processing message:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Execute one agent cycle
   * AI is the brain, system is the hands
   */
  private async executeAgentCycle(
    context: RuntimeContext,
    resolvedAgent: ResolvedAgent
  ): Promise<any> {
    const { message, conversation, agent } = context;

    // Handle special interactive replies
    if (message.interactiveReply) {
      return this.handleInteractiveReply(context, resolvedAgent);
    }

    // Check if we're in the middle of a flow
    if (conversation.currentFlow && conversation.state === 'collecting_info') {
      return this.continueFlow(context, resolvedAgent);
    }

    // Step 1: Get relevant knowledge (RAG)
    const knowledgeResult = await knowledgeInjection.getRelevantKnowledge(
      agent.id,
      message.content,
      { maxChunks: 3 }
    );

    // Update context with knowledge
    conversation.context.knowledgeContext = knowledgeResult.combinedContext || undefined;

    // Step 2: AI Decision - Intent detection & entity extraction
    const aiDecision = await aiDecisionLayer.analyzeMessage(
      message,
      conversation.context,
      agent
    );

    console.log(`[AgentRuntime] AI Decision:`, JSON.stringify(aiDecision));

    // Save intent to message
    await this.updateMessageIntent(
      conversation.id, 
      message.messageId, 
      aiDecision.intent,
      aiDecision.entities
    );

    // Step 3: Update context with extracted entities
    if (Object.keys(aiDecision.entities).length > 0) {
      await stateManager.updateCollectedData(conversation.id, aiDecision.entities);
      Object.assign(conversation.context.collectedData, aiDecision.entities);
    }

    // Step 4: Handle based on intent
    return this.handleIntent(context, resolvedAgent, aiDecision);
  }

  /**
   * Handle intent and execute appropriate action
   */
  private async handleIntent(
    context: RuntimeContext,
    resolvedAgent: ResolvedAgent,
    aiDecision: AIDecision
  ): Promise<any> {
    const { message, conversation, agent, user } = context;
    const { intent, entities, requiresAction, suggestedTool } = aiDecision;

    // Handle greeting
    if (intent === 'greeting') {
      return responseComposer.composeWelcomeMessage(user.phone, agent);
    }

    // Handle goodbye
    if (intent === 'goodbye') {
      await stateManager.completeFlow(conversation.id);
      const response = await aiDecisionLayer.generateResponse(
        conversation.context,
        agent
      );
      return responseComposer.composeTextResponse(user.phone, response);
    }

    // Handle human handoff request
    if (intent === 'human_handoff') {
      const result = await toolEngine.execute('human_handoff', {
        agentId: agent.id,
        conversationId: conversation.id,
        reason: message.content,
      });
      
      await stateManager.updateState(conversation.id, 'handoff');
      
      return responseComposer.composeHandoffResponse(
        user.phone,
        result.data?.queuePosition || 1,
        result.data?.estimatedWait
      );
    }

    // Check if intent requires a flow
    const flowType = this.intentFlowMap[intent];
    if (flowType) {
      const requiredFields = this.flowRequiredFields[flowType];
      const missingFields = await aiDecisionLayer.determineMissingFields(
        conversation.context,
        requiredFields,
        entities
      );

      if (missingFields.length > 0) {
        // Start flow to collect missing information
        await stateManager.startFlow(conversation.id, flowType, missingFields);
        
        const prompt = await aiDecisionLayer.generateCollectionPrompt(
          missingFields[0],
          conversation.context,
          agent
        );
        
        return responseComposer.composeTextResponse(user.phone, prompt);
      }
    }

    // Execute tool if required
    if (requiresAction || suggestedTool) {
      const toolName = suggestedTool || this.intentToolMap[intent];
      
      if (toolName) {
        return this.executeTool(context, resolvedAgent, toolName, entities);
      }
    }

    // Handle general questions using knowledge base
    if (intent === 'ask_question' && conversation.context.knowledgeContext) {
      const response = await aiDecisionLayer.generateResponse(
        conversation.context,
        agent,
        undefined,
        conversation.context.knowledgeContext
      );
      return responseComposer.composeTextResponse(user.phone, response);
    }

    // Generate general response
    const response = await aiDecisionLayer.generateResponse(
      conversation.context,
      agent
    );
    return responseComposer.composeTextResponse(user.phone, response);
  }

  /**
   * Execute a tool and compose response
   */
  private async executeTool(
    context: RuntimeContext,
    resolvedAgent: ResolvedAgent,
    toolName: ToolName,
    entities: Record<string, any>
  ): Promise<any> {
    const { conversation, agent, user } = context;

    // Build tool input
    const toolInput = {
      agentId: agent.id,
      conversationId: conversation.id,
      ...conversation.context.collectedData,
      ...entities,
      customerPhone: user.phone,
      customerName: user.name || entities.name,
    };

    // Execute tool
    const toolResult = await toolEngine.execute(toolName, toolInput);

    // Update context with tool result
    await stateManager.updateState(conversation.id, 'idle', {
      context: {
        lastToolUsed: toolName,
        lastToolResult: toolResult,
      },
    });

    // Handle specific tool results
    if (toolName === 'check_availability' && toolResult.success) {
      const slots = toolResult.data?.availableSlots || [];
      if (slots.length > 0) {
        return responseComposer.composeAvailabilityResponse(
          user.phone,
          entities.date || toolResult.data?.requestedDate,
          slots,
          agent
        );
      }
    }

    if (toolName === 'book_appointment' && toolResult.success && toolResult.data) {
      return responseComposer.composeBookingConfirmation(
        user.phone,
        toolResult.data,
        agent
      );
    }

    // Compose response from tool result
    return responseComposer.composeFromToolResult(
      user.phone,
      toolResult,
      agent,
      conversation.context
    );
  }

  /**
   * Handle interactive reply (button/list selection)
   */
  private async handleInteractiveReply(
    context: RuntimeContext,
    resolvedAgent: ResolvedAgent
  ): Promise<any> {
    const { message, conversation, agent, user } = context;
    const reply = message.interactiveReply!;

    // Parse reply ID
    if (reply.id.startsWith('slot_')) {
      // Time slot selection
      const [, date, time] = reply.id.split('_');
      
      await stateManager.updateCollectedData(conversation.id, { date, time });
      
      // Check if we have all required fields for booking
      const collected: Record<string, any> = { ...conversation.context.collectedData, date, time };
      const missing = ['name', 'phone'].filter(f => !collected[f]);

      if (missing.length > 0) {
        await stateManager.startFlow(conversation.id, 'appointment_booking', missing);
        
        const prompt = await aiDecisionLayer.generateCollectionPrompt(
          missing[0],
          conversation.context,
          agent
        );
        return responseComposer.composeTextResponse(user.phone, prompt);
      }

      // All fields present, book appointment
      return this.executeTool(context, resolvedAgent, 'book_appointment', collected);
    }

    if (reply.id.startsWith('confirm_')) {
      const action = reply.id.replace('confirm_', '');
      
      if (action === 'yes') {
        // Execute pending action
        const pendingTool = conversation.context.lastToolUsed;
        if (pendingTool === 'book_appointment') {
          return this.executeTool(
            context, 
            resolvedAgent, 
            'book_appointment',
            conversation.context.collectedData
          );
        }
      } else if (action === 'no') {
        await stateManager.completeFlow(conversation.id);
        return responseComposer.composeTextResponse(
          user.phone,
          'No problem! Let me know if there\'s anything else I can help with.'
        );
      } else if (action === 'edit') {
        // Restart flow
        const flowType = conversation.currentFlow || 'appointment_booking';
        const required = this.flowRequiredFields[flowType];
        await stateManager.startFlow(conversation.id, flowType, required);
        
        return responseComposer.composeTextResponse(
          user.phone,
          'Let\'s start over. What would you like to change?'
        );
      }
    }

    if (reply.id.startsWith('capability_')) {
      const capability = reply.id.replace('capability_', '');
      // Trigger the selected capability
      const fakeMessage: NormalizedMessage = {
        ...message,
        content: `I want help with ${capability}`,
        type: 'text',
        interactiveReply: undefined,
      };
      
      const newContext = { ...context, message: fakeMessage };
      return this.executeAgentCycle(newContext, resolvedAgent);
    }

    // Unknown interactive reply, generate response
    const response = await aiDecisionLayer.generateResponse(
      conversation.context,
      agent
    );
    return responseComposer.composeTextResponse(user.phone, response);
  }

  /**
   * Continue an active flow
   */
  private async continueFlow(
    context: RuntimeContext,
    resolvedAgent: ResolvedAgent
  ): Promise<any> {
    const { message, conversation, agent, user } = context;
    const missingFields = conversation.context.missingFields || [];
    const currentField = missingFields[0];

    if (!currentField) {
      // Flow complete, process
      await stateManager.completeFlow(conversation.id);
      return this.handleFlowCompletion(context, resolvedAgent);
    }

    // Extract entity for current field from message
    const aiDecision = await aiDecisionLayer.analyzeMessage(
      message,
      conversation.context,
      agent
    );

    // Check if we got the needed field
    const extractedValue = aiDecision.entities[currentField] || message.content;
    
    // Validate and save
    await stateManager.updateCollectedData(conversation.id, { [currentField]: extractedValue });

    // Update missing fields
    const remainingFields = missingFields.slice(1);
    await stateManager.updateState(conversation.id, 'collecting_info', {
      context: { missingFields: remainingFields },
    });

    if (remainingFields.length > 0) {
      // Ask for next field
      const prompt = await aiDecisionLayer.generateCollectionPrompt(
        remainingFields[0],
        conversation.context,
        agent
      );
      return responseComposer.composeTextResponse(user.phone, prompt);
    }

    // All fields collected
    return this.handleFlowCompletion(context, resolvedAgent);
  }

  /**
   * Handle flow completion
   */
  private async handleFlowCompletion(
    context: RuntimeContext,
    resolvedAgent: ResolvedAgent
  ): Promise<any> {
    const { conversation, agent, user } = context;
    const flowType = conversation.currentFlow;
    const collectedData = conversation.context.collectedData;

    // Determine action based on flow type
    if (flowType === 'appointment_booking') {
      // Show confirmation before booking
      return responseComposer.composeConfirmationResponse(
        user.phone,
        'appointment',
        {
          name: collectedData.name,
          date: collectedData.date,
          time: collectedData.time,
          service: collectedData.serviceType,
        },
        agent
      );
    }

    if (flowType === 'lead_capture') {
      // Capture lead
      const result = await toolEngine.execute('capture_lead', {
        agentId: agent.id,
        conversationId: conversation.id,
        ...collectedData,
      });

      await stateManager.completeFlow(conversation.id);
      
      const response = await aiDecisionLayer.generateResponse(
        conversation.context,
        agent,
        result
      );
      return responseComposer.composeTextResponse(user.phone, response);
    }

    // Default: complete flow and respond
    await stateManager.completeFlow(conversation.id);
    
    const response = await aiDecisionLayer.generateResponse(
      conversation.context,
      agent
    );
    return responseComposer.composeTextResponse(user.phone, response);
  }

  /**
   * Update message with detected intent
   */
  private async updateMessageIntent(
    conversationId: string,
    messageId: string,
    intent: Intent,
    entities: Record<string, any>
  ): Promise<void> {
    // This would update the message record with intent/entities
    // For now, it's handled in saveMessage
  }

  /**
   * Process webhook payload (entry point from routes)
   */
  async processWebhook(payload: any): Promise<{ processed: number; errors: number }> {
    const parsed = eventGateway.parseWebhookPayload(payload);
    
    if (!parsed) {
      return { processed: 0, errors: 0 };
    }

    // Handle status updates separately
    if (eventGateway.hasStatusUpdates(parsed)) {
      const statuses = eventGateway.extractStatusUpdates(parsed);
      // TODO: Update message statuses in database
      console.log(`[AgentRuntime] Received ${statuses.length} status updates`);
    }

    // Extract and process messages
    const messages = eventGateway.extractMessages(parsed);
    
    let processed = 0;
    let errors = 0;

    for (const message of messages) {
      const result = await this.processMessage(message);
      if (result.success) {
        processed++;
      } else {
        errors++;
        console.error(`[AgentRuntime] Failed to process message: ${result.error}`);
      }
    }

    return { processed, errors };
  }
}

// Export singleton instance
export const agentRuntime = new AgentRuntime();
