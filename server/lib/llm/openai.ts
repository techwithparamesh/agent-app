/**
 * OpenAI Provider
 */

import type { LLMProvider, LLMCompletionOptions } from "./types";

export class OpenAIProvider implements LLMProvider {
  name = "openai";
  
  private getApiKey(): string | undefined {
    return process.env.OPENAI_API_KEY;
  }

  isAvailable(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 0);
  }

  async complete(options: LLMCompletionOptions): Promise<string | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
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
        console.error(`[LLM:OpenAI] API error ${response.status}:`, errorText);
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (error) {
      console.error("[LLM:OpenAI] Request failed:", error);
      return null;
    }
  }
}
