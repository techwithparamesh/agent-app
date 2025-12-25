/**
 * Workflow API Hooks
 * 
 * React hooks for connecting frontend workflow builder to backend APIs.
 * Handles credentials, workflows, and executions.
 */

import { useState, useCallback, useEffect } from 'react';
import type { Credential } from '@/components/workspace/CredentialManager';

// ============================================
// TYPES
// ============================================

export interface WorkflowData {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  nodes: any[];
  connections: any[];
  triggerConfig: Record<string, any> | null;
  isActive: boolean;
  lastExecutedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionData {
  id: number;
  workflowId: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt: Date | null;
  error: string | null;
  executionData: Record<string, any> | null;
  triggeredBy: string;
}

export interface ApiCredential {
  id: number;
  userId: string;
  appId: string;
  name: string;
  credentialType: string;
  encryptedData: string;
  status: 'valid' | 'invalid' | 'untested';
  lastTestedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// API FUNCTIONS
// ============================================

const API_BASE = '/api/integrations';

// Credentials API
export async function fetchCredentials(): Promise<ApiCredential[]> {
  const response = await fetch(`${API_BASE}/credentials`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch credentials');
  const data = await response.json();
  // Handle both array and { credentials: [...] } format
  return Array.isArray(data) ? data : (data.credentials || []);
}

export async function createCredentialApi(data: {
  appId: string;
  name: string;
  credentialType: string;
  credentialData: Record<string, string>;
}): Promise<ApiCredential> {
  const response = await fetch(`${API_BASE}/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      name: data.name,
      appId: data.appId,
      credentialType: data.credentialType,
      credentials: data.credentialData, // Map to backend field name
    }),
  });
  if (!response.ok) throw new Error('Failed to create credential');
  return response.json();
}

export async function updateCredentialApi(
  id: number,
  data: Partial<{
    name: string;
    credentialData: Record<string, string>;
    status: string;
  }>
): Promise<ApiCredential> {
  const response = await fetch(`${API_BASE}/credentials/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update credential');
  return response.json();
}

export async function deleteCredentialApi(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/credentials/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to delete credential');
}

export async function testCredentialApi(id: number): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/credentials/${id}/verify`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to test credential');
  const data = await response.json();
  // Convert backend response format to frontend expected format
  return { 
    success: data.isValid ?? false, 
    message: data.message ?? (data.isValid ? 'Connection successful!' : 'Verification failed') 
  };
}

// Workflows API
export async function fetchWorkflows(): Promise<WorkflowData[]> {
  const response = await fetch(`${API_BASE}/workflows`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch workflows');
  const data = await response.json();
  // Handle both array and { workflows: [...] } format
  return Array.isArray(data) ? data : (data.workflows || []);
}

export async function fetchWorkflow(id: number): Promise<WorkflowData> {
  const response = await fetch(`${API_BASE}/workflows/${id}`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch workflow');
  return response.json();
}

export async function createWorkflowApi(data: {
  name: string;
  description?: string;
  nodes: any[];
  connections: any[];
  triggerConfig?: Record<string, any>;
  isActive?: boolean;
}): Promise<WorkflowData> {
  const response = await fetch(`${API_BASE}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create workflow');
  return response.json();
}

export async function updateWorkflowApi(
  id: number,
  data: Partial<{
    name: string;
    description: string;
    nodes: any[];
    connections: any[];
    triggerConfig: Record<string, any>;
    isActive: boolean;
  }>
): Promise<WorkflowData> {
  const response = await fetch(`${API_BASE}/workflows/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update workflow');
  return response.json();
}

export async function deleteWorkflowApi(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/workflows/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to delete workflow');
}

export async function executeWorkflowApi(id: number, inputData?: any): Promise<ExecutionData> {
  const response = await fetch(`${API_BASE}/workflows/${id}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ inputData }),
  });
  if (!response.ok) throw new Error('Failed to execute workflow');
  return response.json();
}

// ============================================
// REACT HOOKS
// ============================================

/**
 * Hook for managing credentials with backend sync
 */
export function useCredentialsApi() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert API credential to frontend format
  const toFrontendCredential = (api: ApiCredential): Credential => ({
    id: String(api.id),
    name: api.name,
    appId: api.appId,
    appName: api.appId.charAt(0).toUpperCase() + api.appId.slice(1),
    type: api.credentialType as any,
    status: api.status as any,
    data: {}, // Data is encrypted on backend, not returned
    createdAt: new Date(api.createdAt),
    updatedAt: new Date(api.updatedAt),
    lastTestedAt: api.lastTestedAt ? new Date(api.lastTestedAt) : undefined,
  });

  // Load credentials on mount
  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCredentials();
      setCredentials(data.map(toFrontendCredential));
    } catch (err) {
      console.error('Failed to load credentials:', err);
      setError('Failed to load credentials');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCredential = useCallback(async (
    cred: Omit<Credential, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Credential> => {
    try {
      const api = await createCredentialApi({
        appId: cred.appId,
        name: cred.name,
        credentialType: cred.type,
        credentialData: cred.data,
      });
      const newCred = toFrontendCredential(api);
      setCredentials(prev => [...prev, newCred]);
      return newCred;
    } catch (err) {
      console.error('Failed to create credential:', err);
      throw err;
    }
  }, []);

  const updateCredential = useCallback(async (
    id: string,
    updates: Partial<Credential>
  ): Promise<void> => {
    try {
      const api = await updateCredentialApi(Number(id), {
        name: updates.name,
        credentialData: updates.data,
        status: updates.status,
      });
      setCredentials(prev => prev.map(c => 
        c.id === id ? toFrontendCredential(api) : c
      ));
    } catch (err) {
      console.error('Failed to update credential:', err);
      throw err;
    }
  }, []);

  const deleteCredential = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteCredentialApi(Number(id));
      setCredentials(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete credential:', err);
      throw err;
    }
  }, []);

  const testCredential = useCallback(async (
    id: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      // Set testing status
      setCredentials(prev => prev.map(c => 
        c.id === id ? { ...c, status: 'testing' as const } : c
      ));

      const result = await testCredentialApi(Number(id));
      
      // Update status based on result
      setCredentials(prev => prev.map(c => 
        c.id === id ? { 
          ...c, 
          status: result.success ? 'valid' : 'invalid',
          lastTestedAt: new Date(),
        } : c
      ));

      return result;
    } catch (err) {
      console.error('Failed to test credential:', err);
      setCredentials(prev => prev.map(c => 
        c.id === id ? { ...c, status: 'invalid' } : c
      ));
      return { success: false, message: 'Failed to test credential' };
    }
  }, []);

  return {
    credentials,
    isLoading,
    error,
    loadCredentials,
    createCredential,
    updateCredential,
    deleteCredential,
    testCredential,
  };
}

/**
 * Hook for managing workflows with backend sync
 */
export function useWorkflowsApi() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all workflows
  const loadWorkflows = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchWorkflows();
      setWorkflows(data);
    } catch (err) {
      console.error('Failed to load workflows:', err);
      setError('Failed to load workflows');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load a specific workflow
  const loadWorkflow = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchWorkflow(id);
      setCurrentWorkflow(data);
      return data;
    } catch (err) {
      console.error('Failed to load workflow:', err);
      setError('Failed to load workflow');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save workflow (create or update)
  const saveWorkflow = useCallback(async (
    data: {
      name: string;
      description?: string;
      nodes: any[];
      connections: any[];
      triggerConfig?: Record<string, any>;
      isActive?: boolean;
    },
    workflowId?: number
  ): Promise<WorkflowData | null> => {
    try {
      setIsSaving(true);
      setError(null);

      let result: WorkflowData;
      if (workflowId) {
        result = await updateWorkflowApi(workflowId, data);
      } else {
        result = await createWorkflowApi(data);
      }

      setCurrentWorkflow(result);
      
      // Update workflows list
      setWorkflows(prev => {
        const exists = prev.find(w => w.id === result.id);
        if (exists) {
          return prev.map(w => w.id === result.id ? result : w);
        }
        return [...prev, result];
      });

      return result;
    } catch (err) {
      console.error('Failed to save workflow:', err);
      setError('Failed to save workflow');
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Delete workflow
  const deleteWorkflow = useCallback(async (id: number): Promise<boolean> => {
    try {
      await deleteWorkflowApi(id);
      setWorkflows(prev => prev.filter(w => w.id !== id));
      if (currentWorkflow?.id === id) {
        setCurrentWorkflow(null);
      }
      return true;
    } catch (err) {
      console.error('Failed to delete workflow:', err);
      setError('Failed to delete workflow');
      return false;
    }
  }, [currentWorkflow]);

  // Execute workflow
  const executeWorkflow = useCallback(async (
    id: number,
    inputData?: any
  ): Promise<ExecutionData | null> => {
    try {
      setError(null);
      return await executeWorkflowApi(id, inputData);
    } catch (err) {
      console.error('Failed to execute workflow:', err);
      setError('Failed to execute workflow');
      return null;
    }
  }, []);

  return {
    workflows,
    currentWorkflow,
    isLoading,
    isSaving,
    error,
    loadWorkflows,
    loadWorkflow,
    saveWorkflow,
    deleteWorkflow,
    executeWorkflow,
    setCurrentWorkflow,
  };
}
