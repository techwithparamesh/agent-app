/**
 * Anthropic (Claude) Provider
 */

import type { LLMProvider, LLMCompletionOptions } from "./types";

export class AnthropicProvider implements LLMProvider {
  name = "anthropic";
  
  private getApiKey(): string | undefined {
    return process.env.ANTHROPIC_API_KEY;
  }

  isAvailable(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 0);
  }

  async complete(options: LLMCompletionOptions): Promise<string | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    try {
      // Separate system message from other messages
      const systemMessage = options.messages.find(m => m.role === "system");
      const otherMessages = options.messages.filter(m => m.role !== "system");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: options.maxTokens ?? 500,
          ...(systemMessage ? { system: systemMessage.content } : {}),
          messages: otherMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[LLM:Anthropic] API error ${response.status}:`, errorText);
        return null;
      }

      const data = await response.json();
      const content = data.content?.[0];
      if (content?.type === "text") {
        return content.text;
      }
      return null;
    } catch (error) {
      console.error("[LLM:Anthropic] Request failed:", error);
      return null;
    }
  }
}
