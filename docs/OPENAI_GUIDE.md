# OpenAI Integration

> Complete guide to GPT, DALL-E, Whisper, and TTS in your workflows

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Connection Setup](#connection-setup)
4. [Available Actions](#available-actions)
5. [Action Reference](#action-reference)
6. [Example Workflows](#example-workflows)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [FAQ](#faq)
10. [Pricing Guide](#pricing-guide)

---

## Overview

### What is OpenAI Integration?

OpenAI integration connects your workflows to the world's most advanced AI models:

| Model | Capability |
|-------|------------|
| **GPT-4o / GPT-4o-mini** | Text generation, reasoning, analysis |
| **DALL-E 3** | Image generation from text |
| **Whisper** | Speech-to-text transcription |
| **TTS** | Text-to-speech audio generation |
| **Embeddings** | Semantic search, similarity matching |

### Why Use OpenAI?

- **Instant responses** - Generate human-quality text in seconds
- **Versatile** - Answers questions, writes content, analyzes data
- **Multilingual** - Supports 100+ languages
- **Always available** - 24/7 AI-powered automation

### Use Cases

| Use Case | Example |
|----------|---------|
| **Customer Support** | Auto-respond to inquiries with helpful answers |
| **Content Generation** | Write emails, summaries, product descriptions |
| **Data Processing** | Extract info, classify text, analyze sentiment |
| **Translation** | Translate messages between languages |
| **Image Creation** | Generate product mockups, social media graphics |
| **Transcription** | Convert voice messages/calls to text |
| **Voice Responses** | Generate audio replies for phone systems |

---

## Prerequisites

### Required

1. **OpenAI Account**
   - Sign up at [platform.openai.com](https://platform.openai.com)

2. **API Key**
   - Generated from OpenAI dashboard

3. **Billing Setup**
   - Payment method added (API is pay-as-you-go)

### Optional

- **Organization ID** - For team usage tracking
- **Spending Limits** - To prevent unexpected charges

---

## Connection Setup

### Step 1: Create OpenAI Account

1. Go to [platform.openai.com](https://platform.openai.com)
2. Click **"Sign Up"** (or "Log In" if you have an account)
3. Verify your email address
4. Complete account setup

> 💡 **Note:** ChatGPT Plus subscription ($20/month) is SEPARATE from API access. You need to add billing to your API account even if you have ChatGPT Plus.

### Step 2: Add Payment Method

1. Go to **Settings → Billing**
2. Click **"Add payment method"**
3. Enter your credit card or other payment details
4. Set spending limit (recommended: start with $10-20)

> ⚠️ **Important:** Without a payment method, you cannot use the API even for testing.

### Step 3: Generate API Key

1. Go to **API Keys** in the left sidebar
2. Click **"Create new secret key"**
3. Give it a name (e.g., "AgentForge Integration")
4. Click **"Create secret key"**
5. **Copy the key immediately** - it won't be shown again!

> 🔐 **Security:** Treat your API key like a password. Never share it or commit it to code repositories.

### Step 4: Get Organization ID (Optional)

If you're using OpenAI with a team/organization:

1. Go to **Settings → Organization**
2. Copy the **Organization ID**
3. This helps track usage across team members

### Step 5: Connect in AgentForge

1. Open **AgentForge → Integrations → Credentials**
2. Click **"Add Credential"**
3. Select **"OpenAI"**
4. Enter:
   - **API Key:** (paste from Step 3)
   - **Organization ID:** (optional, from Step 4)
5. Click **"Verify & Save"**
6. You should see a success message

### Step 6: Test the Connection

1. Create a new workflow with **Manual Trigger**
2. Add **OpenAI → Chat Completion** action
3. Configure:
   - Model: `gpt-4o-mini`
   - User Message: `Say hello in a creative way`
4. Click **"Test"**
5. View the AI response in execution results

---

## Available Actions

| Action | Description | Output |
|--------|-------------|--------|
| **Chat Completion** | Generate text using GPT models | Text response |
| **Generate Image** | Create images with DALL-E | Image URL |
| **Create Embedding** | Convert text to vectors | Embedding array |
| **Text to Speech** | Convert text to audio | Base64 audio |
| **Transcribe Audio** | Convert speech to text | Transcribed text |

---

## Action Reference

### 1. Chat Completion (GPT)

**Description:** Generate text responses using GPT models. The most versatile action for any text-based task.

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `model` | String | GPT model to use |
| `userMessage` | String | The prompt/question to answer |

#### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `systemPrompt` | String | None | Instructions for how GPT should behave |
| `temperature` | Number | 0.7 | Creativity (0 = focused, 2 = very creative) |
| `maxTokens` | Number | 1000 | Maximum response length |
| `responseFormat` | String | text | Use `json_object` for JSON output |

#### Available Models

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| `gpt-4o-mini` | ⚡ Fast | Good | $0.15/1M tokens | Most tasks, cost-effective |
| `gpt-4o` | Medium | Excellent | $2.50/1M tokens | Complex reasoning |
| `gpt-4-turbo` | Medium | Excellent | $10/1M tokens | Legacy, use gpt-4o instead |
| `gpt-3.5-turbo` | ⚡⚡ Fastest | Okay | $0.50/1M tokens | Simple tasks only |

#### Temperature Guide

| Temperature | Behavior | Use Case |
|-------------|----------|----------|
| 0.0 - 0.3 | Focused, deterministic | Data extraction, classification |
| 0.4 - 0.7 | Balanced | Customer support, general tasks |
| 0.8 - 1.2 | Creative | Writing, brainstorming |
| 1.3 - 2.0 | Very random | Creative writing, variety |

#### Example: Customer Support Response

```yaml
Action: Chat Completion
Model: gpt-4o-mini
System Prompt: |
  You are a friendly customer support agent for TechCo.
  - Be helpful and concise
  - Use simple language
  - Include relevant links when helpful
  - If you don't know something, say so
User Message: "{{trigger.customer_question}}"
Temperature: 0.5
Max Tokens: 500
```

#### Example: Data Extraction (JSON)

```yaml
Action: Chat Completion
Model: gpt-4o-mini
System Prompt: |
  Extract order information from the message.
  Return JSON with: name, email, product, quantity
  If any field is missing, use null.
User Message: |
  Extract from this email:
  {{trigger.email_body}}
Response Format: json_object
Temperature: 0.1
Max Tokens: 200
```

**Output:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "product": "Widget Pro",
  "quantity": 3
}
```

#### Example: Translation

```yaml
Action: Chat Completion
Model: gpt-4o-mini
System Prompt: "Translate the following text to Spanish. Only output the translation, nothing else."
User Message: "{{trigger.message}}"
Temperature: 0.3
```

#### Output Structure

```json
{
  "model": "gpt-4o-mini",
  "text": "The AI-generated response text...",
  "raw": {
    "id": "chatcmpl-abc123",
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": "The AI-generated response text..."
        },
        "finish_reason": "stop"
      }
    ],
    "usage": {
      "prompt_tokens": 50,
      "completion_tokens": 100,
      "total_tokens": 150
    }
  }
}
```

**Accessing the response:**
- `{{nodes.openai.text}}` - The generated text
- `{{nodes.openai.raw.usage.total_tokens}}` - Tokens used

---

### 2. Generate Image (DALL-E)

**Description:** Create images from text descriptions using DALL-E.

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `model` | String | `dall-e-3` (recommended) or `dall-e-2` |
| `prompt` | String | Description of the image to generate |

#### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `size` | String | `1024x1024` | Image dimensions |
| `quality` | String | `standard` | `standard` or `hd` |
| `style` | String | `vivid` | `vivid` or `natural` |

#### Available Sizes

| Model | Available Sizes |
|-------|-----------------|
| DALL-E 3 | `1024x1024`, `1792x1024`, `1024x1792` |
| DALL-E 2 | `256x256`, `512x512`, `1024x1024` |

#### Example: Product Mockup

```yaml
Action: Generate Image
Model: dall-e-3
Prompt: |
  Professional product photography of {{trigger.product_name}}.
  Clean white background, soft studio lighting,
  high-end commercial style, 4K quality.
Size: 1024x1024
Quality: hd
Style: natural
```

#### Example: Social Media Graphic

```yaml
Action: Generate Image
Model: dall-e-3
Prompt: |
  Modern social media graphic for {{trigger.campaign_name}}.
  Vibrant colors, bold typography saying "{{trigger.headline}}",
  professional marketing style, Instagram-ready.
Size: 1024x1024
Quality: standard
Style: vivid
```

#### Output Structure

```json
{
  "model": "dall-e-3",
  "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "raw": {
    "data": [
      {
        "url": "https://...",
        "revised_prompt": "A professional product photograph..."
      }
    ]
  }
}
```

**Accessing the image:**
- `{{nodes.dalle.url}}` - Direct URL to download/display image

> ⚠️ **Note:** Image URLs expire after ~1 hour. Save images to permanent storage (S3, Google Drive) if needed long-term.

---

### 3. Create Embedding

**Description:** Convert text into vector embeddings for semantic search and similarity matching.

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `model` | String | Embedding model |
| `input` | String | Text to convert |

#### Available Models

| Model | Dimensions | Best For |
|-------|------------|----------|
| `text-embedding-3-small` | 1536 | Cost-effective, general use |
| `text-embedding-3-large` | 3072 | Higher accuracy |
| `text-embedding-ada-002` | 1536 | Legacy, use 3-small instead |

#### Example: Semantic Search

```yaml
Action: Create Embedding
Model: text-embedding-3-small
Input: "{{trigger.search_query}}"
```

#### Use Cases

1. **Semantic Search** - Find similar documents/FAQs
2. **Recommendations** - Find similar products
3. **Clustering** - Group similar items
4. **RAG (Retrieval-Augmented Generation)** - Find relevant context for AI

#### Output Structure

```json
{
  "model": "text-embedding-3-small",
  "embedding": [0.0123, -0.0456, 0.0789, ...],  // 1536 numbers
  "raw": { /* full API response */ }
}
```

---

### 4. Text to Speech (TTS)

**Description:** Convert text to natural-sounding speech audio.

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `model` | String | `tts-1` (fast) or `tts-1-hd` (high quality) |
| `input` | String | Text to speak (max 4096 characters) |
| `voice` | String | Voice to use |

#### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `speed` | Number | 1.0 | Speed (0.25 to 4.0) |

#### Available Voices

| Voice | Description |
|-------|-------------|
| `alloy` | Neutral, balanced |
| `echo` | Warm, conversational |
| `fable` | British, expressive |
| `onyx` | Deep, authoritative |
| `nova` | Friendly, youthful |
| `shimmer` | Clear, pleasant |

#### Example: Voice Response

```yaml
Action: Text to Speech
Model: tts-1-hd
Input: |
  Hello {{trigger.customer_name}}! 
  Your order number {{trigger.order_id}} has been shipped 
  and will arrive by {{trigger.delivery_date}}.
Voice: nova
Speed: 1.0
```

#### Output Structure

```json
{
  "model": "tts-1-hd",
  "voice": "nova",
  "contentType": "audio/mpeg",
  "audioBase64": "//uQxAAAAAANIAAAAAExBTUUz..."
}
```

**Using the audio:**
- `{{nodes.tts.audioBase64}}` - Base64-encoded MP3
- Save to file or send to audio service

---

### 5. Transcribe Audio (Whisper)

**Description:** Convert speech audio to text.

> ⚠️ **Note:** File upload support is not yet implemented in the workflow runner. This action is planned for a future update.

#### Planned Fields

| Field | Type | Description |
|-------|------|-------------|
| `model` | String | `whisper-1` |
| `audio` | File | Audio file to transcribe |
| `language` | String | Optional language hint (ISO code) |

#### Supported Formats
MP3, MP4, MPEG, MPGA, M4A, WAV, WEBM

#### Coming Soon
- Upload audio from URL
- Process voice messages from WhatsApp/Telegram
- Meeting transcription workflows

---

## Example Workflows

### 1. AI Customer Support Bot

**Scenario:** Auto-respond to support emails with AI.

```
[Gmail Trigger] - New email received
       ↓
[OpenAI: Chat Completion] - Generate helpful response
       ↓
[If Condition] - Check if confident answer
       ├── Confident → [Gmail: Send Reply]
       └── Not confident → [Slack: Notify Team]
       ↓
[Google Sheets: Log] - Record interaction
```

**Configuration:**

```yaml
# OpenAI Chat Completion
System Prompt: |
  You are a helpful support agent for Acme Corp.
  
  Our products: Widget Pro ($99), Widget Plus ($199), Enterprise ($499)
  Support hours: Mon-Fri 9AM-6PM EST
  Return policy: 30 days, full refund
  
  Rules:
  - Be friendly and professional
  - If you're not sure, say "Let me connect you with our team"
  - End with "confidence: high/medium/low"
  
User Message: |
  Customer: {{trigger.sender_name}}
  Subject: {{trigger.subject}}
  Message: {{trigger.body}}
  
Model: gpt-4o-mini
Temperature: 0.5
Max Tokens: 500
```

### 2. Content Generation Pipeline

**Scenario:** Generate blog post from topic.

```
[Manual Trigger] - Start with topic
       ↓
[OpenAI #1] - Generate outline
       ↓
[OpenAI #2] - Write full article
       ↓
[OpenAI #3] - Generate social posts
       ↓
[DALL-E] - Generate featured image
       ↓
[Notion: Create Page] - Publish draft
```

**Configuration:**

```yaml
# Step 1: Generate Outline
System Prompt: "Create a detailed blog post outline with 5-7 sections."
User Message: "Topic: {{trigger.topic}}"
Temperature: 0.7

# Step 2: Write Article
System Prompt: "Write a comprehensive blog post. Be engaging and informative."
User Message: |
  Write a blog post based on this outline:
  {{nodes.outline.text}}
Temperature: 0.8
Max Tokens: 2000

# Step 3: Social Posts
System Prompt: "Create 3 social media posts: 1 for Twitter, 1 for LinkedIn, 1 for Instagram."
User Message: "Summarize this article: {{nodes.article.text}}"

# Step 4: Generate Image
Prompt: |
  Professional blog featured image for article about {{trigger.topic}}.
  Modern, minimal design, tech aesthetic.
```

### 3. Multi-Language Support Bot

**Scenario:** Detect language and respond in same language.

```
[Webhook] - Message received
       ↓
[OpenAI #1] - Detect language
       ↓
[OpenAI #2] - Generate response in detected language
       ↓
[WhatsApp] - Send response
```

**Configuration:**

```yaml
# Step 1: Detect Language
System Prompt: "Detect the language of this text. Reply with only the language code (en, es, hi, etc.)"
User Message: "{{trigger.message}}"
Temperature: 0

# Step 2: Generate Response
System Prompt: |
  You are a multilingual support agent.
  Respond in {{nodes.detect.text}} language.
  Be helpful and friendly.
User Message: "{{trigger.message}}"
Temperature: 0.6
```

### 4. Smart Lead Qualification

**Scenario:** Use AI to qualify leads from form submissions.

```
[Webhook] - Form submission
       ↓
[OpenAI] - Analyze and score lead
       ↓
[Switch] - Route by score
       ├── Hot (80+) → [Slack #sales-alerts] + [HubSpot: High Priority]
       ├── Warm (50-79) → [HubSpot: Normal] + [Email: Nurture Sequence]
       └── Cold (<50) → [Mailchimp: Newsletter List]
```

**Configuration:**

```yaml
System Prompt: |
  You are a lead scoring AI. Analyze the form submission and return JSON:
  {
    "score": 0-100,
    "qualification": "hot" | "warm" | "cold",
    "reasons": ["reason1", "reason2"],
    "recommended_action": "description"
  }
  
  Scoring criteria:
  - Business email domain: +20
  - Company size > 50: +15
  - Budget mentioned: +25
  - Urgent timeline: +20
  - Decision maker title: +20

User Message: |
  Lead data:
  Name: {{trigger.name}}
  Email: {{trigger.email}}
  Company: {{trigger.company}}
  Title: {{trigger.job_title}}
  Message: {{trigger.message}}

Response Format: json_object
Temperature: 0.2
```

---

## Troubleshooting

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| **"Invalid API key"** | Wrong or expired key | Generate new key in OpenAI dashboard |
| **"Insufficient quota"** | No billing or exceeded limit | Add payment method, increase limit |
| **"Rate limit exceeded"** | Too many requests | Wait and retry; implement delays |
| **"Context length exceeded"** | Input too long | Shorten prompt or use model with larger context |
| **"Model not found"** | Access restricted | Check API tier; try gpt-4o-mini |
| **"Invalid JSON"** | JSON response format issue | Check system prompt; verify JSON structure |

### Rate Limits

| Tier | RPM (requests/min) | TPM (tokens/min) |
|------|--------------------|--------------------|
| Free Trial | 3 | 40,000 |
| Tier 1 | 500 | 200,000 |
| Tier 2 | 5,000 | 2,000,000 |
| Tier 3+ | Higher | Higher |

**Upgrade by:** Spending more over time (automatic tier upgrades)

### Context Length Limits

| Model | Max Context |
|-------|-------------|
| gpt-4o | 128,000 tokens |
| gpt-4o-mini | 128,000 tokens |
| gpt-4-turbo | 128,000 tokens |
| gpt-3.5-turbo | 16,385 tokens |

**1 token ≈ 4 characters ≈ 0.75 words**

---

## Best Practices

### Prompt Engineering

1. **Be specific** - Clear instructions get better results
   - ❌ "Write something about cats"
   - ✅ "Write a 200-word product description for cat food, highlighting health benefits"

2. **Use system prompts** - Define AI behavior and context
   ```
   You are a customer support agent for Acme Corp.
   You are helpful, concise, and professional.
   You only discuss Acme products and services.
   ```

3. **Provide examples** - Show the format you want
   ```
   Format your response as:
   SUMMARY: [one sentence]
   KEY POINTS: [bullet list]
   RECOMMENDATION: [action item]
   ```

4. **Set boundaries** - Tell AI what NOT to do
   ```
   Never make up information.
   If you don't know, say "I don't have that information."
   Do not discuss competitor products.
   ```

### Cost Optimization

1. **Use gpt-4o-mini** for most tasks (17x cheaper than gpt-4o)
2. **Set appropriate max_tokens** - Don't request 4000 tokens for short answers
3. **Use lower temperature** for deterministic tasks (fewer retries)
4. **Cache common responses** - Don't re-generate same content
5. **Batch similar requests** when possible

### Reliability

1. **Implement retries** for rate limit errors
2. **Set timeouts** to avoid hanging workflows
3. **Validate outputs** before using (especially JSON)
4. **Have fallback** for when AI fails
5. **Log everything** for debugging

---

## FAQ

### General

**Q: What's the difference between ChatGPT and the API?**
A: ChatGPT is the consumer chatbot product ($20/month for Plus). The API is for developers/apps and is pay-per-use. They use the same models but are billed separately.

**Q: Do I need ChatGPT Plus to use the API?**
A: No. They are completely separate. You can use the API without ChatGPT Plus, and vice versa.

**Q: Which model should I use?**
A: Start with `gpt-4o-mini` for everything. Use `gpt-4o` only for complex tasks where mini falls short.

### Pricing

**Q: How much will it cost?**
A: Depends on usage. Most support workflows cost $0.001-0.01 per interaction with gpt-4o-mini. Set spending limits in OpenAI dashboard.

**Q: Why is my bill higher than expected?**
A: Check: (1) Which model you're using (gpt-4o is 17x more expensive), (2) Token counts (long prompts cost more), (3) Number of requests.

### Technical

**Q: Why doesn't OpenAI have triggers?**
A: OpenAI is an action-only service. It responds to requests but doesn't initiate them. Use Webhook, Schedule, or app triggers to start workflows.

**Q: Can I make the AI remember previous conversations?**
A: Not automatically. You need to include conversation history in your prompt. Consider storing history in a database and including recent messages.

**Q: How do I get structured JSON output?**
A: Set `responseFormat: json_object` and instruct in your system prompt exactly what JSON structure you want.

**Q: What's temperature?**
A: Controls randomness. 0 = deterministic (same input → same output). 2 = very random. Use low (0.1-0.3) for data extraction, medium (0.5-0.7) for support, high (0.8+) for creative writing.

---

## Pricing Guide

### Text Models (per 1M tokens)

| Model | Input | Output | Notes |
|-------|-------|--------|-------|
| gpt-4o-mini | $0.15 | $0.60 | **Recommended** |
| gpt-4o | $2.50 | $10.00 | Premium quality |
| gpt-3.5-turbo | $0.50 | $1.50 | Legacy |

**Token estimation:** 1,000 tokens ≈ 750 words

### Image Generation

| Model | Size | Quality | Price |
|-------|------|---------|-------|
| DALL-E 3 | 1024x1024 | Standard | $0.040 |
| DALL-E 3 | 1024x1024 | HD | $0.080 |
| DALL-E 3 | 1792x1024 | Standard | $0.080 |
| DALL-E 3 | 1792x1024 | HD | $0.120 |
| DALL-E 2 | 1024x1024 | - | $0.020 |

### Audio

| Service | Price |
|---------|-------|
| Whisper (transcription) | $0.006 / minute |
| TTS (text-to-speech) | $15.00 / 1M characters |
| TTS HD | $30.00 / 1M characters |

### Embeddings

| Model | Price |
|-------|-------|
| text-embedding-3-small | $0.02 / 1M tokens |
| text-embedding-3-large | $0.13 / 1M tokens |

### Cost Examples

| Use Case | Estimated Cost |
|----------|----------------|
| 1,000 support responses (gpt-4o-mini, 500 tokens each) | ~$0.30 |
| 100 blog posts generated (gpt-4o-mini, 2000 tokens each) | ~$0.12 |
| 50 images generated (DALL-E 3 standard) | ~$2.00 |
| 60 minutes transcribed (Whisper) | ~$0.36 |

---

## Quick Reference

### Model Selection

| Use Case | Recommended Model |
|----------|-------------------|
| Customer support | gpt-4o-mini |
| Data extraction | gpt-4o-mini, temp 0.1 |
| Content writing | gpt-4o-mini, temp 0.7-0.9 |
| Complex reasoning | gpt-4o |
| Code generation | gpt-4o |
| Translation | gpt-4o-mini |
| Quick images | DALL-E 3, standard |
| High-quality images | DALL-E 3, HD |

### Temperature Quick Guide

| Temperature | Use For |
|-------------|---------|
| 0.0 - 0.2 | Data extraction, classification, JSON |
| 0.3 - 0.5 | Support responses, factual content |
| 0.6 - 0.8 | General purpose, balanced |
| 0.9 - 1.2 | Creative writing, brainstorming |
| 1.3+ | Maximum creativity, randomness |

### Common System Prompts

**Customer Support:**
```
You are a helpful customer support agent for [Company].
Be friendly, professional, and concise.
If you don't know something, offer to connect with a human agent.
```

**Data Extraction:**
```
Extract the following information from the text.
Return JSON only: { "field1": "", "field2": "" }
If a field is not found, use null.
```

**Translation:**
```
Translate the following text to [language].
Output only the translation, nothing else.
Maintain the original tone and formatting.
```

---

*Documentation version: 1.0 | Last updated: December 2024*
