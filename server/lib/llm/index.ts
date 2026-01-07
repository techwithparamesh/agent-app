/**
 * Unified LLM Interface
 * 
 * Auto-detects which LLM provider is available based on environment variables.
 * Priority order: Anthropic > OpenAI > Gemini > Groq
 * 
 * Usage:
 *   import { llm, isLLMAvailable } from "./server/lib/llm";
 *   
 *   if (isLLMAvailable()) {
 *     const response = await llm.complete({
 *       messages: [
 *         { role: "system", content: "You are helpful" },
 *         { role: "user", content: "Hello!" }
 *       ]
 *     });
 *   }
 * 
 * Supported environment variables:
 *   - ANTHROPIC_API_KEY (Claude)
 *   - OPENAI_API_KEY (GPT-4, etc.)
 *   - GEMINI_API_KEY or GOOGLE_AI_API_KEY (Google Gemini)
 *   - GROQ_API_KEY (Llama, Mixtral via Groq)
 */

import type { LLMProvider, LLMCompletionOptions, LLMMessage, LLMProviderName } from "./types";
import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";

// Provider instances (lazy initialization)
let _providers: LLMProvider[] | null = null;

function getProviders(): LLMProvider[] {
  if (!_providers) {
    // Order matters - first available will be used
    _providers = [
      new AnthropicProvider(),
      new OpenAIProvider(),
      new GeminiProvider(),
      new GroqProvider(),
    ];
  }
  return _providers;
}

/**
 * Get the first available LLM provider
 */
function getActiveProvider(): LLMProvider | null {
  const providers = getProviders();
  for (const provider of providers) {
    if (provider.isAvailable()) {
      return provider;
    }
  }
  return null;
}

/**
 * Check if any LLM provider is available
 */
export function isLLMAvailable(): boolean {
  return getActiveProvider() !== null;
}

/**
 * Get the name of the active LLM provider
 */
export function getActiveLLMName(): string | null {
  const provider = getActiveProvider();
  return provider?.name || null;
}

/**
 * List all available LLM providers
 */
export function getAvailableLLMs(): string[] {
  return getProviders()
    .filter(p => p.isAvailable())
    .map(p => p.name);
}

/**
 * Complete a prompt using the first available LLM
 */
async function complete(options: LLMCompletionOptions): Promise<string | null> {
  const provider = getActiveProvider();
  if (!provider) {
    console.warn("[LLM] No LLM provider available. Set one of: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, GROQ_API_KEY");
    return null;
  }
  
  console.log(`[LLM] Using provider: ${provider.name}`);
  return provider.complete(options);
}

/**
 * Helper: Complete with system prompt and user message
 */
async function chat(systemPrompt: string, userMessage: string, jsonMode = false): Promise<string | null> {
  return complete({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    jsonMode,
  });
}

/**
 * Helper: Parse JSON from LLM response (handles markdown code blocks)
 */
export function parseJSON<T = unknown>(content: string | null): T | null {
  if (!content) return null;
  
  try {
    // Try direct parse first
    return JSON.parse(content) as T;
  } catch {
    // Try to extract JSON from markdown code blocks or text
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                      content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr) as T;
      } catch {
        console.error("[LLM] Failed to parse JSON from response:", content.substring(0, 200));
      }
    }
  }
  return null;
}

// Export unified LLM interface
export const llm = {
  complete,
  chat,
  isAvailable: isLLMAvailable,
  getActiveName: getActiveLLMName,
  getAvailable: getAvailableLLMs,
};

// Re-export types
export type { LLMProvider, LLMCompletionOptions, LLMMessage, LLMProviderName };
