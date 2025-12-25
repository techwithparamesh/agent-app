/**
 * Anthropic n8n-style Schema
 * 
 * Comprehensive Anthropic Claude API operations
 */

import { N8nAppSchema } from './types';

export const anthropicSchema: N8nAppSchema = {
  id: 'anthropic',
  name: 'Anthropic',
  description: 'Anthropic Claude AI models',
  version: '1.0.0',
  color: '#D97757',
  icon: 'anthropic',
  group: ['ai', 'llm'],
  
  credentials: [
    {
      name: 'anthropicApi',
      displayName: 'Anthropic API',
      required: true,
      type: 'apiKey',
      properties: [
        {
          name: 'apiKey',
          displayName: 'API Key',
          type: 'string',
          required: true,
          typeOptions: {
            password: true,
          },
        },
      ],
    },
  ],
  
  resources: [
    // ============================================
    // MESSAGE RESOURCE
    // ============================================
    {
      id: 'message',
      name: 'Message',
      value: 'message',
      description: 'Message/chat operations',
      operations: [
        {
          id: 'create_message',
          name: 'Create Message',
          value: 'create',
          description: 'Create a message using Claude',
          action: 'Create message',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Claude 4 Opus', value: 'claude-opus-4-20250514' },
                { name: 'Claude 4 Sonnet', value: 'claude-sonnet-4-20250514' },
                { name: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet-20250219' },
                { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
                { name: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku-20241022' },
                { name: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
                { name: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
                { name: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
              ],
              default: 'claude-sonnet-4-20250514',
            },
            {
              id: 'messages',
              name: 'messages',
              displayName: 'Messages',
              type: 'fixedCollection',
              required: true,
              typeOptions: {
                multipleValues: true,
              },
              options: [
                {
                  name: 'messageValues',
                  displayName: 'Message',
                  values: [
                    {
                      name: 'role',
                      displayName: 'Role',
                      type: 'options',
                      options: [
                        { name: 'User', value: 'user' },
                        { name: 'Assistant', value: 'assistant' },
                      ],
                    },
                    {
                      name: 'content',
                      displayName: 'Content',
                      type: 'string',
                      typeOptions: {
                        rows: 4,
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: 'max_tokens',
              name: 'maxTokens',
              displayName: 'Max Tokens',
              type: 'number',
              required: true,
              default: 1024,
            },
          ],
          optionalFields: [
            {
              id: 'system',
              name: 'system',
              displayName: 'System Prompt',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'temperature',
              name: 'temperature',
              displayName: 'Temperature',
              type: 'number',
              required: false,
              default: 1,
              description: 'Value between 0 and 1',
            },
            {
              id: 'top_p',
              name: 'topP',
              displayName: 'Top P',
              type: 'number',
              required: false,
              description: 'Nucleus sampling parameter',
            },
            {
              id: 'top_k',
              name: 'topK',
              displayName: 'Top K',
              type: 'number',
              required: false,
              description: 'Top-k sampling parameter',
            },
            {
              id: 'stop_sequences',
              name: 'stopSequences',
              displayName: 'Stop Sequences',
              type: 'string',
              required: false,
              description: 'Comma-separated stop sequences',
            },
            {
              id: 'stream',
              name: 'stream',
              displayName: 'Stream Response',
              type: 'boolean',
              required: false,
              default: false,
            },
            {
              id: 'metadata',
              name: 'metadata',
              displayName: 'User ID (Metadata)',
              type: 'string',
              required: false,
              description: 'User identifier for tracking',
            },
          ],
        },
        {
          id: 'create_message_simple',
          name: 'Create Simple Message',
          value: 'createSimple',
          description: 'Create a simple single-turn message',
          action: 'Create simple message',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Claude 4 Opus', value: 'claude-opus-4-20250514' },
                { name: 'Claude 4 Sonnet', value: 'claude-sonnet-4-20250514' },
                { name: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet-20250219' },
                { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
                { name: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku-20241022' },
                { name: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
                { name: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
                { name: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
              ],
              default: 'claude-sonnet-4-20250514',
            },
            {
              id: 'prompt',
              name: 'prompt',
              displayName: 'Prompt',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'max_tokens',
              name: 'maxTokens',
              displayName: 'Max Tokens',
              type: 'number',
              required: true,
              default: 1024,
            },
          ],
          optionalFields: [
            {
              id: 'system',
              name: 'system',
              displayName: 'System Prompt',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'temperature',
              name: 'temperature',
              displayName: 'Temperature',
              type: 'number',
              required: false,
              default: 1,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // VISION RESOURCE
    // ============================================
    {
      id: 'vision',
      name: 'Vision',
      value: 'vision',
      description: 'Image analysis operations',
      operations: [
        {
          id: 'analyze_image',
          name: 'Analyze Image',
          value: 'analyze',
          description: 'Analyze an image using Claude vision',
          action: 'Analyze image',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Claude 4 Opus', value: 'claude-opus-4-20250514' },
                { name: 'Claude 4 Sonnet', value: 'claude-sonnet-4-20250514' },
                { name: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet-20250219' },
                { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
                { name: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
                { name: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
                { name: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
              ],
              default: 'claude-sonnet-4-20250514',
            },
            {
              id: 'image_source',
              name: 'imageSource',
              displayName: 'Image Source',
              type: 'options',
              required: true,
              options: [
                { name: 'URL', value: 'url' },
                { name: 'Base64', value: 'base64' },
              ],
            },
            {
              id: 'image_data',
              name: 'imageData',
              displayName: 'Image URL or Base64',
              type: 'string',
              required: true,
            },
            {
              id: 'prompt',
              name: 'prompt',
              displayName: 'Prompt',
              type: 'string',
              required: true,
              default: 'Describe this image',
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'max_tokens',
              name: 'maxTokens',
              displayName: 'Max Tokens',
              type: 'number',
              required: true,
              default: 1024,
            },
          ],
          optionalFields: [
            {
              id: 'media_type',
              name: 'mediaType',
              displayName: 'Media Type',
              type: 'options',
              required: false,
              options: [
                { name: 'JPEG', value: 'image/jpeg' },
                { name: 'PNG', value: 'image/png' },
                { name: 'GIF', value: 'image/gif' },
                { name: 'WebP', value: 'image/webp' },
              ],
              displayOptions: {
                show: {
                  imageSource: ['base64'],
                },
              },
            },
            {
              id: 'system',
              name: 'system',
              displayName: 'System Prompt',
              type: 'string',
              required: false,
            },
            {
              id: 'temperature',
              name: 'temperature',
              displayName: 'Temperature',
              type: 'number',
              required: false,
              default: 1,
            },
          ],
        },
        {
          id: 'analyze_multiple_images',
          name: 'Analyze Multiple Images',
          value: 'analyzeMultiple',
          description: 'Analyze multiple images in a single request',
          action: 'Analyze multiple images',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Claude 4 Opus', value: 'claude-opus-4-20250514' },
                { name: 'Claude 4 Sonnet', value: 'claude-sonnet-4-20250514' },
                { name: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet-20250219' },
                { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
                { name: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
              ],
              default: 'claude-sonnet-4-20250514',
            },
            {
              id: 'images',
              name: 'images',
              displayName: 'Images',
              type: 'fixedCollection',
              required: true,
              typeOptions: {
                multipleValues: true,
              },
              options: [
                {
                  name: 'imageValues',
                  displayName: 'Image',
                  values: [
                    {
                      name: 'source',
                      displayName: 'Source',
                      type: 'options',
                      options: [
                        { name: 'URL', value: 'url' },
                        { name: 'Base64', value: 'base64' },
                      ],
                    },
                    {
                      name: 'data',
                      displayName: 'Data',
                      type: 'string',
                    },
                  ],
                },
              ],
            },
            {
              id: 'prompt',
              name: 'prompt',
              displayName: 'Prompt',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'max_tokens',
              name: 'maxTokens',
              displayName: 'Max Tokens',
              type: 'number',
              required: true,
              default: 1024,
            },
          ],
          optionalFields: [
            {
              id: 'system',
              name: 'system',
              displayName: 'System Prompt',
              type: 'string',
              required: false,
            },
            {
              id: 'temperature',
              name: 'temperature',
              displayName: 'Temperature',
              type: 'number',
              required: false,
              default: 1,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // TOOL USE RESOURCE
    // ============================================
    {
      id: 'tool_use',
      name: 'Tool Use',
      value: 'toolUse',
      description: 'Function calling operations',
      operations: [
        {
          id: 'create_with_tools',
          name: 'Create with Tools',
          value: 'createWithTools',
          description: 'Create a message with tool/function definitions',
          action: 'Create with tools',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Claude 4 Opus', value: 'claude-opus-4-20250514' },
                { name: 'Claude 4 Sonnet', value: 'claude-sonnet-4-20250514' },
                { name: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet-20250219' },
                { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
                { name: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
              ],
              default: 'claude-sonnet-4-20250514',
            },
            {
              id: 'prompt',
              name: 'prompt',
              displayName: 'Prompt',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'tools',
              name: 'tools',
              displayName: 'Tools (JSON)',
              type: 'json',
              required: true,
              description: 'Array of tool definitions',
            },
            {
              id: 'max_tokens',
              name: 'maxTokens',
              displayName: 'Max Tokens',
              type: 'number',
              required: true,
              default: 1024,
            },
          ],
          optionalFields: [
            {
              id: 'system',
              name: 'system',
              displayName: 'System Prompt',
              type: 'string',
              required: false,
            },
            {
              id: 'tool_choice',
              name: 'toolChoice',
              displayName: 'Tool Choice',
              type: 'options',
              required: false,
              options: [
                { name: 'Auto', value: 'auto' },
                { name: 'Any', value: 'any' },
                { name: 'Specific Tool', value: 'tool' },
              ],
            },
            {
              id: 'specific_tool',
              name: 'specificTool',
              displayName: 'Specific Tool Name',
              type: 'string',
              required: false,
              displayOptions: {
                show: {
                  toolChoice: ['tool'],
                },
              },
            },
            {
              id: 'temperature',
              name: 'temperature',
              displayName: 'Temperature',
              type: 'number',
              required: false,
              default: 1,
            },
          ],
        },
        {
          id: 'continue_with_tool_result',
          name: 'Continue with Tool Result',
          value: 'continueWithResult',
          description: 'Continue conversation with tool execution results',
          action: 'Continue with tool result',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Claude 4 Opus', value: 'claude-opus-4-20250514' },
                { name: 'Claude 4 Sonnet', value: 'claude-sonnet-4-20250514' },
                { name: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet-20250219' },
                { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
              ],
              default: 'claude-sonnet-4-20250514',
            },
            {
              id: 'conversation_history',
              name: 'conversationHistory',
              displayName: 'Conversation History (JSON)',
              type: 'json',
              required: true,
              description: 'Previous messages including tool use block',
            },
            {
              id: 'tool_use_id',
              name: 'toolUseId',
              displayName: 'Tool Use ID',
              type: 'string',
              required: true,
            },
            {
              id: 'tool_result',
              name: 'toolResult',
              displayName: 'Tool Result',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'tools',
              name: 'tools',
              displayName: 'Tools (JSON)',
              type: 'json',
              required: true,
            },
            {
              id: 'max_tokens',
              name: 'maxTokens',
              displayName: 'Max Tokens',
              type: 'number',
              required: true,
              default: 1024,
            },
          ],
          optionalFields: [
            {
              id: 'system',
              name: 'system',
              displayName: 'System Prompt',
              type: 'string',
              required: false,
            },
            {
              id: 'is_error',
              name: 'isError',
              displayName: 'Is Error Result',
              type: 'boolean',
              required: false,
              default: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // BATCH RESOURCE
    // ============================================
    {
      id: 'batch',
      name: 'Batch',
      value: 'batch',
      description: 'Batch message operations',
      operations: [
        {
          id: 'create_batch',
          name: 'Create Batch',
          value: 'create',
          description: 'Create a message batch request',
          action: 'Create batch',
          fields: [
            {
              id: 'requests',
              name: 'requests',
              displayName: 'Requests (JSON)',
              type: 'json',
              required: true,
              description: 'Array of message requests',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'get_batch',
          name: 'Get Batch',
          value: 'get',
          description: 'Get batch status',
          action: 'Get batch',
          fields: [
            {
              id: 'batch_id',
              name: 'batchId',
              displayName: 'Batch ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_batches',
          name: 'List Batches',
          value: 'getMany',
          description: 'List all batches',
          action: 'List batches',
          fields: [],
          optionalFields: [
            {
              id: 'limit',
              name: 'limit',
              displayName: 'Limit',
              type: 'number',
              required: false,
              default: 20,
            },
          ],
        },
        {
          id: 'get_batch_results',
          name: 'Get Batch Results',
          value: 'getResults',
          description: 'Get results of a completed batch',
          action: 'Get batch results',
          fields: [
            {
              id: 'batch_id',
              name: 'batchId',
              displayName: 'Batch ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'cancel_batch',
          name: 'Cancel Batch',
          value: 'cancel',
          description: 'Cancel a pending batch',
          action: 'Cancel batch',
          fields: [
            {
              id: 'batch_id',
              name: 'batchId',
              displayName: 'Batch ID',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // COUNT TOKENS RESOURCE
    // ============================================
    {
      id: 'tokens',
      name: 'Tokens',
      value: 'tokens',
      description: 'Token counting operations',
      operations: [
        {
          id: 'count_tokens',
          name: 'Count Tokens',
          value: 'count',
          description: 'Count tokens in a message',
          action: 'Count tokens',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Claude 4 Opus', value: 'claude-opus-4-20250514' },
                { name: 'Claude 4 Sonnet', value: 'claude-sonnet-4-20250514' },
                { name: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet-20250219' },
                { name: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
                { name: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku-20241022' },
                { name: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
                { name: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
                { name: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
              ],
              default: 'claude-sonnet-4-20250514',
            },
            {
              id: 'messages',
              name: 'messages',
              displayName: 'Messages (JSON)',
              type: 'json',
              required: true,
              description: 'Messages array to count tokens for',
            },
          ],
          optionalFields: [
            {
              id: 'system',
              name: 'system',
              displayName: 'System Prompt',
              type: 'string',
              required: false,
            },
            {
              id: 'tools',
              name: 'tools',
              displayName: 'Tools (JSON)',
              type: 'json',
              required: false,
            },
          ],
        },
      ],
    },
  ],
};
