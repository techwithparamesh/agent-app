# 💬 Communication Apps Guide

> **Complete documentation for all messaging and communication integrations.** Learn how to send messages across WhatsApp, Telegram, Slack, Discord, Microsoft Teams, and more.

---

## 📋 Table of Contents

1. [Telegram](#telegram)
2. [Slack](#slack)
3. [Discord](#discord)
4. [Microsoft Teams](#microsoft-teams)
5. [Intercom](#intercom)
6. [Twilio SMS](#twilio-sms)
7. [Crisp](#crisp)

---

## 📲 Telegram

### Overview
Send messages, photos, documents, and interactive buttons through your Telegram bot. Perfect for notifications, customer support, and automated responses.

### Prerequisites
- Telegram Bot Token (from @BotFather)
- Chat ID of target user/group

### Connection Setup

1. **Create a Telegram Bot**
   - Open Telegram and search for `@BotFather`
   - Send `/newbot` command
   - Follow prompts to name your bot
   - Copy the API token provided

2. **Add Credentials**
   - Go to **Settings → Credentials**
   - Click **Add Credential**
   - Select **Telegram**
   - Paste your **Bot Token**
   - Save

3. **Get Chat ID**
   - Add your bot to a group or start a chat
   - Send a message to the bot
   - Visit: `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Find the `chat.id` in the response

---

### Actions Reference

#### 📤 Send Message
Send a text message to a chat.

| Field | Required | Description |
|-------|----------|-------------|
| `chatId` | ✅ Yes | Target chat ID (user or group) |
| `text` | ✅ Yes | Message content |
| `parseMode` | No | `HTML`, `Markdown`, or `MarkdownV2` |
| `disableNotification` | No | Send silently (default: false) |

**Example:**
```json
{
  "chatId": "123456789",
  "text": "Hello from the workflow! 🎉",
  "parseMode": "HTML"
}
```

#### 📸 Send Photo
Send an image to a chat.

| Field | Required | Description |
|-------|----------|-------------|
| `chatId` | ✅ Yes | Target chat ID |
| `photo` | ✅ Yes | Image URL or file_id |
| `caption` | No | Photo caption |
| `parseMode` | No | Caption parse mode |

**Example:**
```json
{
  "chatId": "123456789",
  "photo": "https://example.com/image.jpg",
  "caption": "Check out this amazing photo!"
}
```

#### 📎 Send Document
Send a file to a chat.

| Field | Required | Description |
|-------|----------|-------------|
| `chatId` | ✅ Yes | Target chat ID |
| `document` | ✅ Yes | Document URL or file_id |
| `caption` | No | Document caption |

#### 🔘 Send Buttons
Send an inline keyboard with clickable buttons.

| Field | Required | Description |
|-------|----------|-------------|
| `chatId` | ✅ Yes | Target chat ID |
| `text` | ✅ Yes | Message text |
| `buttons` | ✅ Yes | JSON array of button rows |

**Button Format:**
```json
{
  "chatId": "123456789",
  "text": "Choose an option:",
  "buttons": [
    [{"text": "Option 1", "callback_data": "opt1"}, {"text": "Option 2", "callback_data": "opt2"}],
    [{"text": "Visit Website", "url": "https://example.com"}]
  ]
}
```

#### ✏️ Edit Message
Edit a previously sent message.

| Field | Required | Description |
|-------|----------|-------------|
| `chatId` | ✅ Yes | Chat ID |
| `messageId` | ✅ Yes | Message ID to edit |
| `text` | ✅ Yes | New message text |

#### 🗑️ Delete Message
Delete a message from a chat.

| Field | Required | Description |
|-------|----------|-------------|
| `chatId` | ✅ Yes | Chat ID |
| `messageId` | ✅ Yes | Message ID to delete |

---

### Example Workflows

**1. Order Notification Bot**
```
Trigger: New Shopify Order
  ↓
Telegram: Send Message
  - Chat ID: {{order.customer_chat_id}}
  - Text: "🛒 New order #{{order.number}}!\nTotal: ${{order.total}}"
```

**2. Support Alert System**
```
Trigger: New Zendesk Ticket
  ↓
Telegram: Send Buttons
  - Text: "New ticket from {{ticket.customer}}"
  - Buttons: [["View Ticket", "Assign to Me"]]
```

---

## 💬 Slack

### Overview
Send messages, rich blocks, direct messages, and files to Slack channels. Ideal for team notifications, alerts, and automated updates.

### Prerequisites
- Slack Bot Token (starts with `xoxb-`)
- Channel IDs for target channels

### Connection Setup

1. **Create Slack App**
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Click **Create New App** → **From scratch**
   - Name your app and select workspace

2. **Configure Bot Permissions**
   - Go to **OAuth & Permissions**
   - Add Bot Token Scopes:
     - `chat:write` - Send messages
     - `files:write` - Upload files
     - `reactions:write` - Add reactions
     - `channels:read` - List channels

3. **Install to Workspace**
   - Click **Install to Workspace**
   - Copy the **Bot User OAuth Token**

4. **Add Credentials**
   - Go to **Settings → Credentials**
   - Select **Slack**
   - Paste your Bot Token
   - Save

---

### Actions Reference

#### 💬 Send Message
Send a message to a channel.

| Field | Required | Description |
|-------|----------|-------------|
| `channel` | ✅ Yes | Channel ID (e.g., `C01234567`) |
| `text` | ✅ Yes | Message text |
| `threadTs` | No | Reply to thread (message timestamp) |

**Example:**
```json
{
  "channel": "C01234567",
  "text": "Deployment complete! ✅"
}
```

#### 🧱 Send Blocks
Send rich Block Kit messages.

| Field | Required | Description |
|-------|----------|-------------|
| `channel` | ✅ Yes | Channel ID |
| `blocks` | ✅ Yes | Block Kit JSON array |
| `text` | No | Fallback text |

**Example:**
```json
{
  "channel": "C01234567",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*New Lead!* 🎉\nCompany: Acme Corp"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "View Details"},
          "url": "https://crm.example.com/lead/123"
        }
      ]
    }
  ]
}
```

#### 📩 Send DM
Send a direct message to a user.

| Field | Required | Description |
|-------|----------|-------------|
| `userId` | ✅ Yes | User ID (e.g., `U01234567`) |
| `text` | ✅ Yes | Message text |

#### 👍 Add Reaction
Add an emoji reaction to a message.

| Field | Required | Description |
|-------|----------|-------------|
| `channel` | ✅ Yes | Channel ID |
| `timestamp` | ✅ Yes | Message timestamp |
| `name` | ✅ Yes | Emoji name (without colons) |

#### ✏️ Update Message
Update a previously sent message.

| Field | Required | Description |
|-------|----------|-------------|
| `channel` | ✅ Yes | Channel ID |
| `ts` | ✅ Yes | Message timestamp |
| `text` | ✅ Yes | New message text |

#### 📤 Upload File
Upload a file to a channel.

| Field | Required | Description |
|-------|----------|-------------|
| `channels` | ✅ Yes | Channel IDs (comma-separated) |
| `content` | ✅ Yes | File content or URL |
| `filename` | ✅ Yes | File name |
| `title` | No | File title |

---

### Example Workflows

**1. Daily Standup Reminder**
```
Trigger: Schedule (9 AM daily)
  ↓
Slack: Send Blocks
  - Channel: #engineering
  - Blocks: [Section with reminder + Button to open standup form]
```

**2. Error Alert Pipeline**
```
Trigger: Webhook (error event)
  ↓
Slack: Send Message
  - Channel: #alerts
  - Text: "🚨 Error in {{service}}: {{error.message}}"
  ↓
Slack: Add Reaction
  - Emoji: "rotating_light"
```

---

## 🎮 Discord

### Overview
Send messages and rich embeds to Discord servers via bot or webhooks. Great for community notifications, game updates, and server automation.

### Prerequisites

**For Bot:**
- Discord Bot Token
- Bot added to server with proper permissions

**For Webhooks:**
- Webhook URL from channel settings

### Connection Setup

#### Bot Setup
1. **Create Discord Application**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Click **New Application**
   - Go to **Bot** → **Add Bot**
   - Copy the **Token**

2. **Add Bot to Server**
   - Go to **OAuth2** → **URL Generator**
   - Select `bot` scope
   - Select permissions: Send Messages, Embed Links
   - Copy URL and open in browser to add bot

#### Webhook Setup
1. Open Discord channel settings
2. Go to **Integrations** → **Webhooks**
3. Click **New Webhook**
4. Copy the webhook URL

---

### Actions Reference

#### 💬 Send Message (Bot)
Send a message to a channel using bot.

| Field | Required | Description |
|-------|----------|-------------|
| `channelId` | ✅ Yes | Discord channel ID |
| `content` | ✅ Yes | Message text |
| `tts` | No | Text-to-speech (default: false) |

#### 📋 Send Embed (Bot)
Send a rich embed message.

| Field | Required | Description |
|-------|----------|-------------|
| `channelId` | ✅ Yes | Channel ID |
| `title` | No | Embed title |
| `description` | No | Embed description |
| `color` | No | Hex color (e.g., `#FF5733`) |
| `thumbnailUrl` | No | Thumbnail image URL |
| `imageUrl` | No | Main image URL |
| `footer` | No | Footer text |

**Example:**
```json
{
  "channelId": "123456789012345678",
  "title": "New Achievement! 🏆",
  "description": "Player **JohnDoe** reached Level 50!",
  "color": "#FFD700",
  "thumbnailUrl": "https://example.com/badge.png"
}
```

#### 🔗 Webhook Send
Send via webhook URL.

| Field | Required | Description |
|-------|----------|-------------|
| `content` | No | Message text |
| `username` | No | Override webhook username |
| `avatarUrl` | No | Override webhook avatar |
| `embeds` | No | Array of embed objects |

---

## 👔 Microsoft Teams

### Overview
Send messages and create channels in Microsoft Teams. Perfect for enterprise notifications and team collaboration.

### Prerequisites
- Microsoft 365 account
- Teams webhook URL or Azure AD app

### Connection Setup

1. **Create Incoming Webhook**
   - Open Teams channel
   - Click **...** → **Connectors**
   - Find **Incoming Webhook** → **Configure**
   - Name webhook and copy URL

2. **Add Credentials**
   - Add webhook URL to credentials

---

### Actions Reference

#### 💬 Send Message
Send a message via webhook.

| Field | Required | Description |
|-------|----------|-------------|
| `text` | ✅ Yes | Message text (supports markdown) |

#### 📊 Send Adaptive Card
Send rich interactive cards.

| Field | Required | Description |
|-------|----------|-------------|
| `card` | ✅ Yes | Adaptive Card JSON |

---

## 🗨️ Intercom

### Overview
Send messages and manage contacts in Intercom for customer communication.

### Prerequisites
- Intercom Access Token

### Actions Reference

#### 💬 Send Message
Send in-app message to user.

| Field | Required | Description |
|-------|----------|-------------|
| `userId` | ✅ Yes | Intercom user ID |
| `body` | ✅ Yes | Message content |
| `messageType` | No | `inapp` or `email` |

#### 👤 Create Contact
Create a new contact/lead.

| Field | Required | Description |
|-------|----------|-------------|
| `email` | ✅ Yes | Contact email |
| `name` | No | Contact name |
| `customAttributes` | No | JSON custom fields |

#### ✏️ Update Contact
Update existing contact.

| Field | Required | Description |
|-------|----------|-------------|
| `contactId` | ✅ Yes | Contact ID |
| `customAttributes` | No | Fields to update |

---

## 📱 Twilio SMS

### Overview
Send SMS and MMS messages via Twilio.

### Prerequisites
- Twilio Account SID
- Twilio Auth Token
- Twilio Phone Number

### Connection Setup

1. **Get Credentials**
   - Log into [Twilio Console](https://console.twilio.com)
   - Copy **Account SID** and **Auth Token**
   - Get a phone number from **Phone Numbers**

2. **Add Credentials**
   - Add Account SID, Auth Token, and From Number

---

### Actions Reference

#### 📤 Send SMS
Send a text message.

| Field | Required | Description |
|-------|----------|-------------|
| `to` | ✅ Yes | Recipient phone (E.164 format) |
| `body` | ✅ Yes | Message text |
| `from` | No | Override from number |

**Example:**
```json
{
  "to": "+1234567890",
  "body": "Your verification code is: 123456"
}
```

#### 📷 Send MMS
Send multimedia message.

| Field | Required | Description |
|-------|----------|-------------|
| `to` | ✅ Yes | Recipient phone |
| `body` | No | Message text |
| `mediaUrl` | ✅ Yes | Media URL (image/video) |

---

## 💬 Crisp

### Overview
Send messages via Crisp live chat platform.

### Prerequisites
- Crisp API credentials
- Website ID

### Actions Reference

#### 💬 Send Message
Send message in conversation.

| Field | Required | Description |
|-------|----------|-------------|
| `websiteId` | ✅ Yes | Crisp website ID |
| `sessionId` | ✅ Yes | Conversation session ID |
| `content` | ✅ Yes | Message content |
| `type` | No | `text` or `file` |

---

## 💡 Best Practices

### Message Formatting
- Use **markdown** for emphasis in supported platforms
- Keep messages **concise** for mobile users
- Include **call-to-action** buttons when appropriate
- Use **emojis** to improve readability

### Rate Limiting
| Platform | Rate Limit |
|----------|-----------|
| Telegram | 30 messages/second |
| Slack | 1 message/second per channel |
| Discord | 5 requests/second |
| Twilio | Varies by account |

### Error Handling
- Always validate phone numbers before sending
- Check channel/chat IDs exist
- Handle rate limit errors with retries
- Log failed messages for review

---

## 🔧 Troubleshooting

### Common Issues

**"Chat not found" Error**
- Ensure bot is added to the chat/channel
- Verify chat ID is correct
- Check bot has permission to send messages

**"Rate limit exceeded"**
- Add delays between messages
- Use bulk send features where available
- Consider webhook batching

**"Invalid token"**
- Regenerate bot token
- Check token hasn't been revoked
- Verify token format is correct

---

## 📚 Related Docs
- [WhatsApp Guide](./WHATSAPP_GUIDE.md)
- [Email Apps Guide](./EMAIL_APPS.md)
- [Customer Support Apps](./SUPPORT_APPS.md)
