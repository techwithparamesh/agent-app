/**
 * AI Decision Layer
 * Uses AI ONLY for: Intent detection, Entity extraction, Natural language response
 * AI MUST NOT: Check availability, Book slots, Decide business rules
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  AIDecision,
  Intent,
  ExtractedEntities,
  ConversationContext,
  ToolName,
  AgentConfig,
  NormalizedMessage,
  ToolResult,
} from './types';

// Initialize Anthropic client
const anthropic = new Anthropic();

export class AIDecisionLayer {
  /**
   * Analyze user message and extract intent + entities
   */
  async analyzeMessage(
    message: NormalizedMessage,
    context: ConversationContext,
    agentConfig: AgentConfig
  ): Promise<AIDecision> {
    const systemPrompt = this.buildAnalysisPrompt(agentConfig);
    const userContext = this.buildContextString(context);
    const capabilities = agentConfig.capabilities || [];

    const prompt = `You are an AI assistant analyzing a WhatsApp message. Your job is to understand what the user wants and extract relevant information.

${userContext}

Current message: "${message.content}"
Message type: ${message.type}
${message.interactiveReply ? `Interactive reply: ${message.interactiveReply.title} (id: ${message.interactiveReply.id})` : ''}

Agent capabilities: ${capabilities.join(', ') || 'general support'}

INSTRUCTIONS:
1. Identify the user's intent from this list: greeting, book_appointment, check_availability, cancel_appointment, reschedule_appointment, check_status, ask_question, provide_info, make_order, track_order, billing_inquiry, human_handoff, feedback, goodbye, unknown
2. Extract any entities mentioned (date, time, name, phone, email, service type, etc.)
3. Determine if this requires a tool action
4. Suggest which tool to use if applicable

RESPOND WITH VALID JSON ONLY (no markdown, no code blocks):
{
  "intent": "<intent>",
  "entities": {
    "date": "<YYYY-MM-DD or null>",
    "time": "<HH:mm or null>",
    "name": "<string or null>",
    "phone": "<string or null>",
    "email": "<string or null>",
    "serviceType": "<string or null>",
    "appointmentId": "<string or null>",
    "orderId": "<string or null>"
  },
  "confidence": <0.0-1.0>,
  "requiresAction": <true/false>,
  "suggestedTool": "<tool_name or null>",
  "responseHint": "<brief hint for response>"
}`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          { role: 'user', content: prompt }
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      // Parse JSON response
      const decision = this.parseAIResponse(content.text);
      return decision;
    } catch (error) {
      console.error('[AIDecisionLayer] Error analyzing message:', error);
      
      // Return safe default
      return {
        intent: 'unknown',
        entities: {},
        confidence: 0.5,
        requiresAction: false,
        responseHint: 'I\'m not sure what you need. Could you please rephrase?',
      };
    }
  }

  /**
   * Generate natural language response based on context and tool results
   */
  async generateResponse(
    context: ConversationContext,
    agentConfig: AgentConfig,
    toolResult?: ToolResult,
    additionalContext?: string
  ): Promise<string> {
    const systemPrompt = agentConfig.systemPrompt || this.getDefaultSystemPrompt(agentConfig);
    
    let prompt = `${systemPrompt}

CONVERSATION HISTORY:
${context.messageHistory.slice(-5).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

`;

    if (toolResult) {
      prompt += `TOOL RESULT:
Tool: ${context.lastToolUsed}
Success: ${toolResult.success}
Message: ${toolResult.message}
${toolResult.data ? `Data: ${JSON.stringify(toolResult.data)}` : ''}
${toolResult.options ? `Options: ${JSON.stringify(toolResult.options)}` : ''}

`;
    }

    if (additionalContext) {
      prompt += `ADDITIONAL CONTEXT:
${additionalContext}

`;
    }

    if (context.missingFields && context.missingFields.length > 0) {
      prompt += `MISSING INFORMATION: ${context.missingFields.join(', ')}

`;
    }

    prompt += `Generate a helpful, conversational WhatsApp response. Keep it concise and friendly.
- Use short messages (this is WhatsApp, not email)
- Be warm but professional
- If there are options to present, format them clearly
- If asking for information, ask one thing at a time
- Use emojis sparingly 😊

RESPOND WITH THE MESSAGE TEXT ONLY (no JSON, no quotes, just the message):`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          { role: 'user', content: prompt }
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      return content.text.trim();
    } catch (error) {
      console.error('[AIDecisionLayer] Error generating response:', error);
      
      // Fallback response
      if (toolResult) {
        return toolResult.message;
      }
      return 'I apologize, but I\'m having trouble processing your request. Could you please try again?';
    }
  }

  /**
   * Determine which fields are still needed for a flow
   */
  async determineMissingFields(
    context: ConversationContext,
    requiredFields: string[],
    entities: ExtractedEntities
  ): Promise<string[]> {
    const collected = context.collectedData;
    const missing: string[] = [];

    for (const field of requiredFields) {
      if (!collected[field] && !entities[field]) {
        missing.push(field);
      }
    }

    return missing;
  }

  /**
   * Generate prompt to collect missing information
   */
  async generateCollectionPrompt(
    missingField: string,
    context: ConversationContext,
    agentConfig: AgentConfig
  ): Promise<string> {
    const prompts: Record<string, string> = {
      name: 'Could you please tell me your name?',
      phone: 'What\'s your phone number?',
      email: 'What\'s your email address?',
      date: 'Which date works best for you?',
      time: 'What time would you prefer?',
      serviceType: 'What service are you interested in?',
      address: 'What\'s your address?',
    };

    return prompts[missingField] || `Could you please provide your ${missingField}?`;
  }

  /**
   * Parse and validate AI JSON response
   */
  private parseAIResponse(text: string): AIDecision {
    try {
      // Clean up potential markdown formatting
      let cleanText = text.trim();
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```json?\n?/g, '').replace(/```$/g, '');
      }
      
      const parsed = JSON.parse(cleanText);
      
      // Validate and normalize
      return {
        intent: this.validateIntent(parsed.intent),
        entities: this.normalizeEntities(parsed.entities || {}),
        confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
        requiresAction: Boolean(parsed.requiresAction),
        suggestedTool: parsed.suggestedTool || undefined,
        responseHint: parsed.responseHint || undefined,
      };
    } catch (error) {
      console.error('[AIDecisionLayer] Failed to parse AI response:', text);
      return {
        intent: 'unknown',
        entities: {},
        confidence: 0.3,
        requiresAction: false,
      };
    }
  }

  /**
   * Validate intent is one of the known types
   */
  private validateIntent(intent: string): Intent {
    const validIntents: Intent[] = [
      'greeting', 'book_appointment', 'check_availability', 'cancel_appointment',
      'reschedule_appointment', 'check_status', 'ask_question', 'provide_info',
      'make_order', 'track_order', 'billing_inquiry', 'human_handoff',
      'feedback', 'goodbye', 'unknown'
    ];
    
    return validIntents.includes(intent as Intent) ? intent as Intent : 'unknown';
  }

  /**
   * Normalize extracted entities
   */
  private normalizeEntities(entities: Record<string, any>): ExtractedEntities {
    const normalized: ExtractedEntities = {};

    if (entities.date) {
      // Try to parse and normalize date
      const dateStr = this.parseDate(entities.date);
      if (dateStr) normalized.date = dateStr;
    }

    if (entities.time) {
      // Normalize time format
      const timeStr = this.normalizeTime(entities.time);
      if (timeStr) normalized.time = timeStr;
    }

    // Copy other entities as-is
    for (const key of ['name', 'phone', 'email', 'serviceType', 'appointmentId', 'orderId']) {
      if (entities[key]) {
        normalized[key] = entities[key];
      }
    }

    return normalized;
  }

  /**
   * Parse natural language date to YYYY-MM-DD
   */
  private parseDate(dateInput: string): string | null {
    if (!dateInput) return null;

    const today = new Date();
    const input = dateInput.toLowerCase().trim();

    // Handle relative dates
    if (input === 'today') {
      return today.toISOString().split('T')[0];
    }
    if (input === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    if (input.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    }

    // Try to parse as date string
    try {
      const parsed = new Date(dateInput);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch {}

    return null;
  }

  /**
   * Normalize time to HH:mm format
   */
  private normalizeTime(timeInput: string): string | null {
    if (!timeInput) return null;

    const input = timeInput.toLowerCase().trim();

    // Handle 12-hour format
    const ampm = input.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
    if (ampm) {
      let hours = parseInt(ampm[1]);
      const minutes = ampm[2] ? parseInt(ampm[2]) : 0;
      const period = ampm[3].toLowerCase();

      if (period === 'pm' && hours < 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Handle 24-hour format
    const time24 = input.match(/(\d{1,2}):(\d{2})/);
    if (time24) {
      return `${time24[1].padStart(2, '0')}:${time24[2]}`;
    }

    return null;
  }

  /**
   * Build context string for AI
   */
  private buildContextString(context: ConversationContext): string {
    let str = '';

    if (context.messageHistory.length > 0) {
      str += 'Recent conversation:\n';
      str += context.messageHistory.slice(-3).map(m => 
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');
      str += '\n\n';
    }

    if (Object.keys(context.collectedData).length > 0) {
      str += `Collected information: ${JSON.stringify(context.collectedData)}\n\n`;
    }

    if (context.currentIntent) {
      str += `Current intent: ${context.currentIntent}\n`;
    }

    return str;
  }

  /**
   * Build analysis prompt based on agent config
   */
  private buildAnalysisPrompt(agentConfig: AgentConfig): string {
    return `You are analyzing messages for ${agentConfig.name}.
Business category: ${agentConfig.businessCategory || 'General'}
Tone: ${agentConfig.toneOfVoice || 'Professional'}`;
  }

  /**
   * Get default system prompt
   */
  private getDefaultSystemPrompt(agentConfig: AgentConfig): string {
    return `You are a helpful WhatsApp AI assistant for ${agentConfig.name}.
Tone: ${agentConfig.toneOfVoice || 'Professional'}
Language: ${agentConfig.language || 'English'}

Guidelines:
- Be friendly and conversational
- Keep messages short and clear
- Ask one question at a time
- Confirm important details
- Use emojis sparingly`;
  }
}

// Export singleton instance
export const aiDecisionLayer = new AIDecisionLayer();
