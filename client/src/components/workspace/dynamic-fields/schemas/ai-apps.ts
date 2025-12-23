/**
 * App Schema Registry - AI Apps
 * 
 * Schema definitions for AI/ML service integrations
 */

import type { AppSchema, FieldSchema } from '../types';

// ============================================
// COMMON AI FIELD DEFINITIONS
// ============================================

const modelTemperatureField: FieldSchema = {
  id: 'temperature',
  name: 'Temperature',
  description: 'Controls randomness. Lower values make responses more focused and deterministic, higher values make them more creative.',
  type: 'number',
  defaultValue: 0.7,
  placeholder: '0.7',
  validation: { min: 0, max: 2 },
  aiHelp: 'Use 0-0.3 for factual tasks, 0.7-1.0 for creative tasks',
  examples: [
    { label: 'Precise/Factual', value: 0.1 },
    { label: 'Balanced', value: 0.7 },
    { label: 'Creative', value: 1.0 },
  ],
};

const maxTokensField: FieldSchema = {
  id: 'maxTokens',
  name: 'Max Tokens',
  description: 'Maximum number of tokens to generate. One token is roughly 4 characters.',
  type: 'number',
  defaultValue: 1024,
  placeholder: '1024',
  validation: { min: 1, max: 128000 },
  aiHelp: 'Set based on expected response length. 1000 tokens ≈ 750 words',
};

const systemPromptField: FieldSchema = {
  id: 'systemPrompt',
  name: 'System Prompt',
  description: 'Instructions that define how the AI should behave. This sets the context and personality.',
  type: 'textarea',
  placeholder: 'You are a helpful assistant...',
  rows: 4,
  aiSuggestions: true,
  aiAutoFill: true,
  examples: [
    { label: 'Helpful Assistant', value: 'You are a helpful assistant that provides clear, concise answers.' },
    { label: 'Code Expert', value: 'You are an expert programmer. Provide clean, well-documented code with explanations.' },
    { label: 'Customer Support', value: 'You are a friendly customer support agent. Be empathetic and solution-focused.' },
  ],
};

const userMessageField: FieldSchema = {
  id: 'userMessage',
  name: 'User Message',
  description: 'The message or prompt to send to the AI model.',
  type: 'expression',
  placeholder: 'Enter your message or use {{variables}}',
  validation: { required: true, minLength: 1 },
  aiSuggestions: true,
};

// ============================================
// OPENAI SCHEMA
// ============================================

export const openaiSchema: AppSchema = {
  id: 'openai',
  name: 'OpenAI',
  description: 'AI models including GPT-4, GPT-3.5, DALL-E, Whisper, and more',
  icon: '🤖',
  color: '#10a37f',
  category: 'AI',
  tags: ['ai', 'gpt', 'chatgpt', 'dalle', 'whisper', 'embeddings'],
  apiBaseUrl: 'https://api.openai.com/v1',
  apiDocsUrl: 'https://platform.openai.com/docs',
  version: '1.0.0',
  status: 'stable',
  
  credentials: [{
    id: 'openai_api',
    name: 'OpenAI API',
    type: 'apiKey',
    helpUrl: 'https://platform.openai.com/api-keys',
    fields: [{
      id: 'apiKey',
      name: 'API Key',
      description: 'Your OpenAI API key. Get it from platform.openai.com/api-keys',
      type: 'secret',
      placeholder: 'sk-...',
      validation: { required: true, pattern: '^sk-[a-zA-Z0-9]{32,}$', patternMessage: 'Must be a valid OpenAI API key starting with sk-' },
    }, {
      id: 'organization',
      name: 'Organization ID (Optional)',
      description: 'Your OpenAI organization ID if you belong to multiple organizations',
      type: 'text',
      placeholder: 'org-...',
    }],
    testEndpoint: '/models',
  }],
  
  triggers: [{
    id: 'openai_assistant_message',
    appId: 'openai',
    name: 'Assistant Message',
    description: 'Triggers when an OpenAI Assistant receives or sends a message',
    category: 'AI',
    requiresCredential: true,
    credentialType: 'openai_api',
    fields: [{
      id: 'assistantId',
      name: 'Assistant ID',
      description: 'The ID of the OpenAI Assistant to monitor',
      type: 'resource',
      validation: { required: true },
      dynamicOptions: {
        type: 'api',
        endpoint: '/assistants',
        transform: 'data.map(a => ({ value: a.id, label: a.name || a.id }))',
      },
    }, {
      id: 'eventType',
      name: 'Event Type',
      description: 'Which events should trigger the workflow',
      type: 'select',
      defaultValue: 'message.created',
      options: [
        { value: 'message.created', label: 'Message Created', description: 'When a new message is added' },
        { value: 'run.completed', label: 'Run Completed', description: 'When assistant finishes processing' },
        { value: 'run.failed', label: 'Run Failed', description: 'When assistant encounters an error' },
      ],
    }],
  }],
  
  actions: [
    // Chat Completion
    {
      id: 'openai_chat',
      appId: 'openai',
      name: 'Chat Completion',
      description: 'Generate a response using GPT models (GPT-4o, GPT-4, GPT-3.5)',
      category: 'Text Generation',
      tags: ['chat', 'gpt', 'completion', 'text'],
      requiresCredential: true,
      credentialType: 'openai_api',
      fieldGroups: [
        { id: 'model', name: 'Model Settings', description: 'Configure the AI model' },
        { id: 'prompt', name: 'Prompt', description: 'Input messages' },
        { id: 'parameters', name: 'Parameters', description: 'Generation parameters', collapsed: true },
        { id: 'advanced', name: 'Advanced', description: 'Advanced options', collapsed: true },
      ],
      fields: [
        {
          id: 'model',
          name: 'Model',
          description: 'The GPT model to use for generation',
          type: 'select',
          group: 'model',
          defaultValue: 'gpt-4o',
          validation: { required: true },
          options: [
            { value: 'gpt-4o', label: 'GPT-4o', description: 'Most capable model, best for complex tasks', group: 'GPT-4' },
            { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Faster and cheaper, good for most tasks', group: 'GPT-4' },
            { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'GPT-4 with 128K context', group: 'GPT-4' },
            { value: 'gpt-4', label: 'GPT-4', description: 'Original GPT-4 model', group: 'GPT-4' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and cost-effective', group: 'GPT-3.5' },
            { value: 'gpt-3.5-turbo-16k', label: 'GPT-3.5 Turbo 16K', description: 'Extended context window', group: 'GPT-3.5' },
          ],
        },
        { ...systemPromptField, group: 'prompt' },
        { ...userMessageField, group: 'prompt' },
        {
          id: 'messages',
          name: 'Additional Messages',
          description: 'Additional conversation history or context messages',
          type: 'array',
          group: 'prompt',
          itemSchema: {
            id: 'message',
            name: 'Message',
            description: 'A message in the conversation',
            type: 'object',
            fields: [{
              id: 'role',
              name: 'Role',
              description: 'Who is speaking',
              type: 'select',
              options: [
                { value: 'user', label: 'User' },
                { value: 'assistant', label: 'Assistant' },
                { value: 'system', label: 'System' },
              ],
            }, {
              id: 'content',
              name: 'Content',
              description: 'Message content',
              type: 'textarea',
            }],
          },
        },
        { ...modelTemperatureField, group: 'parameters' },
        { ...maxTokensField, group: 'parameters' },
        {
          id: 'topP',
          name: 'Top P',
          description: 'Nucleus sampling threshold. Alternative to temperature.',
          type: 'number',
          group: 'parameters',
          defaultValue: 1,
          validation: { min: 0, max: 1 },
        },
        {
          id: 'frequencyPenalty',
          name: 'Frequency Penalty',
          description: 'Reduces repetition of tokens based on frequency',
          type: 'number',
          group: 'parameters',
          defaultValue: 0,
          validation: { min: -2, max: 2 },
        },
        {
          id: 'presencePenalty',
          name: 'Presence Penalty',
          description: 'Reduces repetition by penalizing tokens that appear',
          type: 'number',
          group: 'parameters',
          defaultValue: 0,
          validation: { min: -2, max: 2 },
        },
        {
          id: 'responseFormat',
          name: 'Response Format',
          description: 'Format of the response',
          type: 'select',
          group: 'advanced',
          defaultValue: 'text',
          options: [
            { value: 'text', label: 'Text', description: 'Plain text response' },
            { value: 'json_object', label: 'JSON Object', description: 'Structured JSON response' },
          ],
        },
        {
          id: 'seed',
          name: 'Seed',
          description: 'For reproducible outputs. Same seed = same output',
          type: 'number',
          group: 'advanced',
          placeholder: 'Random',
        },
        {
          id: 'stop',
          name: 'Stop Sequences',
          description: 'Up to 4 sequences where the API will stop generating',
          type: 'array',
          group: 'advanced',
          itemSchema: {
            id: 'stopSequence',
            name: 'Stop Sequence',
            description: 'Text that stops generation',
            type: 'text',
          },
        },
        {
          id: 'user',
          name: 'User ID',
          description: 'Unique identifier for end-user tracking',
          type: 'text',
          group: 'advanced',
        },
      ],
      outputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Generated response text' },
          model: { type: 'string', description: 'Model used' },
          usage: {
            type: 'object',
            properties: {
              prompt_tokens: { type: 'number' },
              completion_tokens: { type: 'number' },
              total_tokens: { type: 'number' },
            },
          },
          finish_reason: { type: 'string' },
        },
      },
    },
    
    // Image Generation
    {
      id: 'openai_image',
      appId: 'openai',
      name: 'Generate Image (DALL-E)',
      description: 'Generate images using DALL-E 3 or DALL-E 2',
      category: 'Image Generation',
      tags: ['image', 'dalle', 'art', 'generation'],
      requiresCredential: true,
      credentialType: 'openai_api',
      fields: [
        {
          id: 'model',
          name: 'Model',
          description: 'DALL-E model to use',
          type: 'select',
          defaultValue: 'dall-e-3',
          options: [
            { value: 'dall-e-3', label: 'DALL-E 3', description: 'Latest model with best quality' },
            { value: 'dall-e-2', label: 'DALL-E 2', description: 'Faster, supports more sizes' },
          ],
        },
        {
          id: 'prompt',
          name: 'Prompt',
          description: 'A detailed description of the image you want to generate',
          type: 'textarea',
          rows: 4,
          validation: { required: true, minLength: 1, maxLength: 4000 },
          aiSuggestions: true,
          aiAutoFill: true,
          examples: [
            { label: 'Landscape', value: 'A serene mountain landscape at sunset, with a crystal-clear lake reflecting orange and purple skies' },
            { label: 'Portrait', value: 'A professional headshot of a friendly business executive, warm lighting, neutral background' },
          ],
        },
        {
          id: 'size',
          name: 'Size',
          description: 'Image dimensions',
          type: 'select',
          defaultValue: '1024x1024',
          options: [
            { value: '1024x1024', label: '1024x1024 (Square)', group: 'DALL-E 3 & 2' },
            { value: '1024x1792', label: '1024x1792 (Portrait)', group: 'DALL-E 3 Only' },
            { value: '1792x1024', label: '1792x1024 (Landscape)', group: 'DALL-E 3 Only' },
            { value: '512x512', label: '512x512', group: 'DALL-E 2 Only' },
            { value: '256x256', label: '256x256', group: 'DALL-E 2 Only' },
          ],
        },
        {
          id: 'quality',
          name: 'Quality',
          description: 'Image quality (DALL-E 3 only)',
          type: 'select',
          defaultValue: 'standard',
          showWhen: [{ field: 'model', condition: 'equals', value: 'dall-e-3' }],
          options: [
            { value: 'standard', label: 'Standard', description: 'Good quality, faster' },
            { value: 'hd', label: 'HD', description: 'Higher detail, slower' },
          ],
        },
        {
          id: 'style',
          name: 'Style',
          description: 'Image style (DALL-E 3 only)',
          type: 'select',
          defaultValue: 'vivid',
          showWhen: [{ field: 'model', condition: 'equals', value: 'dall-e-3' }],
          options: [
            { value: 'vivid', label: 'Vivid', description: 'Hyper-real and dramatic' },
            { value: 'natural', label: 'Natural', description: 'More natural, less hyper-real' },
          ],
        },
        {
          id: 'n',
          name: 'Number of Images',
          description: 'How many images to generate (DALL-E 2 supports up to 10)',
          type: 'number',
          defaultValue: 1,
          validation: { min: 1, max: 10 },
        },
        {
          id: 'responseFormat',
          name: 'Response Format',
          description: 'How to receive the image',
          type: 'select',
          defaultValue: 'url',
          options: [
            { value: 'url', label: 'URL', description: 'Returns a URL (expires after 1 hour)' },
            { value: 'b64_json', label: 'Base64', description: 'Returns base64 encoded image' },
          ],
        },
      ],
    },
    
    // Speech to Text
    {
      id: 'openai_transcription',
      appId: 'openai',
      name: 'Transcribe Audio (Whisper)',
      description: 'Convert audio to text using Whisper model',
      category: 'Audio',
      tags: ['audio', 'speech', 'transcription', 'whisper'],
      requiresCredential: true,
      credentialType: 'openai_api',
      fields: [
        {
          id: 'file',
          name: 'Audio File',
          description: 'The audio file to transcribe (mp3, mp4, mpeg, mpga, m4a, wav, webm)',
          type: 'file',
          validation: { required: true },
        },
        {
          id: 'model',
          name: 'Model',
          description: 'Whisper model to use',
          type: 'select',
          defaultValue: 'whisper-1',
          options: [
            { value: 'whisper-1', label: 'Whisper v1', description: 'Latest Whisper model' },
          ],
        },
        {
          id: 'language',
          name: 'Language',
          description: 'Language of the audio (ISO 639-1 code). Auto-detects if not specified.',
          type: 'select',
          allowCustom: true,
          options: [
            { value: '', label: 'Auto-detect' },
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'it', label: 'Italian' },
            { value: 'pt', label: 'Portuguese' },
            { value: 'zh', label: 'Chinese' },
            { value: 'ja', label: 'Japanese' },
            { value: 'ko', label: 'Korean' },
            { value: 'hi', label: 'Hindi' },
            { value: 'ar', label: 'Arabic' },
          ],
        },
        {
          id: 'prompt',
          name: 'Prompt',
          description: 'Optional text to guide the model\'s style or continue a previous segment',
          type: 'textarea',
          rows: 2,
        },
        {
          id: 'responseFormat',
          name: 'Response Format',
          description: 'Format of the transcription output',
          type: 'select',
          defaultValue: 'json',
          options: [
            { value: 'json', label: 'JSON', description: 'Returns text in JSON format' },
            { value: 'text', label: 'Text', description: 'Returns plain text' },
            { value: 'srt', label: 'SRT', description: 'Subtitle format with timestamps' },
            { value: 'vtt', label: 'VTT', description: 'WebVTT subtitle format' },
            { value: 'verbose_json', label: 'Verbose JSON', description: 'JSON with word-level timestamps' },
          ],
        },
        {
          id: 'temperature',
          name: 'Temperature',
          description: 'Sampling temperature (0-1). Lower for more deterministic.',
          type: 'number',
          defaultValue: 0,
          validation: { min: 0, max: 1 },
        },
      ],
    },
    
    // Text to Speech
    {
      id: 'openai_tts',
      appId: 'openai',
      name: 'Text to Speech',
      description: 'Convert text to natural-sounding speech',
      category: 'Audio',
      tags: ['audio', 'speech', 'tts', 'voice'],
      requiresCredential: true,
      credentialType: 'openai_api',
      fields: [
        {
          id: 'input',
          name: 'Text',
          description: 'The text to convert to speech (max 4096 characters)',
          type: 'textarea',
          rows: 4,
          validation: { required: true, maxLength: 4096 },
        },
        {
          id: 'model',
          name: 'Model',
          description: 'TTS model to use',
          type: 'select',
          defaultValue: 'tts-1',
          options: [
            { value: 'tts-1', label: 'TTS-1', description: 'Standard quality, faster' },
            { value: 'tts-1-hd', label: 'TTS-1 HD', description: 'Higher quality, slower' },
          ],
        },
        {
          id: 'voice',
          name: 'Voice',
          description: 'The voice to use for speech synthesis',
          type: 'select',
          defaultValue: 'alloy',
          validation: { required: true },
          options: [
            { value: 'alloy', label: 'Alloy', description: 'Neutral, balanced voice' },
            { value: 'echo', label: 'Echo', description: 'Warm, conversational' },
            { value: 'fable', label: 'Fable', description: 'Expressive, storytelling' },
            { value: 'onyx', label: 'Onyx', description: 'Deep, authoritative' },
            { value: 'nova', label: 'Nova', description: 'Friendly, upbeat' },
            { value: 'shimmer', label: 'Shimmer', description: 'Clear, professional' },
          ],
        },
        {
          id: 'speed',
          name: 'Speed',
          description: 'Speech speed (0.25 to 4.0)',
          type: 'number',
          defaultValue: 1,
          validation: { min: 0.25, max: 4 },
        },
        {
          id: 'response_format',
          name: 'Audio Format',
          description: 'Output audio format',
          type: 'select',
          defaultValue: 'mp3',
          options: [
            { value: 'mp3', label: 'MP3', description: 'Most compatible' },
            { value: 'opus', label: 'Opus', description: 'Best for streaming' },
            { value: 'aac', label: 'AAC', description: 'Good for mobile' },
            { value: 'flac', label: 'FLAC', description: 'Lossless quality' },
            { value: 'wav', label: 'WAV', description: 'Uncompressed' },
            { value: 'pcm', label: 'PCM', description: 'Raw audio' },
          ],
        },
      ],
    },
    
    // Embeddings
    {
      id: 'openai_embeddings',
      appId: 'openai',
      name: 'Create Embeddings',
      description: 'Generate vector embeddings for text (for search, clustering, etc.)',
      category: 'Embeddings',
      tags: ['embeddings', 'vectors', 'search', 'semantic'],
      requiresCredential: true,
      credentialType: 'openai_api',
      fields: [
        {
          id: 'input',
          name: 'Input Text',
          description: 'Text to generate embeddings for',
          type: 'textarea',
          validation: { required: true },
        },
        {
          id: 'model',
          name: 'Model',
          description: 'Embedding model to use',
          type: 'select',
          defaultValue: 'text-embedding-3-small',
          options: [
            { value: 'text-embedding-3-small', label: 'text-embedding-3-small', description: 'Fast, cost-effective (1536 dimensions)' },
            { value: 'text-embedding-3-large', label: 'text-embedding-3-large', description: 'Most capable (3072 dimensions)' },
            { value: 'text-embedding-ada-002', label: 'text-embedding-ada-002', description: 'Legacy model (1536 dimensions)' },
          ],
        },
        {
          id: 'dimensions',
          name: 'Dimensions',
          description: 'Number of dimensions for the output vectors (text-embedding-3 models only)',
          type: 'number',
          showWhen: [{ field: 'model', condition: 'contains', value: 'embedding-3' }],
        },
        {
          id: 'encodingFormat',
          name: 'Encoding Format',
          description: 'Format for the embeddings',
          type: 'select',
          defaultValue: 'float',
          options: [
            { value: 'float', label: 'Float', description: 'Standard floating point' },
            { value: 'base64', label: 'Base64', description: 'Base64 encoded' },
          ],
        },
      ],
    },
    
    // Moderation
    {
      id: 'openai_moderation',
      appId: 'openai',
      name: 'Content Moderation',
      description: 'Check if text contains harmful content',
      category: 'Safety',
      tags: ['moderation', 'safety', 'content'],
      requiresCredential: true,
      credentialType: 'openai_api',
      fields: [
        {
          id: 'input',
          name: 'Input Text',
          description: 'Text to check for harmful content',
          type: 'textarea',
          validation: { required: true },
        },
        {
          id: 'model',
          name: 'Model',
          description: 'Moderation model to use',
          type: 'select',
          defaultValue: 'text-moderation-latest',
          options: [
            { value: 'text-moderation-latest', label: 'Latest', description: 'Most accurate model' },
            { value: 'text-moderation-stable', label: 'Stable', description: 'Consistent results' },
          ],
        },
      ],
    },
  ],
};

// ============================================
// ANTHROPIC (CLAUDE) SCHEMA
// ============================================

export const anthropicSchema: AppSchema = {
  id: 'anthropic',
  name: 'Anthropic (Claude)',
  description: 'Claude AI models - safe, helpful, and honest AI assistant',
  icon: '🧠',
  color: '#d97706',
  category: 'AI',
  tags: ['ai', 'claude', 'chat', 'anthropic'],
  apiBaseUrl: 'https://api.anthropic.com/v1',
  apiDocsUrl: 'https://docs.anthropic.com/',
  version: '1.0.0',
  status: 'stable',
  
  credentials: [{
    id: 'anthropic_api',
    name: 'Anthropic API',
    type: 'apiKey',
    helpUrl: 'https://console.anthropic.com/settings/keys',
    fields: [{
      id: 'apiKey',
      name: 'API Key',
      description: 'Your Anthropic API key',
      type: 'secret',
      placeholder: 'sk-ant-...',
      validation: { required: true },
    }],
  }],
  
  triggers: [],
  
  actions: [
    {
      id: 'anthropic_chat',
      appId: 'anthropic',
      name: 'Claude Message',
      description: 'Generate a response using Claude models',
      category: 'Text Generation',
      requiresCredential: true,
      credentialType: 'anthropic_api',
      fields: [
        {
          id: 'model',
          name: 'Model',
          description: 'Claude model to use',
          type: 'select',
          defaultValue: 'claude-3-5-sonnet-20241022',
          validation: { required: true },
          options: [
            { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', description: 'Best balance of intelligence and speed', group: 'Claude 3.5' },
            { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', description: 'Fastest model', group: 'Claude 3.5' },
            { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus', description: 'Most powerful for complex tasks', group: 'Claude 3' },
            { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet', description: 'Balanced performance', group: 'Claude 3' },
            { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', description: 'Fast and efficient', group: 'Claude 3' },
          ],
        },
        { ...systemPromptField },
        { ...userMessageField },
        { ...maxTokensField, defaultValue: 4096, validation: { min: 1, max: 200000 } },
        { ...modelTemperatureField, validation: { min: 0, max: 1 } },
        {
          id: 'topK',
          name: 'Top K',
          description: 'Sample from top K tokens',
          type: 'number',
          validation: { min: 1 },
        },
        {
          id: 'topP',
          name: 'Top P',
          description: 'Nucleus sampling threshold',
          type: 'number',
          defaultValue: 1,
          validation: { min: 0, max: 1 },
        },
      ],
    },
  ],
};

// ============================================
// GOOGLE AI (GEMINI) SCHEMA
// ============================================

export const googleAISchema: AppSchema = {
  id: 'google_ai',
  name: 'Google AI (Gemini)',
  description: 'Google\'s Gemini models for text, code, and multimodal tasks',
  icon: '✨',
  color: '#4285f4',
  category: 'AI',
  tags: ['ai', 'gemini', 'google', 'multimodal'],
  apiBaseUrl: 'https://generativelanguage.googleapis.com/v1',
  apiDocsUrl: 'https://ai.google.dev/docs',
  version: '1.0.0',
  status: 'stable',
  
  credentials: [{
    id: 'google_ai_api',
    name: 'Google AI API',
    type: 'apiKey',
    helpUrl: 'https://makersuite.google.com/app/apikey',
    fields: [{
      id: 'apiKey',
      name: 'API Key',
      description: 'Your Google AI API key',
      type: 'secret',
      validation: { required: true },
    }],
  }],
  
  triggers: [],
  
  actions: [
    {
      id: 'gemini_chat',
      appId: 'google_ai',
      name: 'Generate Content',
      description: 'Generate text using Gemini models',
      category: 'Text Generation',
      requiresCredential: true,
      credentialType: 'google_ai_api',
      fields: [
        {
          id: 'model',
          name: 'Model',
          description: 'Gemini model to use',
          type: 'select',
          defaultValue: 'gemini-1.5-pro',
          validation: { required: true },
          options: [
            { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Best for complex tasks' },
            { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Fast and efficient' },
            { value: 'gemini-pro', label: 'Gemini Pro', description: 'Text generation' },
            { value: 'gemini-pro-vision', label: 'Gemini Pro Vision', description: 'Multimodal (text + images)' },
          ],
        },
        { ...userMessageField, id: 'prompt', name: 'Prompt' },
        { ...modelTemperatureField },
        { ...maxTokensField, id: 'maxOutputTokens', name: 'Max Output Tokens' },
        {
          id: 'topP',
          name: 'Top P',
          description: 'Nucleus sampling',
          type: 'number',
          defaultValue: 0.95,
          validation: { min: 0, max: 1 },
        },
        {
          id: 'topK',
          name: 'Top K',
          description: 'Top-K sampling',
          type: 'number',
          defaultValue: 40,
          validation: { min: 1 },
        },
        {
          id: 'safetySettings',
          name: 'Safety Settings',
          description: 'Content safety filter levels',
          type: 'object',
          fields: [
            {
              id: 'harassment',
              name: 'Harassment',
              type: 'select',
              defaultValue: 'BLOCK_MEDIUM_AND_ABOVE',
              options: [
                { value: 'BLOCK_NONE', label: 'Block None' },
                { value: 'BLOCK_LOW_AND_ABOVE', label: 'Block Low+' },
                { value: 'BLOCK_MEDIUM_AND_ABOVE', label: 'Block Medium+' },
                { value: 'BLOCK_ONLY_HIGH', label: 'Block High Only' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Export all AI schemas
export const aiAppSchemas: AppSchema[] = [
  openaiSchema,
  anthropicSchema,
  googleAISchema,
];
