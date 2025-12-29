# 🤖 AI & Machine Learning Apps Guide

> **Complete documentation for AI and ML integrations.** Learn how to use OpenAI, Anthropic Claude, Google Gemini, Hugging Face, ElevenLabs, and other AI services in your workflows.

---

## 📋 Table of Contents

1. [OpenAI](#openai)
2. [Anthropic Claude](#anthropic-claude)
3. [Google AI (Gemini)](#google-ai-gemini)
4. [Azure OpenAI](#azure-openai)
5. [Hugging Face](#hugging-face)
6. [ElevenLabs](#elevenlabs)
7. [Replicate](#replicate)

---

## 🟢 OpenAI

### Overview
Access GPT-4, DALL-E, Whisper, and TTS models for text generation, image creation, speech synthesis, and transcription.

### Prerequisites
- OpenAI Account
- API Key (from platform.openai.com)

### Connection Setup

1. **Get API Key**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Click **Create new secret key**
   - Copy the key (shown only once)

2. **Add Credentials**
   - Go to **Settings → Credentials**
   - Select **OpenAI**
   - Paste your API Key
   - Save

---

### Actions Reference

#### 💬 Chat Completion
Generate text using GPT models.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | No | Model ID (default: `gpt-4o`) |
| `prompt` | ✅ Yes | User message/prompt |
| `systemPrompt` | No | System instructions |
| `temperature` | No | Creativity (0-2, default: 1) |
| `maxTokens` | No | Max response tokens |
| `topP` | No | Nucleus sampling |
| `frequencyPenalty` | No | Reduce repetition (-2 to 2) |
| `presencePenalty` | No | Encourage new topics (-2 to 2) |

**Available Models:**
- `gpt-4o` - Latest, most capable
- `gpt-4o-mini` - Fast and affordable
- `gpt-4-turbo` - High capability
- `gpt-3.5-turbo` - Fast, economical

**Example:**
```json
{
  "model": "gpt-4o",
  "prompt": "Write a professional email declining a meeting invitation",
  "systemPrompt": "You are a helpful assistant that writes concise, professional emails.",
  "temperature": 0.7,
  "maxTokens": 500
}
```

**Output:**
```json
{
  "ok": true,
  "text": "Subject: Unable to Attend Meeting...",
  "model": "gpt-4o",
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 120,
    "total_tokens": 165
  }
}
```

#### 🔢 Create Embedding
Generate text embeddings for semantic search.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | No | Model (default: `text-embedding-3-small`) |
| `input` | ✅ Yes | Text to embed |

**Example:**
```json
{
  "input": "The quick brown fox jumps over the lazy dog"
}
```

#### 🎨 Generate Image
Create images with DALL-E.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | No | `dall-e-3` or `dall-e-2` |
| `prompt` | ✅ Yes | Image description |
| `size` | No | `1024x1024`, `1792x1024`, `1024x1792` |
| `quality` | No | `standard` or `hd` |
| `style` | No | `vivid` or `natural` |

**Example:**
```json
{
  "model": "dall-e-3",
  "prompt": "A futuristic city skyline at sunset, cyberpunk style, neon lights",
  "size": "1792x1024",
  "quality": "hd",
  "style": "vivid"
}
```

#### 🔊 Text to Speech
Convert text to natural speech.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | No | `tts-1` or `tts-1-hd` |
| `input` | ✅ Yes | Text to speak |
| `voice` | No | `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer` |
| `speed` | No | Speed (0.25-4.0, default: 1) |

**Example:**
```json
{
  "model": "tts-1-hd",
  "input": "Welcome to our podcast! Today we're discussing AI workflows.",
  "voice": "nova",
  "speed": 1.0
}
```

#### 🎤 Transcribe Audio
Transcribe audio to text with Whisper.

| Field | Required | Description |
|-------|----------|-------------|
| `audioUrl` | ✅ Yes | URL to audio file |
| `language` | No | ISO language code |
| `prompt` | No | Optional context/hint |

---

### Example Workflows

**1. AI Customer Support**
```
Trigger: New Support Ticket
  ↓
OpenAI: Chat Completion
  - systemPrompt: "You are a support agent. Be helpful and concise."
  - prompt: "Customer says: {{ticket.message}}"
  ↓
If Condition: response contains solution
  ↓
Zendesk: Add Reply
  - body: {{openai.text}}
```

**2. Content Generation Pipeline**
```
Trigger: New Airtable Record
  ↓
OpenAI: Chat Completion
  - prompt: "Write a blog post about {{record.topic}}"
  ↓
OpenAI: Generate Image
  - prompt: "Blog header image for: {{record.topic}}"
  ↓
Notion: Create Page
  - title: {{record.topic}}
  - content: {{openai.text}}
```

---

## 🟣 Anthropic Claude

### Overview
Access Claude AI models for text generation, analysis, and vision tasks.

### Prerequisites
- Anthropic Account
- API Key (from console.anthropic.com)

### Connection Setup

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Navigate to **API Keys**
3. Create new key and copy

---

### Actions Reference

#### 💬 Message
Send a message to Claude.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | No | Model (default: `claude-3-5-sonnet-20241022`) |
| `userMessage` | ✅ Yes | Your message/prompt |
| `systemPrompt` | No | System instructions |
| `maxTokens` | No | Max response tokens (default: 1024) |
| `temperature` | No | Creativity (0-1) |
| `topP` | No | Nucleus sampling |
| `topK` | No | Top-K sampling |

**Available Models:**
- `claude-3-5-sonnet-20241022` - Best balance
- `claude-3-opus-20240229` - Most capable
- `claude-3-haiku-20240307` - Fastest

**Example:**
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "userMessage": "Analyze this customer feedback and identify key themes",
  "systemPrompt": "You are an expert at customer feedback analysis. Be specific and actionable.",
  "maxTokens": 2000
}
```

#### 👁️ Vision
Analyze images with Claude.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | No | Model ID |
| `prompt` | ✅ Yes | What to analyze |
| `imageUrl` | ✅ Yes | URL to image |
| `systemPrompt` | No | System context |
| `maxTokens` | No | Max tokens |

**Example:**
```json
{
  "prompt": "Describe what's in this image and identify any text",
  "imageUrl": "https://example.com/screenshot.png"
}
```

---

## 🔷 Google AI (Gemini)

### Overview
Access Google's Gemini models for text generation, vision, and embeddings.

### Prerequisites
- Google Cloud Account
- API Key (from AI Studio or Google Cloud)

### Connection Setup

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **Get API Key**
3. Create and copy API key

---

### Actions Reference

#### 💬 Generate Content
Generate text with Gemini.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | No | Model (default: `gemini-1.5-flash`) |
| `prompt` | ✅ Yes | Input prompt |
| `systemInstruction` | No | System context |
| `temperature` | No | Creativity (0-2) |
| `maxOutputTokens` | No | Max response length |
| `topP` | No | Nucleus sampling |
| `topK` | No | Top-K sampling |

**Available Models:**
- `gemini-1.5-flash` - Fast and versatile
- `gemini-1.5-pro` - Most capable
- `gemini-1.0-pro` - Stable

**Example:**
```json
{
  "model": "gemini-1.5-flash",
  "prompt": "Summarize this article in 3 bullet points",
  "maxOutputTokens": 500
}
```

#### 🖼️ Analyze Image
Analyze images with Gemini Vision.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | No | Model ID |
| `imageUrl` | ✅ Yes | URL to image |
| `prompt` | ✅ Yes | Analysis prompt |
| `maxOutputTokens` | No | Max tokens |

#### 🔢 Embed Content
Generate embeddings.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | No | `text-embedding-004` |
| `content` | ✅ Yes | Text to embed |
| `taskType` | No | `RETRIEVAL_QUERY`, `RETRIEVAL_DOCUMENT`, `SEMANTIC_SIMILARITY` |

---

## 🔵 Azure OpenAI

### Overview
Enterprise-grade OpenAI models hosted on Azure with compliance and security features.

### Prerequisites
- Azure Account
- Azure OpenAI resource deployed
- API Key and endpoint

### Connection Setup

1. Create Azure OpenAI resource in Azure Portal
2. Deploy a model (e.g., GPT-4)
3. Copy:
   - **Endpoint**: `https://your-resource.openai.azure.com/`
   - **API Key**: From Keys and Endpoint section
   - **Deployment Name**: Your model deployment name

---

### Actions Reference

#### 💬 Chat Completion
Generate text with deployed Azure OpenAI model.

| Field | Required | Description |
|-------|----------|-------------|
| `deploymentName` | ✅ Yes | Your deployment name |
| `prompt` | ✅ Yes | User message |
| `systemPrompt` | No | System instructions |
| `temperature` | No | Creativity |
| `maxTokens` | No | Max response tokens |

#### 🔢 Create Embedding
Generate embeddings.

| Field | Required | Description |
|-------|----------|-------------|
| `deploymentName` | ✅ Yes | Embedding deployment name |
| `input` | ✅ Yes | Text to embed |

---

## 🤗 Hugging Face

### Overview
Access thousands of ML models for NLP, vision, audio, and more.

### Prerequisites
- Hugging Face Account
- API Token (from Settings → Access Tokens)

### Actions Reference

#### 📝 Text Generation
Generate text with any text generation model.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | ✅ Yes | Model ID (e.g., `meta-llama/Llama-2-7b-chat-hf`) |
| `inputs` | ✅ Yes | Input prompt |
| `maxNewTokens` | No | Max new tokens |
| `temperature` | No | Creativity |
| `topP` | No | Nucleus sampling |
| `doSample` | No | Enable sampling |

**Example:**
```json
{
  "model": "mistralai/Mistral-7B-Instruct-v0.1",
  "inputs": "Explain quantum computing in simple terms",
  "maxNewTokens": 250
}
```

#### 😊 Sentiment Analysis
Analyze sentiment of text.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | ✅ Yes | Model ID |
| `inputs` | ✅ Yes | Text to analyze |

**Popular Models:**
- `distilbert-base-uncased-finetuned-sst-2-english`
- `cardiffnlp/twitter-roberta-base-sentiment`

#### ❓ Question Answering
Answer questions based on context.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | ✅ Yes | QA model ID |
| `question` | ✅ Yes | Question to answer |
| `context` | ✅ Yes | Context text |

**Example:**
```json
{
  "model": "deepset/roberta-base-squad2",
  "question": "What is the capital of France?",
  "context": "France is a country in Western Europe. Its capital is Paris, which is known for the Eiffel Tower."
}
```

#### 📄 Summarization
Summarize long text.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | ✅ Yes | Summarization model |
| `inputs` | ✅ Yes | Text to summarize |
| `minLength` | No | Minimum summary length |
| `maxLength` | No | Maximum summary length |

#### 🌐 Translation
Translate text between languages.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | ✅ Yes | Translation model |
| `inputs` | ✅ Yes | Text to translate |

**Popular Models:**
- `Helsinki-NLP/opus-mt-en-de` (English to German)
- `Helsinki-NLP/opus-mt-en-fr` (English to French)

#### 🖼️ Image Classification
Classify images.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | ✅ Yes | Vision model |
| `imageUrl` | ✅ Yes | Image URL |

#### 🔍 Object Detection
Detect objects in images.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | ✅ Yes | Detection model |
| `imageUrl` | ✅ Yes | Image URL |

---

## 🔊 ElevenLabs

### Overview
High-quality AI voice synthesis with natural-sounding voices.

### Prerequisites
- ElevenLabs Account
- API Key (from Profile Settings)

### Actions Reference

#### 🎙️ Get Voices
List available voices.

| Field | Required | Description |
|-------|----------|-------------|
| `search` | No | Filter by name |
| `includeLegacy` | No | Include legacy voices |

**Output:**
```json
{
  "voices": [
    {"voice_id": "21m00...", "name": "Rachel", "category": "premade"},
    {"voice_id": "AZnz...", "name": "Adam", "category": "premade"}
  ]
}
```

#### 🔊 Text to Speech
Convert text to speech.

| Field | Required | Description |
|-------|----------|-------------|
| `voiceId` | ✅ Yes | Voice ID |
| `text` | ✅ Yes | Text to speak |
| `modelId` | No | Model (default: `eleven_multilingual_v2`) |
| `stability` | No | Voice stability (0-1) |
| `similarityBoost` | No | Voice clarity (0-1) |
| `style` | No | Style exaggeration (0-1) |
| `speakerBoost` | No | Enable speaker boost |

**Example:**
```json
{
  "voiceId": "21m00Tcm4TlvDq8ikWAM",
  "text": "Welcome to our platform! We're excited to have you here.",
  "stability": 0.5,
  "similarityBoost": 0.75
}
```

**Output:**
```json
{
  "ok": true,
  "audioBase64": "...",
  "contentType": "audio/mpeg"
}
```

#### 🎭 Speech to Speech
Transform voice while preserving speech.

| Field | Required | Description |
|-------|----------|-------------|
| `voiceId` | ✅ Yes | Target voice ID |
| `audioUrl` | ✅ Yes | Source audio URL |

#### 🧬 Voice Clone
Clone a voice from audio samples.

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ Yes | Voice name |
| `audioUrls` | ✅ Yes | Array of sample URLs |
| `description` | No | Voice description |

---

## 🔄 Replicate

### Overview
Run ML models via API - thousands of open-source models available.

### Prerequisites
- Replicate Account
- API Token (from Settings)

### Actions Reference

#### ▶️ Run Model
Run any model on Replicate.

| Field | Required | Description |
|-------|----------|-------------|
| `model` | ✅ Yes | Model ID (`owner/name:version`) |
| `input` | ✅ Yes | Input parameters (model-specific) |

**Example - Stable Diffusion:**
```json
{
  "model": "stability-ai/sdxl:39ed52f2",
  "input": {
    "prompt": "An astronaut riding a horse on Mars",
    "negative_prompt": "low quality, blurry",
    "num_outputs": 1
  }
}
```

#### 📊 Get Prediction
Check prediction status.

| Field | Required | Description |
|-------|----------|-------------|
| `predictionId` | ✅ Yes | Prediction ID |

---

## 💡 Best Practices

### Prompt Engineering
- Be specific and clear in prompts
- Use system prompts for consistent behavior
- Include examples for complex tasks
- Set appropriate temperature for task type

### Cost Optimization
- Use smaller models when possible
- Limit max tokens appropriately
- Cache responses for repeated queries
- Batch similar requests

### Error Handling
- Handle rate limits with retries
- Validate inputs before API calls
- Set timeouts for long-running tasks
- Log failed requests for debugging

---

## 🔧 Troubleshooting

### Common Issues

**"Rate limit exceeded"**
- Add delays between requests
- Use exponential backoff
- Consider higher tier plan

**"Context length exceeded"**
- Reduce input length
- Summarize long documents first
- Use model with larger context

**"Invalid API key"**
- Check key hasn't expired
- Verify key has correct permissions
- Regenerate if needed

**"Model not found"**
- Check model ID is correct
- Verify model is available in your region
- Some models require specific access

---

## 📚 Related Docs
- [OpenAI Guide](./OPENAI_GUIDE.md)
- [Workflow Examples](./WORKFLOWS_OVERVIEW.md)
- [Automation Best Practices](./AUTOMATION_BEST_PRACTICES.md)
