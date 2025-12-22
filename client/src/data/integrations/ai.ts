import { Integration } from './types';

export const openaiIntegration: Integration = {
  id: 'openai',
  name: 'OpenAI',
  description: 'Use the OpenAI node to integrate GPT models, DALL-E, Whisper, and embeddings into your workflows. n8n supports chat completions, image generation, speech-to-text, and vector embeddings.',
  shortDescription: 'GPT, DALL-E, and AI models',
  category: 'ai',
  icon: 'openai',
  color: '#412991',
  website: 'https://openai.com',
  documentationUrl: 'https://platform.openai.com/docs',

  features: [
    'Chat completions (GPT-4, GPT-3.5)',
    'Image generation (DALL-E)',
    'Speech to text (Whisper)',
    'Text to speech',
    'Embeddings',
    'Fine-tuning',
    'Function calling',
    'Vision capabilities',
  ],

  useCases: [
    'Chatbots and assistants',
    'Content generation',
    'Text summarization',
    'Language translation',
    'Image creation',
    'Audio transcription',
    'Sentiment analysis',
    'Code generation',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Create OpenAI Account',
      description: 'Sign up at platform.openai.com.',
    },
    {
      step: 2,
      title: 'Add Payment Method',
      description: 'Add billing information to enable API access.',
    },
    {
      step: 3,
      title: 'Generate API Key',
      description: 'Go to API Keys and create a new secret key.',
    },
    {
      step: 4,
      title: 'Copy API Key',
      description: 'Copy the key immediately - it won\'t be shown again.',
    },
    {
      step: 5,
      title: 'Configure in AgentForge',
      description: 'Enter API key in Integrations > OpenAI.',
    },
  ],

  operations: [
    {
      name: 'Chat Completion',
      description: 'Generate text using GPT models',
      fields: [
        { name: 'model', type: 'select', required: true, description: 'gpt-4o, gpt-4-turbo, gpt-3.5-turbo' },
        { name: 'messages', type: 'array', required: true, description: 'Array of message objects (role, content)' },
        { name: 'temperature', type: 'number', required: false, description: 'Creativity (0-2, default 1)' },
        { name: 'max_tokens', type: 'number', required: false, description: 'Max response length' },
        { name: 'functions', type: 'array', required: false, description: 'Function definitions for function calling' },
      ],
    },
    {
      name: 'Generate Image',
      description: 'Create images with DALL-E',
      fields: [
        { name: 'prompt', type: 'string', required: true, description: 'Image description' },
        { name: 'model', type: 'select', required: false, description: 'dall-e-3, dall-e-2' },
        { name: 'size', type: 'select', required: false, description: '1024x1024, 1792x1024, 1024x1792' },
        { name: 'quality', type: 'select', required: false, description: 'standard, hd' },
        { name: 'n', type: 'number', required: false, description: 'Number of images' },
      ],
    },
    {
      name: 'Transcribe Audio',
      description: 'Convert speech to text with Whisper',
      fields: [
        { name: 'file', type: 'binary', required: true, description: 'Audio file (mp3, wav, etc.)' },
        { name: 'language', type: 'string', required: false, description: 'Language code (e.g., en, es)' },
        { name: 'response_format', type: 'select', required: false, description: 'json, text, srt, vtt' },
      ],
    },
    {
      name: 'Create Embedding',
      description: 'Generate vector embeddings',
      fields: [
        { name: 'input', type: 'string', required: true, description: 'Text to embed' },
        { name: 'model', type: 'string', required: false, description: 'text-embedding-3-small, text-embedding-3-large' },
      ],
    },
    {
      name: 'Text to Speech',
      description: 'Convert text to audio',
      fields: [
        { name: 'input', type: 'string', required: true, description: 'Text to speak' },
        { name: 'voice', type: 'select', required: true, description: 'alloy, echo, fable, onyx, nova, shimmer' },
        { name: 'model', type: 'select', required: false, description: 'tts-1, tts-1-hd' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Generate Response',
      description: 'Get AI-generated text response',
      inputFields: ['model', 'prompt', 'system_message'],
      outputFields: ['response', 'usage', 'finish_reason'],
    },
    {
      name: 'Analyze Image',
      description: 'Describe or analyze an image',
      inputFields: ['image_url', 'prompt'],
      outputFields: ['description', 'usage'],
    },
  ],

  examples: [
    {
      title: 'Customer Support Bot',
      description: 'AI-powered support responses',
      steps: [
        'Trigger: New support message',
        'Retrieve relevant knowledge base articles',
        'Construct system prompt with context',
        'Call GPT with customer message',
        'Format and send response',
      ],
      code: `{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful customer support agent for {{company.name}}. Use the following knowledge base to answer questions:\\n\\n{{knowledgeBase.context}}"
    },
    {
      "role": "user",
      "content": "{{customer.message}}"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Rate limit exceeded',
      cause: 'Too many requests per minute.',
      solution: 'Implement rate limiting. Check usage tier in OpenAI dashboard.',
    },
    {
      problem: 'Context length exceeded',
      cause: 'Input + output exceeds model\'s context window.',
      solution: 'Reduce input length or use model with larger context.',
    },
    {
      problem: 'Invalid API key',
      cause: 'Key deleted, expired, or wrong format.',
      solution: 'Generate new API key in OpenAI dashboard.',
    },
    {
      problem: 'Insufficient quota',
      cause: 'Billing limit reached or no payment method.',
      solution: 'Add funds or increase spending limit in billing settings.',
    },
  ],

  relatedIntegrations: ['anthropic', 'google-ai'],
  externalResources: [
    { title: 'OpenAI API Reference', url: 'https://platform.openai.com/docs/api-reference' },
    { title: 'Prompt Engineering', url: 'https://platform.openai.com/docs/guides/prompt-engineering' },
  ],
};

export const anthropicIntegration: Integration = {
  id: 'anthropic',
  name: 'Anthropic Claude',
  description: 'Use the Anthropic node to integrate Claude AI models into your workflows. n8n supports chat completions with Claude 3.5 Sonnet, Claude 3 Opus, and other Claude models.',
  shortDescription: 'Claude AI models',
  category: 'ai',
  icon: 'anthropic',
  color: '#CC785C',
  website: 'https://anthropic.com',
  documentationUrl: 'https://docs.anthropic.com',

  features: [
    'Chat completions',
    'Long context (200K tokens)',
    'Vision capabilities',
    'Tool use (function calling)',
    'Streaming responses',
    'System prompts',
    'Multi-turn conversations',
    'Structured outputs',
  ],

  useCases: [
    'Complex reasoning',
    'Long document analysis',
    'Code generation',
    'Content creation',
    'Data extraction',
    'Research assistance',
    'Customer support',
    'Writing assistance',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Anthropic Account',
      description: 'Sign up at console.anthropic.com.',
    },
    {
      step: 2,
      title: 'Get API Key',
      description: 'Go to API Keys and create a new key.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter API key in Integrations > Anthropic.',
    },
  ],

  operations: [
    {
      name: 'Create Message',
      description: 'Generate a response with Claude',
      fields: [
        { name: 'model', type: 'select', required: true, description: 'claude-3-5-sonnet, claude-3-opus, claude-3-haiku' },
        { name: 'messages', type: 'array', required: true, description: 'Conversation messages' },
        { name: 'system', type: 'string', required: false, description: 'System prompt' },
        { name: 'max_tokens', type: 'number', required: true, description: 'Max response tokens' },
        { name: 'temperature', type: 'number', required: false, description: 'Creativity (0-1)' },
        { name: 'tools', type: 'array', required: false, description: 'Tool definitions' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Ask Claude',
      description: 'Send a message and get response',
      inputFields: ['model', 'prompt', 'system'],
      outputFields: ['content', 'stop_reason', 'usage'],
    },
  ],

  examples: [
    {
      title: 'Document Analysis',
      description: 'Analyze long documents with Claude',
      steps: [
        'Receive document content',
        'Construct analysis prompt',
        'Call Claude with document',
        'Parse structured output',
      ],
      code: `{
  "model": "claude-3-5-sonnet-20241022",
  "system": "You are a document analyst. Extract key information and provide a structured summary.",
  "messages": [
    {
      "role": "user",
      "content": "Analyze this document and extract: 1) Main topics 2) Key findings 3) Action items\\n\\nDocument:\\n{{document.content}}"
    }
  ],
  "max_tokens": 2000
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Rate limit error',
      cause: 'Too many requests.',
      solution: 'Implement exponential backoff and retry.',
    },
    {
      problem: 'Max tokens exceeded',
      cause: 'Response would exceed max_tokens.',
      solution: 'Increase max_tokens or use a summarization approach.',
    },
  ],

  relatedIntegrations: ['openai', 'google-ai'],
  externalResources: [
    { title: 'Anthropic API Docs', url: 'https://docs.anthropic.com/en/api' },
    { title: 'Claude Models', url: 'https://docs.anthropic.com/en/docs/about-claude/models' },
  ],
};

export const googleAiIntegration: Integration = {
  id: 'google-ai',
  name: 'Google Gemini',
  description: 'Use the Google Gemini node to integrate Google\'s AI models. n8n supports Gemini Pro, Gemini Flash, and multimodal capabilities.',
  shortDescription: 'Google\'s Gemini AI models',
  category: 'ai',
  icon: 'google',
  color: '#4285F4',
  website: 'https://ai.google.dev',
  documentationUrl: 'https://ai.google.dev/docs',

  features: [
    'Text generation',
    'Multimodal (text + images)',
    'Long context',
    'Code generation',
    'Reasoning',
    'Function calling',
    'Embeddings',
    'Safety settings',
  ],

  useCases: [
    'Multimodal analysis',
    'Content generation',
    'Code assistance',
    'Visual understanding',
    'Language tasks',
    'Q&A systems',
    'Summarization',
    'Translation',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Get API Key',
      description: 'Go to aistudio.google.com and create an API key.',
    },
    {
      step: 2,
      title: 'Configure in AgentForge',
      description: 'Enter API key in Integrations > Google Gemini.',
    },
  ],

  operations: [
    {
      name: 'Generate Content',
      description: 'Generate text with Gemini',
      fields: [
        { name: 'model', type: 'select', required: true, description: 'gemini-1.5-pro, gemini-1.5-flash' },
        { name: 'prompt', type: 'string', required: true, description: 'Input prompt' },
        { name: 'images', type: 'array', required: false, description: 'Image URLs for multimodal' },
        { name: 'temperature', type: 'number', required: false, description: 'Creativity (0-1)' },
      ],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Generate Text',
      description: 'Get AI-generated response',
      inputFields: ['model', 'prompt'],
      outputFields: ['text', 'usage'],
    },
  ],

  examples: [
    {
      title: 'Image Analysis',
      description: 'Analyze images with Gemini multimodal',
      steps: [
        'Trigger: New image uploaded',
        'Send image to Gemini with analysis prompt',
        'Extract structured data from response',
        'Store analysis results',
      ],
      code: `{
  "model": "gemini-1.5-flash",
  "contents": [{
    "parts": [
      { "text": "Describe this image in detail and extract any text visible." },
      { "inline_data": { "mime_type": "image/jpeg", "data": "{{base64Image}}" } }
    ]
  }]
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Content blocked',
      cause: 'Safety filters triggered.',
      solution: 'Adjust safety settings or rephrase prompt.',
    },
  ],

  relatedIntegrations: ['openai', 'anthropic'],
  externalResources: [
    { title: 'Gemini API Docs', url: 'https://ai.google.dev/gemini-api/docs' },
  ],
};

export const elevenLabsIntegration: Integration = {
  id: 'elevenlabs',
  name: 'ElevenLabs',
  description: 'Use the ElevenLabs node for realistic AI voice generation. n8n supports text-to-speech, voice cloning, and audio manipulation.',
  shortDescription: 'AI voice generation',
  category: 'ai',
  icon: 'elevenlabs',
  color: '#000000',
  website: 'https://elevenlabs.io',
  documentationUrl: 'https://docs.elevenlabs.io',

  features: [
    'Text to speech',
    'Voice cloning',
    'Voice design',
    'Multiple languages',
    'Emotion control',
    'Voice library',
    'Audio projects',
    'Real-time streaming',
  ],

  useCases: [
    'Audio content creation',
    'Podcast production',
    'Video narration',
    'IVR systems',
    'Accessibility',
    'Audiobooks',
    'Game dialogue',
    'Virtual assistants',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Create ElevenLabs Account',
      description: 'Sign up at elevenlabs.io.',
    },
    {
      step: 2,
      title: 'Get API Key',
      description: 'Go to Profile > API Key.',
    },
    {
      step: 3,
      title: 'Configure in AgentForge',
      description: 'Enter API key in Integrations > ElevenLabs.',
    },
  ],

  operations: [
    {
      name: 'Text to Speech',
      description: 'Convert text to audio',
      fields: [
        { name: 'text', type: 'string', required: true, description: 'Text to convert' },
        { name: 'voice_id', type: 'string', required: true, description: 'Voice ID' },
        { name: 'model_id', type: 'string', required: false, description: 'Model to use' },
        { name: 'stability', type: 'number', required: false, description: 'Voice stability (0-1)' },
        { name: 'similarity_boost', type: 'number', required: false, description: 'Voice similarity (0-1)' },
      ],
    },
    {
      name: 'Get Voices',
      description: 'List available voices',
      fields: [],
    },
  ],

  triggers: [],

  actions: [
    {
      name: 'Generate Audio',
      description: 'Create audio from text',
      inputFields: ['text', 'voice_id'],
      outputFields: ['audio_url', 'audio_binary'],
    },
  ],

  examples: [
    {
      title: 'Podcast Intro Generator',
      description: 'Generate podcast intros with AI voice',
      steps: [
        'Trigger: New podcast episode created',
        'Format intro script with episode details',
        'Generate audio with selected voice',
        'Save audio file to storage',
      ],
      code: `{
  "text": "Welcome to {{podcast.name}}! In today's episode, {{episode.title}}, we'll be discussing {{episode.topic}}. Let's dive in!",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Character limit exceeded',
      cause: 'Text too long for plan.',
      solution: 'Split text into chunks or upgrade plan.',
    },
  ],

  relatedIntegrations: ['openai'],
  externalResources: [
    { title: 'ElevenLabs API', url: 'https://docs.elevenlabs.io/api-reference' },
  ],
};
