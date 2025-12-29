# 📊 Google Suite & Marketing Apps Guide

> **Complete documentation for Google Workspace and marketing integrations.** Learn how to automate Google Sheets, Calendar, Docs, Gmail, and marketing platforms like SendGrid, Mailchimp, and social media.

---

## 📋 Table of Contents

### Google Suite
1. [Google Sheets](#google-sheets)
2. [Gmail](#gmail)
3. [Google Calendar](#google-calendar)
4. [Google Docs](#google-docs)
5. [Google Meet](#google-meet)
6. [Google Forms](#google-forms)
7. [Google Analytics](#google-analytics)

### Marketing & Email
8. [SendGrid](#sendgrid)
9. [Mailchimp](#mailchimp)
10. [Mailgun](#mailgun)
11. [SMTP](#smtp)
12. [Outlook](#outlook)

---

# 📊 Google Suite

## 📗 Google Sheets

### Overview
Automate spreadsheet operations - append rows, update data, search records, and build data pipelines.

### Prerequisites
- Google Account
- OAuth credentials with Sheets API scope

### Connection Setup

1. **Enable Sheets API**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable **Google Sheets API**
   - Create OAuth 2.0 credentials

2. **Share Spreadsheet**
   - If using service account, share the spreadsheet with the service account email

---

### Actions Reference

#### ➕ Append Row
Add a new row to the end of a sheet.

| Field | Required | Description |
|-------|----------|-------------|
| `spreadsheetId` | ✅ Yes | Spreadsheet ID (from URL) |
| `range` | ✅ Yes | Sheet name (e.g., `Sheet1`) |
| `values` | ✅ Yes | Array of values for the row |

**Example:**
```json
{
  "spreadsheetId": "1ABC123xyz...",
  "range": "Leads",
  "values": ["John Doe", "john@example.com", "2024-01-15", "Premium"]
}
```

**Output:**
```json
{
  "ok": true,
  "updatedRange": "Leads!A5:D5",
  "updatedRows": 1
}
```

#### ✏️ Update Row
Update a specific row or range.

| Field | Required | Description |
|-------|----------|-------------|
| `spreadsheetId` | ✅ Yes | Spreadsheet ID |
| `range` | ✅ Yes | Range to update (e.g., `Sheet1!A5:D5`) |
| `values` | ✅ Yes | New values |

**Example:**
```json
{
  "spreadsheetId": "1ABC123xyz...",
  "range": "Leads!A5:D5",
  "values": ["John Doe", "john@newmail.com", "2024-01-15", "Enterprise"]
}
```

#### 📖 Get Rows
Read rows from a range.

| Field | Required | Description |
|-------|----------|-------------|
| `spreadsheetId` | ✅ Yes | Spreadsheet ID |
| `range` | ✅ Yes | Range to read |

**Example:**
```json
{
  "spreadsheetId": "1ABC123xyz...",
  "range": "Leads!A1:D100"
}
```

**Output:**
```json
{
  "ok": true,
  "values": [
    ["Name", "Email", "Date", "Plan"],
    ["John Doe", "john@example.com", "2024-01-15", "Premium"],
    ["Jane Smith", "jane@example.com", "2024-01-16", "Basic"]
  ]
}
```

#### 🔍 Find Row
Search for a row by value.

| Field | Required | Description |
|-------|----------|-------------|
| `spreadsheetId` | ✅ Yes | Spreadsheet ID |
| `range` | ✅ Yes | Range to search |
| `searchValue` | ✅ Yes | Value to find |
| `searchColumn` | No | Column index (0-based) |

#### 🗑️ Delete Row
Delete a row by index.

| Field | Required | Description |
|-------|----------|-------------|
| `spreadsheetId` | ✅ Yes | Spreadsheet ID |
| `sheetId` | ✅ Yes | Sheet ID (not name) |
| `rowIndex` | ✅ Yes | Row index (0-based) |

#### 🧹 Clear Range
Clear contents of a range.

| Field | Required | Description |
|-------|----------|-------------|
| `spreadsheetId` | ✅ Yes | Spreadsheet ID |
| `range` | ✅ Yes | Range to clear |

---

### Example Workflows

**1. Form Submission → Sheet**
```
Trigger: Webhook (form submission)
  ↓
Google Sheets: Append Row
  - range: "Submissions"
  - values: [{{form.name}}, {{form.email}}, {{timestamp}}]
```

**2. CRM Sync**
```
Trigger: HubSpot Contact Created
  ↓
Google Sheets: Find Row
  - searchValue: {{contact.email}}
  ↓
If Condition: row not found
  ↓
Google Sheets: Append Row
  - values: [{{contact.name}}, {{contact.email}}, {{contact.company}}]
```

---

## 📧 Gmail

### Overview
Send emails, manage inbox, and automate email workflows with Gmail.

### Prerequisites
- Google Account
- OAuth credentials with Gmail API scope

---

### Actions Reference

#### 📤 Send Email
Send a plain text or HTML email.

| Field | Required | Description |
|-------|----------|-------------|
| `to` | ✅ Yes | Recipient email |
| `subject` | ✅ Yes | Email subject |
| `body` | ✅ Yes | Email body |
| `cc` | No | CC recipients |
| `bcc` | No | BCC recipients |
| `attachments` | No | Array of attachment URLs |

**Example:**
```json
{
  "to": "customer@example.com",
  "subject": "Your Order Confirmation #12345",
  "body": "Thank you for your order! Your items will ship within 2 days.",
  "cc": "sales@company.com"
}
```

#### 📤 Send HTML Email
Send a rich HTML email.

| Field | Required | Description |
|-------|----------|-------------|
| `to` | ✅ Yes | Recipient email |
| `subject` | ✅ Yes | Email subject |
| `htmlBody` | ✅ Yes | HTML content |
| `attachments` | No | Attachment URLs |

#### ↩️ Reply to Thread
Reply to an existing email thread.

| Field | Required | Description |
|-------|----------|-------------|
| `threadId` | ✅ Yes | Thread ID |
| `body` | ✅ Yes | Reply body |

---

## 📅 Google Calendar

### Overview
Create, update, and manage calendar events programmatically.

### Actions Reference

#### ➕ Create Event
Create a new calendar event.

| Field | Required | Description |
|-------|----------|-------------|
| `calendarId` | No | Calendar ID (default: primary) |
| `summary` | ✅ Yes | Event title |
| `description` | No | Event description |
| `location` | No | Event location |
| `start` | ✅ Yes | Start datetime (ISO) |
| `end` | ✅ Yes | End datetime (ISO) |
| `attendees` | No | Array of attendee emails |
| `reminders` | No | Reminder settings |

**Example:**
```json
{
  "summary": "Team Standup",
  "description": "Daily sync meeting",
  "start": "2024-01-15T09:00:00-05:00",
  "end": "2024-01-15T09:30:00-05:00",
  "attendees": ["team@company.com"],
  "reminders": {
    "useDefault": false,
    "overrides": [{"method": "email", "minutes": 30}]
  }
}
```

#### ✏️ Update Event
Update an existing event.

| Field | Required | Description |
|-------|----------|-------------|
| `calendarId` | No | Calendar ID |
| `eventId` | ✅ Yes | Event ID |
| `summary` | No | New title |
| `start` | No | New start time |
| `end` | No | New end time |

#### 🗑️ Delete Event
Delete a calendar event.

| Field | Required | Description |
|-------|----------|-------------|
| `calendarId` | No | Calendar ID |
| `eventId` | ✅ Yes | Event ID |

#### 📋 List Events
Get events in a time range.

| Field | Required | Description |
|-------|----------|-------------|
| `calendarId` | No | Calendar ID |
| `timeMin` | No | Start of range (ISO) |
| `timeMax` | No | End of range (ISO) |
| `maxResults` | No | Max events |

---

## 📄 Google Docs

### Overview
Create and edit documents programmatically.

### Actions Reference

#### ➕ Create Document
Create a new document.

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ Yes | Document title |

#### ✏️ Update Document
Update document content.

| Field | Required | Description |
|-------|----------|-------------|
| `documentId` | ✅ Yes | Document ID |
| `requests` | ✅ Yes | Array of update requests |

#### ➕ Append Text
Add text to a document.

| Field | Required | Description |
|-------|----------|-------------|
| `documentId` | ✅ Yes | Document ID |
| `text` | ✅ Yes | Text to append |

---

## 🎥 Google Meet

### Overview
Create and manage video meetings.

### Actions Reference

#### ➕ Create Meeting
Create a new meeting.

| Field | Required | Description |
|-------|----------|-------------|
| `summary` | ✅ Yes | Meeting title |
| `start` | ✅ Yes | Start time |
| `end` | ✅ Yes | End time |
| `attendees` | No | Attendee emails |

**Output:**
```json
{
  "ok": true,
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "eventId": "..."
}
```

#### 🔍 Get Meeting
Get meeting details.

| Field | Required | Description |
|-------|----------|-------------|
| `meetingId` | ✅ Yes | Meeting ID |

---

## 📝 Google Forms

### Overview
Retrieve form responses and manage forms.

### Actions Reference

#### 📋 Get Responses
Get form responses.

| Field | Required | Description |
|-------|----------|-------------|
| `formId` | ✅ Yes | Form ID |

---

## 📈 Google Analytics

### Overview
Retrieve analytics data and reports.

### Actions Reference

#### 📊 Get Report
Get an analytics report.

| Field | Required | Description |
|-------|----------|-------------|
| `propertyId` | ✅ Yes | GA4 property ID |
| `startDate` | ✅ Yes | Report start date |
| `endDate` | ✅ Yes | Report end date |
| `metrics` | ✅ Yes | Metrics to retrieve |
| `dimensions` | No | Dimensions to group by |

---

# 📧 Marketing & Email

## 📬 SendGrid

### Overview
Email delivery platform for transactional and marketing emails.

### Prerequisites
- SendGrid Account
- API Key (from Settings → API Keys)

---

### Actions Reference

#### 📤 Send Email
Send a single email.

| Field | Required | Description |
|-------|----------|-------------|
| `to` | ✅ Yes | Recipient email |
| `from` | ✅ Yes | Sender email (verified) |
| `subject` | ✅ Yes | Email subject |
| `textContent` | No | Plain text content |
| `htmlContent` | No | HTML content |
| `fromName` | No | Sender display name |
| `replyTo` | No | Reply-to email |
| `categories` | No | Email categories |

**Example:**
```json
{
  "to": "customer@example.com",
  "from": "noreply@company.com",
  "fromName": "Company Name",
  "subject": "Welcome to Our Platform!",
  "htmlContent": "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
  "categories": ["welcome", "onboarding"]
}
```

#### 📋 Send Template
Send using a dynamic template.

| Field | Required | Description |
|-------|----------|-------------|
| `to` | ✅ Yes | Recipient email |
| `from` | ✅ Yes | Sender email |
| `templateId` | ✅ Yes | Template ID |
| `dynamicData` | No | Template variables |

**Example:**
```json
{
  "to": "customer@example.com",
  "from": "noreply@company.com",
  "templateId": "d-abc123...",
  "dynamicData": {
    "name": "John",
    "orderNumber": "12345",
    "items": [
      {"name": "Widget", "price": "$29.99"}
    ]
  }
}
```

#### 👤 Add Contact
Add a contact to your list.

| Field | Required | Description |
|-------|----------|-------------|
| `email` | ✅ Yes | Contact email |
| `firstName` | No | First name |
| `lastName` | No | Last name |
| `listIds` | No | List IDs to add to |
| `customFields` | No | Custom field values |

---

## 🐵 Mailchimp

### Overview
Email marketing platform with audience management.

### Prerequisites
- Mailchimp Account
- API Key (from Account → Extras → API keys)

---

### Actions Reference

#### ➕ Add Subscriber
Add or update a subscriber.

| Field | Required | Description |
|-------|----------|-------------|
| `listId` | ✅ Yes | Audience/List ID |
| `email` | ✅ Yes | Email address |
| `status` | ✅ Yes | `subscribed`, `pending`, `unsubscribed` |
| `firstName` | No | First name (FNAME) |
| `lastName` | No | Last name (LNAME) |
| `mergeFields` | No | Additional merge fields |
| `tags` | No | Array of tags |

**Example:**
```json
{
  "listId": "abc123",
  "email": "john@example.com",
  "status": "subscribed",
  "firstName": "John",
  "lastName": "Doe",
  "tags": ["newsletter", "customer"]
}
```

#### ➖ Remove Subscriber
Remove a subscriber from a list.

| Field | Required | Description |
|-------|----------|-------------|
| `listId` | ✅ Yes | List ID |
| `email` | ✅ Yes | Email to remove |

#### 🏷️ Add Tag
Add tags to a subscriber.

| Field | Required | Description |
|-------|----------|-------------|
| `listId` | ✅ Yes | List ID |
| `email` | ✅ Yes | Email address |
| `tags` | ✅ Yes | Array of tag names |

#### 📧 Create Campaign
Create an email campaign.

| Field | Required | Description |
|-------|----------|-------------|
| `listId` | ✅ Yes | Target list ID |
| `subject` | ✅ Yes | Email subject |
| `fromName` | ✅ Yes | Sender name |
| `replyTo` | ✅ Yes | Reply-to email |
| `type` | No | Campaign type (default: regular) |

---

## 📨 Mailgun

### Overview
Email API service for sending and receiving emails.

### Actions Reference

#### 📤 Send Email
Send an email via Mailgun.

| Field | Required | Description |
|-------|----------|-------------|
| `to` | ✅ Yes | Recipient email |
| `from` | ✅ Yes | Sender email |
| `subject` | ✅ Yes | Email subject |
| `text` | No | Plain text body |
| `html` | No | HTML body |
| `attachments` | No | Attachment URLs |

---

## 📮 SMTP

### Overview
Send emails via any SMTP server.

### Connection Setup

| Field | Description |
|-------|-------------|
| `host` | SMTP server host |
| `port` | SMTP port (587, 465, 25) |
| `username` | SMTP username |
| `password` | SMTP password |
| `secure` | Use TLS |

### Actions Reference

#### 📤 Send Email
| Field | Required | Description |
|-------|----------|-------------|
| `to` | ✅ Yes | Recipient |
| `from` | ✅ Yes | Sender |
| `subject` | ✅ Yes | Subject |
| `text` | No | Plain text body |
| `html` | No | HTML body |

---

## 📨 Outlook

### Overview
Microsoft Outlook email and calendar integration.

### Actions Reference

#### 📤 Send Email
| Field | Required | Description |
|-------|----------|-------------|
| `to` | ✅ Yes | Recipients |
| `subject` | ✅ Yes | Subject |
| `body` | ✅ Yes | Email body |
| `isHtml` | No | HTML format |

#### 📋 List Emails
| Field | Required | Description |
|-------|----------|-------------|
| `folder` | No | Folder (default: inbox) |
| `top` | No | Max emails |
| `filter` | No | OData filter |

#### 📅 Create Event
| Field | Required | Description |
|-------|----------|-------------|
| `subject` | ✅ Yes | Event title |
| `start` | ✅ Yes | Start time |
| `end` | ✅ Yes | End time |
| `attendees` | No | Attendee emails |

---

## 💡 Best Practices

### Email Deliverability
- Verify sender domains
- Use consistent from addresses
- Include unsubscribe links
- Monitor bounce rates

### Google API Usage
- Use service accounts for server-side
- Cache access tokens
- Handle quota limits
- Use batch requests when possible

### Marketing Compliance
- Follow CAN-SPAM / GDPR
- Double opt-in for subscriptions
- Honor unsubscribe requests
- Keep lists clean

---

## 🔧 Troubleshooting

### Common Issues

**"Insufficient permissions"**
- Check OAuth scopes
- Re-authorize if needed
- Verify API is enabled

**"Email not delivered"**
- Check spam folders
- Verify sender domain
- Review bounce messages

**"Rate limit exceeded"**
- Implement rate limiting
- Use batch operations
- Cache API responses

---

## 📚 Related Docs
- [Communication Apps](./COMMUNICATION_APPS.md)
- [CRM Apps Guide](./CRM_APPS.md)
- [Workflow Examples](./WORKFLOWS_OVERVIEW.md)
