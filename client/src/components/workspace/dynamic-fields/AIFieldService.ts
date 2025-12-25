/**
 * AI Field Service
 * 
 * Provides AI-powered features for dynamic fields:
 * - Auto-fill field values based on context
 * - Generate field suggestions
 * - Validate field values with AI
 * - Generate schemas from API documentation
 */

import type { 
  N8nField as FieldSchema,
  N8nOperation as ActionSchema,
} from '../n8n-schemas/types';

import type {
  AIFieldSuggestion, 
  AIValidationResult,
  FormState 
} from './types';

// ============================================
// TYPES
// ============================================

export interface AIFieldContext {
  // Current node info
  appId: string;
  actionId: string;
  fieldId: string;
  
  // Current form state
  currentValues: Record<string, any>;
  
  // Workflow context
  previousNodes?: Array<{
    id: string;
    appId: string;
    actionId: string;
    output?: any;
  }>;
  
  // Field schema
  fieldSchema: FieldSchema;
  actionSchema: ActionSchema;
  
  // User context
  userPrompt?: string;
}

export interface AIFillResult {
  value: any;
  confidence: number;
  explanation?: string;
}

export interface AISuggestionResult {
  suggestions: AIFieldSuggestion[];
  explanation?: string;
}

export interface AISchemaGenerationResult {
  schema: ActionSchema;
  confidence: number;
  warnings?: string[];
}

// ============================================
// AI PROMPTS
// ============================================

const SYSTEM_PROMPT = `You are an AI assistant helping users configure workflow automation nodes. 
Your job is to help fill in field values intelligently based on context.

Guidelines:
1. Use data from previous nodes when available (referenced as $node.{nodeId}.output)
2. Follow the field's validation rules and constraints
3. Provide realistic, production-ready values
4. For expressions, use the {{ }} syntax for dynamic values
5. Be concise but complete in your suggestions`;

const FIELD_FILL_PROMPT = (context: AIFieldContext) => `
Fill in a value for this field in a workflow automation:

**Action:** ${context.actionSchema.name}
**Field:** ${context.fieldSchema.name}
**Field Type:** ${context.fieldSchema.type}
**Description:** ${context.fieldSchema.description || 'No description'}
**Validation:** ${JSON.stringify(context.fieldSchema.validation || {})}

**Current Form Values:**
${JSON.stringify(context.currentValues, null, 2)}

${context.previousNodes?.length ? `**Previous Nodes in Workflow:**
${context.previousNodes.map(n => `- ${n.appId}/${n.actionId}: Output = ${JSON.stringify(n.output || 'unknown')}`).join('\n')}` : ''}

${context.userPrompt ? `**User Request:** ${context.userPrompt}` : ''}

Respond with JSON:
{
  "value": <the suggested value>,
  "confidence": <0-1 confidence score>,
  "explanation": "<brief explanation>"
}`;

const FIELD_SUGGESTIONS_PROMPT = (context: AIFieldContext) => `
Provide multiple suggestions for this field in a workflow automation:

**Action:** ${context.actionSchema.name}
**Field:** ${context.fieldSchema.name}
**Field Type:** ${context.fieldSchema.type}
**Description:** ${context.fieldSchema.description || 'No description'}

${context.fieldSchema.options?.length ? `**Available Options:**
${context.fieldSchema.options.map(o => `- ${o.value}: ${o.label}`).join('\n')}` : ''}

**Current Form Values:**
${JSON.stringify(context.currentValues, null, 2)}

${context.previousNodes?.length ? `**Previous Nodes:**
${context.previousNodes.map(n => `- ${n.appId}/${n.actionId}`).join('\n')}` : ''}

Respond with JSON:
{
  "suggestions": [
    {
      "value": <value>,
      "label": "<display label>",
      "confidence": <0-1>,
      "reason": "<why this suggestion>"
    }
  ],
  "explanation": "<overall explanation>"
}`;

const VALIDATION_PROMPT = (context: AIFieldContext, value: any) => `
Validate this field value for a workflow automation:

**Action:** ${context.actionSchema.name}
**Field:** ${context.fieldSchema.name}
**Type:** ${context.fieldSchema.type}
**Value:** ${JSON.stringify(value)}
**Validation Rules:** ${JSON.stringify(context.fieldSchema.validation || {})}

Check for:
1. Type correctness
2. Validation rule compliance
3. Logical consistency with other fields
4. Common mistakes or issues

**Other Form Values:**
${JSON.stringify(context.currentValues, null, 2)}

Respond with JSON:
{
  "isValid": <boolean>,
  "errors": ["<error messages>"],
  "warnings": ["<warning messages>"],
  "suggestions": ["<improvement suggestions>"]
}`;

const SCHEMA_GENERATION_PROMPT = (apiInfo: string) => `
Generate a field schema for a workflow action based on this API documentation:

${apiInfo}

Generate a complete ActionSchema with all fields, including:
- Required and optional fields
- Correct field types
- Validation rules
- Default values where appropriate
- Field groups for organization

Respond with JSON matching the ActionSchema type.`;

// ============================================
// AI SERVICE CLASS
// ============================================

export class AIFieldService {
  private apiEndpoint: string;
  private apiKey?: string;
  
  constructor(config?: { apiEndpoint?: string; apiKey?: string }) {
    this.apiEndpoint = config?.apiEndpoint || '/api/ai';
    this.apiKey = config?.apiKey;
  }
  
  /**
   * Call the AI API
   */
  private async callAI(prompt: string, systemPrompt?: string): Promise<any> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt || SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }
      
      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('AI call failed:', error);
      throw error;
    }
  }
  
  /**
   * Auto-fill a field value using AI
   */
  async fillField(context: AIFieldContext): Promise<AIFillResult> {
    try {
      const result = await this.callAI(FIELD_FILL_PROMPT(context));
      return {
        value: result.value,
        confidence: result.confidence || 0.5,
        explanation: result.explanation,
      };
    } catch (error) {
      // Fallback to rule-based fill
      return this.ruleBasedFill(context);
    }
  }
  
  /**
   * Get field suggestions using AI
   */
  async getSuggestions(context: AIFieldContext): Promise<AISuggestionResult> {
    try {
      const result = await this.callAI(FIELD_SUGGESTIONS_PROMPT(context));
      return {
        suggestions: result.suggestions || [],
        explanation: result.explanation,
      };
    } catch (error) {
      // Fallback to rule-based suggestions
      return this.ruleBasedSuggestions(context);
    }
  }
  
  /**
   * Validate a field value using AI
   */
  async validateField(context: AIFieldContext, value: any): Promise<AIValidationResult> {
    try {
      const result = await this.callAI(VALIDATION_PROMPT(context, value));
      return {
        isValid: result.isValid,
        errors: result.errors || [],
        warnings: result.warnings || [],
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      // Fallback to rule-based validation
      return this.ruleBasedValidation(context, value);
    }
  }
  
  /**
   * Generate a schema from API documentation
   */
  async generateSchema(apiInfo: string): Promise<AISchemaGenerationResult> {
    const result = await this.callAI(SCHEMA_GENERATION_PROMPT(apiInfo));
    return {
      schema: result,
      confidence: result.confidence || 0.7,
      warnings: result.warnings,
    };
  }
  
  // ============================================
  // RULE-BASED FALLBACKS
  // ============================================
  
  /**
   * Rule-based field fill (when AI is unavailable)
   */
  private ruleBasedFill(context: AIFieldContext): AIFillResult {
    const { fieldSchema, currentValues, previousNodes } = context;
    
    // Use default value if available
    if (fieldSchema.defaultValue !== undefined) {
      return {
        value: fieldSchema.defaultValue,
        confidence: 0.9,
        explanation: 'Using default value',
      };
    }
    
    // For expression fields, try to find matching data from previous nodes
    if (fieldSchema.type === 'expression' && previousNodes?.length) {
      const lastNode = previousNodes[previousNodes.length - 1];
      if (lastNode.output) {
        // Try to find a matching field in the output
        const fieldName = fieldSchema.id.toLowerCase();
        for (const key of Object.keys(lastNode.output)) {
          if (key.toLowerCase().includes(fieldName) || fieldName.includes(key.toLowerCase())) {
            return {
              value: `{{ $node.${lastNode.id}.output.${key} }}`,
              confidence: 0.7,
              explanation: `Mapped from ${lastNode.appId} output`,
            };
          }
        }
      }
    }
    
    // Generate placeholder based on field type
    const placeholder = this.generatePlaceholder(fieldSchema);
    return {
      value: placeholder,
      confidence: 0.3,
      explanation: 'Generated placeholder value',
    };
  }
  
  /**
   * Rule-based suggestions (when AI is unavailable)
   */
  private ruleBasedSuggestions(context: AIFieldContext): AISuggestionResult {
    const { fieldSchema, previousNodes } = context;
    const suggestions: AIFieldSuggestion[] = [];
    
    // Add options as suggestions if available
    if (fieldSchema.options?.length) {
      fieldSchema.options.slice(0, 5).forEach(option => {
        suggestions.push({
          fieldId: fieldSchema.id,
          value: option.value,
          label: option.label,
          confidence: 0.8,
          reasoning: option.description || 'Available option',
        });
      });
    }
    
    // Add default value as suggestion
    if (fieldSchema.defaultValue !== undefined) {
      suggestions.push({
        fieldId: fieldSchema.id,
        value: fieldSchema.defaultValue,
        label: `Default: ${fieldSchema.defaultValue}`,
        confidence: 0.9,
        reasoning: 'Recommended default value',
      });
    }
    
    // For expression fields, suggest previous node outputs
    if (fieldSchema.type === 'expression' && previousNodes?.length) {
      previousNodes.forEach(node => {
        if (node.output) {
          Object.keys(node.output).slice(0, 3).forEach(key => {
            suggestions.push({
              fieldId: fieldSchema.id,
              value: `{{ $node.${node.id}.output.${key} }}`,
              label: `${node.appId} → ${key}`,
              confidence: 0.6,
              reasoning: `Use output from ${node.appId}`,
            });
          });
        }
      });
    }
    
    return {
      suggestions: suggestions.slice(0, 5),
      explanation: 'Rule-based suggestions',
    };
  }
  
  /**
   * Rule-based validation (when AI is unavailable)
   */
  private ruleBasedValidation(context: AIFieldContext, value: any): AIValidationResult {
    const { fieldSchema } = context;
    const errorMessages: string[] = [];
    const warnings: string[] = [];
    const validation = fieldSchema.validation || {};
    
    // Required check
    if (validation.required && (value === undefined || value === null || value === '')) {
      errorMessages.push(`${fieldSchema.name} is required`);
    }
    
    if (value !== undefined && value !== null && value !== '') {
      // Type-specific validation
      switch (fieldSchema.type) {
        case 'number':
        case 'slider':
          if (typeof value !== 'number') {
            errorMessages.push(`${fieldSchema.name} must be a number`);
          } else {
            if (validation.min !== undefined && value < validation.min) {
              errorMessages.push(`${fieldSchema.name} must be at least ${validation.min}`);
            }
            if (validation.max !== undefined && value > validation.max) {
              errorMessages.push(`${fieldSchema.name} must be at most ${validation.max}`);
            }
          }
          break;
          
        case 'text':
        case 'textarea':
        case 'expression':
          if (typeof value !== 'string') {
            errorMessages.push(`${fieldSchema.name} must be text`);
          } else {
            if (validation.minLength !== undefined && value.length < validation.minLength) {
              errorMessages.push(`${fieldSchema.name} must be at least ${validation.minLength} characters`);
            }
            if (validation.maxLength !== undefined && value.length > validation.maxLength) {
              errorMessages.push(`${fieldSchema.name} must be at most ${validation.maxLength} characters`);
            }
            if (validation.pattern) {
              const regex = new RegExp(validation.pattern);
              if (!regex.test(value)) {
                errorMessages.push(`${fieldSchema.name} format is invalid`);
              }
            }
          }
          break;
          
        case 'email':
          if (typeof value === 'string' && !value.includes('@')) {
            errorMessages.push(`${fieldSchema.name} must be a valid email`);
          }
          break;
          
        case 'url':
          if (typeof value === 'string' && !value.startsWith('http')) {
            warnings.push(`${fieldSchema.name} should start with http:// or https://`);
          }
          break;
          
        case 'select':
          if (fieldSchema.options && !fieldSchema.options.some(o => o.value === value)) {
            if (!fieldSchema.allowCustom) {
              errorMessages.push(`${fieldSchema.name} must be one of the available options`);
            }
          }
          break;
          
        case 'json':
          if (typeof value === 'string') {
            try {
              JSON.parse(value);
            } catch {
              errorMessages.push(`${fieldSchema.name} must be valid JSON`);
            }
          }
          break;
      }
    }
    
    // Convert string errors to proper error objects
    const errors = errorMessages.map(msg => ({
      fieldId: fieldSchema.id,
      message: msg,
      severity: 'error' as const,
    }));
    
    return {
      isValid: errorMessages.length === 0,
      errors,
      warnings,
    };
  }
  
  /**
   * Generate a placeholder value based on field type
   */
  private generatePlaceholder(field: FieldSchema): any {
    switch (field.type) {
      case 'text':
      case 'expression':
        return '';
      case 'number':
      case 'slider':
        return field.defaultValue ?? 0;
      case 'boolean':
        return field.defaultValue ?? false;
      case 'select':
        return field.options?.[0]?.value || '';
      case 'multi-select':
        return [];
      case 'json':
        return {};
      case 'array':
        return [];
      case 'key-value':
        return [{ key: '', value: '' }];
      default:
        return '';
    }
  }
}

// ============================================
// HOOK FOR USING AI FIELD SERVICE
// ============================================

import { useState, useCallback, useRef } from 'react';

interface UseAIFieldsOptions {
  apiEndpoint?: string;
  apiKey?: string;
  debounceMs?: number;
}

interface UseAIFieldsResult {
  fillField: (context: AIFieldContext) => Promise<AIFillResult>;
  getSuggestions: (context: AIFieldContext) => Promise<AISuggestionResult>;
  validateField: (context: AIFieldContext, value: any) => Promise<AIValidationResult>;
  isLoading: boolean;
  error: string | null;
}

export function useAIFields(options?: UseAIFieldsOptions): UseAIFieldsResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<AIFieldService>();
  
  // Initialize service lazily
  if (!serviceRef.current) {
    serviceRef.current = new AIFieldService({
      apiEndpoint: options?.apiEndpoint,
      apiKey: options?.apiKey,
    });
  }
  
  const fillField = useCallback(async (context: AIFieldContext) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await serviceRef.current!.fillField(context);
      return result;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const getSuggestions = useCallback(async (context: AIFieldContext) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await serviceRef.current!.getSuggestions(context);
      return result;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const validateField = useCallback(async (context: AIFieldContext, value: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await serviceRef.current!.validateField(context, value);
      return result;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    fillField,
    getSuggestions,
    validateField,
    isLoading,
    error,
  };
}

// ============================================
// EXPRESSION HELPERS
// ============================================

/**
 * Parse expression to extract variable references
 */
export function parseExpression(expression: string): Array<{ nodeId: string; path: string }> {
  const regex = /\{\{\s*\$node\.([^.]+)\.output\.([^}\s]+)\s*\}\}/g;
  const references: Array<{ nodeId: string; path: string }> = [];
  
  let match;
  while ((match = regex.exec(expression)) !== null) {
    references.push({
      nodeId: match[1],
      path: match[2],
    });
  }
  
  return references;
}

/**
 * Evaluate an expression with given node outputs
 */
export function evaluateExpression(
  expression: string,
  nodeOutputs: Record<string, any>
): any {
  // If not an expression, return as-is
  if (!expression.includes('{{')) {
    return expression;
  }
  
  // Replace all expression placeholders
  return expression.replace(
    /\{\{\s*\$node\.([^.]+)\.output\.([^}\s]+)\s*\}\}/g,
    (_, nodeId, path) => {
      const output = nodeOutputs[nodeId];
      if (!output) return '';
      
      // Navigate the path
      const parts = path.split('.');
      let value = output;
      for (const part of parts) {
        value = value?.[part];
      }
      
      return value?.toString() ?? '';
    }
  );
}

/**
 * Build an expression from a node output path
 */
export function buildExpression(nodeId: string, path: string): string {
  return `{{ $node.${nodeId}.output.${path} }}`;
}

// Export singleton instance for convenience
export const aiFieldService = new AIFieldService();
