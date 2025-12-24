# Integration Workflows Documentation

> **Last Updated:** December 24, 2025  
> **Purpose:** Comprehensive guide to understanding triggers, actions, and workflow persistence

---

## Table of Contents

1. [Understanding Workflows](#1-understanding-workflows)
2. [Trigger Types](#2-trigger-types)
3. [OpenAI Integration Guide](#3-openai-integration-guide)
4. [How Triggers Work for Different Apps](#4-how-triggers-work-for-different-apps)
5. [Workflow Storage](#5-workflow-storage)
6. [Best Practices](#6-best-practices)

---

## 1. Understanding Workflows

### What is a Workflow?

A workflow is an automation that connects different apps and services together. It consists of:

- **Trigger Node** - The event that starts the workflow (e.g., webhook received, scheduled time)
- **Action Nodes** - Tasks performed when triggered (e.g., send email, call OpenAI API)
- **Condition Nodes** (Optional) - Logic that controls the flow based on conditions

### Workflow Structure

```
[Trigger] → [Action 1] → [Action 2] → [Action 3]
    ↓
 When this happens...
                ↓
           Do these things...
```

### Example Workflow

**Use Case:** Generate AI responses for customer inquiries

```
[Webhook Trigger]           →  [OpenAI Chat Completion]  →  [Send Email]
When customer submits form     Generate personalized       Send response
via HTTP POST                  response using GPT-4         to customer
```

---

## 2. Trigger Types

### Available Trigger Types

| Trigger Type | Description | How It Works | Best For |
|--------------|-------------|--------------|----------|
| **Webhook** | Real-time | Receives HTTP POST requests instantly | API integrations, form submissions |
| **Polling** | Scheduled checks | Checks for new data at regular intervals (every 5-60 min) | Email inbox, new files, database rows |
| **Schedule** | Time-based | Runs automatically at specified times | Daily reports, weekly summaries |
| **App Event** | Event-driven | Triggered when specific event happens in connected app | New row in Google Sheets, new Slack message |
| **Manual** | On-demand | Manually triggered by clicking "Run" button | Testing, one-time tasks |

### When to Use Each Trigger Type

#### Webhook (Real-time)
✅ **Use when:**
- You need instant responses (< 1 second)
- External apps can send HTTP POST requests
- Working with form submissions, API callbacks

❌ **Don't use when:**
- The app doesn't support webhooks
- You're checking for new items in a list/folder

**Example:** 
```
Customer fills form → Webhook receives data → OpenAI processes → Email sent
Total time: 2-3 seconds
```

#### Polling (Scheduled)
✅ **Use when:**
- App doesn't support webhooks
- Checking for new emails, files, or database entries
- Batch processing is acceptable

❌ **Don't use when:**
- You need real-time responses
- High frequency updates (< 1 minute intervals)

**Example:**
```
Every 15 minutes → Check Gmail inbox → If new email → OpenAI summarizes → Save to Sheets
```

#### Schedule (Time-based)
✅ **Use when:**
- Running reports at specific times
- Sending daily/weekly summaries
- Cleaning up data periodically

**Example:**
```
Every Monday 9 AM → OpenAI generates weekly summary → Send to team via Slack
```

#### App Event (Event-driven)
✅ **Use when:**
- App supports native event triggers
- Working with Google Sheets, Slack, Trello, etc.

**Example:**
```
New row added to Google Sheets → OpenAI processes data → Update row with results
```

---

## 3. OpenAI Integration Guide

### Understanding OpenAI Triggers

**Important:** OpenAI is an **ACTION** service, not a **TRIGGER** service.

#### Why OpenAI Doesn't Have Triggers

OpenAI's API is designed to respond to requests, not initiate them. You cannot configure OpenAI to "watch" for events or trigger workflows on its own.

### OpenAI as an Action

OpenAI should be used as an **action node** in your workflows, meaning it performs tasks when triggered by something else.

#### Available OpenAI Actions

1. **Chat Completion** (GPT Models)
   - Generate text responses
   - Answer questions
   - Create content
   - Summarize text
   - Translate languages

2. **Generate Image** (DALL-E)
   - Create images from text descriptions
   - Generate product mockups
   - Create social media graphics

3. **Transcribe Audio** (Whisper)
   - Convert speech to text
   - Transcribe meetings
   - Process voice messages

4. **Create Embedding**
   - Convert text to vector embeddings
   - Build semantic search
   - Analyze text similarity

5. **Text to Speech**
   - Convert text to spoken audio
   - Generate voiceovers
   - Create audio responses

### How to Use OpenAI in Workflows

#### Setup Steps

**Step 1: Choose a Trigger**
- Select what will start your workflow (webhook, schedule, app event)

**Step 2: Connect OpenAI**
- Click "Add Action" → Select "OpenAI"
- Select trigger type: **Webhook** (for real-time) or **Polling/Schedule** (for batch)

**Step 3: Authenticate**
- Enter your OpenAI API Key (get from https://platform.openai.com/api-keys)
- Optionally enter Organization ID
- Click "Verify & Connect"

**Step 4: Configure Action**
- Choose action (e.g., "Chat Completion")
- Configure fields:
  - **Model**: gpt-4o, gpt-4o-mini, gpt-3.5-turbo
  - **System Prompt**: Define AI behavior
  - **User Message**: Map data from trigger
  - **Temperature**: 0-2 (lower = focused, higher = creative)

**Step 5: Test & Save**
- Click "Test" to verify configuration
- Click "Save & Activate" to enable workflow

### Common OpenAI Workflow Patterns

#### Pattern 1: Form Submission → AI Response → Email

```yaml
Trigger: Webhook
├─ URL: https://your-app.com/webhook/form-submit
└─ Receives: { name, email, question }

Action 1: OpenAI Chat Completion
├─ Model: gpt-4o-mini
├─ System Prompt: "You are a helpful customer support assistant"
├─ User Message: "{{trigger.question}}"
└─ Outputs: { response }

Action 2: Send Email
├─ To: {{trigger.email}}
├─ Subject: "Re: Your Question"
└─ Body: "Hi {{trigger.name}},\n\n{{openai.response}}"
```

**How it works:**
1. User submits form → Webhook triggered instantly
2. OpenAI generates personalized response
3. Email sent to customer
4. Total time: 3-5 seconds

#### Pattern 2: Daily Summary Email

```yaml
Trigger: Schedule
└─ Time: Every day at 9:00 AM

Action 1: Fetch Data
└─ Get yesterday's customer inquiries from database

Action 2: OpenAI Chat Completion
├─ Model: gpt-4o
├─ System Prompt: "Generate a concise daily summary"
├─ User Message: "Summarize these inquiries: {{data.inquiries}}"
└─ Outputs: { summary }

Action 3: Send Email
├─ To: team@company.com
├─ Subject: "Daily Customer Inquiry Summary"
└─ Body: {{openai.summary}}
```

**How it works:**
1. Runs automatically every morning at 9 AM
2. Fetches data from previous day
3. OpenAI creates intelligent summary
4. Team receives email with summary

#### Pattern 3: Real-time Content Moderation

```yaml
Trigger: Webhook
└─ Receives user-generated content

Action 1: OpenAI Chat Completion
├─ Model: gpt-4o-mini
├─ System Prompt: "Analyze if content is appropriate. Respond with JSON: {appropriate: true/false, reason: string}"
├─ User Message: {{trigger.content}}
└─ Outputs: { analysis }

Action 2: Condition
├─ If analysis.appropriate == false
│   └─ Send to moderation queue
└─ Else
    └─ Publish content
```

#### Pattern 4: Automated Image Generation

```yaml
Trigger: Schedule
└─ Time: Every Monday at 10:00 AM

Action 1: OpenAI Chat Completion
├─ System Prompt: "Generate creative social media post ideas about [topic]"
└─ Outputs: { post_idea }

Action 2: OpenAI Generate Image (DALL-E)
├─ Prompt: {{openai.post_idea}}
├─ Size: 1024x1024
└─ Outputs: { image_url }

Action 3: Post to Social Media
└─ Image: {{dalle.image_url}}
```

### OpenAI Configuration Fields Explained

#### Chat Completion Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| **Model** | Select | GPT model to use | gpt-4o-mini (fast & cheap), gpt-4o (most capable) |
| **System Prompt** | Textarea | Define AI behavior and context | "You are a professional email writer" |
| **User Message** | Textarea | The actual question/request | "Write a follow-up email to {{customer.name}}" |
| **Temperature** | Number | Creativity (0-2) | 0.3 (focused), 0.7 (balanced), 1.5 (creative) |
| **Max Tokens** | Number | Maximum response length | 1000 (short), 4000 (long) |
| **Response Format** | Select | Output format | text (default), json_object (structured) |

#### Image Generation Fields

| Field | Description | Options |
|-------|-------------|---------|
| **Model** | DALL-E version | dall-e-3 (recommended), dall-e-2 |
| **Prompt** | Image description | "A modern logo for a tech startup" |
| **Size** | Image dimensions | 1024x1024, 1024x1792, 1792x1024 |
| **Quality** | Image quality | standard (faster), hd (better quality) |
| **Style** | Visual style | natural (realistic), vivid (artistic) |

### Webhook Setup for OpenAI Workflows

#### Step 1: Configure Trigger
```
Trigger Type: Webhook
Description: Receives form submissions for AI processing
```

#### Step 2: Get Webhook URL
After creating the workflow, you'll receive a webhook URL:
```
https://your-app.com/api/webhook/wf_abc123xyz
```

#### Step 3: Send Data to Webhook
Your app sends HTTP POST requests:

```javascript
// Example: JavaScript
fetch('https://your-app.com/api/webhook/wf_abc123xyz', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    question: 'How do I reset my password?'
  })
});
```

```python
# Example: Python
import requests

requests.post('https://your-app.com/api/webhook/wf_abc123xyz', 
  json={
    'name': 'John Doe',
    'email': 'john@example.com',
    'question': 'How do I reset my password?'
  }
)
```

#### Step 4: Map Webhook Data in OpenAI
In the OpenAI action configuration:

```
User Message: "Answer this customer question: {{trigger.question}}"
```

The `{{trigger.question}}` will be replaced with the actual question from the webhook.

---

## 4. How Triggers Work for Different Apps

### Google Sheets
**Trigger Types:**
- ✅ App Event (New row added)
- ✅ Polling (Check for new rows every X minutes)
- ❌ Webhook (not supported)

**How it works:**
- Polling: Checks spreadsheet every 5-15 minutes for new rows
- App Event: Uses Google's Push Notifications API (instant)

### Slack
**Trigger Types:**
- ✅ App Event (New message in channel)
- ✅ Webhook (Slash commands, Button clicks)

### Gmail
**Trigger Types:**
- ✅ Polling (Check inbox every X minutes)
- ✅ App Event (New email via Gmail API)

### Webhooks (Generic)
**Trigger Types:**
- ✅ Webhook (Real-time HTTP POST)

**Best for:** Custom integrations, Form submissions, API callbacks

---

## 5. Workflow Storage

### Where Workflows Are Saved

Workflows are currently stored in **browser state** during editing. When you click "Save & Activate", they should be persisted to:

#### Database Tables

1. **`integrations` table** (primary storage)
   ```sql
   CREATE TABLE integrations (
     id VARCHAR(36) PRIMARY KEY,
     user_id VARCHAR(36) NOT NULL,
     agent_id VARCHAR(36),
     type VARCHAR(50) NOT NULL,  -- 'workflow', 'trigger', 'action'
     name VARCHAR(255) NOT NULL,
     description TEXT,
     config JSON,  -- Stores nodes, connections, field mappings
     triggers JSON,  -- Trigger configuration
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );
   ```

2. **Workflow Config Structure** (stored in `config` JSON field)
   ```json
   {
     "nodes": [
       {
         "id": "node_1",
         "type": "trigger",
         "appId": "webhook",
         "triggerId": "webhook_received",
         "config": {
           "webhookUrl": "https://...",
           "triggerType": "webhook"
         }
       },
       {
         "id": "node_2",
         "type": "action",
         "appId": "openai",
         "actionId": "chat_completion",
         "config": {
           "model": "gpt-4o-mini",
           "systemPrompt": "You are helpful...",
           "temperature": 0.7,
           "isAuthenticated": true
         }
       }
     ],
     "connections": [
       { "from": "node_1", "to": "node_2" }
     ],
     "fieldMappings": [
       {
         "targetField": "userMessage",
         "expression": "{{trigger.question}}"
       }
     ]
   }
   ```

### Current Limitations

⚠️ **Note:** As of the current version, workflows are only saved in the browser's local state. Full database persistence is planned for the next release.

**What this means:**
- ✅ You can build and test workflows
- ✅ Configurations are saved while editing
- ❌ Workflows are lost on page refresh
- ❌ Cannot share workflows across devices

**Workaround:**
Export your workflow configuration before closing:
```javascript
// Browser console
console.log(JSON.stringify(workflowNodes));
```

### Planned Features (Coming Soon)

- ✅ **Full Database Persistence** - Save workflows to `integrations` table
- ✅ **Workflow Versioning** - Track changes over time
- ✅ **Workflow Templates** - Pre-built workflows for common use cases
- ✅ **Execution Logs** - View workflow run history in `integration_logs` table
- ✅ **Error Handling** - Retry failed executions, error notifications

---

## 6. Best Practices

### Trigger Selection

1. **Use Webhook for Real-time Needs**
   - Form submissions
   - API callbacks
   - User actions requiring immediate response

2. **Use Polling for Batch Processing**
   - Email inbox monitoring
   - File folder checks
   - Database updates
   - Interval: 5-15 minutes for non-critical, 1-5 minutes for important

3. **Use Schedule for Reports**
   - Daily summaries
   - Weekly analytics
   - Monthly reports

### OpenAI Best Practices

#### Cost Optimization

1. **Choose the Right Model**
   - `gpt-4o-mini`: Fast, cheap, great for simple tasks ($0.15 / 1M tokens)
   - `gpt-4o`: Most capable, use for complex tasks ($2.50 / 1M tokens)
   - `gpt-3.5-turbo`: Legacy, cheaper but less capable

2. **Set Reasonable Max Tokens**
   - Short responses: 100-500 tokens
   - Medium: 500-1500 tokens
   - Long: 1500-4000 tokens

3. **Use Caching When Possible**
   - Store frequently used responses
   - Check cache before calling OpenAI

#### Quality Optimization

1. **Write Clear System Prompts**
   ```
   ❌ Bad: "Help customers"
   ✅ Good: "You are a professional customer support agent for [Company]. 
            Answer questions about products, shipping, and returns. 
            Be friendly and concise. If you don't know, say so."
   ```

2. **Use Structured Output for Automation**
   ```
   Response Format: json_object
   System Prompt: "Respond only with JSON: {sentiment: string, category: string}"
   ```

3. **Set Appropriate Temperature**
   - Creative tasks (blog posts): 1.0-1.5
   - Balanced (customer support): 0.7
   - Focused (data extraction): 0.1-0.3

### Error Handling

1. **Add Condition Nodes**
   - Check if OpenAI response is valid
   - Handle rate limits
   - Retry on failure

2. **Monitor Execution Logs**
   - Check `integration_logs` table
   - Set up error notifications

### Security

1. **Protect Webhook URLs**
   - Use authentication tokens
   - Validate request signatures
   - Rate limit incoming requests

2. **Secure API Keys**
   - Never expose in client-side code
   - Rotate keys periodically
   - Use environment variables

---

## Quick Reference

### OpenAI Workflow Checklist

- [ ] Choose trigger type (webhook, polling, schedule)
- [ ] Add OpenAI action node
- [ ] Enter API key and verify connection
- [ ] Select OpenAI action (chat completion, image generation, etc.)
- [ ] Configure model and parameters
- [ ] Map trigger data to OpenAI inputs
- [ ] Test workflow
- [ ] Save and activate
- [ ] Monitor execution logs

### Common Issues

**Problem:** "API Key required" error even after entering key
- **Solution:** Click "Verify & Connect" button after entering key

**Problem:** Workflow not triggering
- **Solution:** Check if workflow is activated (toggle in top-right)

**Problem:** OpenAI returns empty response
- **Solution:** Check max_tokens is not too low, verify user message is not empty

**Problem:** High costs
- **Solution:** Switch to gpt-4o-mini, reduce max_tokens, implement caching

---

## Support

For additional help:
- 📧 Email: support@agentforge.com
- 📚 Full documentation: https://docs.agentforge.com
- 💬 Community forum: https://community.agentforge.com

