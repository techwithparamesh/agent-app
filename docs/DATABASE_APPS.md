# 🗄️ Database Apps Guide

> **Complete documentation for database integrations.** Learn how to query, insert, update, and manage data across PostgreSQL, MySQL, MongoDB, Redis, BigQuery, DynamoDB, and more.

---

## 📋 Table of Contents

1. [PostgreSQL](#postgresql)
2. [MySQL](#mysql)
3. [MongoDB](#mongodb)
4. [Redis](#redis)
5. [BigQuery](#bigquery)
6. [DynamoDB](#dynamodb)
7. [Cosmos DB](#cosmos-db)
8. [Elasticsearch](#elasticsearch)
9. [Supabase](#supabase)
10. [Firebase](#firebase)

---

## 🐘 PostgreSQL

### Overview
Powerful open-source relational database. Execute SQL queries and manage data with full ACID compliance.

### Prerequisites
- PostgreSQL server (local or cloud)
- Connection credentials

### Connection Setup

1. **Gather Connection Details**
   - **Host**: Database server address
   - **Port**: Usually `5432`
   - **Database**: Database name
   - **User**: Username
   - **Password**: Password
   - **SSL**: Enable for cloud databases

2. **Add Credentials**
   - Go to **Settings → Credentials**
   - Select **PostgreSQL**
   - Fill in connection details
   - Test connection
   - Save

---

### Actions Reference

#### 🔍 Query
Execute a SELECT query.

| Field | Required | Description |
|-------|----------|-------------|
| `query` | ✅ Yes | SQL SELECT query |
| `params` | No | Array of parameter values |
| `limit` | No | Limit results |

**Example:**
```json
{
  "query": "SELECT id, name, email FROM users WHERE status = $1 ORDER BY created_at DESC",
  "params": ["active"],
  "limit": 100
}
```

**Output:**
```json
{
  "ok": true,
  "rows": [
    {"id": 1, "name": "John Doe", "email": "john@example.com"},
    {"id": 2, "name": "Jane Smith", "email": "jane@example.com"}
  ]
}
```

#### ⚡ Execute
Execute INSERT, UPDATE, DELETE, or DDL statements.

| Field | Required | Description |
|-------|----------|-------------|
| `query` | ✅ Yes | SQL statement |
| `params` | No | Array of parameter values |

**Insert Example:**
```json
{
  "query": "INSERT INTO users (name, email, status) VALUES ($1, $2, $3) RETURNING id",
  "params": ["John Doe", "john@example.com", "active"]
}
```

**Update Example:**
```json
{
  "query": "UPDATE users SET status = $1 WHERE id = $2",
  "params": ["inactive", 123]
}
```

**Delete Example:**
```json
{
  "query": "DELETE FROM orders WHERE created_at < $1",
  "params": ["2023-01-01"]
}
```

---

### Best Practices

✅ **Always use parameterized queries** to prevent SQL injection:
```sql
-- Good
SELECT * FROM users WHERE email = $1

-- Bad (vulnerable!)
SELECT * FROM users WHERE email = '${email}'
```

✅ **Use transactions** for multiple related operations
✅ **Index frequently queried columns**
✅ **Limit result sets** to avoid memory issues

---

## 🐬 MySQL

### Overview
Popular open-source relational database with wide compatibility.

### Prerequisites
- MySQL server (v5.7+)
- Connection credentials

### Connection Setup

| Field | Description |
|-------|-------------|
| `host` | Database host |
| `port` | Port (default: 3306) |
| `database` | Database name |
| `user` | Username |
| `password` | Password |
| `ssl` | Enable SSL (optional) |

---

### Actions Reference

#### 🔍 Query
Execute a SELECT query.

| Field | Required | Description |
|-------|----------|-------------|
| `query` | ✅ Yes | SQL query |
| `params` | No | Parameter array |
| `limit` | No | Result limit |

**Example:**
```json
{
  "query": "SELECT * FROM products WHERE category = ? AND price < ?",
  "params": ["electronics", 100],
  "limit": 50
}
```

#### ⚡ Execute
Execute data modification statements.

| Field | Required | Description |
|-------|----------|-------------|
| `query` | ✅ Yes | SQL statement |
| `params` | No | Parameter array |

**Example:**
```json
{
  "query": "INSERT INTO orders (customer_id, total, status) VALUES (?, ?, ?)",
  "params": [123, 99.99, "pending"]
}
```

**Output:**
```json
{
  "ok": true,
  "result": {
    "insertId": 456,
    "affectedRows": 1
  }
}
```

---

## 🍃 MongoDB

### Overview
Document database for flexible, JSON-like data storage.

### Prerequisites
- MongoDB instance (Atlas or self-hosted)
- Connection string

### Connection Setup

1. **Get Connection String**
   - **MongoDB Atlas**: Database → Connect → Drivers
   - Format: `mongodb+srv://user:password@cluster.mongodb.net/`

2. **Add Credentials**
   - **Connection String**: Full MongoDB URI
   - **Database**: Target database name

---

### Actions Reference

#### ➕ Insert Document
Insert a new document into a collection.

| Field | Required | Description |
|-------|----------|-------------|
| `collection` | ✅ Yes | Collection name |
| `document` | ✅ Yes | JSON document to insert |

**Example:**
```json
{
  "collection": "users",
  "document": {
    "name": "John Doe",
    "email": "john@example.com",
    "tags": ["premium", "active"],
    "metadata": {
      "source": "signup",
      "campaign": "summer2024"
    }
  }
}
```

**Output:**
```json
{
  "ok": true,
  "insertedId": "507f1f77bcf86cd799439011",
  "acknowledged": true
}
```

#### ✏️ Update Document
Update documents matching a filter.

| Field | Required | Description |
|-------|----------|-------------|
| `collection` | ✅ Yes | Collection name |
| `filter` | ✅ Yes | Query filter object |
| `update` | ✅ Yes | Update operations |
| `upsert` | No | Create if not exists |

**Example:**
```json
{
  "collection": "users",
  "filter": {"email": "john@example.com"},
  "update": {
    "$set": {"status": "premium"},
    "$inc": {"loginCount": 1},
    "$push": {"tags": "verified"}
  }
}
```

#### 🔍 Find Documents
Query documents from a collection.

| Field | Required | Description |
|-------|----------|-------------|
| `collection` | ✅ Yes | Collection name |
| `filter` | No | Query filter (default: all) |
| `projection` | No | Fields to return |
| `sort` | No | Sort order |
| `limit` | No | Max documents (default: 100) |

**Example:**
```json
{
  "collection": "orders",
  "filter": {
    "status": "pending",
    "total": {"$gt": 100}
  },
  "projection": {"_id": 1, "customer": 1, "total": 1},
  "sort": {"createdAt": -1},
  "limit": 50
}
```

#### 🗑️ Delete Documents
Delete documents matching a filter.

| Field | Required | Description |
|-------|----------|-------------|
| `collection` | ✅ Yes | Collection name |
| `filter` | ✅ Yes | Query filter |

**Example:**
```json
{
  "collection": "sessions",
  "filter": {
    "expiresAt": {"$lt": "2024-01-01T00:00:00Z"}
  }
}
```

#### 📊 Aggregate
Run aggregation pipeline.

| Field | Required | Description |
|-------|----------|-------------|
| `collection` | ✅ Yes | Collection name |
| `pipeline` | ✅ Yes | Aggregation stages array |

**Example:**
```json
{
  "collection": "orders",
  "pipeline": [
    {"$match": {"status": "completed"}},
    {"$group": {
      "_id": "$customerId",
      "totalSpent": {"$sum": "$amount"},
      "orderCount": {"$sum": 1}
    }},
    {"$sort": {"totalSpent": -1}},
    {"$limit": 10}
  ]
}
```

---

## 🔴 Redis

### Overview
In-memory key-value store for caching, sessions, and pub/sub.

### Prerequisites
- Redis server
- Connection URL

### Connection Setup

| Field | Description |
|-------|-------------|
| `url` | Redis URL (e.g., `redis://localhost:6379`) |
| `database` | Database number (0-15) |

---

### Actions Reference

#### 💾 Set
Set a key-value pair.

| Field | Required | Description |
|-------|----------|-------------|
| `key` | ✅ Yes | Key name |
| `value` | ✅ Yes | Value to store |
| `ttlSeconds` | No | Expiration in seconds |

**Example:**
```json
{
  "key": "user:123:session",
  "value": "{\"userId\": 123, \"role\": \"admin\"}",
  "ttlSeconds": 3600
}
```

#### 📖 Get
Get a value by key.

| Field | Required | Description |
|-------|----------|-------------|
| `key` | ✅ Yes | Key name |

**Output:**
```json
{
  "ok": true,
  "value": "{\"userId\": 123, \"role\": \"admin\"}"
}
```

#### 📢 Publish
Publish a message to a channel.

| Field | Required | Description |
|-------|----------|-------------|
| `channel` | ✅ Yes | Channel name |
| `message` | ✅ Yes | Message to publish |

**Example:**
```json
{
  "channel": "notifications",
  "message": "{\"type\": \"new_order\", \"orderId\": 456}"
}
```

---

## 📊 BigQuery

### Overview
Google Cloud data warehouse for analytics and large-scale queries.

### Prerequisites
- Google Cloud Project
- Service account with BigQuery access

### Actions Reference

#### 🔍 Query
Execute a SQL query.

| Field | Required | Description |
|-------|----------|-------------|
| `query` | ✅ Yes | SQL query |
| `params` | No | Named parameters |

**Example:**
```json
{
  "query": "SELECT date, SUM(revenue) as total FROM `project.dataset.sales` WHERE date >= @startDate GROUP BY date ORDER BY date",
  "params": {
    "startDate": "2024-01-01"
  }
}
```

---

## ⚡ DynamoDB

### Overview
AWS NoSQL database with single-digit millisecond performance.

### Prerequisites
- AWS Account
- Access Key ID and Secret

### Connection Setup

| Field | Description |
|-------|-------------|
| `accessKeyId` | AWS Access Key |
| `secretAccessKey` | AWS Secret Key |
| `region` | AWS Region |

---

### Actions Reference

#### ➕ Put Item
Create or replace an item.

| Field | Required | Description |
|-------|----------|-------------|
| `tableName` | ✅ Yes | Table name |
| `item` | ✅ Yes | Item to store |

**Example:**
```json
{
  "tableName": "Users",
  "item": {
    "userId": {"S": "user123"},
    "email": {"S": "john@example.com"},
    "name": {"S": "John Doe"},
    "createdAt": {"N": "1704067200"}
  }
}
```

#### 📖 Get Item
Retrieve an item by key.

| Field | Required | Description |
|-------|----------|-------------|
| `tableName` | ✅ Yes | Table name |
| `key` | ✅ Yes | Primary key |

#### 🔍 Query
Query items by partition key.

| Field | Required | Description |
|-------|----------|-------------|
| `tableName` | ✅ Yes | Table name |
| `keyConditionExpression` | ✅ Yes | Key condition |
| `expressionAttributeValues` | ✅ Yes | Attribute values |

#### 📋 Scan
Scan entire table with optional filter.

| Field | Required | Description |
|-------|----------|-------------|
| `tableName` | ✅ Yes | Table name |
| `filterExpression` | No | Filter expression |
| `limit` | No | Max items |

---

## 🌌 Cosmos DB

### Overview
Azure's globally distributed multi-model database.

### Prerequisites
- Azure Account
- Cosmos DB account

### Actions Reference

#### ➕ Create Item
Create a new document.

| Field | Required | Description |
|-------|----------|-------------|
| `container` | ✅ Yes | Container name |
| `item` | ✅ Yes | Document to create |

#### 🔍 Query Items
Query documents with SQL.

| Field | Required | Description |
|-------|----------|-------------|
| `container` | ✅ Yes | Container name |
| `query` | ✅ Yes | SQL query |
| `parameters` | No | Query parameters |

#### ✏️ Update Item
Update a document.

| Field | Required | Description |
|-------|----------|-------------|
| `container` | ✅ Yes | Container name |
| `id` | ✅ Yes | Document ID |
| `item` | ✅ Yes | Updated document |

---

## 🔎 Elasticsearch

### Overview
Search and analytics engine for log analysis, full-text search, and more.

### Prerequisites
- Elasticsearch cluster
- Authentication credentials

### Actions Reference

#### 📝 Index Document
Add or update a document.

| Field | Required | Description |
|-------|----------|-------------|
| `index` | ✅ Yes | Index name |
| `id` | No | Document ID |
| `document` | ✅ Yes | Document body |

#### 🔍 Search
Search for documents.

| Field | Required | Description |
|-------|----------|-------------|
| `index` | ✅ Yes | Index name |
| `query` | ✅ Yes | Elasticsearch query |
| `size` | No | Max results |

**Example:**
```json
{
  "index": "products",
  "query": {
    "bool": {
      "must": [
        {"match": {"title": "laptop"}},
        {"range": {"price": {"lte": 1000}}}
      ]
    }
  },
  "size": 20
}
```

#### ✏️ Update Document
Update a document by ID.

| Field | Required | Description |
|-------|----------|-------------|
| `index` | ✅ Yes | Index name |
| `id` | ✅ Yes | Document ID |
| `doc` | ✅ Yes | Fields to update |

---

## 🟢 Supabase

### Overview
Open-source Firebase alternative with PostgreSQL backend.

### Prerequisites
- Supabase Project
- Project URL and anon/service key

### Actions Reference

#### 🔍 Query
Query data from a table.

| Field | Required | Description |
|-------|----------|-------------|
| `table` | ✅ Yes | Table name |
| `select` | No | Columns to select |
| `filter` | No | Filter conditions |
| `limit` | No | Max rows |

#### ➕ Insert
Insert a row.

| Field | Required | Description |
|-------|----------|-------------|
| `table` | ✅ Yes | Table name |
| `data` | ✅ Yes | Row data |

#### ✏️ Update
Update rows.

| Field | Required | Description |
|-------|----------|-------------|
| `table` | ✅ Yes | Table name |
| `data` | ✅ Yes | Fields to update |
| `filter` | ✅ Yes | Filter conditions |

#### 🗑️ Delete
Delete rows.

| Field | Required | Description |
|-------|----------|-------------|
| `table` | ✅ Yes | Table name |
| `filter` | ✅ Yes | Filter conditions |

---

## 🔥 Firebase

### Overview
Google's app development platform with real-time database and Firestore.

### Prerequisites
- Firebase Project
- Service account key

### Actions Reference

#### 💾 Set Document
Create or overwrite a Firestore document.

| Field | Required | Description |
|-------|----------|-------------|
| `collection` | ✅ Yes | Collection path |
| `documentId` | ✅ Yes | Document ID |
| `data` | ✅ Yes | Document data |

#### 📖 Get Document
Retrieve a document.

| Field | Required | Description |
|-------|----------|-------------|
| `collection` | ✅ Yes | Collection path |
| `documentId` | ✅ Yes | Document ID |

#### 🔍 Query Collection
Query documents in a collection.

| Field | Required | Description |
|-------|----------|-------------|
| `collection` | ✅ Yes | Collection path |
| `where` | No | Query conditions |
| `orderBy` | No | Sort field |
| `limit` | No | Max documents |

---

## 💡 Best Practices

### Security
- Use parameterized queries (SQL injection prevention)
- Limit database user permissions
- Encrypt connections (SSL/TLS)
- Rotate credentials regularly

### Performance
- Index frequently queried fields
- Limit result sets
- Use connection pooling
- Cache frequent queries

### Data Integrity
- Use transactions for related operations
- Validate data before inserting
- Handle errors gracefully
- Log failed operations

---

## 🔧 Troubleshooting

### Common Issues

**"Connection refused"**
- Check host and port
- Verify firewall rules
- Ensure database is running

**"Authentication failed"**
- Verify credentials
- Check user permissions
- Confirm database name

**"Query timeout"**
- Optimize query
- Add indexes
- Increase timeout setting

**"Too many connections"**
- Implement connection pooling
- Close unused connections
- Increase max connections

---

## 📚 Related Docs
- [Storage Apps Guide](./STORAGE_APPS.md)
- [Developer Tools](./DEVELOPER_APPS.md)
- [Workflow Examples](./WORKFLOWS_OVERVIEW.md)
