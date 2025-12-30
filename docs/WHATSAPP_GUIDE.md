# WhatsApp Business Integration

> Complete guide to sending messages, templates, and media via WhatsApp Business API

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Connection Setup](#connection-setup)
4. [Available Triggers](#available-triggers)
5. [Available Actions](#available-actions)
6. [Action Reference](#action-reference)
7. [Example Workflows](#example-workflows)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)
10. [FAQ](#faq)

---

## Overview

### What is WhatsApp Business Integration?

The WhatsApp Business integration allows your workflows to communicate with customers through WhatsApp—the world's most popular messaging platform with **2+ billion users**.

Using the official WhatsApp Cloud API (via Meta), you can:
- Send text messages
- Send pre-approved template messages
- Send images, documents, videos, and audio
- Send interactive messages with buttons and lists
- Mark messages as read

### Why Use WhatsApp?

| Metric | WhatsApp | Email |
|--------|----------|-------|
| Open Rate | **98%** | 20% |
| Response Time | **Minutes** | Hours/Days |
| User Preference | **Instant messaging** | Formal communication |
| Global Reach | **180+ countries** | Universal |

### Use Cases

| Use Case | Description |
|----------|-------------|
| **Customer Support** | Automated 24/7 support with AI-powered responses |
| **Order Updates** | Shipping notifications, delivery confirmations |
| **Appointment Reminders** | Reduce no-shows with timely reminders |
| **Lead Nurturing** | Engage prospects with personalized messages |
| **Payment Reminders** | Invoice and payment due notifications |
| **Two-Factor Authentication** | Send OTP codes securely |

---

## Prerequisites

Before connecting WhatsApp, you need:

### Required Accounts

1. **Meta Business Account** (free)
   - Create at [business.facebook.com](https://business.facebook.com)
   
2. **WhatsApp Business Account** (within Meta Business Suite)
   - Set up in Meta Business Suite → Settings → WhatsApp Accounts

3. **Dedicated Phone Number**
   - Cannot be currently registered with WhatsApp
   - Can be mobile or landline (if it can receive SMS/voice for verification)

### Required Credentials

| Credential | Where to Find |
|------------|---------------|
| **Access Token** | Meta Business Suite → System Users → Generate Token |
| **Phone Number ID** | WhatsApp Manager → Phone Numbers → Your Number |
| **Business Account ID** (optional) | WhatsApp Manager → Overview |

### Business Verification (Optional but Recommended)

Meta may require business verification for:
- Higher messaging limits
- Verified badge on your business profile
- Access to certain features

---

## Connection Setup

### Step 1: Create Meta Business Account

1. Go to [business.facebook.com](https://business.facebook.com)
2. Click **"Create Account"**
3. Enter your business name, your name, and email
4. Verify your email address
5. Complete business information

> 💡 **Tip:** Use your official business email for easier verification later.

### Step 2: Set Up WhatsApp Business Account

1. In Meta Business Suite, go to **Settings** (gear icon)
2. Click **"WhatsApp Accounts"** in the left sidebar
3. Click **"Add"** to create a new WhatsApp Business Account
4. Follow the prompts to link it to your Meta Business Account

### Step 3: Add Your Phone Number

1. In WhatsApp Manager, click **"Phone Numbers"**
2. Click **"Add Phone Number"**
3. Enter the phone number you want to use
4. Select verification method (SMS or Voice Call)
5. Enter the verification code
6. Set your display name (must follow [Meta guidelines](https://www.facebook.com/business/help/757569725593362))

> ⚠️ **Warning:** This phone number cannot be currently registered with WhatsApp (personal or business). If it is, you must delete that WhatsApp account first.

### Step 4: Create System User and Generate Token

1. Go to **Meta Business Suite → Business Settings**
2. Click **Users → System Users**
3. Click **"Add"** to create a new system user
4. Name it (e.g., "AgentForge Integration")
5. Set role to **Admin**
6. Click **"Add Assets"** → Select your WhatsApp Business Account → **Full Control**
7. Click **"Generate New Token"**
8. Select expiration (recommend: "Never" for integrations)
9. Select permissions:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
10. Click **"Generate Token"**
11. **Copy the token immediately** (it won't be shown again!)

### Step 5: Get Phone Number ID

1. In WhatsApp Manager, go to **Phone Numbers**
2. Click on your phone number
3. Find **Phone Number ID** (looks like: `1234567890123456`)
4. Copy this ID

### Step 6: Connect in AgentForge

1. Open **AgentForge → Integrations → Credentials**
2. Click **"Add Credential"**
3. Select **"WhatsApp Business"**
4. Enter:
   - **Access Token:** (paste from Step 4)
   - **Phone Number ID:** (paste from Step 5)
5. Click **"Verify & Save"**
6. You should see a success message

### Step 7: Test the Connection

1. Create a new workflow with a **Manual Trigger**
2. Add a **WhatsApp → Send Message** action
3. Configure:
   - To: Your personal phone number (with country code)
   - Message: "Hello from AgentForge! 🎉"
4. Click **"Test"**
5. Check your WhatsApp for the message

---

## Available Triggers

### WhatsApp triggers are configured via Webhooks

WhatsApp doesn't have direct triggers in the flow builder. Instead, use the **Webhook Trigger** and configure Meta to send webhook events.

### Setting Up WhatsApp Webhooks

1. In Meta Developer Console, go to your app
2. Add **"WhatsApp"** product if not already added
3. Go to **Configuration → Webhooks**
4. Enter your Webhook URL from AgentForge
5. Enter a Verify Token (any secure string)
6. Subscribe to events:
   - `messages` - Incoming messages
   - `message_status` - Delivery/read receipts

### Environment Variables (Webhook + Security)

These environment variables control webhook verification and security for the WhatsApp agent/webhook endpoints.

| Variable | Required? | Description |
|---------|-----------|-------------|
| `WHATSAPP_VERIFY_TOKEN` | Optional | Used for the **GET** webhook verification challenge (`/api/whatsapp/webhook`). If not set, verification can still succeed using an agent-specific verify token stored in the database. |
| `WHATSAPP_WEBHOOK_SECRET` | Recommended (Required if enforcing) | Meta App Secret used to validate the **POST** webhook signature header `X-Hub-Signature-256`. |
| `WHATSAPP_WEBHOOK_ENFORCE_SIGNATURE` | Optional | Set to `true` to **reject** unsigned/invalid webhooks with `401`. If `true` while `WHATSAPP_WEBHOOK_SECRET` is missing, the server treats it as a misconfiguration and returns `500`. |

**Production note (important):**

- `ENCRYPTION_KEY` is strongly recommended in production because WhatsApp access tokens are stored encrypted at rest. If it changes between restarts, previously saved tokens can’t be decrypted.

### Webhook Payload Examples

**Incoming Message:**
```json
{
  "from": "919876543210",
  "id": "wamid.xxxxx",
  "timestamp": "1703847000",
  "type": "text",
  "text": {
    "body": "Hi, I need help with my order"
  }
}
```

**Message Status Update:**
```json
{
  "id": "wamid.xxxxx",
  "status": "delivered",
  "timestamp": "1703847010",
  "recipient_id": "919876543210"
}
```

---

## Available Actions

| Action | Description | When to Use |
|--------|-------------|-------------|
| **Send Message** | Send plain text message | Simple responses, confirmations |
| **Send Template** | Send pre-approved template | First contact, notifications |
| **Send Media** | Send image/video/document/audio | Product images, receipts, voice |
| **Send Interactive** | Buttons or list menus | Menus, quick replies, choices |
| **Mark as Read** | Mark received message as read | Show blue checkmarks |

---

## Action Reference

### 1. Send Message

**Description:** Sends a plain text message to a WhatsApp user.

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `to` | String | Recipient phone number with country code (e.g., `919876543210`) |
| `message` | String | The text message to send (max 4096 characters) |

#### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `previewUrl` | Boolean | `true` | Show link previews in message |

#### Example Configuration

```yaml
Action: Send Message
To: {{trigger.customer_phone}}
Message: |
  Hello {{trigger.customer_name}}! 👋
  
  Your order #{{trigger.order_id}} has been shipped!
  
  Track it here: https://track.example.com/{{trigger.order_id}}
Preview URL: true
```

#### Output

```json
{
  "ok": true,
  "message": {
    "messaging_product": "whatsapp",
    "contacts": [{ "wa_id": "919876543210" }],
    "messages": [{ "id": "wamid.HBgLMTY..." }]
  }
}
```

> ⚠️ **Important:** You can only send free-form text messages within **24 hours** of the customer's last message. After 24 hours, you must use a Template message.

---

### 2. Send Template

**Description:** Sends a pre-approved message template. Required for initiating conversations.

#### Why Templates?

Meta requires templates for:
- **First contact** (customer hasn't messaged you first)
- **Re-engaging** after 24-hour window closes
- **Promotional messages**
- **Notifications** (appointments, orders, etc.)

Templates must be approved by Meta before use (usually 24-48 hours).

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `to` | String | Recipient phone number with country code |
| `templateName` | String | Name of your approved template (e.g., `order_confirmation`) |

#### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `templateLanguage` | String | `en` | Language code (e.g., `en`, `es`, `hi`) |
| `templateParams` | JSON Array | `[]` | Parameter values to fill in template |

#### Example: Simple Template

Template (created in WhatsApp Manager):
```
Name: hello_world
Body: Hello {{1}}! Welcome to our service.
```

Configuration:
```yaml
Action: Send Template
To: {{trigger.phone}}
Template Name: hello_world
Template Language: en
Template Params: ["{{trigger.customer_name}}"]
```

Result sent to customer:
```
Hello John! Welcome to our service.
```

#### Example: Order Confirmation Template

Template:
```
Name: order_shipped
Body: Hi {{1}}! Your order #{{2}} has been shipped. 
      Expected delivery: {{3}}. 
      Track here: {{4}}
```

Configuration:
```yaml
Action: Send Template
To: {{trigger.phone}}
Template Name: order_shipped
Template Language: en
Template Params: [
  "{{trigger.name}}",
  "{{trigger.order_id}}",
  "{{trigger.delivery_date}}",
  "https://track.example.com/{{trigger.order_id}}"
]
```

#### Output

```json
{
  "ok": true,
  "message": {
    "messaging_product": "whatsapp",
    "contacts": [{ "wa_id": "919876543210" }],
    "messages": [{ "id": "wamid.HBgLMTY..." }]
  }
}
```

---

### 3. Send Media

**Description:** Sends images, videos, documents, or audio files.

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `to` | String | Recipient phone number |
| `mediaType` | String | Type: `image`, `video`, `audio`, or `document` |
| `mediaUrl` | String | Public URL of the media file |

#### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `caption` | String | Text caption (for images, videos, documents) |
| `filename` | String | Display filename (for documents only) |

#### Supported Media Types

| Type | Formats | Max Size |
|------|---------|----------|
| **Image** | JPEG, PNG | 5 MB |
| **Video** | MP4, 3GPP | 16 MB |
| **Audio** | AAC, MP3, OGG, AMR, OPUS | 16 MB |
| **Document** | PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX | 100 MB |

#### Example: Send Product Image

```yaml
Action: Send Media
To: {{trigger.phone}}
Media Type: image
Media URL: https://example.com/products/{{trigger.product_id}}.jpg
Caption: |
  📦 {{trigger.product_name}}
  
  Price: ${{trigger.price}}
  In stock: ✅
  
  Reply "BUY" to order!
```

#### Example: Send Invoice PDF

```yaml
Action: Send Media
To: {{trigger.customer_phone}}
Media Type: document
Media URL: {{nodes.generate_invoice.pdf_url}}
Filename: Invoice_{{trigger.order_id}}.pdf
Caption: Here's your invoice for order #{{trigger.order_id}}
```

#### Output

```json
{
  "ok": true,
  "message": {
    "messaging_product": "whatsapp",
    "contacts": [{ "wa_id": "919876543210" }],
    "messages": [{ "id": "wamid.HBgLMTY..." }]
  }
}
```

---

### 4. Send Interactive

**Description:** Sends messages with clickable buttons or list menus.

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `to` | String | Recipient phone number |
| `interactiveType` | String | `button` or `list` |
| `bodyText` | String | Main message body |
| `buttons` | JSON Object | Button/list configuration |

#### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `headerText` | String | Optional header text |
| `footerText` | String | Optional footer text |

#### Example: Button Message

```yaml
Action: Send Interactive
To: {{trigger.phone}}
Interactive Type: button
Header Text: How can we help?
Body Text: Please choose an option below:
Footer Text: Reply anytime for help
Buttons: {
  "buttons": [
    {
      "type": "reply",
      "reply": {
        "id": "support",
        "title": "🆘 Support"
      }
    },
    {
      "type": "reply",
      "reply": {
        "id": "sales",
        "title": "💰 Sales"
      }
    },
    {
      "type": "reply",
      "reply": {
        "id": "billing",
        "title": "📄 Billing"
      }
    }
  ]
}
```

**Result:** Customer sees message with 3 clickable buttons.

#### Example: List Menu

```yaml
Action: Send Interactive
To: {{trigger.phone}}
Interactive Type: list
Header Text: Our Services
Body Text: Browse our services and select one to learn more.
Footer Text: Tap the button below
Buttons: {
  "button": "View Services",
  "sections": [
    {
      "title": "Popular Services",
      "rows": [
        {
          "id": "web_dev",
          "title": "Web Development",
          "description": "Custom websites and apps"
        },
        {
          "id": "seo",
          "title": "SEO Services",
          "description": "Improve search rankings"
        }
      ]
    },
    {
      "title": "New Services",
      "rows": [
        {
          "id": "ai_integration",
          "title": "AI Integration",
          "description": "Add AI to your business"
        }
      ]
    }
  ]
}
```

**Result:** Customer sees button "View Services". Tapping shows categorized list menu.

---

### 5. Mark as Read

**Description:** Marks a received message as read (shows blue checkmarks to sender).

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `messageId` | String | The ID of the message to mark as read (from webhook) |

#### Example

```yaml
Action: Mark as Read
Message ID: {{trigger.message_id}}
```

#### Output

```json
{
  "ok": true,
  "result": {
    "success": true
  }
}
```

> 💡 **Tip:** Use this at the start of your workflow to immediately show the customer their message was seen, even before generating a response.

---

## Example Workflows

### 1. Customer Support Auto-Reply

**Scenario:** Automatically respond to customer messages using AI.

```
[Webhook Trigger] - Receives WhatsApp message from Meta
       ↓
[WhatsApp: Mark as Read] - Show blue checkmarks immediately
       ↓
[OpenAI: Chat Completion] - Generate helpful response
       ↓
[WhatsApp: Send Message] - Send AI response to customer
       ↓
[Google Sheets: Append Row] - Log conversation
```

**Configuration:**

```yaml
# Webhook receives:
# { "from": "919876543210", "message_id": "wamid.xxx", "text": "What are your hours?" }

# Step 1: Mark as Read
Message ID: {{trigger.message_id}}

# Step 2: OpenAI
System Prompt: |
  You are a helpful customer support agent for Acme Corp.
  Our hours are Mon-Fri 9AM-6PM EST.
  Be friendly and concise.
User Message: "{{trigger.text}}"
Model: gpt-4o-mini
Temperature: 0.7

# Step 3: Send Message
To: {{trigger.from}}
Message: "{{nodes.openai.text}}"

# Step 4: Log to Sheets
Spreadsheet: Customer Support Log
Sheet: December 2024
Values: [
  "{{trigger.from}}",
  "{{trigger.text}}",
  "{{nodes.openai.text}}",
  "{{now}}"
]
```

### 2. Order Confirmation with Tracking

**Scenario:** Send order confirmation when payment is received.

```
[Stripe Webhook] - Payment successful
       ↓
[REST API] - Get order details from your system
       ↓
[WhatsApp: Send Template] - Send order confirmation
       ↓
[WhatsApp: Send Media] - Send invoice PDF
```

**Configuration:**

```yaml
# Stripe webhook receives payment event

# Step 1: Get Order Details
URL: https://api.yourstore.com/orders/{{trigger.order_id}}
Method: GET

# Step 2: Send Template
To: {{nodes.api.customer_phone}}
Template Name: order_confirmed
Template Params: [
  "{{nodes.api.customer_name}}",
  "{{trigger.order_id}}",
  "₹{{trigger.amount}}",
  "{{nodes.api.delivery_date}}"
]

# Step 3: Send Invoice
To: {{nodes.api.customer_phone}}
Media Type: document
Media URL: {{nodes.api.invoice_url}}
Filename: Invoice_{{trigger.order_id}}.pdf
```

### 3. Appointment Reminder

**Scenario:** Send reminder 24 hours before appointment.

```
[Schedule Trigger] - Runs every hour
       ↓
[Database: Query] - Get appointments in next 24 hours
       ↓
[Loop] - For each appointment
       ↓
[WhatsApp: Send Template] - Send reminder
```

**Configuration:**

```yaml
# Schedule: Every hour at minute 0

# Step 1: Query upcoming appointments
Query: |
  SELECT * FROM appointments 
  WHERE datetime BETWEEN NOW() AND NOW() + INTERVAL 24 HOUR
  AND reminder_sent = false

# Step 2: Loop through results
For Each: {{nodes.database.rows}}

# Step 3: Send Template (inside loop)
To: {{loop.current.phone}}
Template Name: appointment_reminder
Template Params: [
  "{{loop.current.customer_name}}",
  "{{loop.current.service}}",
  "{{loop.current.date}}",
  "{{loop.current.time}}"
]
```

### 4. Product Catalog Bot

**Scenario:** Interactive product browsing via WhatsApp.

```
[Webhook Trigger] - Customer sends message
       ↓
[Switch] - Check message content
       ├── "menu" → [Send Interactive List]
       ├── Product ID → [Send Product Image + Buy Button]
       └── "buy" → [Send Payment Link]
```

---

## Troubleshooting

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| **"Access token has expired"** | Token expired or revoked | Generate new token in Meta Business Suite |
| **"Phone number not registered"** | Recipient doesn't have WhatsApp | Verify number format (include country code, no spaces) |
| **"Template not found"** | Template name incorrect or not approved | Check exact template name in WhatsApp Manager |
| **"Message failed - 24 hour window"** | Trying to send text after 24 hours | Use a Template message instead |
| **"Rate limit exceeded"** | Too many messages sent | Wait and retry; implement rate limiting |
| **"Invalid phone number format"** | Wrong number format | Use format: `919876543210` (country code + number, no + or spaces) |
| **"Media URL not accessible"** | WhatsApp can't fetch your media | Ensure URL is public and HTTPS |

### Phone Number Format

**Correct formats:**
- `919876543210` ✅ (India)
- `14155551234` ✅ (USA)
- `447911123456` ✅ (UK)

**Incorrect formats:**
- `+91 98765 43210` ❌
- `091-9876543210` ❌
- `9876543210` ❌ (missing country code)

### 24-Hour Messaging Window

WhatsApp has a **24-hour customer service window**:

| Scenario | What You Can Send |
|----------|-------------------|
| Customer messaged in last 24 hours | Any message type (text, media, interactive) |
| No message from customer in 24+ hours | **Only Template messages** |

**How to handle:**
1. Always use Templates for initiating conversations
2. When customer replies, you have 24 hours for free-form messages
3. Set up a system to track last customer message time

### Testing Templates

Before using templates in production:

1. Create template in WhatsApp Manager
2. Wait for approval (usually 24-48 hours)
3. Test with your own phone number first
4. Verify all parameters fill correctly
5. Check message renders properly on mobile

---

## Best Practices

### Message Quality

- ✅ **Keep messages concise** - WhatsApp is for quick conversations
- ✅ **Use emojis sparingly** - They add personality but don't overdo it
- ✅ **Include call-to-action** - Tell customers what to do next
- ✅ **Personalize** - Use customer name and relevant details
- ❌ **Don't spam** - Respect customer preferences
- ❌ **Don't send walls of text** - Break into multiple messages if needed

### Template Best Practices

- Submit templates well in advance (approval takes 24-48 hours)
- Use clear, professional language
- Avoid promotional language in utility templates
- Include opt-out instructions in marketing templates
- Test with all possible parameter values

### Technical Best Practices

- **Mark as Read first** - Show customers you've seen their message immediately
- **Handle errors gracefully** - Have fallback for failed messages
- **Log all interactions** - For debugging and compliance
- **Implement rate limiting** - Avoid hitting API limits
- **Use webhooks** - Don't poll for messages

### Compliance

- Only message customers who have opted in
- Provide clear opt-out mechanism
- Respect time zones (don't message at 3 AM)
- Follow Meta's [Commerce Policy](https://www.whatsapp.com/legal/commerce-policy)
- Store and handle data according to privacy regulations

---

## FAQ

### General Questions

**Q: Do I need WhatsApp Business app to use this?**
A: No. This uses the WhatsApp Cloud API, which is separate from the WhatsApp Business app. You need a Meta Business Account instead.

**Q: Can I use my personal WhatsApp number?**
A: No. The phone number you use must NOT be currently registered with WhatsApp. You'll need a separate number for business use.

**Q: How much does WhatsApp API cost?**
A: Meta charges per conversation:
- **User-initiated** (customer messages first): $0.00-0.05 per conversation
- **Business-initiated** (you message first): $0.03-0.15 per conversation
Prices vary by country. First 1,000 conversations/month are free.

**Q: Can I send messages to any phone number?**
A: You can only send messages to users who have opted in or have messaged your business first. Bulk spam is prohibited and will get your account banned.

### Technical Questions

**Q: Why can't I send a text message?**
A: If it's been more than 24 hours since the customer's last message, you must use a Template message.

**Q: How do I receive messages from customers?**
A: Set up webhooks in Meta Developer Console to receive incoming messages at your webhook URL.

**Q: Can I send messages to groups?**
A: No. WhatsApp Cloud API only supports individual (1:1) messaging, not group chats.

**Q: What happens if a message fails?**
A: The API returns an error. Implement retry logic for temporary failures, and alert for permanent failures (invalid number, blocked, etc.).

**Q: Can I schedule messages?**
A: Not directly through the API. Use a Schedule trigger in your workflow to send messages at specific times.

### Template Questions

**Q: How long does template approval take?**
A: Usually 24-48 hours. Complex templates or first-time submissions may take longer.

**Q: Why was my template rejected?**
A: Common reasons:
- Promotional content in utility templates
- Vague or unclear purpose
- Missing required information
- Policy violations

**Q: Can I edit an approved template?**
A: No. You must create a new template. You can delete the old one after the new one is approved.

---

## Quick Reference

### Credential Fields

| Field | Required | Example |
|-------|----------|---------|
| Access Token | Yes | `EAAGm0PX4ZCps...` |
| Phone Number ID | Yes | `1234567890123456` |

### Action Summary

| Action | Required Fields | 24-Hour Rule |
|--------|-----------------|--------------|
| Send Message | `to`, `message` | Requires open window |
| Send Template | `to`, `templateName` | Works anytime |
| Send Media | `to`, `mediaType`, `mediaUrl` | Requires open window |
| Send Interactive | `to`, `interactiveType`, `bodyText`, `buttons` | Requires open window |
| Mark as Read | `messageId` | N/A |

### Phone Number Format
```
Country Code + Number (no spaces, no +, no dashes)

India: 919876543210
USA: 14155551234
UK: 447911123456
```

---

*Documentation version: 1.0 | Last updated: December 2024*
