# 👥 CRM & Sales Apps Guide

> **Complete documentation for Customer Relationship Management integrations.** Learn how to manage contacts, deals, and customer data across HubSpot, Salesforce, Pipedrive, Zoho CRM, and more.

---

## 📋 Table of Contents

1. [HubSpot](#hubspot)
2. [HubSpot Marketing](#hubspot-marketing)
3. [Salesforce](#salesforce)
4. [Pipedrive](#pipedrive)
5. [Zoho CRM](#zoho-crm)
6. [Freshsales](#freshsales)
7. [Linear](#linear)

---

## 🟠 HubSpot

### Overview
HubSpot is an all-in-one CRM platform. Manage contacts, companies, deals, and notes with powerful automation capabilities.

### Prerequisites
- HubSpot Account (Free tier works)
- HubSpot Access Token or OAuth credentials

### Connection Setup

1. **Get API Access Token**
   - Go to HubSpot → **Settings** (⚙️)
   - Navigate to **Integrations** → **Private Apps**
   - Click **Create Private App**
   - Name your app
   - Go to **Scopes** tab and add:
     - `crm.objects.contacts.read`
     - `crm.objects.contacts.write`
     - `crm.objects.deals.read`
     - `crm.objects.deals.write`
     - `crm.objects.companies.write`
   - Click **Create App**
   - Copy the **Access Token**

2. **Add Credentials**
   - Go to **Settings → Credentials**
   - Click **Add Credential**
   - Select **HubSpot**
   - Paste your Access Token
   - Save

---

### Actions Reference

#### 👤 Create Contact
Create a new contact in HubSpot.

| Field | Required | Description |
|-------|----------|-------------|
| `email` | ✅ Yes | Contact email address |
| `firstname` | No | First name |
| `lastname` | No | Last name |
| `phone` | No | Phone number |
| `company` | No | Company name |
| `jobtitle` | No | Job title |
| `lifecyclestage` | No | `subscriber`, `lead`, `marketingqualifiedlead`, `salesqualifiedlead`, `opportunity`, `customer` |
| `customProperties` | No | JSON object with custom fields |

**Example:**
```json
{
  "email": "john.doe@example.com",
  "firstname": "John",
  "lastname": "Doe",
  "company": "Acme Corp",
  "lifecyclestage": "lead",
  "customProperties": {
    "source": "website_form"
  }
}
```

**Output:**
```json
{
  "ok": true,
  "contact": {
    "id": "123456",
    "properties": {
      "email": "john.doe@example.com",
      "firstname": "John",
      "lastname": "Doe"
    }
  }
}
```

#### ✏️ Update Contact
Update an existing contact's properties.

| Field | Required | Description |
|-------|----------|-------------|
| `contactId` | ✅ Yes | HubSpot contact ID |
| `properties` | ✅ Yes | JSON object with fields to update |

**Example:**
```json
{
  "contactId": "123456",
  "properties": {
    "phone": "+1234567890",
    "lifecyclestage": "customer"
  }
}
```

#### 🔍 Get Contact
Retrieve contact by ID or email.

| Field | Required | Description |
|-------|----------|-------------|
| `contactId` | ⚠️ One required | Contact ID |
| `email` | ⚠️ One required | Contact email |
| `properties` | No | Array of properties to fetch |

**Example:**
```json
{
  "email": "john.doe@example.com",
  "properties": ["firstname", "lastname", "company", "phone"]
}
```

#### 💰 Create Deal
Create a new deal/opportunity.

| Field | Required | Description |
|-------|----------|-------------|
| `dealname` | ✅ Yes | Deal name/title |
| `pipeline` | ✅ Yes | Pipeline ID or name |
| `dealstage` | ✅ Yes | Stage ID or name |
| `amount` | No | Deal value |
| `closedate` | No | Expected close date (ISO format) |

**Example:**
```json
{
  "dealname": "Acme Corp - Enterprise Plan",
  "pipeline": "default",
  "dealstage": "qualifiedtobuy",
  "amount": "50000",
  "closedate": "2024-03-31"
}
```

#### ✏️ Update Deal
Update deal properties.

| Field | Required | Description |
|-------|----------|-------------|
| `dealId` | ✅ Yes | Deal ID |
| `properties` | ✅ Yes | JSON object with fields |

#### 🏢 Create Company
Create a new company record.

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ Yes | Company name |
| `domain` | No | Company website domain |
| `industry` | No | Industry |
| `phone` | No | Company phone |
| `city` | No | City |
| `country` | No | Country |

**Example:**
```json
{
  "name": "Acme Corporation",
  "domain": "acme.com",
  "industry": "Technology",
  "city": "San Francisco",
  "country": "USA"
}
```

#### 📝 Add Note
Create a note (engagement) in HubSpot.

| Field | Required | Description |
|-------|----------|-------------|
| `noteBody` | ✅ Yes | Note content |

---

### Example Workflows

**1. Lead Capture → CRM**
```
Trigger: Webhook (Form submission)
  ↓
HubSpot: Create Contact
  - email: {{form.email}}
  - firstname: {{form.name}}
  - lifecyclestage: "lead"
  ↓
Slack: Send Message
  - text: "New lead: {{form.email}}"
```

**2. Deal Won → Customer Onboarding**
```
Trigger: HubSpot Deal Updated
  ↓
If Condition: dealstage == "closedwon"
  ↓
HubSpot: Update Contact
  - lifecyclestage: "customer"
  ↓
SendGrid: Send Template
  - template: "welcome_customer"
```

---

## 📊 HubSpot Marketing

### Overview
Marketing-specific HubSpot actions for campaigns and list management.

### Actions Reference

#### 📧 Create Campaign
Create a marketing campaign.

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ Yes | Campaign name |
| `type` | No | Campaign type |

#### 📋 Add Contact to List
Add a contact to a marketing list.

| Field | Required | Description |
|-------|----------|-------------|
| `listId` | ✅ Yes | Static list ID |
| `email` | ✅ Yes | Contact email |

---

## ☁️ Salesforce

### Overview
Enterprise CRM with powerful automation. Manage leads, contacts, accounts, opportunities, and custom objects.

### Prerequisites
- Salesforce Account
- OAuth Connected App or API credentials

### Connection Setup

1. **Create Connected App**
   - Go to Salesforce Setup
   - Search for **App Manager**
   - Click **New Connected App**
   - Enable OAuth, add scopes:
     - `api`
     - `refresh_token`

2. **Get Credentials**
   - Note the Consumer Key and Secret
   - Configure callback URL

---

### Actions Reference

#### ➕ Create Record
Create any Salesforce object.

| Field | Required | Description |
|-------|----------|-------------|
| `objectType` | ✅ Yes | Object API name (`Contact`, `Lead`, `Account`, etc.) |
| `fields` | ✅ Yes | JSON object with field values |

**Example - Create Lead:**
```json
{
  "objectType": "Lead",
  "fields": {
    "FirstName": "John",
    "LastName": "Doe",
    "Company": "Acme Corp",
    "Email": "john@acme.com",
    "LeadSource": "Web"
  }
}
```

#### ✏️ Update Record
Update an existing record.

| Field | Required | Description |
|-------|----------|-------------|
| `objectType` | ✅ Yes | Object API name |
| `recordId` | ✅ Yes | Salesforce record ID |
| `fields` | ✅ Yes | Fields to update |

#### 🔍 Query Records
Run SOQL query to find records.

| Field | Required | Description |
|-------|----------|-------------|
| `query` | ✅ Yes | SOQL query string |

**Example:**
```json
{
  "query": "SELECT Id, Name, Email FROM Contact WHERE Email = 'john@example.com'"
}
```

#### 🗑️ Delete Record
Delete a record.

| Field | Required | Description |
|-------|----------|-------------|
| `objectType` | ✅ Yes | Object API name |
| `recordId` | ✅ Yes | Record ID to delete |

---

## 🔵 Pipedrive

### Overview
Sales-focused CRM designed for pipeline management and deal tracking.

### Prerequisites
- Pipedrive Account
- API Token (from Settings → Personal Preferences → API)

### Connection Setup

1. Go to **Settings** → **Personal Preferences** → **API**
2. Copy your **API Token**
3. Add to credentials in the app

---

### Actions Reference

#### 👤 Create Person
Create a new contact/person.

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ Yes | Person's name |
| `email` | No | Email address |
| `phone` | No | Phone number |
| `orgId` | No | Organization ID to associate |

**Example:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

#### 💰 Create Deal
Create a new deal in pipeline.

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ Yes | Deal title |
| `value` | No | Deal value |
| `currency` | No | Currency code (USD, EUR, etc.) |
| `personId` | No | Associated person ID |
| `orgId` | No | Associated organization ID |
| `stageId` | No | Pipeline stage ID |

#### ✏️ Update Deal
Update deal properties.

| Field | Required | Description |
|-------|----------|-------------|
| `dealId` | ✅ Yes | Deal ID |
| `title` | No | New title |
| `value` | No | New value |
| `stageId` | No | Move to stage |
| `status` | No | `open`, `won`, or `lost` |

#### 📅 Add Activity
Schedule an activity (call, meeting, task).

| Field | Required | Description |
|-------|----------|-------------|
| `type` | ✅ Yes | Activity type (`call`, `meeting`, `task`, etc.) |
| `subject` | ✅ Yes | Activity subject |
| `dueDate` | ✅ Yes | Due date (YYYY-MM-DD) |
| `dealId` | No | Associated deal |
| `personId` | No | Associated person |

---

## 🟡 Zoho CRM

### Overview
Comprehensive CRM with sales automation, marketing, and support features.

### Prerequisites
- Zoho CRM Account
- OAuth or API credentials

### Actions Reference

#### ➕ Create Record
Create a CRM record.

| Field | Required | Description |
|-------|----------|-------------|
| `module` | ✅ Yes | Module name (`Leads`, `Contacts`, `Deals`, etc.) |
| `data` | ✅ Yes | JSON with record data |

#### ✏️ Update Record
Update existing record.

| Field | Required | Description |
|-------|----------|-------------|
| `module` | ✅ Yes | Module name |
| `recordId` | ✅ Yes | Record ID |
| `data` | ✅ Yes | Fields to update |

#### 🔍 Search Records
Search for records in a module.

| Field | Required | Description |
|-------|----------|-------------|
| `module` | ✅ Yes | Module name |
| `criteria` | ✅ Yes | Search criteria |

---

## 🔷 Freshsales

### Overview
CRM by Freshworks focused on sales teams.

### Actions Reference

#### 👤 Create Contact
Create a new contact.

| Field | Required | Description |
|-------|----------|-------------|
| `email` | ✅ Yes | Contact email |
| `firstName` | No | First name |
| `lastName` | No | Last name |
| `phone` | No | Phone number |

#### 📥 Create Lead
Create a new lead.

| Field | Required | Description |
|-------|----------|-------------|
| `email` | ✅ Yes | Lead email |
| `firstName` | No | First name |
| `lastName` | No | Last name |
| `company` | No | Company name |

#### 💰 Update Deal
Update deal properties.

| Field | Required | Description |
|-------|----------|-------------|
| `dealId` | ✅ Yes | Deal ID |
| `amount` | No | Deal amount |
| `stageId` | No | Deal stage |

---

## 📐 Linear

### Overview
Modern issue tracking for software teams. Perfect for bug tracking and project management.

### Prerequisites
- Linear Account
- API Key (from Settings → API)

### Connection Setup

1. Go to **Settings** → **API**
2. Create new API key
3. Add to credentials

---

### Actions Reference

#### 🎫 Create Issue
Create a new issue/ticket.

| Field | Required | Description |
|-------|----------|-------------|
| `teamId` | ✅ Yes | Team ID |
| `title` | ✅ Yes | Issue title |
| `description` | No | Issue description (markdown) |
| `priority` | No | 0=No priority, 1=Urgent, 2=High, 3=Normal, 4=Low |
| `stateId` | No | State/status ID |
| `assigneeId` | No | User ID to assign |
| `labelIds` | No | Array of label IDs |

**Example:**
```json
{
  "teamId": "abc-123",
  "title": "Bug: Login button not working",
  "description": "Users cannot click the login button on mobile devices",
  "priority": 2,
  "labelIds": ["label-bug"]
}
```

#### ✏️ Update Issue
Update issue properties.

| Field | Required | Description |
|-------|----------|-------------|
| `issueId` | ✅ Yes | Issue ID |
| `title` | No | New title |
| `description` | No | New description |
| `priority` | No | New priority |
| `stateId` | No | Move to state |
| `assigneeId` | No | Reassign to user |

#### 💬 Add Comment
Add a comment to an issue.

| Field | Required | Description |
|-------|----------|-------------|
| `issueId` | ✅ Yes | Issue ID |
| `body` | ✅ Yes | Comment text (markdown) |

---

## 💡 Best Practices

### Data Quality
- Always validate email formats before creating contacts
- Use standardized field values (e.g., lifecycle stages)
- Keep custom properties consistent across systems

### Sync Strategies
- **One-way sync**: Simpler, push from source to CRM
- **Two-way sync**: Use webhooks to keep systems in sync
- **Batch updates**: Group updates to avoid API limits

### Contact Deduplication
- Check for existing contacts before creating new ones
- Use email as primary identifier
- Merge duplicates when found

---

## 🔧 Troubleshooting

### Common Issues

**"Contact already exists"**
- Use Get Contact first to check existence
- Use Update Contact if found

**"Invalid pipeline/stage"**
- Verify pipeline and stage IDs are correct
- Check API permissions for pipelines

**"Rate limit exceeded"**
- HubSpot: 100 requests/10 seconds
- Salesforce: Varies by org
- Add delays between bulk operations

**"Missing required field"**
- Check CRM settings for required fields
- Some fields may be required by your org's configuration

---

## 📚 Related Docs
- [Marketing Apps Guide](./MARKETING_APPS.md)
- [Project Management Apps](./PROJECT_APPS.md)
- [Workflow Examples](./WORKFLOWS_OVERVIEW.md)
