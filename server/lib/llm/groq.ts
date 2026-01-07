/**
 * Groq Provider (Fast inference for Llama, Mixtral, etc.)
 */

import type { LLMProvider, LLMCompletionOptions } from "./types";

export class GroqProvider implements LLMProvider {
  name = "groq";
  
  private getApiKey(): string | undefined {
    return process.env.GROQ_API_KEY;
  }

  isAvailable(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 0);
  }

  async complete(options: LLMCompletionOptions): Promise<string | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // Fast and capable
          messages: options.messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          temperature: options.temperature ?? 0,
          max_tokens: options.maxTokens ?? 500,
          ...(options.jsonMode ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[LLM:Groq] API error ${response.status}:`, errorText);
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (error) {
      console.error("[LLM:Groq] Request failed:", error);
      return null;
    }
  }
}
