/**
 * API Types
 * Shared type definitions for API responses and common data structures
 */

// ========== WIDGET CONFIG ==========
export interface WidgetConfig {
  displayName?: string;
  primaryColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  avatarUrl?: string;
  showBranding?: boolean;
  autoOpen?: boolean;
  responseFormat?: 'structured' | 'conversational';
  widgetKey?: string;
  allowedOrigins?: string[];
}

// ========== AGENT TYPES ==========
export type AgentType = 'website' | 'whatsapp';

export interface Agent {
  id: string;
  userId: string;
  name: string;
  websiteUrl?: string | null;
  description?: string | null;
  systemPrompt?: string | null;
  toneOfVoice?: string | null;
  purpose?: string | null;
  welcomeMessage?: string | null;
  suggestedQuestions?: string | null;
  isActive: boolean;
  scanStatus?: string | null;
  scanProgress?: number | null;
  scanMessage?: string | null;
  lastScannedAt?: string | null;
  agentType: AgentType;
  businessCategory?: string | null;
  capabilities?: string[] | null;
  businessInfo?: Record<string, unknown> | null;
  language?: string;
  widgetConfig?: WidgetConfig | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AgentAnalytics {
  totalConversations: number;
  conversationsLast7Days: number;
  conversationsLast30Days: number;
  totalMessages: number;
  avgMessagesPerConversation: number | string;
  avgResponseTime: number;
  knowledgeBaseCount: number;
  isActive: boolean;
  lastScannedAt?: string | null;
}

// ========== CONVERSATION TYPES ==========
export interface Conversation {
  id: string;
  agentId: string;
  sessionId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

// ========== KNOWLEDGE BASE ==========
export interface KnowledgeEntry {
  id: string;
  agentId: string;
  sourceUrl?: string | null;
  title?: string | null;
  section?: string | null;
  content: string;
  contentType?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

// ========== USER TYPES ==========
export interface User {
  id: string;
  email?: string | null;
  emailVerified?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  plan?: string;
  messageCount?: number;
  messageLimit?: number;
  subscriptionStatus?: string;
  subscriptionEndsAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface UserUsage {
  messageCount: number;
  messageLimit: number;
  plan: string;
  subscriptionStatus: string;
}

// ========== WORKFLOW TYPES ==========
export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface WorkflowConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  nodes?: WorkflowNode[] | null;
  connections?: WorkflowConnection[] | null;
  isActive: boolean;
  triggerType?: string | null;
  triggerConfig?: Record<string, unknown> | null;
  webhookId?: string | null;
  webhookUrl?: string | null;
  cronExpression?: string | null;
  timezone?: string;
  executionCount?: number;
  lastExecutedAt?: string | null;
  lastExecutionStatus?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'cancelled';
  triggerType?: string | null;
  triggerData?: Record<string, unknown> | null;
  startedAt?: string | null;
  completedAt?: string | null;
  duration?: number | null;
  outputData?: Record<string, unknown> | null;
  errorMessage?: string | null;
  errorStack?: string | null;
  nodeExecutions?: NodeExecution[] | null;
  createdAt: string;
}

export interface NodeExecution {
  nodeId: string;
  nodeName: string;
  status: string;
  inputData?: unknown;
  outputData?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

// ========== WHATSAPP TYPES ==========
export interface WhatsappBusinessAccount {
  id: string;
  userId: string;
  bspProvider: string;
  bspAccountId?: string | null;
  wabaId?: string | null;
  businessName: string;
  businessEmail?: string | null;
  businessWebsite?: string | null;
  verificationStatus?: string;
  status?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PhoneNumber {
  id: string;
  wabaId: string;
  userId: string;
  phoneNumber: string;
  displayPhoneNumber?: string | null;
  phoneNumberId?: string | null;
  provisioningStatus?: string;
  qualityRating?: string | null;
  messagingLimit?: string | null;
  profileName?: string | null;
  isVerified: boolean;
  agentId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ========== API RESPONSE TYPES ==========
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ========== DASHBOARD TYPES ==========
export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalConversations: number;
  totalMessages: number;
  recentConversations: Conversation[];
}
