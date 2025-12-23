// ============= WORKSPACE FLOW BUILDER TYPES =============

export interface Position {
  x: number;
  y: number;
}

export interface FlowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'loop' | 'router' | 'error-handler';
  appId: string;
  appName: string;
  appIcon: string;
  appColor: string;
  name: string;
  description?: string;
  position: Position;
  status: 'incomplete' | 'configured' | 'error' | 'running' | 'success';
  config: Record<string, any>;
  triggerId?: string;
  actionId?: string;
  connections: string[]; // IDs of connected nodes
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: string;
  targetHandle?: string;
  type: 'default' | 'success' | 'error' | 'true' | 'false';
  animated?: boolean;
}

export interface WorkspaceFlow {
  id: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  connections: Connection[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  version: number;
}

export interface AppCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface AppIntegration {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  color: string;
  popular?: boolean;
  triggers?: AppTrigger[];
  actions?: AppAction[];
  fields?: string[];
}

export interface AppTrigger {
  id: string;
  name: string;
  description: string;
  icon?: string;
  fields?: TriggerField[];
}

export interface AppAction {
  id: string;
  name: string;
  description: string;
  icon?: string;
  fields?: ActionField[];
}

export interface TriggerField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'number' | 'boolean' | 'json' | 'password';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
}

export interface ActionField extends TriggerField {}

// AI Model types
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description?: string;
  maxTokens?: number;
  capabilities?: string[];
}

// Comprehensive AI Models list
export const AI_MODELS: AIModel[] = [
  // OpenAI Models
  { id: 'openai-gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Most capable multimodal model', capabilities: ['text', 'vision', 'audio'] },
  { id: 'openai-gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Affordable and fast multimodal model', capabilities: ['text', 'vision'] },
  { id: 'openai-gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', description: 'High performance GPT-4 variant', capabilities: ['text', 'vision'] },
  { id: 'openai-gpt-4', name: 'GPT-4', provider: 'OpenAI', description: 'Original GPT-4 model', capabilities: ['text'] },
  { id: 'openai-gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', description: 'Fast and cost-effective', capabilities: ['text'] },
  { id: 'openai-o1', name: 'O1', provider: 'OpenAI', description: 'Advanced reasoning model', capabilities: ['text', 'reasoning'] },
  { id: 'openai-o1-mini', name: 'O1 Mini', provider: 'OpenAI', description: 'Fast reasoning model', capabilities: ['text', 'reasoning'] },
  { id: 'openai-o1-preview', name: 'O1 Preview', provider: 'OpenAI', description: 'Preview reasoning capabilities', capabilities: ['text', 'reasoning'] },
  
  // Anthropic Models
  { id: 'anthropic-claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Best balance of intelligence and speed', capabilities: ['text', 'vision', 'coding'] },
  { id: 'anthropic-claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: 'Most powerful Claude model', capabilities: ['text', 'vision', 'analysis'] },
  { id: 'anthropic-claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', description: 'Balanced performance', capabilities: ['text', 'vision'] },
  { id: 'anthropic-claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', description: 'Fastest Claude model', capabilities: ['text', 'vision'] },
  { id: 'anthropic-claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', description: 'Enhanced fast model', capabilities: ['text', 'vision'] },
  
  // Google Models
  { id: 'google-gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', description: 'Latest fast multimodal model', capabilities: ['text', 'vision', 'audio'] },
  { id: 'google-gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', description: 'Advanced multimodal with 1M context', capabilities: ['text', 'vision', 'audio', 'video'] },
  { id: 'google-gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', description: 'Fast multimodal model', capabilities: ['text', 'vision'] },
  { id: 'google-gemini-pro', name: 'Gemini Pro', provider: 'Google', description: 'Balanced performance', capabilities: ['text'] },
  { id: 'google-gemma-2', name: 'Gemma 2', provider: 'Google', description: 'Open-weight model', capabilities: ['text'] },
  
  // Mistral Models
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', description: 'Most capable Mistral model', capabilities: ['text', 'coding'] },
  { id: 'mistral-medium', name: 'Mistral Medium', provider: 'Mistral', description: 'Balanced performance', capabilities: ['text'] },
  { id: 'mistral-small', name: 'Mistral Small', provider: 'Mistral', description: 'Fast and efficient', capabilities: ['text'] },
  { id: 'mistral-nemo', name: 'Mistral Nemo', provider: 'Mistral', description: 'Compact model', capabilities: ['text'] },
  { id: 'mistral-codestral', name: 'Codestral', provider: 'Mistral', description: 'Specialized for code', capabilities: ['text', 'coding'] },
  { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', provider: 'Mistral', description: 'MoE architecture', capabilities: ['text'] },
  { id: 'mixtral-8x22b', name: 'Mixtral 8x22B', provider: 'Mistral', description: 'Large MoE model', capabilities: ['text', 'coding'] },
  
  // Meta Models (via various providers)
  { id: 'meta-llama-3.2-90b', name: 'Llama 3.2 90B', provider: 'Meta', description: 'Largest Llama model', capabilities: ['text', 'vision'] },
  { id: 'meta-llama-3.2-11b', name: 'Llama 3.2 11B', provider: 'Meta', description: 'Vision-language model', capabilities: ['text', 'vision'] },
  { id: 'meta-llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'Meta', description: 'Frontier open model', capabilities: ['text', 'coding'] },
  { id: 'meta-llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta', description: 'Large Llama model', capabilities: ['text'] },
  { id: 'meta-llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Meta', description: 'Efficient Llama model', capabilities: ['text'] },
  
  // Groq (Fast Inference)
  { id: 'groq-llama-3.2-90b', name: 'Llama 3.2 90B (Groq)', provider: 'Groq', description: 'Ultra-fast inference', capabilities: ['text', 'vision'] },
  { id: 'groq-llama-3.1-70b', name: 'Llama 3.1 70B (Groq)', provider: 'Groq', description: 'Fast large model', capabilities: ['text'] },
  { id: 'groq-mixtral-8x7b', name: 'Mixtral 8x7B (Groq)', provider: 'Groq', description: 'Fast MoE inference', capabilities: ['text'] },
  { id: 'groq-gemma-7b', name: 'Gemma 7B (Groq)', provider: 'Groq', description: 'Fast compact model', capabilities: ['text'] },
  
  // Cohere Models
  { id: 'cohere-command-r-plus', name: 'Command R+', provider: 'Cohere', description: 'Best for RAG applications', capabilities: ['text', 'rag'] },
  { id: 'cohere-command-r', name: 'Command R', provider: 'Cohere', description: 'Scalable RAG model', capabilities: ['text', 'rag'] },
  { id: 'cohere-command', name: 'Command', provider: 'Cohere', description: 'General purpose model', capabilities: ['text'] },
  { id: 'cohere-embed-v3', name: 'Embed v3', provider: 'Cohere', description: 'Text embeddings', capabilities: ['embeddings'] },
  
  // xAI Models
  { id: 'xai-grok-2', name: 'Grok 2', provider: 'xAI', description: 'Latest Grok model', capabilities: ['text', 'vision'] },
  { id: 'xai-grok-2-mini', name: 'Grok 2 Mini', provider: 'xAI', description: 'Fast Grok model', capabilities: ['text'] },
  { id: 'xai-grok-beta', name: 'Grok Beta', provider: 'xAI', description: 'Beta features', capabilities: ['text'] },
  
  // Perplexity Models
  { id: 'perplexity-sonar-large', name: 'Sonar Large', provider: 'Perplexity', description: 'Online search model', capabilities: ['text', 'search'] },
  { id: 'perplexity-sonar-small', name: 'Sonar Small', provider: 'Perplexity', description: 'Fast search model', capabilities: ['text', 'search'] },
  
  // Together AI Models
  { id: 'together-qwen-2.5-72b', name: 'Qwen 2.5 72B', provider: 'Together', description: 'Alibaba large model', capabilities: ['text', 'coding'] },
  { id: 'together-deepseek-v2.5', name: 'DeepSeek V2.5', provider: 'Together', description: 'Efficient Chinese model', capabilities: ['text', 'coding'] },
  { id: 'together-yi-large', name: 'Yi Large', provider: 'Together', description: '01.AI model', capabilities: ['text'] },
  
  // Replicate Models
  { id: 'replicate-sdxl', name: 'SDXL', provider: 'Replicate', description: 'Image generation', capabilities: ['image'] },
  { id: 'replicate-flux', name: 'Flux', provider: 'Replicate', description: 'Fast image generation', capabilities: ['image'] },
  
  // Amazon Models
  { id: 'aws-titan-text', name: 'Titan Text', provider: 'AWS Bedrock', description: 'Amazon text model', capabilities: ['text'] },
  { id: 'aws-titan-embed', name: 'Titan Embed', provider: 'AWS Bedrock', description: 'Amazon embeddings', capabilities: ['embeddings'] },
  
  // Custom/Self-hosted
  { id: 'custom', name: 'Custom API Endpoint', provider: 'Custom', description: 'Use your own model endpoint', capabilities: ['text'] },
  { id: 'ollama-local', name: 'Ollama (Local)', provider: 'Local', description: 'Local model via Ollama', capabilities: ['text'] },
  { id: 'lmstudio-local', name: 'LM Studio (Local)', provider: 'Local', description: 'Local model via LM Studio', capabilities: ['text'] },
];

// Group AI models by provider
export const AI_MODELS_BY_PROVIDER = AI_MODELS.reduce((acc, model) => {
  if (!acc[model.provider]) {
    acc[model.provider] = [];
  }
  acc[model.provider].push(model);
  return acc;
}, {} as Record<string, AIModel[]>);
