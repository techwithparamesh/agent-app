# 🛒 E-commerce & Payments Apps Guide

> **Complete documentation for e-commerce and payment integrations.** Learn how to manage orders, products, customers, and payments across Stripe, Shopify, PayPal, WooCommerce, and more.

---

## 📋 Table of Contents

1. [Stripe](#stripe)
2. [Shopify](#shopify)
3. [PayPal](#paypal)
4. [WooCommerce](#woocommerce)
5. [Square](#square)
6. [Razorpay](#razorpay)

---

## 💳 Stripe

### Overview
Complete payment processing platform for online businesses. Handle customers, payments, subscriptions, invoices, and refunds.

### Prerequisites
- Stripe Account
- Secret API Key (from Dashboard → Developers → API keys)

### Connection Setup

1. **Get API Keys**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Navigate to **Developers** → **API keys**
   - Copy your **Secret key** (starts with `sk_`)
   - Use **test keys** (`sk_test_...`) for development

2. **Add Credentials**
   - Go to **Settings → Credentials**
   - Select **Stripe**
   - Paste your Secret Key
   - Save

> ⚠️ **Never expose your secret key in client-side code!**

---

### Actions Reference

#### 👤 Create Customer
Create a new customer in Stripe.

| Field | Required | Description |
|-------|----------|-------------|
| `email` | ✅ Yes | Customer email |
| `name` | No | Customer name |
| `phone` | No | Phone number |
| `description` | No | Customer description |
| `metadata` | No | JSON object with custom data |

**Example:**
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "metadata": {
    "user_id": "usr_123",
    "plan": "premium"
  }
}
```

**Output:**
```json
{
  "ok": true,
  "id": "cus_ABC123...",
  "raw": {
    "id": "cus_ABC123...",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### 💰 Create Payment Intent
Create a payment intent for collecting payments.

| Field | Required | Description |
|-------|----------|-------------|
| `amount` | ✅ Yes | Amount in cents (e.g., 1000 = $10.00) |
| `currency` | ✅ Yes | Currency code (e.g., `usd`, `eur`) |
| `customerId` | No | Stripe customer ID |
| `description` | No | Payment description |
| `paymentMethodTypes` | No | Array of payment methods |
| `metadata` | No | Custom metadata |

**Example:**
```json
{
  "amount": 2999,
  "currency": "usd",
  "customerId": "cus_ABC123",
  "description": "Premium plan subscription",
  "metadata": {
    "order_id": "order_456"
  }
}
```

**Output:**
```json
{
  "ok": true,
  "id": "pi_...",
  "clientSecret": "pi_..._secret_...",
  "raw": {...}
}
```

#### 📅 Create Subscription
Create a recurring subscription.

| Field | Required | Description |
|-------|----------|-------------|
| `customerId` | ✅ Yes | Stripe customer ID |
| `priceId` | ✅ Yes | Price ID (from Products) |
| `trialPeriodDays` | No | Free trial days |
| `metadata` | No | Custom metadata |

**Example:**
```json
{
  "customerId": "cus_ABC123",
  "priceId": "price_XYZ789",
  "trialPeriodDays": 14
}
```

#### ❌ Cancel Subscription
Cancel an active subscription.

| Field | Required | Description |
|-------|----------|-------------|
| `subscriptionId` | ✅ Yes | Subscription ID |
| `cancelAtPeriodEnd` | No | Cancel at end of period (default: true) |

#### 🧾 Create Invoice
Create an invoice for a customer.

| Field | Required | Description |
|-------|----------|-------------|
| `customerId` | ✅ Yes | Customer ID |
| `autoAdvance` | No | Auto-finalize invoice |
| `description` | No | Invoice description |

#### 🔍 Get Customer
Retrieve customer details.

| Field | Required | Description |
|-------|----------|-------------|
| `customerId` | ✅ Yes | Customer ID |

#### ↩️ Refund Payment
Refund a payment.

| Field | Required | Description |
|-------|----------|-------------|
| `paymentIntentId` | ✅ Yes | Payment intent ID |
| `amount` | No | Partial refund amount (cents) |
| `reason` | No | `duplicate`, `fraudulent`, `requested_by_customer` |

---

### Example Workflows

**1. New User → Stripe Customer**
```
Trigger: User Signup
  ↓
Stripe: Create Customer
  - email: {{user.email}}
  - name: {{user.name}}
  ↓
Database: Update User
  - stripeCustomerId: {{stripe.id}}
```

**2. Subscription Canceled → Win-back**
```
Trigger: Stripe Webhook (subscription.deleted)
  ↓
SendGrid: Send Email
  - template: "win_back_offer"
  - to: {{customer.email}}
  ↓
Slack: Notify Team
  - text: "Lost subscriber: {{customer.email}}"
```

---

## 🛍️ Shopify

### Overview
E-commerce platform for managing products, orders, customers, and fulfillment.

### Prerequisites
- Shopify Store
- Admin API Access Token (from app or private app)

### Connection Setup

1. **Create Private App (Legacy) or Custom App**
   - Go to **Settings** → **Apps and sales channels**
   - Click **Develop apps** → **Create an app**
   - Configure API scopes:
     - `read_orders`, `write_orders`
     - `read_products`, `write_products`
     - `read_customers`, `write_customers`
   - Install app and copy **Admin API access token**

2. **Add Credentials**
   - **Shop Domain**: `your-store.myshopify.com`
   - **Access Token**: Admin API token

---

### Actions Reference

#### 📦 Get Order
Retrieve order details.

| Field | Required | Description |
|-------|----------|-------------|
| `orderId` | ✅ Yes | Order ID |

**Output:**
```json
{
  "ok": true,
  "order": {
    "id": 123456,
    "name": "#1001",
    "total_price": "99.00",
    "line_items": [...]
  }
}
```

#### ➕ Create Order
Create a new order.

| Field | Required | Description |
|-------|----------|-------------|
| `lineItems` | ✅ Yes | Array of line items |
| `customerId` | No | Customer ID |
| `email` | No | Customer email |
| `financialStatus` | No | `pending`, `paid`, `refunded` |
| `shippingAddress` | No | Shipping address JSON |
| `tags` | No | Order tags |

**Line Item Format:**
```json
{
  "lineItems": [
    {"variant_id": 12345, "quantity": 2},
    {"variant_id": 67890, "quantity": 1}
  ],
  "email": "customer@example.com"
}
```

#### ✏️ Update Order
Update order details.

| Field | Required | Description |
|-------|----------|-------------|
| `orderId` | ✅ Yes | Order ID |
| `note` | No | Order note |
| `tags` | No | Tags |
| `email` | No | Customer email |

#### 🏷️ Create Product
Create a new product.

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ Yes | Product title |
| `bodyHtml` | No | Product description (HTML) |
| `vendor` | No | Product vendor |
| `productType` | No | Product type |
| `tags` | No | Product tags |
| `variants` | No | Product variants JSON |
| `images` | No | Product images JSON |

**Example:**
```json
{
  "title": "Premium T-Shirt",
  "bodyHtml": "<p>Soft cotton t-shirt</p>",
  "vendor": "My Brand",
  "productType": "Apparel",
  "tags": "cotton, summer",
  "variants": [
    {"title": "Small", "price": "29.99", "sku": "TSHIRT-S"},
    {"title": "Medium", "price": "29.99", "sku": "TSHIRT-M"}
  ]
}
```

#### ✏️ Update Product
Update product details.

| Field | Required | Description |
|-------|----------|-------------|
| `productId` | ✅ Yes | Product ID |
| `title` | No | New title |
| `bodyHtml` | No | New description |
| `tags` | No | New tags |

#### 👤 Get Customer
Retrieve customer details.

| Field | Required | Description |
|-------|----------|-------------|
| `customerId` | ✅ Yes | Customer ID |

#### 📬 Create Fulfillment
Create order fulfillment.

| Field | Required | Description |
|-------|----------|-------------|
| `orderId` | ✅ Yes | Order ID |
| `trackingNumber` | No | Tracking number |
| `trackingCompany` | No | Shipping carrier |
| `notifyCustomer` | No | Send notification |

---

## 💵 PayPal

### Overview
Global payment platform for processing payments and transfers.

### Prerequisites
- PayPal Business Account
- Client ID and Secret (from Developer Dashboard)

### Actions Reference

#### 💳 Create Payment
Create a payment.

| Field | Required | Description |
|-------|----------|-------------|
| `amount` | ✅ Yes | Payment amount |
| `currency` | ✅ Yes | Currency code |
| `description` | No | Payment description |
| `returnUrl` | ✅ Yes | Success redirect URL |
| `cancelUrl` | ✅ Yes | Cancel redirect URL |

#### ✅ Execute Payment
Execute an approved payment.

| Field | Required | Description |
|-------|----------|-------------|
| `paymentId` | ✅ Yes | Payment ID |
| `payerId` | ✅ Yes | Payer ID |

#### 🔍 Get Payment
Get payment details.

| Field | Required | Description |
|-------|----------|-------------|
| `paymentId` | ✅ Yes | Payment ID |

---

## 🛒 WooCommerce

### Overview
WordPress e-commerce plugin for managing online stores.

### Prerequisites
- WooCommerce Store
- REST API Keys (from Settings → Advanced → REST API)

### Actions Reference

#### ➕ Create Order
Create a new order.

| Field | Required | Description |
|-------|----------|-------------|
| `lineItems` | ✅ Yes | Array of products |
| `billing` | No | Billing address |
| `shipping` | No | Shipping address |
| `customerId` | No | Customer ID |

#### ✏️ Update Order
Update order details.

| Field | Required | Description |
|-------|----------|-------------|
| `orderId` | ✅ Yes | Order ID |
| `status` | No | Order status |
| `note` | No | Order note |

#### 🏷️ Create Product
Create a product.

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ Yes | Product name |
| `regular_price` | ✅ Yes | Regular price |
| `description` | No | Product description |
| `sku` | No | Product SKU |

---

## 🔲 Square

### Overview
Payment and POS platform for in-person and online payments.

### Prerequisites
- Square Account
- Access Token (from Developer Dashboard)

### Actions Reference

#### 💳 Create Payment
Process a payment.

| Field | Required | Description |
|-------|----------|-------------|
| `amount` | ✅ Yes | Amount in cents |
| `currency` | ✅ Yes | Currency code |
| `sourceId` | ✅ Yes | Payment source (card nonce) |
| `customerId` | No | Customer ID |

#### 👤 Create Customer
Create a customer.

| Field | Required | Description |
|-------|----------|-------------|
| `email` | No | Email address |
| `givenName` | No | First name |
| `familyName` | No | Last name |
| `phoneNumber` | No | Phone number |

#### 📋 List Payments
List recent payments.

| Field | Required | Description |
|-------|----------|-------------|
| `beginTime` | No | Start date |
| `endTime` | No | End date |
| `limit` | No | Max results |

---

## 🇮🇳 Razorpay

### Overview
Payment gateway popular in India for processing payments.

### Prerequisites
- Razorpay Account
- Key ID and Key Secret

### Actions Reference

#### 🔗 Create Payment Link
Create a shareable payment link.

| Field | Required | Description |
|-------|----------|-------------|
| `amount` | ✅ Yes | Amount in paise |
| `currency` | No | Currency (default: INR) |
| `description` | ✅ Yes | Payment description |
| `customerName` | No | Customer name |
| `customerEmail` | No | Customer email |
| `customerPhone` | No | Customer phone |

#### 📦 Create Order
Create an order for payment.

| Field | Required | Description |
|-------|----------|-------------|
| `amount` | ✅ Yes | Amount in paise |
| `currency` | No | Currency |
| `receipt` | No | Receipt ID |
| `notes` | No | Custom notes |

---

## 💡 Best Practices

### Payment Security
- Always use HTTPS for callbacks
- Validate webhook signatures
- Never log full card numbers
- Use test mode for development

### Order Management
- Track order states properly
- Send confirmation emails
- Handle failed payments gracefully
- Log all transactions

### Inventory Sync
- Update stock after orders
- Handle overselling
- Sync across channels
- Set low stock alerts

---

## 🔧 Troubleshooting

### Common Issues

**"Invalid API Key"**
- Check key format (test vs live)
- Verify key hasn't been rotated
- Ensure correct environment

**"Payment failed"**
- Check card details
- Verify sufficient funds
- Check for fraud blocks
- Review decline codes

**"Webhook not received"**
- Verify endpoint URL
- Check webhook signing secret
- Review webhook logs
- Ensure endpoint returns 200

**"Order not found"**
- Verify order ID format
- Check correct store/account
- Ensure API permissions

---

## 📚 Related Docs
- [Email Marketing Apps](./MARKETING_APPS.md)
- [Database Apps](./DATABASE_APPS.md)
- [Workflow Examples](./WORKFLOWS_OVERVIEW.md)
