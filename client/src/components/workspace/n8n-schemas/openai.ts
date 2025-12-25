/**
 * OpenAI n8n-Style Schema
 * 
 * Resources: Text, Image, Audio, File, Assistant, Thread, Model
 * Based on: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.openai/
 */

import { N8nAppSchema } from './types';

export const openAiSchema: N8nAppSchema = {
  id: 'openai',
  name: 'OpenAI',
  icon: 'brain',
  color: '#10A37F',
  description: 'Consume the OpenAI API to build AI-powered applications',
  version: '1.0',
  subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
  group: ['transform', 'ai'],
  documentationUrl: 'https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.openai/',
  
  credentials: [
    {
      id: 'openai_api',
      name: 'OpenAI API',
      type: 'apiKey',
      fields: [
        {
          id: 'api_key',
          displayName: 'API Key',
          name: 'apiKey',
          type: 'password',
          required: true,
          description: 'Your OpenAI API key from platform.openai.com',
          placeholder: 'sk-...',
        },
        {
          id: 'organization',
          displayName: 'Organization ID',
          name: 'organizationId',
          type: 'string',
          required: false,
          description: 'Optional organization ID for API usage tracking',
          placeholder: 'org-...',
        },
        {
          id: 'base_url',
          displayName: 'Base URL',
          name: 'baseUrl',
          type: 'string',
          required: false,
          default: 'https://api.openai.com/v1',
          description: 'Custom API base URL (for Azure OpenAI or proxies)',
        },
      ],
    },
  ],

  resources: [
    // ========================================
    // TEXT RESOURCE
    // ========================================
    {
      id: 'text',
      name: 'Text',
      value: 'text',
      description: 'Generate and manipulate text using GPT models',
      operations: [
        {
          id: 'message_model',
          name: 'Message a Model',
          value: 'message',
          description: 'Send a message to a model and receive a response',
          action: 'Message a model',
          fields: [
            {
              id: 'model',
              displayName: 'Model',
              name: 'model',
              type: 'options',
              required: true,
              default: 'gpt-4o',
              description: 'The model to use for generating the completion',
              options: [
                { name: 'GPT-4o', value: 'gpt-4o', description: 'Most capable model, great for complex tasks' },
                { name: 'GPT-4o Mini', value: 'gpt-4o-mini', description: 'Fast and affordable for simpler tasks' },
                { name: 'GPT-4 Turbo', value: 'gpt-4-turbo', description: 'Previous generation flagship model' },
                { name: 'GPT-4', value: 'gpt-4', description: 'Original GPT-4 model' },
                { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo', description: 'Fast and cost-effective' },
                { name: 'o1', value: 'o1', description: 'Reasoning model for complex problems' },
                { name: 'o1-mini', value: 'o1-mini', description: 'Smaller reasoning model' },
                { name: 'o1-preview', value: 'o1-preview', description: 'Preview of reasoning capabilities' },
              ],
            },
            {
              id: 'messages',
              displayName: 'Messages',
              name: 'messages',
              type: 'fixedCollection',
              required: true,
              description: 'The messages to send to the model',
              fixedCollectionFields: [
                {
                  id: 'role',
                  displayName: 'Role',
                  name: 'role',
                  type: 'options',
                  required: true,
                  default: 'user',
                  options: [
                    { name: 'System', value: 'system', description: 'Sets the behavior of the assistant' },
                    { name: 'User', value: 'user', description: 'Messages from the user' },
                    { name: 'Assistant', value: 'assistant', description: 'Previous assistant responses' },
                  ],
                },
                {
                  id: 'content',
                  displayName: 'Content',
                  name: 'content',
                  type: 'text',
                  required: true,
                  description: 'The content of the message',
                  placeholder: 'Enter your message here...',
                  typeOptions: {
                    rows: 4,
                  },
                },
              ],
            },
            {
              id: 'prompt',
              displayName: 'Prompt',
              name: 'prompt',
              type: 'text',
              required: true,
              description: 'The user prompt/question to send to the model',
              placeholder: 'Write a poem about...',
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'system_message',
              displayName: 'System Message',
              name: 'systemMessage',
              type: 'text',
              default: 'You are a helpful assistant.',
              description: 'Sets the behavior and personality of the assistant',
              placeholder: 'You are an expert at...',
              typeOptions: {
                rows: 3,
              },
            },
            {
              id: 'temperature',
              displayName: 'Temperature',
              name: 'temperature',
              type: 'number',
              default: 0.7,
              description: 'Controls randomness: 0 is deterministic, 2 is very random',
              typeOptions: {
                minValue: 0,
                maxValue: 2,
                numberPrecision: 1,
              },
            },
            {
              id: 'max_tokens',
              displayName: 'Max Tokens',
              name: 'maxTokens',
              type: 'number',
              default: 2048,
              description: 'Maximum number of tokens in the response',
              typeOptions: {
                minValue: 1,
                maxValue: 128000,
              },
            },
            {
              id: 'top_p',
              displayName: 'Top P',
              name: 'topP',
              type: 'number',
              default: 1,
              description: 'Nucleus sampling: only consider tokens with top_p probability mass',
              typeOptions: {
                minValue: 0,
                maxValue: 1,
                numberPrecision: 2,
              },
            },
            {
              id: 'frequency_penalty',
              displayName: 'Frequency Penalty',
              name: 'frequencyPenalty',
              type: 'number',
              default: 0,
              description: 'Decrease likelihood of repeating tokens based on frequency',
              typeOptions: {
                minValue: -2,
                maxValue: 2,
                numberPrecision: 1,
              },
            },
            {
              id: 'presence_penalty',
              displayName: 'Presence Penalty',
              name: 'presencePenalty',
              type: 'number',
              default: 0,
              description: 'Decrease likelihood of repeating any token that appeared',
              typeOptions: {
                minValue: -2,
                maxValue: 2,
                numberPrecision: 1,
              },
            },
            {
              id: 'stop_sequences',
              displayName: 'Stop Sequences',
              name: 'stop',
              type: 'string',
              description: 'Sequences where the model will stop generating (comma-separated)',
              placeholder: '\\n\\n, END, ###',
            },
            {
              id: 'response_format',
              displayName: 'Response Format',
              name: 'responseFormat',
              type: 'options',
              default: 'text',
              description: 'The format of the response',
              options: [
                { name: 'Text', value: 'text', description: 'Standard text response' },
                { name: 'JSON Object', value: 'json_object', description: 'Response as valid JSON' },
                { name: 'JSON Schema', value: 'json_schema', description: 'Response matching a JSON schema' },
              ],
            },
            {
              id: 'json_schema',
              displayName: 'JSON Schema',
              name: 'jsonSchema',
              type: 'json',
              description: 'Define the JSON schema the response should conform to',
              displayOptions: {
                show: {
                  responseFormat: ['json_schema'],
                },
              },
              typeOptions: {
                alwaysOpenEditWindow: true,
              },
            },
            {
              id: 'seed',
              displayName: 'Seed',
              name: 'seed',
              type: 'number',
              description: 'For reproducible outputs (beta feature)',
              placeholder: '12345',
            },
            {
              id: 'user',
              displayName: 'User ID',
              name: 'user',
              type: 'string',
              description: 'A unique identifier for your end-user for abuse monitoring',
              placeholder: 'user-123',
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/chat/completions',
            },
          },
        },
        {
          id: 'complete_text',
          name: 'Complete Text',
          value: 'complete',
          description: 'Generate text completion for a prompt (legacy)',
          action: 'Complete text',
          fields: [
            {
              id: 'model',
              displayName: 'Model',
              name: 'model',
              type: 'options',
              required: true,
              default: 'gpt-3.5-turbo-instruct',
              description: 'The model to use for text completion',
              options: [
                { name: 'GPT-3.5 Turbo Instruct', value: 'gpt-3.5-turbo-instruct', description: 'Instruction-following model' },
                { name: 'Davinci-002', value: 'davinci-002', description: 'Most capable completion model' },
                { name: 'Babbage-002', value: 'babbage-002', description: 'Faster, good for straightforward tasks' },
              ],
            },
            {
              id: 'prompt',
              displayName: 'Prompt',
              name: 'prompt',
              type: 'text',
              required: true,
              description: 'The prompt to generate completions for',
              placeholder: 'Write a tagline for an ice cream shop...',
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'max_tokens',
              displayName: 'Max Tokens',
              name: 'maxTokens',
              type: 'number',
              default: 256,
              description: 'Maximum number of tokens to generate',
              typeOptions: {
                minValue: 1,
                maxValue: 4096,
              },
            },
            {
              id: 'temperature',
              displayName: 'Temperature',
              name: 'temperature',
              type: 'number',
              default: 0.7,
              description: 'Controls randomness in the output',
              typeOptions: {
                minValue: 0,
                maxValue: 2,
                numberPrecision: 1,
              },
            },
            {
              id: 'suffix',
              displayName: 'Suffix',
              name: 'suffix',
              type: 'string',
              description: 'The suffix that comes after the completion',
              placeholder: 'THE END',
            },
            {
              id: 'best_of',
              displayName: 'Best Of',
              name: 'bestOf',
              type: 'number',
              default: 1,
              description: 'Generate this many completions and return the best',
              typeOptions: {
                minValue: 1,
                maxValue: 20,
              },
            },
            {
              id: 'echo',
              displayName: 'Echo Prompt',
              name: 'echo',
              type: 'boolean',
              default: false,
              description: 'Echo back the prompt in addition to the completion',
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/completions',
            },
          },
        },
        {
          id: 'classify_text',
          name: 'Classify Text',
          value: 'classify',
          description: 'Classify text for moderation or custom categories',
          action: 'Classify text',
          fields: [
            {
              id: 'input',
              displayName: 'Input Text',
              name: 'input',
              type: 'text',
              required: true,
              description: 'The text to classify',
              placeholder: 'Enter text to classify...',
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'model',
              displayName: 'Moderation Model',
              name: 'model',
              type: 'options',
              default: 'text-moderation-latest',
              description: 'The moderation model to use',
              options: [
                { name: 'Text Moderation Latest', value: 'text-moderation-latest', description: 'Most accurate moderation' },
                { name: 'Text Moderation Stable', value: 'text-moderation-stable', description: 'More consistent results' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/moderations',
            },
          },
        },
      ],
    },

    // ========================================
    // IMAGE RESOURCE
    // ========================================
    {
      id: 'image',
      name: 'Image',
      value: 'image',
      description: 'Generate and manipulate images using DALL-E',
      operations: [
        {
          id: 'generate_image',
          name: 'Generate Image',
          value: 'generate',
          description: 'Create an image from a text prompt',
          action: 'Generate an image',
          fields: [
            {
              id: 'prompt',
              displayName: 'Prompt',
              name: 'prompt',
              type: 'text',
              required: true,
              description: 'A text description of the image you want to generate',
              placeholder: 'A white siamese cat with blue eyes...',
              typeOptions: {
                rows: 3,
              },
            },
            {
              id: 'model',
              displayName: 'Model',
              name: 'model',
              type: 'options',
              required: true,
              default: 'dall-e-3',
              description: 'The model to use for image generation',
              options: [
                { name: 'DALL-E 3', value: 'dall-e-3', description: 'Latest and most capable (default)' },
                { name: 'DALL-E 2', value: 'dall-e-2', description: 'Previous generation, lower cost' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'size',
              displayName: 'Size',
              name: 'size',
              type: 'options',
              default: '1024x1024',
              description: 'The size of the generated image',
              options: [
                { name: '1024x1024', value: '1024x1024', description: 'Square (DALL-E 2 & 3)' },
                { name: '1792x1024', value: '1792x1024', description: 'Landscape (DALL-E 3 only)' },
                { name: '1024x1792', value: '1024x1792', description: 'Portrait (DALL-E 3 only)' },
                { name: '512x512', value: '512x512', description: 'Small square (DALL-E 2 only)' },
                { name: '256x256', value: '256x256', description: 'Thumbnail (DALL-E 2 only)' },
              ],
            },
            {
              id: 'quality',
              displayName: 'Quality',
              name: 'quality',
              type: 'options',
              default: 'standard',
              description: 'The quality of the image (DALL-E 3 only)',
              options: [
                { name: 'Standard', value: 'standard', description: 'Standard quality' },
                { name: 'HD', value: 'hd', description: 'Higher detail, more consistent' },
              ],
              displayOptions: {
                show: {
                  model: ['dall-e-3'],
                },
              },
            },
            {
              id: 'style',
              displayName: 'Style',
              name: 'style',
              type: 'options',
              default: 'vivid',
              description: 'The style of the generated image (DALL-E 3 only)',
              options: [
                { name: 'Vivid', value: 'vivid', description: 'Hyper-real and dramatic' },
                { name: 'Natural', value: 'natural', description: 'Less hyper-real, more natural' },
              ],
              displayOptions: {
                show: {
                  model: ['dall-e-3'],
                },
              },
            },
            {
              id: 'n',
              displayName: 'Number of Images',
              name: 'n',
              type: 'number',
              default: 1,
              description: 'How many images to generate',
              typeOptions: {
                minValue: 1,
                maxValue: 10,
              },
            },
            {
              id: 'response_format',
              displayName: 'Response Format',
              name: 'responseFormat',
              type: 'options',
              default: 'url',
              description: 'The format in which the image is returned',
              options: [
                { name: 'URL', value: 'url', description: 'A URL to the generated image' },
                { name: 'Base64', value: 'b64_json', description: 'Base64-encoded JSON' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/images/generations',
            },
          },
        },
        {
          id: 'edit_image',
          name: 'Edit Image',
          value: 'edit',
          description: 'Edit an existing image with a text prompt',
          action: 'Edit an image',
          fields: [
            {
              id: 'image',
              displayName: 'Image',
              name: 'image',
              type: 'string',
              required: true,
              description: 'The image to edit (PNG, less than 4MB, square)',
              placeholder: 'Select or upload an image...',
            },
            {
              id: 'prompt',
              displayName: 'Prompt',
              name: 'prompt',
              type: 'text',
              required: true,
              description: 'A text description of the edits you want to make',
              placeholder: 'Add a red hat to the person...',
              typeOptions: {
                rows: 3,
              },
            },
          ],
          optionalFields: [
            {
              id: 'mask',
              displayName: 'Mask',
              name: 'mask',
              type: 'string',
              description: 'A mask image indicating areas to edit (transparent areas)',
              placeholder: 'Select or upload a mask image...',
            },
            {
              id: 'model',
              displayName: 'Model',
              name: 'model',
              type: 'options',
              default: 'dall-e-2',
              options: [
                { name: 'DALL-E 2', value: 'dall-e-2', description: 'Only DALL-E 2 supports editing' },
              ],
            },
            {
              id: 'size',
              displayName: 'Size',
              name: 'size',
              type: 'options',
              default: '1024x1024',
              options: [
                { name: '1024x1024', value: '1024x1024' },
                { name: '512x512', value: '512x512' },
                { name: '256x256', value: '256x256' },
              ],
            },
            {
              id: 'n',
              displayName: 'Number of Images',
              name: 'n',
              type: 'number',
              default: 1,
              typeOptions: {
                minValue: 1,
                maxValue: 10,
              },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/images/edits',
            },
          },
        },
        {
          id: 'create_variation',
          name: 'Create Variation',
          value: 'variation',
          description: 'Create variations of an existing image',
          action: 'Create image variation',
          fields: [
            {
              id: 'image',
              displayName: 'Image',
              name: 'image',
              type: 'string',
              required: true,
              description: 'The image to create variations of (PNG, less than 4MB, square)',
              placeholder: 'Select or upload an image...',
            },
          ],
          optionalFields: [
            {
              id: 'model',
              displayName: 'Model',
              name: 'model',
              type: 'options',
              default: 'dall-e-2',
              options: [
                { name: 'DALL-E 2', value: 'dall-e-2', description: 'Only DALL-E 2 supports variations' },
              ],
            },
            {
              id: 'n',
              displayName: 'Number of Variations',
              name: 'n',
              type: 'number',
              default: 1,
              typeOptions: {
                minValue: 1,
                maxValue: 10,
              },
            },
            {
              id: 'size',
              displayName: 'Size',
              name: 'size',
              type: 'options',
              default: '1024x1024',
              options: [
                { name: '1024x1024', value: '1024x1024' },
                { name: '512x512', value: '512x512' },
                { name: '256x256', value: '256x256' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/images/variations',
            },
          },
        },
        {
          id: 'analyze_image',
          name: 'Analyze Image',
          value: 'analyze',
          description: 'Analyze and describe an image using GPT-4 Vision',
          action: 'Analyze an image',
          fields: [
            {
              id: 'image_url',
              displayName: 'Image URL',
              name: 'imageUrl',
              type: 'string',
              required: true,
              description: 'URL of the image to analyze',
              placeholder: 'https://example.com/image.jpg',
            },
            {
              id: 'prompt',
              displayName: 'Prompt',
              name: 'prompt',
              type: 'text',
              required: true,
              default: 'What is in this image?',
              description: 'What would you like to know about the image?',
              placeholder: 'Describe this image in detail...',
              typeOptions: {
                rows: 2,
              },
            },
          ],
          optionalFields: [
            {
              id: 'model',
              displayName: 'Model',
              name: 'model',
              type: 'options',
              default: 'gpt-4o',
              options: [
                { name: 'GPT-4o', value: 'gpt-4o', description: 'Most capable vision model' },
                { name: 'GPT-4o Mini', value: 'gpt-4o-mini', description: 'Faster, more affordable' },
                { name: 'GPT-4 Turbo', value: 'gpt-4-turbo', description: 'Previous flagship with vision' },
              ],
            },
            {
              id: 'detail',
              displayName: 'Detail Level',
              name: 'detail',
              type: 'options',
              default: 'auto',
              description: 'Controls how the model processes the image',
              options: [
                { name: 'Auto', value: 'auto', description: 'Let the model decide' },
                { name: 'Low', value: 'low', description: 'Lower fidelity, faster' },
                { name: 'High', value: 'high', description: 'Higher fidelity, more detail' },
              ],
            },
            {
              id: 'max_tokens',
              displayName: 'Max Tokens',
              name: 'maxTokens',
              type: 'number',
              default: 300,
              typeOptions: {
                minValue: 1,
                maxValue: 4096,
              },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/chat/completions',
            },
          },
        },
      ],
    },

    // ========================================
    // AUDIO RESOURCE
    // ========================================
    {
      id: 'audio',
      name: 'Audio',
      value: 'audio',
      description: 'Transcribe, translate, and generate audio',
      operations: [
        {
          id: 'transcribe',
          name: 'Transcribe Audio',
          value: 'transcribe',
          description: 'Convert audio to text using Whisper',
          action: 'Transcribe audio',
          fields: [
            {
              id: 'file',
              displayName: 'Audio File',
              name: 'file',
              type: 'string',
              required: true,
              description: 'The audio file to transcribe (mp3, mp4, mpeg, mpga, m4a, wav, webm)',
              placeholder: 'Select or upload an audio file...',
            },
          ],
          optionalFields: [
            {
              id: 'model',
              displayName: 'Model',
              name: 'model',
              type: 'options',
              default: 'whisper-1',
              options: [
                { name: 'Whisper V1', value: 'whisper-1', description: 'Current Whisper model' },
              ],
            },
            {
              id: 'language',
              displayName: 'Language',
              name: 'language',
              type: 'options',
              description: 'The language of the audio (ISO-639-1 code)',
              options: [
                { name: 'Auto-detect', value: '', description: 'Automatically detect language' },
                { name: 'English', value: 'en' },
                { name: 'Spanish', value: 'es' },
                { name: 'French', value: 'fr' },
                { name: 'German', value: 'de' },
                { name: 'Italian', value: 'it' },
                { name: 'Portuguese', value: 'pt' },
                { name: 'Dutch', value: 'nl' },
                { name: 'Japanese', value: 'ja' },
                { name: 'Korean', value: 'ko' },
                { name: 'Chinese', value: 'zh' },
                { name: 'Arabic', value: 'ar' },
                { name: 'Hindi', value: 'hi' },
                { name: 'Russian', value: 'ru' },
              ],
            },
            {
              id: 'prompt',
              displayName: 'Prompt',
              name: 'prompt',
              type: 'text',
              description: 'Optional text to guide the transcription style',
              placeholder: 'Technical terminology: API, SDK, JSON...',
            },
            {
              id: 'response_format',
              displayName: 'Response Format',
              name: 'responseFormat',
              type: 'options',
              default: 'json',
              options: [
                { name: 'JSON', value: 'json' },
                { name: 'Text', value: 'text' },
                { name: 'SRT', value: 'srt', description: 'Subtitle format' },
                { name: 'Verbose JSON', value: 'verbose_json', description: 'Includes timestamps' },
                { name: 'VTT', value: 'vtt', description: 'Web subtitle format' },
              ],
            },
            {
              id: 'temperature',
              displayName: 'Temperature',
              name: 'temperature',
              type: 'number',
              default: 0,
              typeOptions: {
                minValue: 0,
                maxValue: 1,
                numberPrecision: 1,
              },
            },
            {
              id: 'timestamp_granularities',
              displayName: 'Timestamp Granularity',
              name: 'timestampGranularities',
              type: 'multiOptions',
              description: 'Timestamp granularity for verbose_json format',
              options: [
                { name: 'Word', value: 'word' },
                { name: 'Segment', value: 'segment' },
              ],
              displayOptions: {
                show: {
                  responseFormat: ['verbose_json'],
                },
              },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/audio/transcriptions',
            },
          },
        },
        {
          id: 'translate',
          name: 'Translate Audio',
          value: 'translate',
          description: 'Translate audio from any language to English',
          action: 'Translate audio to English',
          fields: [
            {
              id: 'file',
              displayName: 'Audio File',
              name: 'file',
              type: 'string',
              required: true,
              description: 'The audio file to translate',
              placeholder: 'Select or upload an audio file...',
            },
          ],
          optionalFields: [
            {
              id: 'model',
              displayName: 'Model',
              name: 'model',
              type: 'options',
              default: 'whisper-1',
              options: [
                { name: 'Whisper V1', value: 'whisper-1' },
              ],
            },
            {
              id: 'prompt',
              displayName: 'Prompt',
              name: 'prompt',
              type: 'text',
              description: 'Optional text to guide the translation',
            },
            {
              id: 'response_format',
              displayName: 'Response Format',
              name: 'responseFormat',
              type: 'options',
              default: 'json',
              options: [
                { name: 'JSON', value: 'json' },
                { name: 'Text', value: 'text' },
                { name: 'SRT', value: 'srt' },
                { name: 'Verbose JSON', value: 'verbose_json' },
                { name: 'VTT', value: 'vtt' },
              ],
            },
            {
              id: 'temperature',
              displayName: 'Temperature',
              name: 'temperature',
              type: 'number',
              default: 0,
              typeOptions: {
                minValue: 0,
                maxValue: 1,
                numberPrecision: 1,
              },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/audio/translations',
            },
          },
        },
        {
          id: 'generate_speech',
          name: 'Generate Speech',
          value: 'speech',
          description: 'Convert text to natural-sounding speech',
          action: 'Generate speech from text',
          fields: [
            {
              id: 'input',
              displayName: 'Text',
              name: 'input',
              type: 'text',
              required: true,
              description: 'The text to convert to speech (max 4096 characters)',
              placeholder: 'Enter the text you want to convert to speech...',
              validation: {
                maxLength: 4096,
              },
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'voice',
              displayName: 'Voice',
              name: 'voice',
              type: 'options',
              required: true,
              default: 'alloy',
              description: 'The voice to use for speech generation',
              options: [
                { name: 'Alloy', value: 'alloy', description: 'Neutral and balanced' },
                { name: 'Echo', value: 'echo', description: 'Warm and engaging' },
                { name: 'Fable', value: 'fable', description: 'British accent' },
                { name: 'Onyx', value: 'onyx', description: 'Deep and authoritative' },
                { name: 'Nova', value: 'nova', description: 'Energetic and upbeat' },
                { name: 'Shimmer', value: 'shimmer', description: 'Soft and gentle' },
              ],
            },
          ],
          optionalFields: [
            {
              id: 'model',
              displayName: 'Model',
              name: 'model',
              type: 'options',
              default: 'tts-1',
              description: 'The TTS model to use',
              options: [
                { name: 'TTS-1', value: 'tts-1', description: 'Standard quality, faster' },
                { name: 'TTS-1 HD', value: 'tts-1-hd', description: 'Higher quality, slower' },
              ],
            },
            {
              id: 'response_format',
              displayName: 'Response Format',
              name: 'responseFormat',
              type: 'options',
              default: 'mp3',
              description: 'The audio format of the output',
              options: [
                { name: 'MP3', value: 'mp3', description: 'Most compatible' },
                { name: 'Opus', value: 'opus', description: 'Good for streaming' },
                { name: 'AAC', value: 'aac', description: 'Apple devices' },
                { name: 'FLAC', value: 'flac', description: 'Lossless compression' },
                { name: 'WAV', value: 'wav', description: 'Uncompressed' },
                { name: 'PCM', value: 'pcm', description: 'Raw audio' },
              ],
            },
            {
              id: 'speed',
              displayName: 'Speed',
              name: 'speed',
              type: 'number',
              default: 1.0,
              description: 'The speed of the generated audio (0.25 to 4.0)',
              typeOptions: {
                minValue: 0.25,
                maxValue: 4.0,
                numberPrecision: 2,
              },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/audio/speech',
            },
          },
        },
      ],
    },

    // ========================================
    // FILE RESOURCE
    // ========================================
    {
      id: 'file',
      name: 'File',
      value: 'file',
      description: 'Upload and manage files for fine-tuning and assistants',
      operations: [
        {
          id: 'upload_file',
          name: 'Upload File',
          value: 'upload',
          description: 'Upload a file for fine-tuning or assistants',
          action: 'Upload a file',
          fields: [
            {
              id: 'file',
              displayName: 'File',
              name: 'file',
              type: 'string',
              required: true,
              description: 'The file to upload',
              placeholder: 'Select or upload a file...',
            },
            {
              id: 'purpose',
              displayName: 'Purpose',
              name: 'purpose',
              type: 'options',
              required: true,
              default: 'assistants',
              description: 'The intended purpose of the file',
              options: [
                { name: 'Assistants', value: 'assistants', description: 'For use with Assistants API' },
                { name: 'Fine-tune', value: 'fine-tune', description: 'For fine-tuning models' },
                { name: 'Vision', value: 'vision', description: 'For vision capabilities' },
                { name: 'Batch', value: 'batch', description: 'For batch API requests' },
              ],
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'POST',
              url: '/files',
            },
          },
        },
        {
          id: 'list_files',
          name: 'List Files',
          value: 'list',
          description: 'List all uploaded files',
          action: 'List all files',
          fields: [],
          optionalFields: [
            {
              id: 'purpose',
              displayName: 'Purpose',
              name: 'purpose',
              type: 'options',
              description: 'Filter by purpose',
              options: [
                { name: 'All', value: '' },
                { name: 'Assistants', value: 'assistants' },
                { name: 'Fine-tune', value: 'fine-tune' },
                { name: 'Vision', value: 'vision' },
                { name: 'Batch', value: 'batch' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/files',
            },
          },
        },
        {
          id: 'get_file',
          name: 'Get File',
          value: 'get',
          description: 'Get information about a specific file',
          action: 'Get file info',
          fields: [
            {
              id: 'file_id',
              displayName: 'File ID',
              name: 'fileId',
              type: 'string',
              required: true,
              description: 'The ID of the file to retrieve',
              placeholder: 'file-...',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'GET',
              url: '/files/{fileId}',
            },
          },
        },
        {
          id: 'delete_file',
          name: 'Delete File',
          value: 'delete',
          description: 'Delete a file',
          action: 'Delete a file',
          fields: [
            {
              id: 'file_id',
              displayName: 'File ID',
              name: 'fileId',
              type: 'string',
              required: true,
              description: 'The ID of the file to delete',
              placeholder: 'file-...',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'DELETE',
              url: '/files/{fileId}',
            },
          },
        },
        {
          id: 'get_file_content',
          name: 'Get File Content',
          value: 'content',
          description: 'Retrieve the contents of a file',
          action: 'Get file content',
          fields: [
            {
              id: 'file_id',
              displayName: 'File ID',
              name: 'fileId',
              type: 'string',
              required: true,
              description: 'The ID of the file',
              placeholder: 'file-...',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'GET',
              url: '/files/{fileId}/content',
            },
          },
        },
      ],
    },

    // ========================================
    // ASSISTANT RESOURCE
    // ========================================
    {
      id: 'assistant',
      name: 'Assistant',
      value: 'assistant',
      description: 'Create and manage AI assistants with tools and files',
      operations: [
        {
          id: 'create_assistant',
          name: 'Create Assistant',
          value: 'create',
          description: 'Create a new assistant',
          action: 'Create an assistant',
          fields: [
            {
              id: 'model',
              displayName: 'Model',
              name: 'model',
              type: 'options',
              required: true,
              default: 'gpt-4o',
              description: 'The model for the assistant',
              options: [
                { name: 'GPT-4o', value: 'gpt-4o' },
                { name: 'GPT-4o Mini', value: 'gpt-4o-mini' },
                { name: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
                { name: 'GPT-4', value: 'gpt-4' },
                { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
              ],
            },
            {
              id: 'name',
              displayName: 'Name',
              name: 'name',
              type: 'string',
              description: 'The name of the assistant',
              placeholder: 'My Assistant',
            },
            {
              id: 'instructions',
              displayName: 'Instructions',
              name: 'instructions',
              type: 'text',
              description: 'The system instructions for the assistant',
              placeholder: 'You are a helpful assistant that...',
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'description',
              displayName: 'Description',
              name: 'description',
              type: 'text',
              description: 'A description of the assistant',
              typeOptions: {
                rows: 2,
              },
            },
            {
              id: 'tools',
              displayName: 'Tools',
              name: 'tools',
              type: 'multiOptions',
              description: 'Tools the assistant can use',
              options: [
                { name: 'Code Interpreter', value: 'code_interpreter', description: 'Run Python code' },
                { name: 'File Search', value: 'file_search', description: 'Search uploaded files' },
              ],
            },
            {
              id: 'file_ids',
              displayName: 'File IDs',
              name: 'fileIds',
              type: 'string',
              description: 'Comma-separated list of file IDs to attach',
              placeholder: 'file-abc123, file-def456',
            },
            {
              id: 'temperature',
              displayName: 'Temperature',
              name: 'temperature',
              type: 'number',
              default: 1,
              typeOptions: {
                minValue: 0,
                maxValue: 2,
                numberPrecision: 1,
              },
            },
            {
              id: 'top_p',
              displayName: 'Top P',
              name: 'topP',
              type: 'number',
              default: 1,
              typeOptions: {
                minValue: 0,
                maxValue: 1,
                numberPrecision: 2,
              },
            },
            {
              id: 'metadata',
              displayName: 'Metadata',
              name: 'metadata',
              type: 'json',
              description: 'Custom metadata as JSON object',
              typeOptions: {
                alwaysOpenEditWindow: true,
              },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/assistants',
            },
          },
        },
        {
          id: 'list_assistants',
          name: 'List Assistants',
          value: 'list',
          description: 'List all assistants',
          action: 'List all assistants',
          fields: [],
          optionalFields: [
            {
              id: 'limit',
              displayName: 'Limit',
              name: 'limit',
              type: 'number',
              default: 20,
              description: 'Maximum number of assistants to return',
              typeOptions: {
                minValue: 1,
                maxValue: 100,
              },
            },
            {
              id: 'order',
              displayName: 'Order',
              name: 'order',
              type: 'options',
              default: 'desc',
              options: [
                { name: 'Descending', value: 'desc' },
                { name: 'Ascending', value: 'asc' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'GET',
              url: '/assistants',
            },
          },
        },
        {
          id: 'get_assistant',
          name: 'Get Assistant',
          value: 'get',
          description: 'Retrieve a specific assistant',
          action: 'Get an assistant',
          fields: [
            {
              id: 'assistant_id',
              displayName: 'Assistant ID',
              name: 'assistantId',
              type: 'string',
              required: true,
              description: 'The ID of the assistant',
              placeholder: 'asst_...',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'GET',
              url: '/assistants/{assistantId}',
            },
          },
        },
        {
          id: 'update_assistant',
          name: 'Update Assistant',
          value: 'update',
          description: 'Update an existing assistant',
          action: 'Update an assistant',
          fields: [
            {
              id: 'assistant_id',
              displayName: 'Assistant ID',
              name: 'assistantId',
              type: 'string',
              required: true,
              description: 'The ID of the assistant to update',
              placeholder: 'asst_...',
            },
          ],
          optionalFields: [
            {
              id: 'model',
              displayName: 'Model',
              name: 'model',
              type: 'options',
              options: [
                { name: 'GPT-4o', value: 'gpt-4o' },
                { name: 'GPT-4o Mini', value: 'gpt-4o-mini' },
                { name: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
                { name: 'GPT-4', value: 'gpt-4' },
                { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
              ],
            },
            {
              id: 'name',
              displayName: 'Name',
              name: 'name',
              type: 'string',
            },
            {
              id: 'instructions',
              displayName: 'Instructions',
              name: 'instructions',
              type: 'text',
              typeOptions: {
                rows: 4,
              },
            },
            {
              id: 'description',
              displayName: 'Description',
              name: 'description',
              type: 'text',
            },
            {
              id: 'tools',
              displayName: 'Tools',
              name: 'tools',
              type: 'multiOptions',
              options: [
                { name: 'Code Interpreter', value: 'code_interpreter' },
                { name: 'File Search', value: 'file_search' },
              ],
            },
            {
              id: 'temperature',
              displayName: 'Temperature',
              name: 'temperature',
              type: 'number',
              typeOptions: {
                minValue: 0,
                maxValue: 2,
                numberPrecision: 1,
              },
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/assistants/{assistantId}',
            },
          },
        },
        {
          id: 'delete_assistant',
          name: 'Delete Assistant',
          value: 'delete',
          description: 'Delete an assistant',
          action: 'Delete an assistant',
          fields: [
            {
              id: 'assistant_id',
              displayName: 'Assistant ID',
              name: 'assistantId',
              type: 'string',
              required: true,
              description: 'The ID of the assistant to delete',
              placeholder: 'asst_...',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'DELETE',
              url: '/assistants/{assistantId}',
            },
          },
        },
      ],
    },

    // ========================================
    // EMBEDDING RESOURCE
    // ========================================
    {
      id: 'embedding',
      name: 'Embedding',
      value: 'embedding',
      description: 'Create text embeddings for similarity search',
      operations: [
        {
          id: 'create_embedding',
          name: 'Create Embedding',
          value: 'create',
          description: 'Create an embedding vector from input text',
          action: 'Create an embedding',
          fields: [
            {
              id: 'input',
              displayName: 'Input',
              name: 'input',
              type: 'text',
              required: true,
              description: 'The text to embed',
              placeholder: 'Enter text to create embedding for...',
              typeOptions: {
                rows: 4,
              },
            },
          ],
          optionalFields: [
            {
              id: 'model',
              displayName: 'Model',
              name: 'model',
              type: 'options',
              default: 'text-embedding-3-small',
              description: 'The embedding model to use',
              options: [
                { name: 'text-embedding-3-small', value: 'text-embedding-3-small', description: 'Smaller, faster, cheaper' },
                { name: 'text-embedding-3-large', value: 'text-embedding-3-large', description: 'Larger, more accurate' },
                { name: 'text-embedding-ada-002', value: 'text-embedding-ada-002', description: 'Previous generation' },
              ],
            },
            {
              id: 'dimensions',
              displayName: 'Dimensions',
              name: 'dimensions',
              type: 'number',
              description: 'The number of dimensions for the embedding (text-embedding-3 only)',
              placeholder: '1536',
              typeOptions: {
                minValue: 1,
                maxValue: 3072,
              },
            },
            {
              id: 'encoding_format',
              displayName: 'Encoding Format',
              name: 'encodingFormat',
              type: 'options',
              default: 'float',
              options: [
                { name: 'Float', value: 'float', description: 'Array of floats' },
                { name: 'Base64', value: 'base64', description: 'Base64 encoded' },
              ],
            },
          ],
          routing: {
            request: {
              method: 'POST',
              url: '/embeddings',
            },
          },
        },
      ],
    },

    // ========================================
    // MODEL RESOURCE
    // ========================================
    {
      id: 'model',
      name: 'Model',
      value: 'model',
      description: 'List and manage available models',
      operations: [
        {
          id: 'list_models',
          name: 'List Models',
          value: 'list',
          description: 'List all available models',
          action: 'List all models',
          fields: [],
          optionalFields: [],
          routing: {
            request: {
              method: 'GET',
              url: '/models',
            },
          },
        },
        {
          id: 'get_model',
          name: 'Get Model',
          value: 'get',
          description: 'Get details about a specific model',
          action: 'Get model details',
          fields: [
            {
              id: 'model',
              displayName: 'Model',
              name: 'model',
              type: 'string',
              required: true,
              description: 'The model ID',
              placeholder: 'gpt-4o',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'GET',
              url: '/models/{model}',
            },
          },
        },
        {
          id: 'delete_model',
          name: 'Delete Fine-tuned Model',
          value: 'delete',
          description: 'Delete a fine-tuned model',
          action: 'Delete fine-tuned model',
          fields: [
            {
              id: 'model',
              displayName: 'Model ID',
              name: 'model',
              type: 'string',
              required: true,
              description: 'The ID of the fine-tuned model to delete',
              placeholder: 'ft:gpt-3.5-turbo:my-org:custom_suffix:id',
            },
          ],
          optionalFields: [],
          routing: {
            request: {
              method: 'DELETE',
              url: '/models/{model}',
            },
          },
        },
      ],
    },
  ],

  defaults: {
    name: 'OpenAI',
  },
};

export default openAiSchema;
