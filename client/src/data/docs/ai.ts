import { IntegrationDoc } from './types';

export const aiDocs: IntegrationDoc[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // OPENAI
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    category: 'ai',
    shortDescription: 'GPT models, DALL-E, Whisper - Generate text, images, and transcriptions',
    overview: {
      what: 'OpenAI integration provides access to ChatGPT, DALL-E, Whisper, and other AI models for text generation, image creation, speech-to-text, and embeddings.',
      why: 'OpenAI offers the most advanced AI models. Automate content creation, customer support, image generation, and audio transcription with state-of-the-art AI.',
      useCases: [
        'Generate AI responses for customer inquiries',
        'Create content (emails, summaries, articles)',
        'Generate images from text descriptions',
        'Transcribe audio/video to text',
        'Translate languages',
        'Analyze sentiment',
        'Build semantic search with embeddings',
        'Convert text to speech'
      ],
      targetAudience: 'Anyone wanting to add AI capabilities to their workflows - content creators, customer support teams, developers, marketers.',
    },
    prerequisites: {
      accounts: ['OpenAI account (sign up at platform.openai.com)'],
      permissions: ['OpenAI API Key with billing enabled'],
      preparations: [
        'Sign up at https://platform.openai.com',
        'Add payment method to your account',
        'Generate API key from API Keys section',
        'Optional: Create organization and note Organization ID'
      ],
    },
    connectionGuide: [
      { 
        step: 1, 
        title: 'Create OpenAI Account', 
        description: 'Go to https://platform.openai.com and sign up or log in.', 
        screenshot: 'OpenAI – Sign Up',
        tip: 'You can use your Google or Microsoft account for quick signup.'
      },
      { 
        step: 2, 
        title: 'Add Billing', 
        description: 'Click Settings → Billing → Add payment method. You must add a card to use the API.', 
        screenshot: 'OpenAI – Billing',
        warning: 'API is pay-as-you-go. Set spending limits to avoid unexpected charges!'
      },
      { 
        step: 3, 
        title: 'Generate API Key', 
        description: 'Click "API keys" in left sidebar → "Create new secret key".', 
        screenshot: 'OpenAI – API Keys',
        tip: 'Give your key a descriptive name like "AgentForge Integration".'
      },
      { 
        step: 4, 
        title: 'Copy API Key', 
        description: 'Copy the generated key immediately.', 
        screenshot: 'OpenAI – Copy Key',
        warning: 'The key is shown only once! Save it securely.'
      },
      { 
        step: 5, 
        title: 'Optional: Get Organization ID', 
        description: 'If using organization, go to Settings → Organization → copy Organization ID.', 
        screenshot: 'OpenAI – Org ID',
        tip: 'Organization ID is optional but useful for tracking usage across teams.'
      },
      { 
        step: 6, 
        title: 'Connect in AgentForge', 
        description: 'In workflow builder, add OpenAI node → Enter API Key and Organization ID (optional) → Click "Verify & Connect".', 
        screenshot: 'AgentForge – OpenAI Connection',
        tip: 'The connection will validate your API key before proceeding.'
      },
    ],
    triggers: [],
    actions: [
      { 
        id: 'chat_completion', 
        name: 'Chat Completion (GPT)', 
        description: 'Generate text using GPT models (ChatGPT).', 
        whenToUse: 'For any text generation task - answers, emails, summaries, content creation, coding help, translations.', 
        requiredFields: ['Model', 'User Message'], 
        optionalFields: ['System Prompt', 'Temperature', 'Max Tokens', 'Response Format'],
        example: 'User Message: "Summarize this customer inquiry: {{trigger.message}}" → GPT generates concise summary'
      },
      { 
        id: 'generate_image', 
        name: 'Generate Image (DALL-E)', 
        description: 'Create images from text descriptions using DALL-E.', 
        whenToUse: 'For creating product mockups, social media graphics, logos, illustrations, or any visual content.', 
        requiredFields: ['Model (dall-e-3 or dall-e-2)', 'Prompt'], 
        optionalFields: ['Size', 'Quality', 'Style'],
        example: 'Prompt: "Modern logo for a tech startup" → DALL-E generates professional logo image'
      },
      { 
        id: 'transcribe_audio', 
        name: 'Transcribe Audio (Whisper)', 
        description: 'Convert speech to text using Whisper model.', 
        whenToUse: 'For transcribing meetings, voice messages, podcasts, or any audio/video content.', 
        requiredFields: ['Audio File', 'Model (whisper-1)'], 
        optionalFields: ['Language', 'Prompt (context hint)'],
        example: 'Upload voice message → Whisper transcribes to text → Save to database'
      },
      { 
        id: 'create_embedding', 
        name: 'Create Embedding', 
        description: 'Convert text to vector embeddings for semantic search.', 
        whenToUse: 'For building semantic search, similarity matching, content recommendations, or RAG systems.', 
        requiredFields: ['Model (text-embedding-3-small/large)', 'Input Text'], 
        optionalFields: [],
        example: 'Input: "How do I reset password?" → Returns vector embedding for similarity search'
      },
      { 
        id: 'text_to_speech', 
        name: 'Text to Speech (TTS)', 
        description: 'Convert text to realistic spoken audio.', 
        whenToUse: 'For creating voiceovers, audio responses, podcasts, or accessibility features.', 
        requiredFields: ['Model (tts-1/tts-1-hd)', 'Input Text', 'Voice'], 
        optionalFields: ['Speed (0.25-4.0)'],
        example: 'Input: "Thank you for your order!" → TTS generates audio file in chosen voice'
      },
    ],
    exampleFlow: { 
      title: 'Customer Support Automation', 
      scenario: 'Automatically respond to customer inquiries using AI.', 
      steps: [
        'Customer submits support form via webhook',
        'Webhook triggers workflow with customer name, email, and question',
        'OpenAI Chat Completion analyzes question using GPT-4o-mini',
        'GPT generates personalized, helpful response',
        'Email action sends response to customer',
        'Customer receives answer within 3-5 seconds'
      ] 
    },
    troubleshooting: [
      { 
        error: 'API Key required', 
        cause: 'API key not entered or verified.', 
        solution: 'Enter your OpenAI API key in the connection step and click "Verify & Connect".' 
      },
      { 
        error: 'Invalid API key', 
        cause: 'API key is incorrect, revoked, or expired.', 
        solution: 'Generate a new API key from OpenAI dashboard and update the connection.' 
      },
      { 
        error: 'Insufficient quota', 
        cause: 'You\'ve exceeded your usage limits or have no billing set up.', 
        solution: 'Add a payment method in OpenAI Settings → Billing, or increase your spending limit.' 
      },
      { 
        error: 'Rate limit exceeded', 
        cause: 'Too many requests in a short time.', 
        solution: 'Wait a moment and retry. Consider implementing rate limiting in your workflow or upgrading your tier.' 
      },
      { 
        error: 'Model not found', 
        cause: 'You don\'t have access to the selected model.', 
        solution: 'Check your API tier. Some models require higher access levels. Try gpt-4o-mini or gpt-3.5-turbo.' 
      },
      { 
        error: 'Context length exceeded', 
        cause: 'Input message + output tokens exceed model limits.', 
        solution: 'Shorten your input message or reduce max_tokens. GPT-4o supports up to 128K tokens.' 
      },
    ],
    bestPractices: [
      'Choose the right model: gpt-4o-mini for speed/cost, gpt-4o for quality',
      'Write clear, specific system prompts to guide AI behavior',
      'Set temperature: 0.1-0.3 for focused tasks, 0.7 for balanced, 1.0+ for creative',
      'Set max_tokens appropriately: 500 for short, 1500 for medium, 4000 for long',
      'Use structured output (JSON) when you need predictable formats',
      'Implement retry logic for rate limits and temporary errors',
      'Cache common responses to reduce API calls and costs',
      'Monitor usage in OpenAI dashboard to track spending',
      'Use gpt-4o-mini for most tasks ($0.15/1M tokens vs $2.50/1M for gpt-4o)',
      'For images: DALL-E 3 for best quality, size 1024x1024 for social media',
      'For transcription: Provide language hint for better accuracy',
      'Set spending limits in OpenAI billing to prevent unexpected charges'
    ],
    faq: [
      { 
        question: 'Why doesn\'t OpenAI have triggers?', 
        answer: 'OpenAI is an ACTION service, not a TRIGGER service. It responds to requests but doesn\'t initiate workflows. Use it as an action node after triggers like Webhook, Schedule, or App Events.' 
      },
      { 
        question: 'What trigger should I use with OpenAI?', 
        answer: 'Use Webhook for real-time responses (form submissions, API calls), Polling for batch processing (check email inbox), or Schedule for automated reports (daily summaries).' 
      },
      { 
        question: 'Which GPT model should I use?', 
        answer: 'gpt-4o-mini: Fast, cheap, great for most tasks ($0.15/1M tokens). gpt-4o: Most capable, use for complex reasoning ($2.50/1M tokens). gpt-3.5-turbo: Legacy, cheaper but less capable.' 
      },
      { 
        question: 'How much does it cost?', 
        answer: 'gpt-4o-mini: $0.15 per 1M input tokens, $0.60 per 1M output. gpt-4o: $2.50 per 1M input, $10 per 1M output. DALL-E 3: $0.04-$0.12 per image. Whisper: $0.006 per minute.' 
      },
      { 
        question: 'What is temperature?', 
        answer: 'Temperature (0-2) controls randomness. Lower = focused and deterministic (0.1 for data extraction), Medium = balanced (0.7 for support), Higher = creative (1.5 for writing).' 
      },
      { 
        question: 'What is max_tokens?', 
        answer: 'Maximum length of AI response in tokens (~4 chars per token). 500 tokens ≈ 375 words (short email), 1500 tokens ≈ 1125 words (detailed response), 4000 tokens ≈ 3000 words (long article).' 
      },
      { 
        question: 'Can I use my OpenAI subscription?', 
        answer: 'No. ChatGPT Plus ($20/mo) is separate from API access. API is pay-as-you-go based on usage. You need to add a payment method even if you have Plus.' 
      },
      { 
        question: 'How do I map webhook data to OpenAI?', 
        answer: 'Use expressions like {{trigger.question}} in the User Message field. Data from the trigger will be inserted when the workflow runs.' 
      },
      { 
        question: 'Can I use GPT-4?', 
        answer: 'Yes! Use gpt-4o (latest) or gpt-4-turbo. Note: gpt-4o is more expensive but significantly more capable than gpt-3.5-turbo.' 
      },
      { 
        question: 'What is Organization ID?', 
        answer: 'Optional identifier for tracking usage across teams. Find it in OpenAI Settings → Organization. Leave blank if you\'re using a personal account.' 
      },
      { 
        question: 'How do I get webhook data into OpenAI?', 
        answer: 'In workflow: 1) Webhook trigger receives data (e.g., {name, email, question}), 2) In OpenAI action, map fields: User Message = "Answer: {{trigger.question}}", 3) AI processes and returns response.' 
      },
      { 
        question: 'Can I generate images in bulk?', 
        answer: 'Yes, but each image is a separate API call. Use polling or schedule triggers to generate images in batches. DALL-E 3 is best for quality, DALL-E 2 is faster/cheaper.' 
      },
    ],
  },

  // Additional AI integrations can be added here (Anthropic Claude, Gemini, etc.)
];
