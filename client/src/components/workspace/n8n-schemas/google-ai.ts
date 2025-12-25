/**
 * Google AI (Gemini) n8n-style Schema
 * 
 * Comprehensive Google AI / Gemini API operations
 */

import { N8nAppSchema } from './types';

export const googleAISchema: N8nAppSchema = {
  id: 'googleAI',
  name: 'Google AI',
  description: 'Google Gemini AI models',
  version: '1.0.0',
  color: '#4285F4',
  icon: 'google-ai',
  group: ['ai', 'llm', 'google'],
  
  credentials: [
    {
      name: 'googleAIApi',
      displayName: 'Google AI API',
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
    {
      name: 'googleAIServiceAccount',
      displayName: 'Google AI Service Account',
      required: true,
      type: 'serviceAccount',
      properties: [
        {
          name: 'serviceAccountKey',
          displayName: 'Service Account JSON',
          type: 'json',
          required: true,
        },
        {
          name: 'project',
          displayName: 'Project ID',
          type: 'string',
          required: true,
        },
      ],
    },
  ],
  
  resources: [
    // ============================================
    // GENERATE CONTENT RESOURCE
    // ============================================
    {
      id: 'generateContent',
      name: 'Generate Content',
      value: 'generateContent',
      description: 'Text generation operations',
      operations: [
        {
          id: 'generate_text',
          name: 'Generate Text',
          value: 'generate',
          description: 'Generate text using Gemini',
          action: 'Generate text',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Gemini 2.5 Pro Preview', value: 'gemini-2.5-pro-preview-06-05' },
                { name: 'Gemini 2.5 Flash Preview', value: 'gemini-2.5-flash-preview-05-20' },
                { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
                { name: 'Gemini 2.0 Flash Lite', value: 'gemini-2.0-flash-lite' },
                { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
                { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
                { name: 'Gemini 1.5 Flash 8B', value: 'gemini-1.5-flash-8b' },
              ],
              default: 'gemini-2.0-flash',
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
          ],
          optionalFields: [
            {
              id: 'system_instruction',
              name: 'systemInstruction',
              displayName: 'System Instruction',
              type: 'string',
              required: false,
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'max_output_tokens',
              name: 'maxOutputTokens',
              displayName: 'Max Output Tokens',
              type: 'number',
              required: false,
              default: 8192,
            },
            {
              id: 'temperature',
              name: 'temperature',
              displayName: 'Temperature',
              type: 'number',
              required: false,
              default: 1,
              description: 'Value between 0 and 2',
            },
            {
              id: 'top_p',
              name: 'topP',
              displayName: 'Top P',
              type: 'number',
              required: false,
            },
            {
              id: 'top_k',
              name: 'topK',
              displayName: 'Top K',
              type: 'number',
              required: false,
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
              id: 'response_mime_type',
              name: 'responseMimeType',
              displayName: 'Response MIME Type',
              type: 'options',
              required: false,
              options: [
                { name: 'Plain Text', value: 'text/plain' },
                { name: 'JSON', value: 'application/json' },
              ],
            },
            {
              id: 'response_schema',
              name: 'responseSchema',
              displayName: 'Response Schema (JSON)',
              type: 'json',
              required: false,
              description: 'JSON schema for structured output',
            },
          ],
        },
        {
          id: 'generate_chat',
          name: 'Chat',
          value: 'chat',
          description: 'Multi-turn chat generation',
          action: 'Chat',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Gemini 2.5 Pro Preview', value: 'gemini-2.5-pro-preview-06-05' },
                { name: 'Gemini 2.5 Flash Preview', value: 'gemini-2.5-flash-preview-05-20' },
                { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
                { name: 'Gemini 2.0 Flash Lite', value: 'gemini-2.0-flash-lite' },
                { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
                { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
              ],
              default: 'gemini-2.0-flash',
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
                        { name: 'Model', value: 'model' },
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
          ],
          optionalFields: [
            {
              id: 'system_instruction',
              name: 'systemInstruction',
              displayName: 'System Instruction',
              type: 'string',
              required: false,
            },
            {
              id: 'max_output_tokens',
              name: 'maxOutputTokens',
              displayName: 'Max Output Tokens',
              type: 'number',
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
          id: 'stream_generate',
          name: 'Stream Generate',
          value: 'streamGenerate',
          description: 'Generate text with streaming',
          action: 'Stream generate',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Gemini 2.5 Pro Preview', value: 'gemini-2.5-pro-preview-06-05' },
                { name: 'Gemini 2.5 Flash Preview', value: 'gemini-2.5-flash-preview-05-20' },
                { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
                { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
                { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
              ],
              default: 'gemini-2.0-flash',
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
          ],
          optionalFields: [
            {
              id: 'system_instruction',
              name: 'systemInstruction',
              displayName: 'System Instruction',
              type: 'string',
              required: false,
            },
            {
              id: 'max_output_tokens',
              name: 'maxOutputTokens',
              displayName: 'Max Output Tokens',
              type: 'number',
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
    // VISION RESOURCE
    // ============================================
    {
      id: 'vision',
      name: 'Vision',
      value: 'vision',
      description: 'Image and video analysis',
      operations: [
        {
          id: 'analyze_image',
          name: 'Analyze Image',
          value: 'analyzeImage',
          description: 'Analyze an image using Gemini',
          action: 'Analyze image',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Gemini 2.5 Pro Preview', value: 'gemini-2.5-pro-preview-06-05' },
                { name: 'Gemini 2.5 Flash Preview', value: 'gemini-2.5-flash-preview-05-20' },
                { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
                { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
                { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
              ],
              default: 'gemini-2.0-flash',
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
                { name: 'Google Cloud Storage', value: 'gcs' },
              ],
            },
            {
              id: 'image_data',
              name: 'imageData',
              displayName: 'Image Data',
              type: 'string',
              required: true,
              description: 'URL, Base64, or GCS URI',
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
          ],
          optionalFields: [
            {
              id: 'mime_type',
              name: 'mimeType',
              displayName: 'MIME Type',
              type: 'options',
              required: false,
              options: [
                { name: 'JPEG', value: 'image/jpeg' },
                { name: 'PNG', value: 'image/png' },
                { name: 'GIF', value: 'image/gif' },
                { name: 'WebP', value: 'image/webp' },
                { name: 'HEIC', value: 'image/heic' },
                { name: 'HEIF', value: 'image/heif' },
              ],
            },
            {
              id: 'max_output_tokens',
              name: 'maxOutputTokens',
              displayName: 'Max Output Tokens',
              type: 'number',
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
          id: 'analyze_video',
          name: 'Analyze Video',
          value: 'analyzeVideo',
          description: 'Analyze a video using Gemini',
          action: 'Analyze video',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Gemini 2.5 Pro Preview', value: 'gemini-2.5-pro-preview-06-05' },
                { name: 'Gemini 2.5 Flash Preview', value: 'gemini-2.5-flash-preview-05-20' },
                { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
                { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
                { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
              ],
              default: 'gemini-2.0-flash',
            },
            {
              id: 'video_source',
              name: 'videoSource',
              displayName: 'Video Source',
              type: 'options',
              required: true,
              options: [
                { name: 'Google Cloud Storage', value: 'gcs' },
                { name: 'YouTube', value: 'youtube' },
                { name: 'Upload', value: 'upload' },
              ],
            },
            {
              id: 'video_data',
              name: 'videoData',
              displayName: 'Video Data',
              type: 'string',
              required: true,
              description: 'GCS URI, YouTube URL, or file URI',
            },
            {
              id: 'prompt',
              name: 'prompt',
              displayName: 'Prompt',
              type: 'string',
              required: true,
              default: 'Describe this video',
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'video_start_offset',
              name: 'videoStartOffset',
              displayName: 'Start Offset (seconds)',
              type: 'number',
              required: false,
            },
            {
              id: 'video_end_offset',
              name: 'videoEndOffset',
              displayName: 'End Offset (seconds)',
              type: 'number',
              required: false,
            },
            {
              id: 'max_output_tokens',
              name: 'maxOutputTokens',
              displayName: 'Max Output Tokens',
              type: 'number',
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
          value: 'analyzeMultipleImages',
          description: 'Analyze multiple images',
          action: 'Analyze multiple images',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Gemini 2.5 Pro Preview', value: 'gemini-2.5-pro-preview-06-05' },
                { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
                { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
              ],
              default: 'gemini-2.0-flash',
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
                        { name: 'GCS', value: 'gcs' },
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
          ],
          optionalFields: [
            {
              id: 'max_output_tokens',
              name: 'maxOutputTokens',
              displayName: 'Max Output Tokens',
              type: 'number',
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
    // AUDIO RESOURCE
    // ============================================
    {
      id: 'audio',
      name: 'Audio',
      value: 'audio',
      description: 'Audio analysis operations',
      operations: [
        {
          id: 'analyze_audio',
          name: 'Analyze Audio',
          value: 'analyze',
          description: 'Analyze audio using Gemini',
          action: 'Analyze audio',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Gemini 2.5 Pro Preview', value: 'gemini-2.5-pro-preview-06-05' },
                { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
                { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
                { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
              ],
              default: 'gemini-2.0-flash',
            },
            {
              id: 'audio_source',
              name: 'audioSource',
              displayName: 'Audio Source',
              type: 'options',
              required: true,
              options: [
                { name: 'Google Cloud Storage', value: 'gcs' },
                { name: 'Base64', value: 'base64' },
                { name: 'Upload', value: 'upload' },
              ],
            },
            {
              id: 'audio_data',
              name: 'audioData',
              displayName: 'Audio Data',
              type: 'string',
              required: true,
            },
            {
              id: 'prompt',
              name: 'prompt',
              displayName: 'Prompt',
              type: 'string',
              required: true,
              default: 'Transcribe this audio',
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'mime_type',
              name: 'mimeType',
              displayName: 'MIME Type',
              type: 'options',
              required: false,
              options: [
                { name: 'WAV', value: 'audio/wav' },
                { name: 'MP3', value: 'audio/mp3' },
                { name: 'AIFF', value: 'audio/aiff' },
                { name: 'AAC', value: 'audio/aac' },
                { name: 'OGG Vorbis', value: 'audio/ogg' },
                { name: 'FLAC', value: 'audio/flac' },
              ],
            },
            {
              id: 'max_output_tokens',
              name: 'maxOutputTokens',
              displayName: 'Max Output Tokens',
              type: 'number',
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
    // FUNCTION CALLING RESOURCE
    // ============================================
    {
      id: 'functionCalling',
      name: 'Function Calling',
      value: 'functionCalling',
      description: 'Tool/function calling operations',
      operations: [
        {
          id: 'generate_with_tools',
          name: 'Generate with Tools',
          value: 'generateWithTools',
          description: 'Generate with function/tool definitions',
          action: 'Generate with tools',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Gemini 2.5 Pro Preview', value: 'gemini-2.5-pro-preview-06-05' },
                { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
                { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
              ],
              default: 'gemini-2.0-flash',
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
              description: 'Array of function declarations',
            },
          ],
          optionalFields: [
            {
              id: 'system_instruction',
              name: 'systemInstruction',
              displayName: 'System Instruction',
              type: 'string',
              required: false,
            },
            {
              id: 'tool_config',
              name: 'toolConfig',
              displayName: 'Tool Config Mode',
              type: 'options',
              required: false,
              options: [
                { name: 'Auto', value: 'AUTO' },
                { name: 'Any', value: 'ANY' },
                { name: 'None', value: 'NONE' },
              ],
            },
            {
              id: 'allowed_function_names',
              name: 'allowedFunctionNames',
              displayName: 'Allowed Function Names',
              type: 'string',
              required: false,
              description: 'Comma-separated function names',
            },
            {
              id: 'max_output_tokens',
              name: 'maxOutputTokens',
              displayName: 'Max Output Tokens',
              type: 'number',
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
          id: 'continue_with_function_result',
          name: 'Continue with Function Result',
          value: 'continueWithResult',
          description: 'Continue after function execution',
          action: 'Continue with function result',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Gemini 2.5 Pro Preview', value: 'gemini-2.5-pro-preview-06-05' },
                { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
                { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
              ],
              default: 'gemini-2.0-flash',
            },
            {
              id: 'conversation_history',
              name: 'conversationHistory',
              displayName: 'Conversation History (JSON)',
              type: 'json',
              required: true,
            },
            {
              id: 'function_name',
              name: 'functionName',
              displayName: 'Function Name',
              type: 'string',
              required: true,
            },
            {
              id: 'function_response',
              name: 'functionResponse',
              displayName: 'Function Response (JSON)',
              type: 'json',
              required: true,
            },
            {
              id: 'tools',
              name: 'tools',
              displayName: 'Tools (JSON)',
              type: 'json',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'system_instruction',
              name: 'systemInstruction',
              displayName: 'System Instruction',
              type: 'string',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // EMBEDDINGS RESOURCE
    // ============================================
    {
      id: 'embeddings',
      name: 'Embeddings',
      value: 'embeddings',
      description: 'Text embedding operations',
      operations: [
        {
          id: 'create_embedding',
          name: 'Create Embedding',
          value: 'create',
          description: 'Create text embeddings',
          action: 'Create embedding',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Text Embedding 004', value: 'text-embedding-004' },
                { name: 'Text Embedding 005', value: 'text-embedding-005' },
              ],
              default: 'text-embedding-004',
            },
            {
              id: 'content',
              name: 'content',
              displayName: 'Content',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'task_type',
              name: 'taskType',
              displayName: 'Task Type',
              type: 'options',
              required: false,
              options: [
                { name: 'Retrieval Query', value: 'RETRIEVAL_QUERY' },
                { name: 'Retrieval Document', value: 'RETRIEVAL_DOCUMENT' },
                { name: 'Semantic Similarity', value: 'SEMANTIC_SIMILARITY' },
                { name: 'Classification', value: 'CLASSIFICATION' },
                { name: 'Clustering', value: 'CLUSTERING' },
                { name: 'Question Answering', value: 'QUESTION_ANSWERING' },
                { name: 'Fact Verification', value: 'FACT_VERIFICATION' },
              ],
            },
            {
              id: 'title',
              name: 'title',
              displayName: 'Title',
              type: 'string',
              required: false,
              description: 'Optional title for documents',
            },
            {
              id: 'output_dimensionality',
              name: 'outputDimensionality',
              displayName: 'Output Dimensionality',
              type: 'number',
              required: false,
              description: 'Reduce embedding dimensions',
            },
          ],
        },
        {
          id: 'batch_embed',
          name: 'Batch Embed',
          value: 'batchEmbed',
          description: 'Create embeddings for multiple texts',
          action: 'Batch embed',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Text Embedding 004', value: 'text-embedding-004' },
                { name: 'Text Embedding 005', value: 'text-embedding-005' },
              ],
              default: 'text-embedding-004',
            },
            {
              id: 'contents',
              name: 'contents',
              displayName: 'Contents',
              type: 'fixedCollection',
              required: true,
              typeOptions: {
                multipleValues: true,
              },
              options: [
                {
                  name: 'contentValues',
                  displayName: 'Content',
                  values: [
                    {
                      name: 'text',
                      displayName: 'Text',
                      type: 'string',
                    },
                    {
                      name: 'title',
                      displayName: 'Title',
                      type: 'string',
                    },
                  ],
                },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'task_type',
              name: 'taskType',
              displayName: 'Task Type',
              type: 'options',
              required: false,
              options: [
                { name: 'Retrieval Query', value: 'RETRIEVAL_QUERY' },
                { name: 'Retrieval Document', value: 'RETRIEVAL_DOCUMENT' },
                { name: 'Semantic Similarity', value: 'SEMANTIC_SIMILARITY' },
                { name: 'Classification', value: 'CLASSIFICATION' },
                { name: 'Clustering', value: 'CLUSTERING' },
              ],
            },
            {
              id: 'output_dimensionality',
              name: 'outputDimensionality',
              displayName: 'Output Dimensionality',
              type: 'number',
              required: false,
            },
          ],
        },
      ],
    },
    
    // ============================================
    // FILES RESOURCE
    // ============================================
    {
      id: 'files',
      name: 'Files',
      value: 'files',
      description: 'File upload and management',
      operations: [
        {
          id: 'upload_file',
          name: 'Upload File',
          value: 'upload',
          description: 'Upload a file for use with Gemini',
          action: 'Upload file',
          fields: [
            {
              id: 'file_data',
              name: 'fileData',
              displayName: 'File Data (Base64)',
              type: 'string',
              required: true,
            },
            {
              id: 'mime_type',
              name: 'mimeType',
              displayName: 'MIME Type',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [
            {
              id: 'display_name',
              name: 'displayName',
              displayName: 'Display Name',
              type: 'string',
              required: false,
            },
          ],
        },
        {
          id: 'get_file',
          name: 'Get File',
          value: 'get',
          description: 'Get file metadata',
          action: 'Get file',
          fields: [
            {
              id: 'file_name',
              name: 'fileName',
              displayName: 'File Name',
              type: 'string',
              required: true,
              description: 'Format: files/{file_id}',
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_files',
          name: 'List Files',
          value: 'getMany',
          description: 'List uploaded files',
          action: 'List files',
          fields: [],
          optionalFields: [
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 10,
            },
          ],
        },
        {
          id: 'delete_file',
          name: 'Delete File',
          value: 'delete',
          description: 'Delete an uploaded file',
          action: 'Delete file',
          fields: [
            {
              id: 'file_name',
              name: 'fileName',
              displayName: 'File Name',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // MODEL INFO RESOURCE
    // ============================================
    {
      id: 'models',
      name: 'Models',
      value: 'models',
      description: 'Model information',
      operations: [
        {
          id: 'get_model',
          name: 'Get Model',
          value: 'get',
          description: 'Get model information',
          action: 'Get model',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'string',
              required: true,
            },
          ],
          optionalFields: [],
        },
        {
          id: 'list_models',
          name: 'List Models',
          value: 'getMany',
          description: 'List available models',
          action: 'List models',
          fields: [],
          optionalFields: [
            {
              id: 'page_size',
              name: 'pageSize',
              displayName: 'Page Size',
              type: 'number',
              required: false,
              default: 50,
            },
          ],
        },
        {
          id: 'count_tokens',
          name: 'Count Tokens',
          value: 'countTokens',
          description: 'Count tokens in content',
          action: 'Count tokens',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Gemini 2.5 Pro Preview', value: 'gemini-2.5-pro-preview-06-05' },
                { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
                { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
                { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
              ],
              default: 'gemini-2.0-flash',
            },
            {
              id: 'content',
              name: 'content',
              displayName: 'Content',
              type: 'string',
              required: true,
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [],
        },
      ],
    },
    
    // ============================================
    // GROUNDING/SEARCH RESOURCE
    // ============================================
    {
      id: 'grounding',
      name: 'Grounding',
      value: 'grounding',
      description: 'Search grounding operations',
      operations: [
        {
          id: 'generate_with_google_search',
          name: 'Generate with Google Search',
          value: 'generateWithSearch',
          description: 'Generate with Google Search grounding',
          action: 'Generate with Google Search',
          fields: [
            {
              id: 'model',
              name: 'model',
              displayName: 'Model',
              type: 'options',
              required: true,
              options: [
                { name: 'Gemini 2.5 Pro Preview', value: 'gemini-2.5-pro-preview-06-05' },
                { name: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
                { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
              ],
              default: 'gemini-2.0-flash',
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
          ],
          optionalFields: [
            {
              id: 'dynamic_retrieval_threshold',
              name: 'dynamicRetrievalThreshold',
              displayName: 'Dynamic Retrieval Threshold',
              type: 'number',
              required: false,
              description: 'Threshold for dynamic retrieval (0-1)',
            },
            {
              id: 'system_instruction',
              name: 'systemInstruction',
              displayName: 'System Instruction',
              type: 'string',
              required: false,
            },
            {
              id: 'max_output_tokens',
              name: 'maxOutputTokens',
              displayName: 'Max Output Tokens',
              type: 'number',
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
  ],
};
