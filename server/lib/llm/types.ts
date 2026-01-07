/**
 * LLM Provider Types
 * 
 * Common types for all LLM providers
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMCompletionOptions {
  messages: LLMMessage[];
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export interface LLMProvider {
  name: string;
  isAvailable(): boolean;
  complete(options: LLMCompletionOptions): Promise<string | null>;
}

export type LLMProviderName = "anthropic" | "openai" | "gemini" | "groq";
