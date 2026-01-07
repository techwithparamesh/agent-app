/**
 * Google Gemini Provider
 */

import type { LLMProvider, LLMCompletionOptions } from "./types";

export class GeminiProvider implements LLMProvider {
  name = "gemini";
  
  private getApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  }

  isAvailable(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 0);
  }

  async complete(options: LLMCompletionOptions): Promise<string | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) return null;

    try {
      // Convert messages to Gemini format
      const systemMessage = options.messages.find(m => m.role === "system");
      const otherMessages = options.messages.filter(m => m.role !== "system");

      const contents = otherMessages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      // Prepend system instruction to first user message if present
      if (systemMessage && contents.length > 0 && contents[0].role === "user") {
        contents[0].parts[0].text = `${systemMessage.content}\n\n${contents[0].parts[0].text}`;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: options.temperature ?? 0,
              maxOutputTokens: options.maxTokens ?? 500,
              ...(options.jsonMode ? { responseMimeType: "application/json" } : {}),
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[LLM:Gemini] API error ${response.status}:`, errorText);
        return null;
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
      console.error("[LLM:Gemini] Request failed:", error);
      return null;
    }
  }
}
