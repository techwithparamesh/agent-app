# AgentForge - Complete Product Documentation

> **Version:** 1.0  
> **Last Updated:** January 2025  
> **Target Audience:** Business Users, Marketers, Support Teams

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Getting Started](#2-getting-started)
3. [User Guide](#3-user-guide)
4. [WhatsApp AI Agent](#4-whatsapp-ai-agent)
5. [Admin Guide](#5-admin-guide)
6. [FAQs](#6-frequently-asked-questions)
7. [Best Practices](#7-best-practices)
8. [Glossary](#8-glossary)

---

## 1. Product Overview

### What is AgentForge?

AgentForge is an AI-powered platform that helps businesses create intelligent chatbot agents trained on their own website content. Instead of spending weeks building a customer support system, you can have a smart AI assistant ready in minutes.

### Who is it for?

| User Type | How AgentForge Helps |
|-----------|---------------------|
| **Small Business Owners** | Provide 24/7 customer support without hiring additional staff |
| **Marketing Teams** | Engage website visitors and capture leads automatically |
| **E-commerce Stores** | Answer product questions and guide customers to purchase |
| **Freelancers & Agencies** | Build AI chatbots for clients quickly |
| **Customer Support Teams** | Reduce repetitive queries and focus on complex issues |

### Key Benefits

- ✅ **24/7 Availability** — Your AI agent never sleeps
- ✅ **Instant Setup** — Go from website to working chatbot in under 10 minutes
- ✅ **No Coding Required** — Simple point-and-click interface
- ✅ **Learns Your Content** — Trained on your actual website, not generic responses
- ✅ **Multi-Channel** — Deploy on your website or WhatsApp Business
- ✅ **Cost Effective** — Free tier available, paid plans start at affordable rates

### Core Features

| Feature | Description |
|---------|-------------|
| **AI Agent Builder** | Create intelligent agents tailored to your business with customizable personalities |
| **Website Scanner** | Automatically extract content from any website to train your AI |
| **Smart Chatbot** | Deploy context-aware chatbots that understand your business |
| **Embeddable Widget** | Add a chat widget to any website with one line of code |
| **WhatsApp Integration** | Connect your AI to WhatsApp Business API |
| **Analytics Dashboard** | Track conversations, visitors, and agent performance |
| **Knowledge Base** | Manage and update the content your AI knows |

### Use Cases

1. **Customer Support Bot**  
   Answer common questions about products, shipping, returns, and policies automatically.

2. **Lead Capture**  
   Engage visitors, qualify leads, and collect contact information 24/7.

3. **Product Recommendations**  
   Help customers find the right product based on their needs.

4. **Appointment Booking**  
   Let customers schedule appointments through natural conversation.

5. **FAQ Automation**  
   Train your agent on FAQs to handle repetitive queries instantly.

---

## 2. Getting Started

### System Requirements

AgentForge works in any modern web browser:
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari

No software installation required — everything runs in your browser.

### Step 1: Create Your Account

1. Go to the AgentForge website
2. Click **"Get Started Free"** or **"Sign Up"**
3. Enter your details:
   - Full Name
   - Email Address
   - Password (minimum 8 characters)
4. Click **"Create Account"**
5. You'll be automatically logged in

> 💡 **Tip:** You can also sign up using your existing account through Replit authentication if available.

### Step 2: Access Your Dashboard

After signing up, you'll land on your **Dashboard** — your command center for managing everything:

![Dashboard Overview]

The dashboard includes:
- **Agents** — Your AI chatbots
- **Knowledge Base** — Content your agents know
- **Conversations** — Chat history with visitors
- **Analytics** — Performance metrics
- **Billing** — Subscription and usage

### Step 3: Create Your First Agent

1. Click **"New Agent"** or **"Create Your First Agent"**
2. Choose a template:
   - **Website Assistant** — General customer support
   - **E-commerce Helper** — Product-focused assistance
   - **Lead Qualifier** — Sales and lead capture
   - **Custom** — Build from scratch
3. Enter agent details:
   - **Name** — Give your agent a friendly name (e.g., "Sarah")
   - **Description** — Describe its purpose
4. Configure personality and behavior
5. Click **"Create Agent"**

### Step 4: Scan Your Website

This is where the magic happens! AgentForge reads your website and teaches your agent about your business.

1. Go to **Scan Website** in the sidebar
2. Enter your website URL (e.g., `https://www.yoursite.com`)
3. Click **"Start Scanning"**
4. Watch the real-time progress:
   - Pages discovered
   - Content extracted
   - Knowledge base updated

> ⏱️ **Scanning Time:** Typically 1-5 minutes depending on website size

### Step 5: Test Your Chatbot

Before going live, test that your agent works correctly:

1. Go to **Test Chatbot** in the sidebar
2. Select your agent from the dropdown
3. Start a conversation
4. Ask questions about your business
5. Check if responses are accurate

**Example test questions:**
- "What services do you offer?"
- "What are your business hours?"
- "How can I contact support?"

### Step 6: Deploy Your Agent

#### Option A: Website Widget

1. Go to your agent's settings
2. Copy the embed code
3. Paste it before the `</body>` tag on your website

```html
<script
  src="https://your-agentforge-url.com/widget.js"
  data-agent-id="your-agent-id"
  data-position="bottom-right"
  data-color="#4F46E5"
></script>
```

#### Option B: WhatsApp Business

1. Connect your WhatsApp Business Account (see [WhatsApp AI Agent](#4-whatsapp-ai-agent))
2. Assign a phone number to your agent
3. Start receiving messages through WhatsApp

---

## 3. User Guide

### 3.1 Managing Agents

#### Creating an Agent

| Step | Action |
|------|--------|
| 1 | Navigate to Dashboard → Agents |
| 2 | Click "New Agent" |
| 3 | Select a template or start from scratch |
| 4 | Fill in agent details |
| 5 | Configure personality settings |
| 6 | Save and activate |

#### Agent Templates

| Template | Best For | Features |
|----------|----------|----------|
| **Website Assistant** | General support | FAQ handling, navigation help |
| **E-commerce Helper** | Online stores | Product info, order status |
| **Lead Qualifier** | Sales teams | Contact capture, qualification |
| **Appointment Booker** | Service businesses | Scheduling, reminders |
| **Custom** | Unique needs | Full customization |

#### Editing an Agent

1. Go to Dashboard → Agents
2. Click on the agent you want to edit
3. Modify settings as needed
4. Click "Save Changes"

#### Deleting an Agent

1. Go to Dashboard → Agents
2. Click on the agent
3. Scroll to "Danger Zone"
4. Click "Delete Agent"
5. Confirm deletion

> ⚠️ **Warning:** Deleting an agent removes all associated conversations and knowledge. This cannot be undone.

### 3.2 Website Scanner

The Website Scanner automatically crawls your website and extracts content for your AI to learn.

#### Starting a Scan

1. Navigate to Dashboard → Scan Website
2. Enter your website URL
3. Click "Start Scanning"

#### What Gets Scanned

- ✅ Page titles and headings
- ✅ Main body content
- ✅ Product descriptions
- ✅ FAQ sections
- ✅ About pages
- ✅ Contact information

#### What's Excluded

- ❌ Login-protected pages
- ❌ Dynamic JavaScript content (some cases)
- ❌ Images and media files
- ❌ External links

#### Understanding Scan Progress

| Status | Meaning |
|--------|---------|
| **Starting** | Initializing the scanner |
| **Discovering Pages** | Finding all pages on your site |
| **Extracting Content** | Reading page content |
| **Processing** | Converting to knowledge |
| **Complete** | Ready to use |

#### Re-scanning

If your website content changes, run a new scan to update your agent's knowledge:

1. Go to Scan Website
2. Enter the same URL
3. Click "Start Scanning"
4. New content will be added/updated

### 3.3 Knowledge Base Management

The Knowledge Base stores all the information your agent knows.

#### Viewing Knowledge

1. Go to Dashboard → Knowledge Base
2. Browse entries organized by:
   - Page URL (source)
   - Title
   - Content type
   - Date added

#### Deleting Knowledge Entries

1. Find the entry you want to remove
2. Click the delete icon (🗑️)
3. Confirm deletion

> 💡 **Tip:** Delete outdated information to keep your agent accurate.

### 3.4 Testing Your Chatbot

The Test Chatbot feature lets you interact with your agent before deploying.

#### How to Test

1. Go to Dashboard → Test Chatbot
2. Select an agent from the dropdown
3. Type a message and press Enter
4. Review the AI response

#### Testing Tips

- Test common customer questions
- Try edge cases and unusual queries
- Check if the agent stays on topic
- Verify factual accuracy against your website

#### Message Limits

| Plan | Monthly Messages |
|------|------------------|
| Free | 20 messages |
| Starter | 1,000 messages |
| Pro | 5,000 messages |
| Enterprise | Unlimited |

> The usage bar in the chat interface shows your remaining messages.

### 3.5 Conversations & History

View all conversations between your agents and visitors.

#### Accessing Conversations

1. Go to Dashboard → Conversations
2. Browse the list of past conversations
3. Click on any conversation to view details

#### Conversation Details

- **Session ID** — Unique identifier
- **Agent Used** — Which agent handled the chat
- **Messages** — Full conversation history
- **Timestamp** — When the conversation occurred
- **Channel** — Website widget or WhatsApp

### 3.6 Deploying the Chat Widget

#### Widget Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| `data-agent-id` | Your agent's unique ID | `"abc123"` |
| `data-position` | Widget position | `"bottom-right"`, `"bottom-left"` |
| `data-color` | Primary color | `"#4F46E5"` |
| `data-name` | Agent display name | `"Sarah"` |
| `data-greeting` | Welcome message | `"Hi! How can I help?"` |

#### Basic Installation

```html
<script
  src="https://your-url.com/widget.js"
  data-agent-id="YOUR_AGENT_ID"
></script>
```

#### Full Customization

```html
<script
  src="https://your-url.com/widget.js"
  data-agent-id="YOUR_AGENT_ID"
  data-position="bottom-right"
  data-color="#10B981"
  data-name="Alex"
  data-greeting="Welcome! I'm here to help you find what you need."
></script>
```

#### Platform-Specific Instructions

**WordPress:**
1. Go to Appearance → Theme Editor
2. Open footer.php
3. Paste the widget code before `</body>`
4. Save changes

**Shopify:**
1. Go to Online Store → Themes
2. Click "Edit Code"
3. Open theme.liquid
4. Paste before `</body>`

**Wix:**
1. Go to Settings → Custom Code
2. Add new code snippet
3. Paste widget code
4. Set placement to "Body - End"

**Squarespace:**
1. Go to Settings → Advanced → Code Injection
2. Add to Footer section
3. Save changes

---

## 4. WhatsApp AI Agent

### 4.1 Overview

Connect your AI agent to WhatsApp Business to serve customers on the world's most popular messaging platform.

### 4.2 Requirements

Before setting up WhatsApp integration, you need:

- ✅ WhatsApp Business Account (WABA)
- ✅ Verified Facebook Business Manager
- ✅ At least one registered phone number
- ✅ Paid AgentForge plan (Starter or above)

### 4.3 Supported Providers (BSP)

AgentForge works with major WhatsApp Business Solution Providers:

| Provider | Description |
|----------|-------------|
| **360dialog** | Popular EU-based provider |
| **Twilio** | Developer-friendly with global reach |
| **MessageBird** | European communications platform |
| **Vonage** | Enterprise-grade messaging |
| **Meta Direct** | Direct Meta API access |

### 4.4 Setup Steps

#### Step 1: Connect WhatsApp Business Account

1. Go to Dashboard → WhatsApp Accounts
2. Click "Connect New Account"
3. Enter your provider details:
   - Account ID
   - API Key
   - Provider type
4. Click "Verify & Connect"

#### Step 2: Register Phone Numbers

1. Go to Dashboard → Phone Numbers
2. Click "Add Phone Number"
3. Enter:
   - Phone number (with country code)
   - Display name
   - Select WhatsApp account
4. Verify the number
5. Click "Register"

#### Step 3: Assign Agent to Phone Number

1. Go to Dashboard → Agents
2. Select or create a WhatsApp agent
3. In agent settings, link to your phone number
4. Save changes

#### Step 4: Configure Webhook

AgentForge handles incoming messages via webhooks:

```
Webhook URL: https://your-url.com/api/whatsapp/webhook
Verify Token: [Provided in dashboard]
```

### 4.5 Message Types Supported

| Type | Description | Example |
|------|-------------|---------|
| **Text** | Plain text messages | "Hello, I have a question" |
| **Image** | Photos sent by customers | Product photos |
| **Document** | PDF, Word files | Order confirmations |
| **Location** | GPS coordinates | For local services |
| **Contacts** | vCard sharing | Customer details |
| **Interactive** | Buttons and lists | Quick replies |

### 4.6 AI Capabilities

Your WhatsApp agent can:

| Capability | Description |
|------------|-------------|
| **Answer Questions** | Respond using knowledge base |
| **Detect Intent** | Understand customer purpose |
| **Extract Information** | Pull names, dates, emails from messages |
| **Book Appointments** | Schedule meetings (with calendar integration) |
| **Capture Leads** | Collect contact details |
| **Hand Off to Human** | Transfer complex cases to support team |

### 4.7 Intent Detection

The AI automatically detects what customers want:

| Intent | Examples | AI Action |
|--------|----------|-----------|
| `greeting` | "Hi", "Hello" | Send welcome message |
| `ask_question` | "What are your hours?" | Search knowledge base |
| `book_appointment` | "I want to schedule a visit" | Start booking flow |
| `talk_to_human` | "I need a real person" | Transfer to support |
| `goodbye` | "Thanks, bye" | Send farewell message |
| `complaint` | "This is unacceptable" | Escalate with empathy |

### 4.8 Message Templates

WhatsApp requires pre-approved templates for outbound messages.

#### Creating a Template

1. Go to Dashboard → Templates
2. Click "New Template"
3. Fill in:
   - Template name
   - Language
   - Category (marketing, utility, authentication)
   - Message body with variables
4. Submit for approval

#### Template Variables

```
Hello {{1}},

Your order {{2}} has been shipped!
Tracking number: {{3}}

Thank you for shopping with us.
```

### 4.9 Conversation Flow Example

```
Customer: Hi, I'm interested in your services

AI Agent: Hello! 👋 Welcome to [Business Name]. I'm here to help!
What would you like to know about?
• Our services
• Pricing
• Book a consultation

Customer: What are your prices?

AI Agent: Great question! Here's our pricing:
📦 Basic Plan: $29/month
⭐ Pro Plan: $79/month
🏢 Enterprise: Custom pricing

Would you like more details on any plan?

Customer: I want to talk to someone

AI Agent: Of course! I'll connect you with our team right away.
A support agent will be with you shortly. 
Is there anything specific you'd like them to help with?
```

### 4.10 Error Handling

| Error | Meaning | Solution |
|-------|---------|----------|
| **Invalid Token** | API credentials expired | Reconnect WhatsApp account |
| **Rate Limited** | Too many messages sent | Slow down sending rate |
| **Template Rejected** | Template not approved | Edit and resubmit template |
| **Number Not Registered** | Phone not verified | Complete verification |

---

## 5. Admin Guide

### 5.1 User Management

Currently, AgentForge operates on a single-user account model. Each account has:
- One owner
- Full access to all features based on subscription

**Enterprise plans** may include team member support (contact sales).

### 5.2 Monitoring Agents

#### Analytics Dashboard

Track your agents' performance:

| Metric | Description |
|--------|-------------|
| **Total Conversations** | All chats across agents |
| **Unique Visitors** | Individual users |
| **Response Rate** | Percentage of questions answered |
| **Avg Response Time** | How fast the AI responds |

#### Per-Agent Statistics

View individual agent performance:
- Number of conversations handled
- Most common questions asked
- Success/failure rates

### 5.3 Billing & Subscriptions

#### Viewing Your Plan

1. Go to Dashboard → Billing
2. See current plan and usage

#### Usage Tracking

```
Messages Used: 450 / 1,000
[████████████░░░░░░░░] 45%
```

#### Upgrading Your Plan

1. Go to Dashboard → Billing
2. Click "Upgrade Plan"
3. Select new plan
4. Complete checkout via Stripe
5. New limits apply immediately

#### Managing Subscription

- **Upgrade** — Higher tier, instant effect
- **Downgrade** — Takes effect next billing cycle
- **Cancel** — Access continues until period ends

### 5.4 Subscription Plans

| Plan | Price | Messages | Agents | WhatsApp |
|------|-------|----------|--------|----------|
| **Free** | $0/month | 20 | 1 | ❌ |
| **Starter** | $29/month | 1,000 | 3 | 1 number |
| **Pro** | $79/month | 5,000 | 10 | 3 numbers |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited |

### 5.5 Viewing Logs & Activity

#### Conversation Logs

1. Go to Dashboard → Conversations
2. Filter by:
   - Agent
   - Date range
   - Channel (website/WhatsApp)
3. Export if needed

#### Webhook Events (WhatsApp)

Technical logs for WhatsApp messages are available through your BSP's dashboard.

### 5.6 Security Best Practices

| Practice | Description |
|----------|-------------|
| **Strong Password** | Use 12+ characters with mixed case, numbers, symbols |
| **Secure API Keys** | Never share or expose your API credentials |
| **Regular Reviews** | Periodically review agent responses for accuracy |
| **Update Content** | Re-scan website when content changes |

---

## 6. Frequently Asked Questions

### Getting Started

**Q: How long does it take to set up an agent?**  
A: Most users have a working agent in under 10 minutes. Scanning a typical website takes 2-5 minutes.

**Q: Do I need technical skills?**  
A: No coding or technical knowledge required. The entire process is point-and-click.

**Q: Can I try before buying?**  
A: Yes! The Free plan includes 20 messages per month forever. Paid plans have a 14-day free trial.

### Agents & Chatbots

**Q: How many agents can I create?**  
A: Depends on your plan — Free allows 1 agent, Starter allows 3, Pro allows 10, Enterprise is unlimited.

**Q: Can I use multiple agents on one website?**  
A: Yes, but typically one agent per page or section works best.

**Q: What languages does the AI support?**  
A: The AI can understand and respond in most major languages, including English, Spanish, French, German, Portuguese, Hindi, and more.

**Q: How accurate is the AI?**  
A: Accuracy depends on your knowledge base quality. Well-scanned websites with clear content yield 90%+ accuracy.

### Website Scanning

**Q: Can it scan password-protected pages?**  
A: No, the scanner can only access publicly available pages.

**Q: How often should I re-scan?**  
A: Re-scan whenever you make significant content updates to your website.

**Q: Why are some pages not scanned?**  
A: Some pages may be blocked by robots.txt, require JavaScript rendering, or have anti-bot protection.

### Billing & Pricing

**Q: What counts as a "message"?**  
A: Only AI-generated responses count. Customer messages are free.

**Q: What happens if I exceed my limit?**  
A: You'll receive a warning. You can either upgrade or purchase additional messages.

**Q: Can I get a refund?**  
A: Yes, we offer a 14-day money-back guarantee on all paid plans.

**Q: Is there a yearly discount?**  
A: Yes, annual billing saves 20% compared to monthly.

### WhatsApp

**Q: Do I need a special WhatsApp account?**  
A: Yes, you need a WhatsApp Business Account (WABA), not a regular WhatsApp.

**Q: Can I use my personal phone number?**  
A: No, WhatsApp Business requires a dedicated business phone number.

**Q: How do I get a WhatsApp Business Account?**  
A: Apply through Facebook Business Manager or use a BSP like 360dialog or Twilio.

### Technical

**Q: Is my data secure?**  
A: Yes, all data is encrypted in transit and at rest. We never share or use your content for AI training.

**Q: Does the widget slow down my website?**  
A: No, the widget loads asynchronously and has minimal impact (<50KB).

**Q: Can I customize the widget appearance?**  
A: Yes, you can change colors, position, greeting message, and agent name.

---

## 7. Best Practices

### 7.1 Creating Effective Agents

| Do | Don't |
|----|-------|
| ✅ Give agents clear, specific names | ❌ Use generic names like "Bot 1" |
| ✅ Define a consistent personality | ❌ Switch between formal and casual |
| ✅ Test thoroughly before deploying | ❌ Deploy without testing |
| ✅ Update knowledge regularly | ❌ Let information become outdated |

### 7.2 Website Scanning Tips

1. **Clean Your Content First**
   - Remove duplicate pages
   - Fix broken links
   - Update outdated information

2. **Structure Content Well**
   - Use clear headings (H1, H2, H3)
   - Break content into logical sections
   - Include a comprehensive FAQ page

3. **Re-scan Regularly**
   - After major website updates
   - Monthly for active sites
   - Quarterly for stable sites

### 7.3 Optimizing AI Responses

**DO:**
- Keep knowledge base entries focused and specific
- Include common variations of questions
- Add FAQ content if not on website
- Remove contradictory information

**DON'T:**
- Overload with irrelevant content
- Include promotional fluff
- Leave outdated information
- Add competitor mentions

### 7.4 WhatsApp Best Practices

1. **Response Time**
   - Reply within 24 hours (WhatsApp policy)
   - Set expectations if human handoff is delayed

2. **Message Quality**
   - Keep messages concise
   - Use emojis sparingly but effectively
   - Break long responses into multiple messages

3. **Templates**
   - Pre-approve all necessary templates
   - Have templates ready for common scenarios
   - Test templates before production use

4. **Handoff Process**
   - Train your team on the handoff queue
   - Set clear escalation criteria
   - Follow up on transferred conversations

### 7.5 Maximizing ROI

| Strategy | Impact |
|----------|--------|
| Prominent widget placement | +30% engagement |
| Custom welcome message | +25% conversations |
| Regular knowledge updates | +40% accuracy |
| Mobile-optimized responses | +20% satisfaction |

---

## 8. Glossary

| Term | Definition |
|------|------------|
| **Agent** | An AI-powered chatbot configured to respond based on your content |
| **BSP** | Business Solution Provider — A company authorized to provide WhatsApp Business API access |
| **Conversation** | A complete chat session between a visitor and your agent |
| **Embed Code** | HTML/JavaScript snippet to add the chat widget to your website |
| **Handoff** | Transferring a conversation from AI to a human support agent |
| **Intent** | The detected purpose or goal behind a user's message |
| **Knowledge Base** | The collection of content your agent uses to answer questions |
| **Message** | A single AI-generated response (counted against your plan limit) |
| **RAG** | Retrieval Augmented Generation — AI technique that retrieves relevant content before generating responses |
| **Session** | A unique identifier for a visitor's chat interaction |
| **Template** | Pre-approved message format required for outbound WhatsApp messages |
| **WABA** | WhatsApp Business Account — Required for WhatsApp API integration |
| **Webhook** | A URL that receives real-time notifications when events occur (like incoming messages) |
| **Widget** | The chat bubble/interface that appears on your website |

---

## Need Help?

- 📧 **Email:** support@agentforge.com
- 💬 **Live Chat:** Available on our website
- 📚 **Help Center:** docs.agentforge.com
- 🐦 **Twitter:** @AgentForge

---

*© 2025 AgentForge. All rights reserved.*
