# WhatsApp Cloud API - Complete Setup Guide

> Step-by-step guide to connect your WhatsApp Business Account and start receiving messages with your AI agents.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Meta Developer Console Setup](#step-1-meta-developer-console-setup)
4. [Step 2: Connect WhatsApp Account in AgentForge](#step-2-connect-whatsapp-account-in-agentforge)
5. [Step 3: Register Your Phone Number](#step-3-register-your-phone-number)
6. [Step 4: Configure Webhooks](#step-4-configure-webhooks)
7. [Step 5: Link Agent to Phone Number](#step-5-link-agent-to-phone-number)
8. [Step 6: Test Your Integration](#step-6-test-your-integration)
9. [Understanding Account Statuses](#understanding-account-statuses)
10. [Troubleshooting](#troubleshooting)
11. [FAQ](#faq)

---

## Overview

AgentForge uses **Meta's WhatsApp Cloud API** with **Embedded Signup** to provide a seamless WhatsApp integration. This allows your AI agents to:

- ✅ Receive incoming WhatsApp messages
- ✅ Send automated AI-powered responses
- ✅ Handle customer conversations 24/7
- ✅ Use approved message templates
- ✅ Send rich media (images, documents, etc.)

### Architecture

```
Customer → WhatsApp → Meta Cloud API → Webhook → AgentForge → AI Agent → Response
```

---

## Prerequisites

Before you begin, ensure you have:

| Requirement | Description |
|-------------|-------------|
| **Meta Account** | Personal Facebook account to access Meta Business Suite |
| **Business Information** | Business name, address, and category |
| **Phone Number** | A phone number NOT currently registered with WhatsApp |
| **AgentForge Account** | Active account with email verified |
| **AI Agent Created** | At least one agent configured in AgentForge |

### Important Notes About Phone Numbers

⚠️ **The phone number you use CANNOT be:**
- Currently registered with WhatsApp (personal or business app)
- Used on another WhatsApp Business Account

💡 **To use an existing WhatsApp number:**
1. Delete WhatsApp from that phone
2. Wait 5-10 minutes
3. Then register it for Business API

---

## Step 1: Meta Developer Console Setup

### 1.1 Create a Meta App

1. Go to **[developers.facebook.com](https://developers.facebook.com)**
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** as the app type
4. Fill in:
   - **App Name**: Your business name (e.g., "My Company WhatsApp")
   - **App Contact Email**: Your business email
   - **Business Portfolio**: Select or create one
5. Click **"Create App"**

### 1.2 Configure App Settings

1. In your app dashboard, go to **App Settings** → **Basic**
2. Note down your **App ID** (you'll need this)
3. Add your **App Domains**: `yourdomain.com`
4. Set **Privacy Policy URL**: `https://yourdomain.com/privacy`
5. Click **Save Changes**

### 1.3 Add Facebook Login for Business

1. In the left sidebar, click **"Add Product"**
2. Find **"Facebook Login for Business"** → Click **"Set Up"**
3. Go to **Facebook Login for Business** → **Settings**
4. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://yourdomain.com/api/whatsapp-cloud/oauth/callback
   ```
5. Click **Save Changes**

### 1.4 Configure Embedded Signup Permissions

1. Go to **App Review** → **Permissions and Features**
2. Request these permissions (some may need App Review):
   - `whatsapp_business_management` ✅
   - `whatsapp_business_messaging` ✅
3. For development/testing, add yourself as a **Test User**:
   - Go to **App Roles** → **Test Users**
   - Click **"Add"** and enter your Facebook email

### 1.5 Get App Secret

1. Go to **App Settings** → **Basic**
2. Click **"Show"** next to **App Secret**
3. Copy the secret (you'll need this for webhook verification)

---

## Step 2: Connect WhatsApp Account in AgentForge

### 2.1 Navigate to WhatsApp Accounts

1. Login to AgentForge at `https://yourdomain.com`
2. Go to **Dashboard** → **WhatsApp Business** → **WhatsApp Accounts**
3. Click **"Connect WhatsApp Account"**

### 2.2 Complete the Meta Popup

1. A Meta login popup will appear
2. **Login** with your Facebook account
3. Follow the prompts to:
   - Select or create a **Meta Business Portfolio**
   - Select or create a **WhatsApp Business Account**
   - Optionally add a phone number (you can do this later)
4. Click **"Continue"** and **"Allow"** permissions

### 2.3 Verify Connection

After the popup closes:
1. You'll be redirected to your WhatsApp Accounts page
2. Your new account should appear with status **"Active"**
3. Click **"Manage"** to see account details

### What Gets Created:

| Item | Description |
|------|-------------|
| **WhatsApp Business Account (WABA)** | Your business identity on WhatsApp |
| **Access Token** | Secure token for API calls (encrypted in our database) |
| **Webhook Verify Token** | Unique token for webhook verification |

---

## Step 3: Register Your Phone Number

### 3.1 Important: Prepare Your Phone Number

Before registering, ensure the phone number:
- ✅ Can receive SMS or voice calls
- ❌ Is NOT currently used with WhatsApp app
- ❌ Is NOT registered to another WhatsApp Business Account

**If the number is currently on WhatsApp:**
1. Open WhatsApp on that phone
2. Go to **Settings** → **Account** → **Delete Account**
3. Or uninstall WhatsApp completely
4. Wait **5-10 minutes** before proceeding

### 3.2 Add Phone Number via Meta Business Suite

1. Go to **[business.facebook.com/settings/whatsapp-business-accounts](https://business.facebook.com/settings/whatsapp-business-accounts)**
2. Click on your **WhatsApp Business Account**
3. Go to **"Phone Numbers"** tab
4. Click **"Add Phone Number"**
5. Enter your phone number with country code (e.g., +1 555 123 4567)
6. Choose verification method: **SMS** or **Voice Call**
7. Click **"Next"**
8. Enter the **6-digit verification code** you receive
9. Complete the profile setup (display name, business category)

### 3.3 Sync Phone Number in AgentForge

1. Go to **Dashboard** → **WhatsApp Accounts**
2. Click **"Manage"** on your account
3. Click **"Sync with Meta"** button
4. Your phone number should now appear with status **"Active"**

---

## Step 4: Configure Webhooks

Webhooks allow your app to receive incoming WhatsApp messages.

### 4.1 Get Your Webhook Details

1. In AgentForge, go to **WhatsApp Accounts** → **Manage** your account
2. Scroll down to **"Webhook Configuration"** section
3. Copy the two values:
   - **Callback URL**: `https://yourdomain.com/api/whatsapp-cloud/webhook`
   - **Verify Token**: (your unique token shown here)

### 4.2 Configure Webhook in Meta

1. Go to **[developers.facebook.com/apps](https://developers.facebook.com/apps)**
2. Select your app
3. In the left sidebar, click **"Add Product"**
4. Find **"Webhooks"** → Click **"Set Up"**
5. In the Webhooks section, select **"WhatsApp Business Account"** from dropdown
6. Click **"Subscribe to this object"**
7. Enter:
   - **Callback URL**: Paste from AgentForge
   - **Verify Token**: Paste from AgentForge
8. Click **"Verify and Save"**

### 4.3 Subscribe to Webhook Fields

After verification, you'll see a list of fields. Subscribe to:

| Field | Purpose |
|-------|---------|
| `messages` | ✅ Required - Receive incoming messages |
| `message_template_status_update` | Optional - Template approval notifications |

Click the **"Subscribe"** toggle for each field.

### 4.4 Alternative: Configure via WhatsApp Product

If you added WhatsApp as a product:
1. Go to **WhatsApp** → **Configuration** in left sidebar
2. Under **Webhook**, click **"Edit"**
3. Enter Callback URL and Verify Token
4. Click **"Verify and Save"**
5. Subscribe to `messages` field

---

## Step 5: Link Agent to Phone Number

### 5.1 Create an AI Agent (if not done)

1. Go to **Dashboard** → **AI Agents** → **Create Agent**
2. Configure your agent:
   - Name
   - Website (for knowledge scanning)
   - Business category
   - Language
3. Wait for website scan to complete

### 5.2 Link Agent to Phone Number

1. Go to **WhatsApp Accounts** → **Manage** your account
2. Click **"Manage Numbers"** button
3. Find your phone number
4. Click **"Link Agent"**
5. Select your AI agent from the dropdown
6. Click **"Confirm"**

Now all incoming messages to that phone number will be handled by your AI agent!

---

## Step 6: Test Your Integration

### 6.1 Send a Test Message

1. Open WhatsApp on any phone (different from your business number)
2. Send a message to your business number
3. Your AI agent should respond automatically!

### 6.2 Check Logs (Debug)

If messages aren't being received:
1. Check your server logs for webhook activity
2. Look for `[Webhook]` log entries
3. Verify the phone number is linked to an agent

### 6.3 Test via Meta API Setup (Alternative)

1. Go to **[developers.facebook.com/apps](https://developers.facebook.com/apps)**
2. Select your app → **WhatsApp** → **API Setup**
3. Use the **"Send Message"** tool to send test messages
4. Add recipient phone numbers in the **"To"** field

---

## Understanding Account Statuses

### Account Status

| Status | Meaning |
|--------|---------|
| **Active** ✅ | Account is connected and working |
| **Pending** ⏳ | Awaiting verification or approval |
| **Suspended** 🚫 | Account suspended by Meta |
| **Disconnected** ❌ | Account was manually disconnected |

### Business Verification Status

| Status | Meaning | Action |
|--------|---------|--------|
| **Verified** ✅ | Business identity confirmed | None needed |
| **Not Verified** ⚠️ | Business not yet verified | Complete verification in Meta Business Settings |
| **Pending** ⏳ | Verification in progress | Wait for Meta review |

### Account Review Status

| Status | Meaning |
|--------|---------|
| **Approved** ✅ | Full API access |
| **Pending** ⏳ | Under review (normal for new accounts) |
| **Rejected** ❌ | Contact Meta support |

### Phone Number Status

| Status | Meaning | Action |
|--------|---------|--------|
| **Active** ✅ | Ready to send/receive | None |
| **Pending** ⏳ | Not registered with Meta | Add via Meta Business Suite |
| **Offline** 🔴 | Registered but not active | Check Meta settings |

---

## Troubleshooting

### "Phone number is already registered to a WhatsApp account"

**Cause**: The number is used on WhatsApp mobile app or another business account.

**Solution**:
1. If it's your phone: Delete WhatsApp from that phone
2. If it's on another WABA: Remove it from that account first
3. Wait 5-10 minutes, then try again

### "Verification code limit exceeded"

**Cause**: Too many verification attempts.

**Solution**: Wait 1-24 hours, then try again.

### Webhook verification fails

**Cause**: Incorrect callback URL or verify token.

**Solution**:
1. Ensure URL is exactly: `https://yourdomain.com/api/whatsapp-cloud/webhook`
2. Make sure HTTPS is working (valid SSL certificate)
3. Copy verify token exactly from AgentForge

### Sync shows "Phone numbers from Meta: []"

**Cause**: Phone number not registered on Meta side.

**Solution**: Add phone number via Meta Business Suite (Step 3.2)

### "Error performing query" in Meta

**Cause**: Temporary Meta platform issue.

**Solution**: 
1. Try a different browser / incognito mode
2. Wait and try again later
3. Contact Meta support if persistent

### Messages not being received

**Cause**: Webhook not configured or agent not linked.

**Solution**:
1. Verify webhook is configured (Step 4)
2. Check webhook subscriptions include `messages`
3. Ensure agent is linked to phone number (Step 5)

---

## FAQ

### Q: Do I need business verification to test?

**A**: No! You can test with unverified status. Verification is only required for:
- Higher messaging limits (>1000/day)
- Verified badge on profile

### Q: How many messages can I send?

**A**: Default tier is **1,000 business-initiated conversations per 24 hours**. This increases with quality rating and verification.

### Q: Can I use my personal WhatsApp number?

**A**: Yes, but you must delete WhatsApp from that phone first. You cannot use the same number for both personal and business API simultaneously.

### Q: How do I increase my messaging limit?

**A**: Complete business verification and maintain a good quality rating. Limits increase automatically: 1K → 10K → 100K → Unlimited.

### Q: What happens if I disconnect my account?

**A**: Your agents will stop receiving WhatsApp messages. You can reconnect anytime using the same process.

### Q: Can I have multiple phone numbers?

**A**: Yes! You can add multiple phone numbers to one WABA and link different agents to each.

### Q: Why is my account review pending?

**A**: This is normal for new accounts. Meta reviews accounts automatically. It usually takes 24-72 hours and requires no action from you.

---

## Environment Variables Reference

For self-hosted deployments, configure these in your `.env`:

```env
# Meta App Configuration
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_GRAPH_API_VERSION=v21.0

# Webhook Verification
META_WEBHOOK_VERIFY_TOKEN=optional_global_token

# OAuth Callback
WHATSAPP_OAUTH_REDIRECT_URI=https://yourdomain.com/api/whatsapp-cloud/oauth/callback
```

---

## Support

If you encounter issues not covered here:

1. **Check server logs** for detailed error messages
2. **Meta Documentation**: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
3. **Meta Support**: [business.facebook.com/help](https://business.facebook.com/help)
4. **AgentForge Support**: Contact your administrator

---

*Last updated: January 2026*
