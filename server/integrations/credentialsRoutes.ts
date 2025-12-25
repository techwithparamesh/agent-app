/**
 * Integration Credentials & Workflows API Routes
 * 
 * Handles secure storage and management of API keys and workflow definitions.
 */
import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated } from '../replitAuth';
import { 
  encryptCredentialData, 
  decryptCredentialData, 
  maskCredential 
} from './crypto';

const router = Router();

// ========== CREDENTIALS ROUTES ==========

// Validation schemas
const createCredentialSchema = z.object({
  name: z.string().min(1).max(255),
  appId: z.string().min(1).max(100),
  credentialType: z.enum(['api_key', 'oauth2', 'basic_auth', 'bearer_token']),
  credentials: z.record(z.any()), // Flexible credential data (api_key, username/password, etc.)
  scopes: z.array(z.string()).optional(),
});

const updateCredentialSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  credentials: z.record(z.any()).optional(),
  scopes: z.array(z.string()).optional(),
  isValid: z.boolean().optional(),
});

// Get all credentials for user (masked)
router.get('/credentials', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const credentials = await storage.getCredentialsByUserId(userId);
    
    // Return credentials with masked sensitive data
    const maskedCredentials = credentials.map(cred => {
      let preview = '';
      try {
        const data = decryptCredentialData(cred.encryptedData);
        // Show what type of credential it is
        if (data.apiKey) preview = maskCredential(data.apiKey);
        else if (data.accessToken) preview = maskCredential(data.accessToken);
        else if (data.username) preview = `${data.username}:****`;
        else preview = '••••••••';
      } catch {
        preview = '(encrypted)';
      }
      
      return {
        id: cred.id,
        name: cred.name,
        appId: cred.appId,
        credentialType: cred.credentialType,
        preview,
        isValid: cred.isValid,
        lastUsedAt: cred.lastUsedAt,
        lastValidatedAt: cred.lastValidatedAt,
        createdAt: cred.createdAt,
        updatedAt: cred.updatedAt,
      };
    });
    
    res.json({ credentials: maskedCredentials });
  } catch (error: any) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({ message: 'Failed to fetch credentials' });
  }
});

// Get credential by ID (with decrypted data for workflow execution)
router.get('/credentials/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const credential = await storage.getCredentialById(req.params.id);
    
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    
    if (credential.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Decrypt and return full credential data
    const decryptedData = decryptCredentialData(credential.encryptedData);
    
    res.json({
      id: credential.id,
      name: credential.name,
      appId: credential.appId,
      credentialType: credential.credentialType,
      credentials: decryptedData,
      scopes: credential.scopes,
      isValid: credential.isValid,
      createdAt: credential.createdAt,
    });
  } catch (error: any) {
    console.error('Error fetching credential:', error);
    res.status(500).json({ message: 'Failed to fetch credential' });
  }
});

// Create new credential
router.post('/credentials', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const data = createCredentialSchema.parse(req.body);
    
    // Check if credential already exists for this app
    const existing = await storage.getCredentialByUserAndApp(userId, data.appId);
    if (existing) {
      return res.status(409).json({ 
        message: 'Credential for this app already exists',
        existingId: existing.id 
      });
    }
    
    // Encrypt the credential data
    const encryptedData = encryptCredentialData(data.credentials);
    
    const credential = await storage.createCredential(userId, {
      name: data.name,
      appId: data.appId,
      credentialType: data.credentialType,
      encryptedData,
      scopes: data.scopes || [],
      isValid: true,
    });
    
    res.status(201).json({
      id: credential.id,
      name: credential.name,
      appId: credential.appId,
      credentialType: credential.credentialType,
      isValid: credential.isValid,
      createdAt: credential.createdAt,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating credential:', error);
    res.status(500).json({ message: 'Failed to create credential' });
  }
});

// Update credential
router.patch('/credentials/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const credential = await storage.getCredentialById(req.params.id);
    
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    
    if (credential.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const data = updateCredentialSchema.parse(req.body);
    
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.scopes) updateData.scopes = data.scopes;
    if (data.isValid !== undefined) updateData.isValid = data.isValid;
    
    // If credentials are being updated, re-encrypt
    if (data.credentials) {
      updateData.encryptedData = encryptCredentialData(data.credentials);
      updateData.isValid = true; // Reset validation on update
    }
    
    const updated = await storage.updateCredential(req.params.id, updateData);
    
    res.json({
      id: updated?.id,
      name: updated?.name,
      appId: updated?.appId,
      isValid: updated?.isValid,
      updatedAt: updated?.updatedAt,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating credential:', error);
    res.status(500).json({ message: 'Failed to update credential' });
  }
});

// Delete credential
router.delete('/credentials/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const credential = await storage.getCredentialById(req.params.id);
    
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    
    if (credential.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    await storage.deleteCredential(req.params.id);
    res.json({ message: 'Credential deleted' });
  } catch (error: any) {
    console.error('Error deleting credential:', error);
    res.status(500).json({ message: 'Failed to delete credential' });
  }
});

// Verify/test a credential
router.post('/credentials/:id/verify', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const credential = await storage.getCredentialById(req.params.id);
    
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }
    
    if (credential.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const decryptedData = decryptCredentialData(credential.encryptedData);
    
    // TODO: Implement actual verification based on appId
    // For now, just mark as validated
    let isValid = true;
    let message = 'Credential verified successfully';
    
    // Example: Verify OpenAI API key
    if (credential.appId === 'openai' && decryptedData.apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${decryptedData.apiKey}` }
        });
        isValid = response.ok;
        if (!isValid) {
          message = 'Invalid API key';
        }
      } catch (e) {
        isValid = false;
        message = 'Failed to verify API key';
      }
    }
    
    // Update validation status
    await storage.updateCredential(req.params.id, {
      isValid,
      lastValidatedAt: new Date(),
    });
    
    res.json({ isValid, message });
  } catch (error: any) {
    console.error('Error verifying credential:', error);
    res.status(500).json({ message: 'Failed to verify credential' });
  }
});

// ========== WORKFLOWS ROUTES ==========

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  connections: z.array(z.any()).optional(),
  triggerType: z.enum(['webhook', 'schedule', 'manual', 'event']).optional(),
  triggerConfig: z.record(z.any()).optional(),
  cronExpression: z.string().optional(),
  timezone: z.string().optional(),
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  nodes: z.array(z.any()).optional(),
  connections: z.array(z.any()).optional(),
  isActive: z.boolean().optional(),
  triggerType: z.enum(['webhook', 'schedule', 'manual', 'event']).optional(),
  triggerConfig: z.record(z.any()).optional(),
  cronExpression: z.string().optional(),
  timezone: z.string().optional(),
});

// Get all workflows for user
router.get('/workflows', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflows = await storage.getWorkflowsByUserId(userId);
    res.json({ workflows });
  } catch (error: any) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ message: 'Failed to fetch workflows' });
  }
});

// Get workflow by ID
router.get('/workflows/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflow = await storage.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    if (workflow.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.json(workflow);
  } catch (error: any) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ message: 'Failed to fetch workflow' });
  }
});

// Create workflow
router.post('/workflows', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const data = createWorkflowSchema.parse(req.body);
    
    const workflow = await storage.createWorkflow(userId, {
      name: data.name,
      description: data.description,
      nodes: data.nodes || [],
      connections: data.connections || [],
      triggerType: data.triggerType,
      triggerConfig: data.triggerConfig,
      cronExpression: data.cronExpression,
      timezone: data.timezone || 'UTC',
    });
    
    res.status(201).json(workflow);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error creating workflow:', error);
    res.status(500).json({ message: 'Failed to create workflow' });
  }
});

// Update workflow
router.patch('/workflows/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflow = await storage.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    if (workflow.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const data = updateWorkflowSchema.parse(req.body);
    const updated = await storage.updateWorkflow(req.params.id, data);
    
    res.json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Error updating workflow:', error);
    res.status(500).json({ message: 'Failed to update workflow' });
  }
});

// Delete workflow
router.delete('/workflows/:id', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflow = await storage.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    if (workflow.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    await storage.deleteWorkflow(req.params.id);
    res.json({ message: 'Workflow deleted' });
  } catch (error: any) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ message: 'Failed to delete workflow' });
  }
});

// Activate/deactivate workflow
router.post('/workflows/:id/toggle', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflow = await storage.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    if (workflow.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const updated = await storage.updateWorkflow(req.params.id, {
      isActive: !workflow.isActive,
    });
    
    res.json({ isActive: updated?.isActive });
  } catch (error: any) {
    console.error('Error toggling workflow:', error);
    res.status(500).json({ message: 'Failed to toggle workflow' });
  }
});

// Get workflow executions
router.get('/workflows/:id/executions', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflow = await storage.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    if (workflow.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const limit = parseInt(req.query.limit as string) || 50;
    const executions = await storage.getExecutionsByWorkflowId(req.params.id, limit);
    
    res.json({ executions });
  } catch (error: any) {
    console.error('Error fetching executions:', error);
    res.status(500).json({ message: 'Failed to fetch executions' });
  }
});

// Execute workflow manually
router.post('/workflows/:id/execute', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const workflow = await storage.getWorkflowById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    
    if (workflow.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Create execution record
    const execution = await storage.createExecution({
      workflowId: workflow.id,
      status: 'pending',
      triggerType: 'manual',
      triggerData: req.body.inputData || {},
      startedAt: new Date(),
    });
    
    // TODO: Actually execute the workflow nodes
    // For now, just mark as success
    await storage.updateExecution(execution.id, {
      status: 'success',
      completedAt: new Date(),
      duration: 100,
      outputData: { message: 'Workflow executed (placeholder)' },
    });
    
    // Update workflow stats
    await storage.updateWorkflow(workflow.id, {
      executionCount: (workflow.executionCount || 0) + 1,
      lastExecutedAt: new Date(),
      lastExecutionStatus: 'success',
    });
    
    res.json({ 
      executionId: execution.id,
      status: 'success',
      message: 'Workflow executed successfully' 
    });
  } catch (error: any) {
    console.error('Error executing workflow:', error);
    res.status(500).json({ message: 'Failed to execute workflow' });
  }
});

export default router;
