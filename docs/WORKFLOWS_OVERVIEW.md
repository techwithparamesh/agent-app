# How Workflows Work

> A complete guide to understanding and building automation workflows in AgentForge

---

## Table of Contents

1. [What is a Workflow?](#what-is-a-workflow)
2. [Core Concepts](#core-concepts)
3. [Workflow Components](#workflow-components)
4. [How Execution Works](#how-execution-works)
5. [Building Your First Workflow](#building-your-first-workflow)
6. [Using Variables and Expressions](#using-variables-and-expressions)
7. [Testing and Debugging](#testing-and-debugging)
8. [Best Practices](#best-practices)
9. [Common Workflow Patterns](#common-workflow-patterns)

---

## What is a Workflow?

A **workflow** is an automated sequence of actions that executes when a specific event (trigger) occurs. Think of it as a recipe:

- **Trigger** = When to start cooking (e.g., "When an order comes in")
- **Actions** = Steps to follow (e.g., "Send confirmation email", "Update spreadsheet")
- **Connections** = The order of steps

### Real-World Example

```
When a customer fills out your contact form (Trigger: Webhook)
    ↓
Extract their name and question (Data Processing)
    ↓
Generate AI response using GPT-4 (Action: OpenAI)
    ↓
Send response via email (Action: Gmail)
    ↓
Log lead to Google Sheets (Action: Google Sheets)
    ↓
Notify your team on Slack (Action: Slack)
```

**Result:** Customer gets instant AI-powered response, you get the lead in your spreadsheet, and your team is notified—all automatically, 24/7.

---

## Core Concepts

### 1. Nodes

Nodes are the building blocks of workflows. Each node represents either a **trigger** (starting point) or an **action** (task to perform).

| Node Type | Description | Example |
|-----------|-------------|---------|
| **Trigger** | Starts the workflow when an event occurs | Webhook receives data, Schedule runs at 9 AM |
| **Action** | Performs a specific task | Send email, Create Slack message, Call API |
| **Logic** | Controls flow based on conditions | If/Else, Switch, Loop |

### 2. Connections (Edges)

Connections link nodes together and define the execution order. Data flows from left to right, from triggers through actions.

```
[Trigger] ──→ [Action 1] ──→ [Action 2] ──→ [Action 3]
```

### 3. Credentials

Credentials securely store your API keys, tokens, and passwords. Instead of entering your OpenAI API key in every node, you create one credential and reference it.

**Benefits:**
- Encrypted storage
- Easy updates (change once, applies everywhere)
- Team sharing without exposing secrets

### 4. Execution Context

When a workflow runs, it creates an **execution context** containing:

- `trigger` - Data from the trigger event
- `nodes` - Output from each completed node
- `variables` - Custom variables you've set

This context allows later nodes to access data from earlier nodes.

---

## Workflow Components

### Triggers (Starting Points)

Every workflow starts with exactly **one trigger**. The trigger determines when and how the workflow executes.

#### Webhook Trigger
**When to use:** Real-time events from external systems (form submissions, API calls, payment notifications)

```
Webhook URL: https://your-app.com/api/webhooks/abc123
↓
Receives: { "name": "John", "email": "john@example.com", "message": "Hi!" }
↓
Workflow starts immediately
```

#### Schedule Trigger
**When to use:** Time-based automation (daily reports, weekly cleanup, hourly checks)

```
Cron: 0 9 * * 1-5  (Every weekday at 9 AM)
↓
Workflow runs automatically
```

#### Manual Trigger
**When to use:** Testing, on-demand workflows, admin tasks

```
Click "Test" button
↓
Workflow runs with test data
```

#### App-Specific Triggers
Some integrations have their own triggers:

| App | Triggers |
|-----|----------|
| WhatsApp | Message Received, Status Update |
| Telegram | New Message, Command Received |
| Stripe | Payment Received, Subscription Created |
| GitHub | Push, Pull Request, Issue Created |

### Actions (Tasks)

Actions are tasks your workflow performs. Each action:
- Receives input from previous nodes or trigger
- Performs an operation (API call, data processing, etc.)
- Outputs data for subsequent nodes

#### Example Action Flow

```javascript
// Input to OpenAI action
{
  model: "gpt-4o-mini",
  userMessage: "Summarize: {{trigger.customer_question}}",
  systemPrompt: "You are a helpful assistant",
  temperature: 0.7
}

// Output from OpenAI action
{
  model: "gpt-4o-mini",
  text: "Based on your question about pricing, our plans start at...",
  raw: { /* full API response */ }
}
```

### Logic Nodes

Control workflow execution flow:

#### If Condition
Branch workflow based on conditions:

```
If {{trigger.orderTotal}} > 100
  ├── True → Send VIP discount email
  └── False → Send standard thank you email
```

#### Switch
Multiple branches based on value:

```
Switch on {{trigger.department}}
  ├── "sales" → Route to Sales Slack channel
  ├── "support" → Create Zendesk ticket
  └── default → Send to general inbox
```

#### Loop
Process multiple items:

```
For each item in {{trigger.products}}
  → Generate product description using AI
  → Upload to Shopify
```

#### Set Variable
Store computed values for later use:

```
Set {{variables.fullName}} = "{{trigger.firstName}} {{trigger.lastName}}"
```

---

## How Execution Works

### Execution Flow

1. **Trigger fires** → Workflow receives trigger data
2. **Context created** → `{ trigger: {...}, nodes: {}, variables: {} }`
3. **Nodes execute** → In topological order (respecting connections)
4. **Data flows** → Each node's output added to context
5. **Actions perform** → API calls, database operations, etc.
6. **Execution completes** → Success or error recorded

### Data Flow Example

```
Step 1: Webhook Trigger
  Output: { name: "Alice", email: "alice@example.com", question: "What's the price?" }
  Context: { trigger: { name: "Alice", email: "...", question: "..." } }

Step 2: OpenAI Chat Completion
  Input: "Answer this: {{trigger.question}}"
  Output: { text: "Our pricing starts at $29/month..." }
  Context: { trigger: {...}, nodes: { openai_1: { text: "Our pricing..." } } }

Step 3: Gmail Send Email
  Input: To: {{trigger.email}}, Body: {{nodes.openai_1.text}}
  Output: { messageId: "abc123", status: "sent" }
  Context: { trigger: {...}, nodes: { openai_1: {...}, gmail_1: {...} } }
```

### Execution States

| State | Description |
|-------|-------------|
| **Pending** | Workflow queued, waiting to start |
| **Running** | Currently executing |
| **Success** | All nodes completed successfully |
| **Error** | One or more nodes failed |
| **Partial** | Some nodes succeeded, some failed |

---

## Building Your First Workflow

### Step 1: Open the Flow Builder

1. Navigate to **Dashboard → Integrations**
2. Click **"Open Flow Builder"**
3. You'll see an empty canvas with "Add first step"

### Step 2: Add a Trigger

1. Click the **"+"** or **"Add first step"** button
2. Select **"Webhook"** as your trigger
3. The webhook node appears on the canvas
4. Copy your webhook URL for testing

### Step 3: Add Your First Action

1. Click the **"+"** button on the right side of the trigger node
2. Browse or search for **"OpenAI"**
3. Click to add the OpenAI node
4. A connection line automatically appears

### Step 4: Configure the Action

1. Double-click the OpenAI node to open configuration
2. **Select Credential:** Choose or create an OpenAI credential
3. **Select Action:** "Chat Completion (GPT)"
4. **Configure Fields:**
   - Model: `gpt-4o-mini`
   - User Message: `Respond to: {{trigger.message}}`
   - System Prompt: `You are a helpful assistant`

### Step 5: Add More Actions (Optional)

Repeat Step 3-4 to add:
- **Gmail** → Send the AI response via email
- **Slack** → Notify your team
- **Google Sheets** → Log the interaction

### Step 6: Save and Test

1. Click **"Save"** to save your workflow
2. Give it a name like "Customer Support Bot"
3. Click **"Test"** to run with sample data
4. View execution results in the Executions tab

### Step 7: Activate

1. Toggle the workflow to **"Active"**
2. Your workflow now runs automatically when the trigger fires

---

## Using Variables and Expressions

### Expression Syntax

Use double curly braces `{{ }}` to reference data:

```
{{trigger.fieldName}}          → Data from trigger
{{nodes.nodeId.fieldName}}     → Data from a previous node
{{variables.variableName}}     → Custom variables
```

### Examples

#### Accessing Trigger Data
```
// Trigger receives: { name: "John", email: "john@example.com" }

{{trigger.name}}        → "John"
{{trigger.email}}       → "john@example.com"
```

#### Accessing Node Output
```
// OpenAI node (ID: openai_1) outputs: { text: "Hello!" }

{{nodes.openai_1.text}}  → "Hello!"
{{openai_1.text}}        → "Hello!" (shorthand)
```

#### Nested Data
```
// Trigger receives: { user: { profile: { name: "Jane" } } }

{{trigger.user.profile.name}}  → "Jane"
```

### String Interpolation

Combine static text with expressions:

```
"Hello {{trigger.name}}, your order #{{trigger.orderId}} is confirmed!"
```

Result: `"Hello John, your order #12345 is confirmed!"`

---

## Testing and Debugging

### Test Mode

1. Click **"Test"** button in the workflow header
2. Enter sample trigger data (JSON format)
3. Click **"Run Test"**
4. Watch nodes execute in real-time
5. Click any node to see its input/output

### Viewing Executions

1. Click the **"Executions"** tab
2. See all workflow runs with status
3. Click any execution to view details:
   - Trigger data received
   - Each node's input and output
   - Error messages (if any)
   - Execution duration

### Common Debugging Tips

| Issue | How to Debug |
|-------|--------------|
| Node shows "Error" | Check the error message in execution details |
| Wrong data in action | Verify expression syntax: `{{trigger.field}}` |
| Workflow not triggering | Check trigger is active and URL is correct |
| Credential error | Re-verify credential in Integrations settings |
| Missing output | Ensure previous node completed successfully |

### Test Data Template

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "message": "Hello, I have a question about pricing.",
  "orderId": "12345",
  "amount": 99.99
}
```

---

## Best Practices

### 1. Start Simple
Begin with 2-3 nodes. Add complexity gradually after testing.

### 2. Name Your Nodes
Give descriptive names: "Generate AI Response" instead of "OpenAI 1"

### 3. Handle Errors
Use If Condition to check for errors before proceeding:
```
If {{nodes.api_call.error}} exists
  → Send error notification
  → Log error
Else
  → Continue normal flow
```

### 4. Use Variables for Reusability
Instead of repeating `{{trigger.firstName}} {{trigger.lastName}}`:
```
Set {{variables.fullName}} = "{{trigger.firstName}} {{trigger.lastName}}"
```
Then use `{{variables.fullName}}` everywhere.

### 5. Test with Real-ish Data
Use realistic test data that matches production scenarios.

### 6. Monitor Executions
Regularly check the Executions tab for failures.

### 7. Document Your Workflows
Add notes explaining what complex workflows do.

### 8. Credential Security
- Never hardcode API keys in expressions
- Use credentials for all sensitive data
- Rotate keys periodically

---

## Common Workflow Patterns

### Pattern 1: Customer Support Bot

```
Webhook (receives customer message)
    ↓
OpenAI (generate helpful response)
    ↓
Gmail (send response to customer)
    ↓
Google Sheets (log interaction)
```

### Pattern 2: Lead Qualification

```
Webhook (form submission)
    ↓
If Condition (check if business email)
    ├── True → HubSpot (create qualified lead)
    │           ↓
    │           Slack (notify sales team)
    └── False → Mailchimp (add to nurture list)
```

### Pattern 3: Order Processing

```
Stripe Webhook (payment received)
    ↓
Shopify (fulfill order)
    ↓
WhatsApp (send confirmation to customer)
    ↓
Google Sheets (update sales tracker)
    ↓
Slack (notify warehouse team)
```

### Pattern 4: Content Generation

```
Schedule (every Monday 9 AM)
    ↓
OpenAI (generate weekly newsletter content)
    ↓
OpenAI (generate image for newsletter)
    ↓
Mailchimp (create and schedule campaign)
```

### Pattern 5: Data Sync

```
Schedule (every hour)
    ↓
REST API (fetch new orders from legacy system)
    ↓
Loop (for each order)
    ↓
Airtable (create/update record)
```

---

## What's Next?

Now that you understand how workflows work:

1. **[WhatsApp Integration Guide](./WHATSAPP_GUIDE.md)** - Send messages via WhatsApp
2. **[OpenAI Integration Guide](./OPENAI_GUIDE.md)** - Add AI to your workflows
3. **[Webhook Setup Guide](./WEBHOOK_GUIDE.md)** - Connect external apps
4. **[Google Sheets Guide](./GOOGLE_SHEETS_GUIDE.md)** - Log data to spreadsheets

---

## Quick Reference Card

### Expression Cheatsheet

| Expression | Description |
|------------|-------------|
| `{{trigger.field}}` | Access trigger data |
| `{{nodes.nodeId.field}}` | Access node output |
| `{{variables.name}}` | Access custom variable |
| `{{trigger.nested.field}}` | Access nested data |

### Node Types

| Type | Icon | Purpose |
|------|------|---------|
| Trigger | ⚡ | Starts workflow |
| Action | ▶️ | Performs task |
| If/Else | 🔀 | Conditional branching |
| Switch | 🔀 | Multi-way branching |
| Loop | 🔁 | Iterate over items |
| Set Variable | 📝 | Store computed values |

### Trigger Types

| Trigger | Fires When |
|---------|------------|
| Webhook | HTTP request received |
| Schedule | At specified time/interval |
| Manual | User clicks "Test" |
| App Event | Specific app event occurs |

---

*Documentation version: 1.0 | Last updated: December 2024*
