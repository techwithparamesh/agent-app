# AgentForge Quick Start Guide

> Get your first AI chatbot live in 5 minutes! 🚀

---

## Step 1: Sign Up (30 seconds)

1. Go to AgentForge → Click **"Get Started Free"**
2. Enter your name, email, and password
3. Click **"Create Account"**

---

## Step 2: Create an Agent (1 minute)

1. Click **"New Agent"** on your dashboard
2. Choose **"Website Assistant"** template
3. Name your agent (e.g., "Alex")
4. Click **"Create Agent"**

---

## Step 3: Scan Your Website (2 minutes)

1. Go to **Scan Website** in the sidebar
2. Enter your website URL
3. Click **"Start Scanning"**
4. Wait for the green "Complete" status ✅

---

## Step 4: Test Your Bot (1 minute)

1. Go to **Test Chatbot**
2. Select your agent
3. Ask: "What does your company do?"
4. Verify the response is accurate

---

## Step 5: Deploy! (30 seconds)

Copy this code to your website (before `</body>`):

```html
<script
  src="YOUR_AGENTFORGE_URL/widget.js"
  data-agent-id="YOUR_AGENT_ID"
  data-widget-key="YOUR_WIDGET_KEY"
></script>
```

Notes:
- `data-widget-key` is a public (non-secret) per-agent identifier used to reduce scraping/abuse. Existing agents may work without it until `WIDGET_KEY_ENFORCED=true`.
- You can restrict which domains can use the widget via `WIDGET_ALLOWED_ORIGINS` and/or per-agent `widgetConfig.allowedOrigins`.
- Widget requests are rate-limited and subject to plan/message limits.

Server config note:
- Set `APP_URL` to your SaaS domain (e.g. `https://digitalagency4us.cloud`). This is used to generate absolute links and to always allow your own SaaS domain (and subdomains) for widget origin checks.

---

## 🎉 You're Live!

Your AI chatbot is now helping visitors 24/7!

### Next Steps

- [ ] Customize widget colors
- [ ] Add more website pages
- [ ] Set up WhatsApp (paid plans)
- [ ] Review conversations

### Need Help?

📧 support@agentforge.com | 💬 Live Chat Available

---

*Read the full documentation: [PRODUCT_DOCUMENTATION.md](./PRODUCT_DOCUMENTATION.md)*
