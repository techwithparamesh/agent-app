# 📋 Project Management Apps Guide

> **Complete documentation for project management integrations.** Learn how to create tasks, manage issues, and automate project workflows across Asana, Jira, Trello, Monday.com, ClickUp, Notion, and Airtable.

---

## 📋 Table of Contents

1. [Asana](#asana)
2. [Jira](#jira)
3. [Trello](#trello)
4. [Monday.com](#mondaycom)
5. [ClickUp](#clickup)
6. [Notion](#notion)
7. [Airtable](#airtable)

---

## 🔶 Asana

### Overview
Asana helps teams organize work with tasks, projects, and workflows. Perfect for task automation, team notifications, and project synchronization.

### Prerequisites
- Asana Account
- Personal Access Token (from Developer Console)

### Connection Setup

1. **Get Access Token**
   - Go to [Asana Developer Console](https://app.asana.com/0/developer-console)
   - Click **Create New Token**
   - Name your token and click **Create**
   - Copy the token immediately (shown only once)

2. **Find Your IDs**
   - **Workspace ID**: Go to Admin Console → Copy from URL
   - **Project ID**: Open project → Copy from URL
   - **User ID**: Open your profile → Copy from URL

---

### Actions Reference

#### ✅ Create Task
Create a new task in a project.

| Field | Required | Description |
|-------|----------|-------------|
| `workspaceId` | ✅ Yes | Workspace GID |
| `projectId` | ✅ Yes | Project GID |
| `name` | ✅ Yes | Task name |
| `notes` | No | Task description |
| `assignee` | No | User GID to assign |
| `dueOn` | No | Due date (`YYYY-MM-DD` or ISO datetime) |
| `tags` | No | Array of tag GIDs |

**Example:**
```json
{
  "workspaceId": "1234567890",
  "projectId": "9876543210",
  "name": "Review Q4 marketing plan",
  "notes": "Check budget allocation and timeline",
  "assignee": "1111111111",
  "dueOn": "2024-01-15"
}
```

**Output:**
```json
{
  "ok": true,
  "task": {
    "gid": "123456",
    "name": "Review Q4 marketing plan",
    "permalink_url": "https://app.asana.com/0/..."
  }
}
```

#### ✏️ Update Task
Update an existing task.

| Field | Required | Description |
|-------|----------|-------------|
| `taskId` | ✅ Yes | Task GID |
| `name` | No | New task name |
| `notes` | No | New description |
| `completed` | No | Mark complete (true/false) |
| `assignee` | No | Reassign to user |
| `dueOn` | No | New due date |

#### ✔️ Complete Task
Mark a task as complete.

| Field | Required | Description |
|-------|----------|-------------|
| `taskId` | ✅ Yes | Task GID |

#### 💬 Add Comment
Add a comment/story to a task.

| Field | Required | Description |
|-------|----------|-------------|
| `taskId` | ✅ Yes | Task GID |
| `text` | ✅ Yes | Comment text |

#### 📎 Create Subtask
Create a subtask under a parent task.

| Field | Required | Description |
|-------|----------|-------------|
| `parentTaskId` | ✅ Yes | Parent task GID |
| `name` | ✅ Yes | Subtask name |
| `notes` | No | Subtask description |

---

### Example Workflows

**1. Customer Request → Task**
```
Trigger: New Zendesk Ticket
  ↓
Asana: Create Task
  - name: "Support: {{ticket.subject}}"
  - notes: "{{ticket.description}}"
  - assignee: (support team member)
  ↓
Slack: Send Message
  - text: "New support task created"
```

**2. Task Completion Notification**
```
Trigger: Asana Task Completed (webhook)
  ↓
Slack: Send Message
  - channel: #team-updates
  - text: "✅ Task completed: {{task.name}}"
```

---

## 🔵 Jira

### Overview
Jira is the leading issue and project tracker for software teams. Manage bugs, features, sprints, and releases.

### Prerequisites
- Jira Cloud Account
- API Token (from Atlassian account settings)
- Jira domain (e.g., `yourcompany.atlassian.net`)

### Connection Setup

1. **Get API Token**
   - Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Click **Create API Token**
   - Copy the token

2. **Add Credentials**
   - **Domain**: Your Jira URL (e.g., `company.atlassian.net`)
   - **Email**: Your Atlassian email
   - **API Token**: Token from step 1

---

### Actions Reference

#### 🎫 Create Issue
Create a new issue (bug, story, task, etc.).

| Field | Required | Description |
|-------|----------|-------------|
| `projectKey` | ✅ Yes | Project key (e.g., `PROJ`) |
| `issueTypeId` | ✅ Yes | Issue type ID (`10001` for Bug, etc.) |
| `summary` | ✅ Yes | Issue title |
| `description` | No | Issue description |
| `priority` | No | Priority name (`Highest`, `High`, `Medium`, `Low`, `Lowest`) |
| `assignee` | No | Assignee account ID |
| `labels` | No | Array of labels |
| `customFields` | No | JSON object with custom field values |

**Example:**
```json
{
  "projectKey": "PROJ",
  "issueTypeId": "10001",
  "summary": "Login page crashes on mobile",
  "description": "Users report that the login page crashes when using Safari on iOS 17",
  "priority": "High",
  "labels": ["bug", "mobile"]
}
```

#### ✏️ Update Issue
Update issue fields.

| Field | Required | Description |
|-------|----------|-------------|
| `issueKey` | ✅ Yes | Issue key (e.g., `PROJ-123`) |
| `summary` | No | New summary |
| `description` | No | New description |
| `priority` | No | New priority |
| `assignee` | No | New assignee account ID |

#### 🔄 Transition Issue
Move issue to a different status.

| Field | Required | Description |
|-------|----------|-------------|
| `issueKey` | ✅ Yes | Issue key |
| `transitionId` | ✅ Yes | Transition ID (get from API) |
| `comment` | No | Comment to add with transition |

**Common Transition IDs** (vary by project):
- To Do → In Progress: `21`
- In Progress → Done: `31`
- Any → Backlog: `11`

#### 💬 Add Comment
Add a comment to an issue.

| Field | Required | Description |
|-------|----------|-------------|
| `issueKey` | ✅ Yes | Issue key |
| `body` | ✅ Yes | Comment text |

#### 🔍 Search Issues
Search issues using JQL (Jira Query Language).

| Field | Required | Description |
|-------|----------|-------------|
| `jql` | ✅ Yes | JQL query string |
| `maxResults` | No | Max results (default: 50) |

**Example JQL queries:**
```
project = PROJ AND status = "In Progress"
assignee = currentUser() AND resolution = Unresolved
created >= -7d AND priority = High
```

---

### Example Workflows

**1. GitHub PR → Jira Update**
```
Trigger: GitHub PR Merged
  ↓
Jira: Transition Issue
  - issueKey: (extract from PR title)
  - transitionId: (to "Done")
  ↓
Jira: Add Comment
  - body: "PR merged by {{pr.author}}"
```

**2. Critical Bug Alert**
```
Trigger: Jira Issue Created
  ↓
If Condition: priority == "Highest"
  ↓
Slack: Send Message
  - channel: #critical-bugs
  - text: "🚨 Critical: {{issue.summary}}"
  ↓
Telegram: Send Message
  - text: "Critical bug: {{issue.key}}"
```

---

## 📘 Trello

### Overview
Visual kanban boards for organizing tasks and projects. Simple yet powerful for team collaboration.

### Prerequisites
- Trello Account
- API Key (from developer portal)
- Token (OAuth authorization)

### Connection Setup

1. **Get API Key**
   - Go to [Trello Power-Up Admin](https://trello.com/power-ups/admin)
   - Create new Power-Up or use existing
   - Copy **API Key**

2. **Get Token**
   - Visit: `https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&key=YOUR_API_KEY`
   - Authorize and copy the token

---

### Actions Reference

#### 🎴 Create Card
Create a new card on a list.

| Field | Required | Description |
|-------|----------|-------------|
| `listId` | ✅ Yes | List ID |
| `name` | ✅ Yes | Card name |
| `desc` | No | Card description |
| `due` | No | Due date (ISO format) |
| `pos` | No | Position (`top`, `bottom`, or number) |
| `labels` | No | Array of label IDs |
| `members` | No | Array of member IDs |

**Example:**
```json
{
  "listId": "5f1234567890abcdef",
  "name": "Design new homepage",
  "desc": "Create mockups for the updated homepage",
  "due": "2024-01-20T17:00:00.000Z",
  "pos": "top"
}
```

#### ✏️ Update Card
Update card properties.

| Field | Required | Description |
|-------|----------|-------------|
| `cardId` | ✅ Yes | Card ID |
| `name` | No | New name |
| `desc` | No | New description |
| `due` | No | New due date |
| `dueComplete` | No | Mark due complete |
| `closed` | No | Archive card |

#### 🔄 Move Card
Move a card to a different list.

| Field | Required | Description |
|-------|----------|-------------|
| `cardId` | ✅ Yes | Card ID |
| `targetListId` | ✅ Yes | Target list ID |
| `pos` | No | Position on list |

#### 💬 Add Comment
Add a comment to a card.

| Field | Required | Description |
|-------|----------|-------------|
| `cardId` | ✅ Yes | Card ID |
| `text` | ✅ Yes | Comment text |

#### 👤 Add Member
Add a member to a card.

| Field | Required | Description |
|-------|----------|-------------|
| `cardId` | ✅ Yes | Card ID |
| `memberId` | ✅ Yes | Member ID |

#### 📝 Create List
Create a new list on a board.

| Field | Required | Description |
|-------|----------|-------------|
| `boardId` | ✅ Yes | Board ID |
| `name` | ✅ Yes | List name |
| `pos` | No | Position |

---

## 📊 Monday.com

### Overview
Work OS for managing projects, processes, and everyday work with customizable workflows.

### Prerequisites
- Monday.com Account
- API Token (from Admin → API)

### Connection Setup

1. Go to **Profile** → **Admin** → **API**
2. Generate new personal API token
3. Copy token

---

### Actions Reference

#### ➕ Create Item
Create a new item on a board.

| Field | Required | Description |
|-------|----------|-------------|
| `boardId` | ✅ Yes | Board ID (number) |
| `itemName` | ✅ Yes | Item name |
| `groupId` | No | Group ID (default: first group) |
| `columnValues` | No | JSON object with column values |

**Column Values Format:**
```json
{
  "columnValues": {
    "status": {"label": "Working on it"},
    "person": {"personsAndTeams": [{"id": 12345, "kind": "person"}]},
    "date": {"date": "2024-01-15"}
  }
}
```

#### ✏️ Update Item
Update item column values.

| Field | Required | Description |
|-------|----------|-------------|
| `itemId` | ✅ Yes | Item ID |
| `boardId` | ✅ Yes | Board ID |
| `columnValues` | ✅ Yes | JSON with column updates |

#### 📝 Create Update
Add an update (comment) to an item.

| Field | Required | Description |
|-------|----------|-------------|
| `itemId` | ✅ Yes | Item ID |
| `body` | ✅ Yes | Update text |

#### 🔄 Move Item
Move item to a different group.

| Field | Required | Description |
|-------|----------|-------------|
| `itemId` | ✅ Yes | Item ID |
| `groupId` | ✅ Yes | Target group ID |

---

## ⚡ ClickUp

### Overview
All-in-one productivity platform for tasks, docs, goals, and more.

### Prerequisites
- ClickUp Account
- API Token (from Settings → Apps)

### Actions Reference

#### ✅ Create Task
Create a new task.

| Field | Required | Description |
|-------|----------|-------------|
| `listId` | ✅ Yes | List ID |
| `name` | ✅ Yes | Task name |
| `description` | No | Task description |
| `status` | No | Status name |
| `priority` | No | 1=Urgent, 2=High, 3=Normal, 4=Low |
| `dueDate` | No | Due date (ISO or timestamp) |
| `assignees` | No | Array of user IDs |
| `tags` | No | Array of tag names |

**Example:**
```json
{
  "listId": "123456",
  "name": "Update documentation",
  "description": "Add new API endpoints to docs",
  "priority": 3,
  "dueDate": "2024-01-20"
}
```

#### ✏️ Update Task
Update task properties.

| Field | Required | Description |
|-------|----------|-------------|
| `taskId` | ✅ Yes | Task ID |
| `name` | No | New name |
| `description` | No | New description |
| `status` | No | New status |
| `priority` | No | New priority |

#### 💬 Add Comment
Add a comment to a task.

| Field | Required | Description |
|-------|----------|-------------|
| `taskId` | ✅ Yes | Task ID |
| `commentText` | ✅ Yes | Comment content |

---

## 📝 Notion

### Overview
All-in-one workspace for notes, docs, wikis, and databases. Build custom workflows with pages and databases.

### Prerequisites
- Notion Account
- Integration Token (from Notion Integrations)

### Connection Setup

1. **Create Integration**
   - Go to [Notion Integrations](https://www.notion.so/my-integrations)
   - Click **New Integration**
   - Name your integration
   - Copy the **Internal Integration Token**

2. **Share with Integration**
   - Open the page/database in Notion
   - Click **Share** → **Invite**
   - Select your integration

---

### Actions Reference

#### 📄 Create Page
Create a new page in a database or as a child page.

| Field | Required | Description |
|-------|----------|-------------|
| `parentId` | ✅ Yes | Parent page or database ID |
| `parentType` | ✅ Yes | `page_id` or `database_id` |
| `title` | ✅ Yes | Page title |
| `properties` | No | JSON with database properties |
| `content` | No | Initial page content |

**Example - Create Database Item:**
```json
{
  "parentId": "abc123...",
  "parentType": "database_id",
  "title": "Meeting Notes - Jan 15",
  "properties": {
    "Status": {"select": {"name": "Draft"}},
    "Date": {"date": {"start": "2024-01-15"}}
  },
  "content": "## Attendees\n- John\n- Jane"
}
```

#### ✏️ Update Page
Update page properties.

| Field | Required | Description |
|-------|----------|-------------|
| `pageId` | ✅ Yes | Page ID |
| `properties` | ✅ Yes | JSON with properties to update |

#### ➕ Append Block
Add content to a page.

| Field | Required | Description |
|-------|----------|-------------|
| `pageId` | ✅ Yes | Page ID |
| `content` | ✅ Yes | Text content |
| `blockType` | No | `paragraph`, `heading_1`, `heading_2`, `bulleted_list_item`, `numbered_list_item`, `to_do` |

#### 🔍 Query Database
Query database with filters and sorts.

| Field | Required | Description |
|-------|----------|-------------|
| `databaseId` | ✅ Yes | Database ID |
| `filter` | No | Notion filter object |
| `sorts` | No | Notion sorts array |
| `pageSize` | No | Results per page |

**Example Filter:**
```json
{
  "filter": {
    "and": [
      {"property": "Status", "select": {"equals": "Active"}},
      {"property": "Due Date", "date": {"before": "2024-02-01"}}
    ]
  }
}
```

---

## 📊 Airtable

### Overview
Spreadsheet-database hybrid with powerful API. Great for structured data and custom applications.

### Prerequisites
- Airtable Account
- Personal Access Token (from Account settings)
- Base ID and Table ID

### Connection Setup

1. **Get API Key**
   - Go to [Airtable Account](https://airtable.com/account)
   - Generate personal access token with scopes:
     - `data.records:read`
     - `data.records:write`

2. **Find Base and Table IDs**
   - Open your base
   - Base ID: In URL after `airtable.com/`
   - Table ID: Use API docs or table settings

---

### Actions Reference

#### ➕ Create Record
Create a new record in a table.

| Field | Required | Description |
|-------|----------|-------------|
| `baseId` | ✅ Yes | Base ID |
| `tableId` | ✅ Yes | Table ID or name |
| `fields` | ✅ Yes | JSON object with field values |

**Example:**
```json
{
  "baseId": "appXXXXXXXXXX",
  "tableId": "Contacts",
  "fields": {
    "Name": "John Doe",
    "Email": "john@example.com",
    "Status": "Active",
    "Tags": ["Lead", "Enterprise"]
  }
}
```

#### ✏️ Update Record
Update an existing record.

| Field | Required | Description |
|-------|----------|-------------|
| `baseId` | ✅ Yes | Base ID |
| `tableId` | ✅ Yes | Table ID |
| `recordId` | ✅ Yes | Record ID |
| `fields` | ✅ Yes | Fields to update |

#### 🔍 Get Record
Get a single record by ID.

| Field | Required | Description |
|-------|----------|-------------|
| `baseId` | ✅ Yes | Base ID |
| `tableId` | ✅ Yes | Table ID |
| `recordId` | ✅ Yes | Record ID |

#### 📋 List Records
List records with optional filtering.

| Field | Required | Description |
|-------|----------|-------------|
| `baseId` | ✅ Yes | Base ID |
| `tableId` | ✅ Yes | Table ID |
| `viewId` | No | View ID to use |
| `filterByFormula` | No | Airtable formula filter |
| `maxRecords` | No | Maximum records to return |
| `sort` | No | Sort configuration |

**Example Filter Formula:**
```
{Status} = 'Active'
AND({Created Date} > '2024-01-01')
```

#### 🗑️ Delete Record
Delete a record.

| Field | Required | Description |
|-------|----------|-------------|
| `baseId` | ✅ Yes | Base ID |
| `tableId` | ✅ Yes | Table ID |
| `recordId` | ✅ Yes | Record ID |

---

## 💡 Best Practices

### Task Automation
- Use meaningful task names with context
- Include links back to source (ticket, email, etc.)
- Set appropriate due dates and priorities
- Assign to specific team members when possible

### Data Consistency
- Standardize status names across platforms
- Use consistent date formats
- Map priority levels between systems

### Error Handling
- Check if task/issue exists before updating
- Handle "not found" errors gracefully
- Log failed operations for review

---

## 🔧 Troubleshooting

### Common Issues

**"Project/Board not found"**
- Verify ID is correct (check URL)
- Ensure API token has access to project
- Check if project is archived

**"Permission denied"**
- Verify token scopes include write access
- Check if user has project permissions
- For Notion: ensure integration is shared with page

**"Invalid field value"**
- Check field type matches value format
- Use correct select option names
- Verify date format (usually ISO 8601)

---

## 📚 Related Docs
- [CRM Apps Guide](./CRM_APPS.md)
- [Developer Tools](./DEVELOPER_APPS.md)
- [Workflow Examples](./WORKFLOWS_OVERVIEW.md)
