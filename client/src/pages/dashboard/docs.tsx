import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Docs() {
  return (
    <DashboardLayout title="Product Documentation">
      <ScrollArea className="max-w-4xl mx-auto py-8 px-4 md:px-8 h-[calc(100vh-100px)]">
        <div className="prose prose-lg max-w-none">
          <h1>Product Documentation</h1>
          <h2 id="product-overview">1. Product Overview</h2>
          <h3>What is this product?</h3>
          <p>A no-code AI platform that lets you create, train, and deploy AI chatbots for your website and WhatsApp. The system scans your website or uploaded content, builds a knowledge base, and powers your chatbot to answer questions using your own data.</p>
          <h3>Who is it for?</h3>
          <ul>
            <li>Business owners</li>
            <li>Customer support teams</li>
            <li>Marketers</li>
            <li>Agencies</li>
            <li>Developers and non-developers</li>
          </ul>
          <h3>Key Benefits</h3>
          <ul>
            <li>No coding required</li>
            <li>Fast setup (under 10 minutes)</li>
            <li>24/7 automated support</li>
            <li>Multi-channel (Website, WhatsApp)</li>
            <li>Easy management and analytics</li>
          </ul>
          <h3>Use Cases</h3>
          <ul>
            <li>Customer support automation</li>
            <li>Lead capture</li>
            <li>FAQ bots</li>
            <li>Appointment booking</li>
            <li>Product recommendations</li>
          </ul>

          <h2 id="how-it-works">2. How It Works</h2>
          <ol>
            <li>Sign up and log in.</li>
            <li>Create an AI agent (chatbot) in your dashboard.</li>
            <li>Scan your website or upload documents to build the knowledge base.</li>
            <li>Test your chatbot in the dashboard.</li>
            <li>Deploy on your website (via widget) or WhatsApp.</li>
            <li>Monitor conversations and analytics.</li>
            <li>Integrate with 50+ apps (Google Sheets, Slack, Shopify, etc.) using the workflow builder.</li>
          </ol>

          <h2 id="getting-started">3. Getting Started</h2>
          <h3>Account Signup</h3>
          <ol>
            <li>Go to the <a href="/signup">Sign Up</a> page.</li>
            <li>Enter your name, email, and password.</li>
            <li>Click <b>Sign Up</b>.</li>
            <li>Confirm your email if prompted.</li>
          </ol>
          <h3>Login</h3>
          <ol>
            <li>Go to the <a href="/login">Login</a> page.</li>
            <li>Enter your email and password.</li>
            <li>Click <b>Login</b>.</li>
          </ol>
          <h3>Dashboard Overview</h3>
          <ul>
            <li><b>Agents:</b> Manage your chatbots.</li>
            <li><b>Knowledge:</b> Add, edit, or delete information your bots use.</li>
            <li><b>Conversations:</b> View chat history and analytics.</li>
            <li><b>Integrations:</b> Connect to WhatsApp and other apps.</li>
            <li><b>Settings:</b> Update your profile and preferences.</li>
          </ul>

          <h2 id="user-guide">4. User Guide</h2>
          <h3>Create a New AI Agent</h3>
          <ol>
            <li>Go to <b>Agents</b>.</li>
            <li>Click <b>Create New Agent</b>.</li>
            <li>Enter a name and description.</li>
            <li>Choose the type (Website or WhatsApp).</li>
            <li>Click <b>Save</b>.</li>
          </ol>
          <h3>Scan a Website</h3>
          <ol>
            <li>Select your agent.</li>
            <li>Click <b>Scan Website</b>.</li>
            <li>Enter your website URL (e.g., https://yourcompany.com).</li>
            <li>Click <b>Start Scan</b>.</li>
            <li>Wait for the scan to finish.</li>
          </ol>
          <h3>Upload and Manage Knowledge</h3>
          <ol>
            <li>Go to <b>Knowledge</b>.</li>
            <li>Click <b>Add Knowledge</b>.</li>
            <li>Paste text, upload a file, or add a URL.</li>
            <li>Click <b>Save</b>.</li>
            <li>Edit or delete entries as needed.</li>
          </ol>
          <h3>How Chatbot Responses Work</h3>
          <ul>
            <li>The chatbot uses your website and uploaded knowledge to answer questions.</li>
            <li>It matches user questions to the most relevant content.</li>
            <li>You can review and improve responses in the <b>Knowledge</b> section.</li>
          </ul>
          <h3>Test the Chatbot</h3>
          <ol>
            <li>Go to <b>Test Chatbot</b>.</li>
            <li>Select your agent.</li>
            <li>Type a question and press Enter.</li>
            <li>Review the response.</li>
          </ol>
          <h3>Deploy on Website</h3>
          <ol>
            <li>Go to your agent’s settings.</li>
            <li>Copy the widget code.</li>
            <li>Paste it into your website’s HTML before the <code>&lt;/body&gt;</code> tag.</li>
          </ol>
          <h3>Deploy on WhatsApp</h3>
          <ol>
            <li>Go to <b>Integrations &gt; WhatsApp</b>.</li>
            <li>Connect your WhatsApp Business account.</li>
            <li>Assign a phone number to your agent.</li>
            <li>Activate the integration.</li>
          </ol>

          <h2 id="integrations--workflow-automation">5. Integrations & Workflow Automation</h2>
          <h3>Supported Integrations</h3>
          <ul>
            <li>WhatsApp</li>
            <li>Google Sheets</li>
            <li>Slack</li>
            <li>Telegram</li>
            <li>Shopify</li>
            <li>Gmail/Outlook</li>
            <li>Stripe</li>
            <li>Mailchimp</li>
            <li>Webhooks</li>
            <li>And 40+ more</li>
          </ul>
          <h3>Step-by-Step Integration Guides</h3>
          <h4>Google Sheets Integration</h4>
          <ol>
            <li>Go to <b>Integrations</b>.</li>
            <li>Click <b>New Integration</b>.</li>
            <li>Select <b>Google Sheets</b>.</li>
            <li>Choose a trigger (e.g., “New Row Added”).</li>
            <li>Connect your Google account and grant permissions.</li>
            <li>Map the data fields (e.g., customer name, email).</li>
            <li>Add actions (e.g., “Add Row”, “Update Row”).</li>
            <li>Save and activate the integration.</li>
            <li>Test the integration using the <b>Test</b> button.</li>
          </ol>
          <h4>Slack Integration</h4>
          <ol>
            <li>Go to <b>Integrations</b>.</li>
            <li>Click <b>New Integration</b>.</li>
            <li>Select <b>Slack</b>.</li>
            <li>Choose a trigger (e.g., “Message Received”).</li>
            <li>Connect your Slack workspace.</li>
            <li>Map the data fields.</li>
            <li>Add actions (e.g., “Send Message”, “Upload File”).</li>
            <li>Save and activate.</li>
            <li>Test and monitor logs.</li>
          </ol>
          <h4>Webhook Integration</h4>
          <ol>
            <li>Go to <b>Integrations</b>.</li>
            <li>Click <b>New Integration</b>.</li>
            <li>Select <b>Webhook</b>.</li>
            <li>Enter your webhook URL.</li>
            <li>Choose trigger and action.</li>
            <li>Map data fields.</li>
            <li>Save and test.</li>
          </ol>
          <p>For each integration, follow the on-screen instructions. If you need help, click the “?” icon next to each field.</p>

          <h2 id="whatsapp-ai-agent">6. WhatsApp AI Agent</h2>
          <h3>How WhatsApp Integration Works</h3>
          <ul>
            <li>Connect your WhatsApp Business account.</li>
            <li>Assign a phone number to your AI agent.</li>
            <li>Incoming WhatsApp messages are routed to your agent.</li>
            <li>The agent replies using your knowledge base.</li>
          </ul>
          <h3>Message Flow</h3>
          <ol>
            <li>Customer sends a WhatsApp message.</li>
            <li>The platform receives and processes the message.</li>
            <li>The AI agent finds the best answer.</li>
            <li>The reply is sent back to the customer.</li>
          </ol>
          <h3>Example Conversation</h3>
          <pre><code>Customer: What are your opening hours?
AI Agent: Our opening hours are 9am to 6pm, Monday to Friday.</code></pre>
          <h3>Error Handling</h3>
          <ul>
            <li><b>Invalid phone number:</b> Check your WhatsApp number is correct and registered.</li>
            <li><b>No response:</b> Ensure your agent is active and has knowledge uploaded.</li>
            <li><b>Integration failed:</b> Reconnect your WhatsApp account and check credentials.</li>
          </ul>

          <h2 id="admin-guide">7. Admin Guide</h2>
          <h3>Managing Users</h3>
          <ul>
            <li>Go to <b>Settings &gt; Users</b> (if enabled).</li>
            <li>Add or remove users as needed.</li>
          </ul>
          <h3>Managing Agents</h3>
          <ul>
            <li>View all agents in <b>Agents</b>.</li>
            <li>Edit, deactivate, or delete agents.</li>
          </ul>
          <h3>Monitoring Conversations</h3>
          <ul>
            <li>Go to <b>Conversations</b>.</li>
            <li>Filter by agent, date, or channel.</li>
            <li>Export conversations if needed.</li>
          </ul>
          <h3>Logs and Analytics</h3>
          <ul>
            <li>Access analytics in <b>Dashboard</b> or <b>Analytics</b>.</li>
            <li>View metrics like total conversations, response rate, and user satisfaction.</li>
            <li>Check logs for errors or failed integrations.</li>
          </ul>

          <h2 id="faqs">8. FAQs</h2>
          <h3>General</h3>
          <ul>
            <li><b>How long does it take to set up?</b> Most users are live in under 10 minutes.</li>
            <li><b>Do I need to code?</b> No, everything is point-and-click.</li>
            <li><b>Can I use my own data?</b> Yes, scan your website or upload documents.</li>
            <li><b>What if my bot gives a wrong answer?</b> Update or add knowledge to improve accuracy.</li>
            <li><b>Can I use both WhatsApp and website chat?</b> Yes, you can deploy on both channels.</li>
          </ul>
          <h3>Troubleshooting</h3>
          <ul>
            <li><b>Scan not working:</b> Check your website URL and try again.</li>
            <li><b>No responses:</b> Make sure your agent has knowledge uploaded.</li>
            <li><b>WhatsApp not connecting:</b> Verify your WhatsApp Business credentials.</li>
            <li><b>Widget not showing:</b> Ensure the code is placed before <code>&lt;/body&gt;</code> and there are no JavaScript errors.</li>
            <li><b>Integration errors:</b> Check API keys, permissions, and logs.</li>
          </ul>

          <h2 id="best-practices">9. Best Practices</h2>
          <ul>
            <li>Use clear, simple language in your knowledge base.</li>
            <li>Add FAQs and common questions.</li>
            <li>Keep answers concise and relevant.</li>
            <li>Regularly update your knowledge base.</li>
            <li>Test with real user questions.</li>
            <li>Remove outdated or incorrect information.</li>
            <li>Avoid duplicate or conflicting entries.</li>
            <li>Test both website and WhatsApp flows.</li>
          </ul>

          <h2 id="glossary">10. Glossary</h2>
          <table>
            <thead>
              <tr><th>Term</th><th>Definition</th></tr>
            </thead>
            <tbody>
              <tr><td>Agent</td><td>An AI chatbot you create on the platform</td></tr>
              <tr><td>Knowledge</td><td>The information your agent uses to answer questions</td></tr>
              <tr><td>Widget</td><td>The chat bubble you add to your website</td></tr>
              <tr><td>Integration</td><td>Connecting your agent to other apps (e.g., WhatsApp)</td></tr>
              <tr><td>Trigger</td><td>An event that starts a workflow (e.g., message received)</td></tr>
              <tr><td>Action</td><td>What happens after a trigger (e.g., send email, reply)</td></tr>
              <tr><td>Dashboard</td><td>The main control panel for your account</td></tr>
              <tr><td>Conversation</td><td>A chat session between a user and your agent</td></tr>
              <tr><td>Admin</td><td>A user with permission to manage the platform</td></tr>
              <tr><td>Analytics</td><td>Data and statistics about your agents and conversations</td></tr>
            </tbody>
          </table>

          <h2 id="links--resources">11. Links & Resources</h2>
          <ul>
            <li><a href="/signup">Sign Up</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/help">Help Center</a></li>
            <li><a href="mailto:support@yourdomain.com">Contact Support</a></li>
            <li><a href="/api-docs">API Documentation</a></li>
            <li><a href="/widget-guide">Widget Installation Guide</a></li>
            <li><a href="/whatsapp-guide">WhatsApp Integration Guide</a></li>
          </ul>
          <h2 id="integration-app-guides">12. Integration App Guides</h2>
          <h3>How to Build Flows (for Any App)</h3>
          <ol>
            <li>Go to <b>Integrations</b> in your dashboard.</li>
            <li>Click <b>New Integration</b>.</li>
            <li>Choose your app (e.g., Google Sheets, Slack, WhatsApp, etc.).</li>
            <li>Select a <b>trigger</b> (what starts the flow, e.g., “Message Received”, “New Row Added”).</li>
            <li>Add one or more <b>actions</b> (what happens next, e.g., “Send Email”, “Add Row”, “Send WhatsApp Message”).</li>
            <li>Map data fields using smart variables (e.g., <code>{"{{customer_email}}"}</code>).</li>
            <li>Save and <b>activate</b> your integration.</li>
            <li>Test your flow using the <b>Test</b> button.</li>
            <li>Monitor execution logs and errors.</li>
          </ol>
          <p>Tip: You can chain multiple actions, add conditions, and connect multiple apps in one workflow!</p>

          <h3>All Supported Apps (Step-by-Step Guides)</h3>
          <p>Browse every integration below. Click to expand each app for details, setup, triggers, actions, and workflow examples.</p>

          {/* Communication */}
          <details><summary><b>WhatsApp Business</b></summary>
            <ul>
              <li><b>What it does:</b> Send/receive WhatsApp messages, templates, media, buttons.</li>
              <li><b>Use cases:</b> Customer support, order updates, appointment reminders.</li>
              <li><b>How to connect:</b> Integrations → WhatsApp → Connect account → Assign number.</li>
              <li><b>Triggers:</b> Message received, image/document/audio/location received, button clicked, etc.</li>
              <li><b>Actions:</b> Send message, reply, send template, send media, send buttons, mark as read, etc.</li>
              <li><b>Example flow:</b> When a WhatsApp message is received, add the customer to Google Sheets and send a reply.</li>
            </ul>
          </details>
          <details><summary><b>Telegram</b></summary>
            <ul>
              <li><b>What it does:</b> Send/receive Telegram messages, photos, documents, buttons.</li>
              <li><b>Use cases:</b> Customer notifications, support, group alerts.</li>
              <li><b>How to connect:</b> Enter bot token and chat ID.</li>
              <li><b>Triggers:</b> Message/photo/document/voice/command received, button clicked, etc.</li>
              <li><b>Actions:</b> Send message, reply, send photo, send buttons, etc.</li>
              <li><b>Example flow:</b> When a new order is placed, send a Telegram alert to your team.</li>
            </ul>
          </details>
          <details><summary><b>Slack</b></summary>
            <ul>
              <li><b>What it does:</b> Send messages, upload files, reply in threads, receive Slack events.</li>
              <li><b>Use cases:</b> Team notifications, support escalation, chat logs.</li>
              <li><b>How to connect:</b> Authorize your Slack workspace.</li>
              <li><b>Triggers:</b> Message posted, thread reply, bot mentioned, reaction added, etc.</li>
              <li><b>Actions:</b> Send message, reply, upload file, add reaction, etc.</li>
              <li><b>Example flow:</b> When a customer requests a callback, send a Slack message to the support channel.</li>
            </ul>
          </details>
          <details><summary><b>Discord</b></summary>
            <ul>
              <li><b>What it does:</b> Send/receive Discord messages, embeds, reactions, manage channels.</li>
              <li><b>Use cases:</b> Community support, notifications, bot automation.</li>
              <li><b>How to connect:</b> Enter bot token and server/channel info.</li>
              <li><b>Triggers:</b> Message received, reaction added, member joined, etc.</li>
              <li><b>Actions:</b> Send message, reply, send embed, add reaction, manage roles, etc.</li>
              <li><b>Example flow:</b> When a new support ticket is created, post to a Discord channel.</li>
            </ul>
          </details>
          <details><summary><b>SMS (Twilio)</b></summary>
            <ul>
              <li><b>What it does:</b> Send/receive SMS and MMS, make calls, verify numbers.</li>
              <li><b>Use cases:</b> SMS alerts, OTP, appointment reminders.</li>
              <li><b>How to connect:</b> Enter Twilio account SID and auth token.</li>
              <li><b>Triggers:</b> SMS/MMS received, call received, status update.</li>
              <li><b>Actions:</b> Send SMS/MMS, make call, send WhatsApp (via Twilio), verify number.</li>
              <li><b>Example flow:</b> When a new lead is captured, send an SMS confirmation.</li>
            </ul>
          </details>
          <details><summary><b>Microsoft Teams</b></summary>
            <ul>
              <li><b>What it does:</b> Send/receive Teams messages, manage channels, schedule meetings.</li>
              <li><b>Use cases:</b> Team alerts, meeting scheduling, support escalation.</li>
              <li><b>How to connect:</b> Authorize with Microsoft account.</li>
              <li><b>Triggers:</b> Message received, channel created, member added, etc.</li>
              <li><b>Actions:</b> Send message, reply, send card, schedule meeting, manage members.</li>
              <li><b>Example flow:</b> When a new appointment is booked, create a Teams meeting and notify the team.</li>
            </ul>
          </details>
          <details><summary><b>Webhooks (Incoming/Outgoing)</b></summary>
            <ul>
              <li><b>What it does:</b> Send/receive data to/from any API or service.</li>
              <li><b>Use cases:</b> Custom integrations, notifications, data sync.</li>
              <li><b>How to connect:</b> Enter webhook URL and configure method/headers.</li>
              <li><b>Triggers:</b> Webhook received, custom event.</li>
              <li><b>Actions:</b> Send webhook, receive data, trigger custom flows.</li>
              <li><b>Example flow:</b> When a new lead is captured, send their info to your CRM via webhook.</li>
            </ul>
          </details>

          {/* Email */}
          <details><summary><b>Gmail</b></summary>
            <ul>
              <li><b>What it does:</b> Send/receive emails, manage labels, reply, forward, search.</li>
              <li><b>Use cases:</b> Automated replies, lead follow-up, support tickets.</li>
              <li><b>How to connect:</b> Sign in with your Google account.</li>
              <li><b>Triggers:</b> Email received, with attachment, label added, etc.</li>
              <li><b>Actions:</b> Send email, reply, forward, add label, search, etc.</li>
              <li><b>Example flow:</b> When a new lead is captured, send a welcome email and log the info in Google Sheets.</li>
            </ul>
          </details>
          <details><summary><b>Outlook</b></summary>
            <ul>
              <li><b>What it does:</b> Send/receive emails, manage folders, reply, forward, schedule events.</li>
              <li><b>Use cases:</b> Automated replies, meeting scheduling, support tickets.</li>
              <li><b>How to connect:</b> Sign in with your Microsoft account.</li>
              <li><b>Triggers:</b> Email received, calendar event, meeting invite, etc.</li>
              <li><b>Actions:</b> Send email, reply, forward, create event, move email, etc.</li>
              <li><b>Example flow:</b> When a meeting is scheduled, send a confirmation email and add to Google Calendar.</li>
            </ul>
          </details>
          <details><summary><b>SMTP Email</b></summary>
            <ul>
              <li><b>What it does:</b> Send emails via any SMTP server.</li>
              <li><b>Use cases:</b> Transactional emails, notifications, custom email flows.</li>
              <li><b>How to connect:</b> Enter SMTP host, port, username, and password.</li>
              <li><b>Triggers:</b> (Outbound only)</li>
              <li><b>Actions:</b> Send email, send with attachment, send template.</li>
              <li><b>Example flow:</b> When a new order is placed, send a receipt via SMTP.</li>
            </ul>
          </details>
          <details><summary><b>SendGrid</b></summary>
            <ul>
              <li><b>What it does:</b> Send transactional/bulk emails, manage contacts, track opens/clicks.</li>
              <li><b>Use cases:</b> Newsletters, transactional emails, analytics.</li>
              <li><b>How to connect:</b> Enter SendGrid API key.</li>
              <li><b>Triggers:</b> Email opened, clicked, bounced, delivered, etc.</li>
              <li><b>Actions:</b> Send email, send template, add/remove/search contacts, get stats.</li>
              <li><b>Example flow:</b> When a user signs up, add them to SendGrid and send a welcome email.</li>
            </ul>
          </details>
          <details><summary><b>Mailchimp</b></summary>
            <ul>
              <li><b>What it does:</b> Manage subscribers, send campaigns, add tags, segment lists.</li>
              <li><b>Use cases:</b> Newsletter signups, campaign automation, lead tagging.</li>
              <li><b>How to connect:</b> Enter Mailchimp API key and audience ID.</li>
              <li><b>Triggers:</b> New subscriber, campaign sent, tag added, etc.</li>
              <li><b>Actions:</b> Add/update/archive subscriber, send campaign, add/remove tag, etc.</li>
              <li><b>Example flow:</b> When a user signs up, add them to Mailchimp and send a welcome campaign.</li>
            </ul>
          </details>

          {/* CRM & Sales */}
          <details><summary><b>HubSpot</b></summary>
            <ul>
              <li><b>What it does:</b> Manage contacts, deals, tickets in HubSpot CRM.</li>
              <li><b>Use cases:</b> Lead capture, sales automation, support tickets.</li>
              <li><b>How to connect:</b> Enter HubSpot API key.</li>
              <li><b>Triggers:</b> New contact, deal, ticket, etc.</li>
              <li><b>Actions:</b> Create/update contact, deal, ticket, etc.</li>
              <li><b>Example flow:</b> When a new lead is captured, add to HubSpot and notify sales on Slack.</li>
            </ul>
          </details>
          <details><summary><b>Salesforce</b></summary>
            <ul>
              <li><b>What it does:</b> Sync contacts, deals, and opportunities with Salesforce CRM.</li>
              <li><b>Use cases:</b> Lead management, sales pipeline automation.</li>
              <li><b>How to connect:</b> Enter instance URL and access token.</li>
              <li><b>Triggers:</b> New contact, opportunity, case, etc.</li>
              <li><b>Actions:</b> Create/update contact, opportunity, case, etc.</li>
              <li><b>Example flow:</b> When a new deal is created, update Salesforce and send a Slack alert.</li>
            </ul>
          </details>
          <details><summary><b>Pipedrive</b></summary>
            <ul>
              <li><b>What it does:</b> Manage deals and contacts in Pipedrive CRM.</li>
              <li><b>Use cases:</b> Sales automation, lead tracking.</li>
              <li><b>How to connect:</b> Enter API token.</li>
              <li><b>Triggers:</b> New deal, contact, activity, etc.</li>
              <li><b>Actions:</b> Create/update deal, contact, activity, etc.</li>
              <li><b>Example flow:</b> When a lead is qualified, add to Pipedrive and send a follow-up email.</li>
            </ul>
          </details>
          <details><summary><b>Zoho CRM</b></summary>
            <ul>
              <li><b>What it does:</b> Sync leads and contacts with Zoho CRM.</li>
              <li><b>Use cases:</b> Lead management, contact sync.</li>
              <li><b>How to connect:</b> Enter client ID, secret, and refresh token.</li>
              <li><b>Triggers:</b> New lead, contact, deal, etc.</li>
              <li><b>Actions:</b> Create/update lead, contact, deal, etc.</li>
              <li><b>Example flow:</b> When a new lead is captured, add to Zoho and notify your team.</li>
            </ul>
          </details>
          <details><summary><b>Freshsales</b></summary>
            <ul>
              <li><b>What it does:</b> Manage contacts and deals in Freshsales CRM.</li>
              <li><b>Use cases:</b> Sales automation, lead tracking.</li>
              <li><b>How to connect:</b> Enter API key and domain.</li>
              <li><b>Triggers:</b> New contact, deal, activity, etc.</li>
              <li><b>Actions:</b> Create/update contact, deal, activity, etc.</li>
              <li><b>Example flow:</b> When a lead is captured, add to Freshsales and send a Slack notification.</li>
            </ul>
          </details>

          {/* Automation Platforms */}
          <details><summary><b>Zapier</b></summary>
            <ul>
              <li><b>What it does:</b> Connect to 5000+ apps via Zapier webhooks.</li>
              <li><b>Use cases:</b> Multi-app automation, custom workflows.</li>
              <li><b>How to connect:</b> Enter Zapier webhook URL.</li>
              <li><b>Triggers:</b> Webhook received, custom event.</li>
              <li><b>Actions:</b> Send webhook, trigger Zap.</li>
              <li><b>Example flow:</b> When a new lead is captured, trigger a Zap to update your CRM and send an email.</li>
            </ul>
          </details>
          <details><summary><b>Make (Integromat)</b></summary>
            <ul>
              <li><b>What it does:</b> Trigger Make scenarios via webhook.</li>
              <li><b>Use cases:</b> Multi-step automation, data sync.</li>
              <li><b>How to connect:</b> Enter Make webhook URL.</li>
              <li><b>Triggers:</b> Webhook received, custom event.</li>
              <li><b>Actions:</b> Send webhook, trigger scenario.</li>
              <li><b>Example flow:</b> When a new order is placed, trigger a Make scenario to update inventory and notify the team.</li>
            </ul>
          </details>
          <details><summary><b>n8n</b></summary>
            <ul>
              <li><b>What it does:</b> Trigger n8n workflows via webhook.</li>
              <li><b>Use cases:</b> Custom automation, data processing.</li>
              <li><b>How to connect:</b> Enter n8n webhook URL.</li>
              <li><b>Triggers:</b> Webhook received, custom event.</li>
              <li><b>Actions:</b> Send webhook, trigger workflow.</li>
              <li><b>Example flow:</b> When a support ticket is created, trigger an n8n workflow to update your helpdesk and send a notification.</li>
            </ul>
          </details>
          <details><summary><b>IFTTT</b></summary>
            <ul>
              <li><b>What it does:</b> Trigger IFTTT applets via webhook.</li>
              <li><b>Use cases:</b> Simple automations, smart home, notifications.</li>
              <li><b>How to connect:</b> Enter IFTTT webhook key and event name.</li>
              <li><b>Triggers:</b> Webhook received, custom event.</li>
              <li><b>Actions:</b> Send webhook, trigger applet.</li>
              <li><b>Example flow:</b> When a new lead is captured, trigger an IFTTT applet to add to Google Contacts.</li>
            </ul>
          </details>
          <details><summary><b>Power Automate</b></summary>
            <ul>
              <li><b>What it does:</b> Trigger Microsoft Power Automate flows via webhook.</li>
              <li><b>Use cases:</b> Business process automation, notifications.</li>
              <li><b>How to connect:</b> Enter Power Automate webhook URL.</li>
              <li><b>Triggers:</b> Webhook received, custom event.</li>
              <li><b>Actions:</b> Send webhook, trigger flow.</li>
              <li><b>Example flow:</b> When a new order is placed, trigger a Power Automate flow to update your ERP.</li>
            </ul>
          </details>

          {/* Database & Storage */}
          <details><summary><b>Airtable</b></summary>
            <ul>
              <li><b>What it does:</b> Read/write to Airtable bases and tables.</li>
              <li><b>Use cases:</b> Lead management, project tracking, CRM.</li>
              <li><b>How to connect:</b> Enter Airtable API key, base ID, and table ID.</li>
              <li><b>Triggers:</b> New record, record updated, etc.</li>
              <li><b>Actions:</b> Create/update/delete record, search, etc.</li>
              <li><b>Example flow:</b> When a new lead is captured, add to Airtable and notify your team.</li>
            </ul>
          </details>
          <details><summary><b>Notion</b></summary>
            <ul>
              <li><b>What it does:</b> Create pages and database entries in Notion.</li>
              <li><b>Use cases:</b> Knowledge management, project tracking.</li>
              <li><b>How to connect:</b> Enter Notion API key and database ID.</li>
              <li><b>Triggers:</b> New page, database entry, etc.</li>
              <li><b>Actions:</b> Create/update/delete page or entry.</li>
              <li><b>Example flow:</b> When a new support ticket is created, add to Notion database.</li>
            </ul>
          </details>
          <details><summary><b>Firebase</b></summary>
            <ul>
              <li><b>What it does:</b> Store and sync data in Firestore.</li>
              <li><b>Use cases:</b> Real-time data sync, chat logs, analytics.</li>
              <li><b>How to connect:</b> Enter project ID and credentials.</li>
              <li><b>Triggers:</b> Data added/updated, etc.</li>
              <li><b>Actions:</b> Add/update/delete document, query data.</li>
              <li><b>Example flow:</b> When a new chat is started, log to Firebase.</li>
            </ul>
          </details>
          <details><summary><b>Supabase</b></summary>
            <ul>
              <li><b>What it does:</b> Store and sync data in Supabase.</li>
              <li><b>Use cases:</b> Analytics, user management, chat logs.</li>
              <li><b>How to connect:</b> Enter Supabase URL and API key.</li>
              <li><b>Triggers:</b> Data added/updated, etc.</li>
              <li><b>Actions:</b> Add/update/delete record, query data.</li>
              <li><b>Example flow:</b> When a new user signs up, add to Supabase.</li>
            </ul>
          </details>
          <details><summary><b>MongoDB</b></summary>
            <ul>
              <li><b>What it does:</b> Store and query data in MongoDB collections.</li>
              <li><b>Use cases:</b> Data warehousing, analytics, chat logs.</li>
              <li><b>How to connect:</b> Enter connection string, database, and collection.</li>
              <li><b>Triggers:</b> Data added/updated, etc.</li>
              <li><b>Actions:</b> Add/update/delete document, query data.</li>
              <li><b>Example flow:</b> When a new order is placed, log to MongoDB.</li>
            </ul>
          </details>
          <details><summary><b>Dropbox</b></summary>
            <ul>
              <li><b>What it does:</b> Upload/download files to/from Dropbox.</li>
              <li><b>Use cases:</b> File storage, document sync, backups.</li>
              <li><b>How to connect:</b> Enter Dropbox access token.</li>
              <li><b>Triggers:</b> File uploaded, file deleted, etc.</li>
              <li><b>Actions:</b> Upload/download/delete file, list folder.</li>
              <li><b>Example flow:</b> When a document is generated, upload to Dropbox.</li>
            </ul>
          </details>
          <details><summary><b>AWS S3</b></summary>
            <ul>
              <li><b>What it does:</b> Store files in S3 buckets.</li>
              <li><b>Use cases:</b> File storage, backups, media hosting.</li>
              <li><b>How to connect:</b> Enter access key, secret, bucket, and region.</li>
              <li><b>Triggers:</b> File uploaded, file deleted, etc.</li>
              <li><b>Actions:</b> Upload/download/delete file, list bucket.</li>
              <li><b>Example flow:</b> When a report is generated, upload to S3.</li>
            </ul>
          </details>

          {/* E-commerce & Payments */}
          <details><summary><b>Stripe</b></summary>
            <ul>
              <li><b>What it does:</b> Manage payments, customers, invoices.</li>
              <li><b>Use cases:</b> Payment notifications, invoice automation, customer sync.</li>
              <li><b>How to connect:</b> Enter Stripe secret key.</li>
              <li><b>Triggers:</b> Payment received, invoice created, customer updated, etc.</li>
              <li><b>Actions:</b> Create customer, send invoice, refund payment, etc.</li>
              <li><b>Example flow:</b> When a payment is received, send a WhatsApp confirmation and update Google Sheets.</li>
            </ul>
          </details>
          <details><summary><b>Razorpay</b></summary>
            <ul>
              <li><b>What it does:</b> Process payments via Razorpay.</li>
              <li><b>Use cases:</b> Payment notifications, order sync.</li>
              <li><b>How to connect:</b> Enter key ID and key secret.</li>
              <li><b>Triggers:</b> Payment received, order created, etc.</li>
              <li><b>Actions:</b> Create payment, refund, etc.</li>
              <li><b>Example flow:</b> When a payment is received, update Google Sheets and notify your team.</li>
            </ul>
          </details>
          <details><summary><b>Shopify</b></summary>
            <ul>
              <li><b>What it does:</b> Sync orders, products, and customers with Shopify.</li>
              <li><b>Use cases:</b> Order notifications, product updates, customer sync.</li>
              <li><b>How to connect:</b> Enter shop domain and access token.</li>
              <li><b>Triggers:</b> New order, product updated, customer created, etc.</li>
              <li><b>Actions:</b> Create order, update product, send notification, etc.</li>
              <li><b>Example flow:</b> When a new order is placed, notify your team on Slack and update Google Sheets.</li>
            </ul>
          </details>
          <details><summary><b>WooCommerce</b></summary>
            <ul>
              <li><b>What it does:</b> Manage WooCommerce orders and products.</li>
              <li><b>Use cases:</b> Order sync, product updates, customer notifications.</li>
              <li><b>How to connect:</b> Enter site URL, consumer key, and secret.</li>
              <li><b>Triggers:</b> New order, product updated, customer created, etc.</li>
              <li><b>Actions:</b> Create/update order, update product, etc.</li>
              <li><b>Example flow:</b> When a new order is placed, update Google Sheets and notify your team.</li>
            </ul>
          </details>
          <details><summary><b>PayPal</b></summary>
            <ul>
              <li><b>What it does:</b> Process PayPal payments, manage customers.</li>
              <li><b>Use cases:</b> Payment notifications, order sync.</li>
              <li><b>How to connect:</b> Enter client ID and secret.</li>
              <li><b>Triggers:</b> Payment received, order created, etc.</li>
              <li><b>Actions:</b> Create payment, refund, etc.</li>
              <li><b>Example flow:</b> When a payment is received, update Google Sheets and notify your team.</li>
            </ul>
          </details>

          {/* Productivity & Project Management */}
          <details><summary><b>Trello</b></summary>
            <ul>
              <li><b>What it does:</b> Create cards, manage boards and lists in Trello.</li>
              <li><b>Use cases:</b> Task management, project tracking, support tickets.</li>
              <li><b>How to connect:</b> Enter API key, token, and board ID.</li>
              <li><b>Triggers:</b> Card created, updated, moved, etc.</li>
              <li><b>Actions:</b> Create/update card, move card, add comment, etc.</li>
              <li><b>Example flow:</b> When a new support ticket is created, add a Trello card and notify your team.</li>
            </ul>
          </details>
          <details><summary><b>Asana</b></summary>
            <ul>
              <li><b>What it does:</b> Create tasks, manage projects in Asana.</li>
              <li><b>Use cases:</b> Task automation, project tracking.</li>
              <li><b>How to connect:</b> Enter access token and workspace ID.</li>
              <li><b>Triggers:</b> Task created, updated, completed, etc.</li>
              <li><b>Actions:</b> Create/update task, add comment, etc.</li>
              <li><b>Example flow:</b> When a new order is placed, create an Asana task for fulfillment.</li>
            </ul>
          </details>
          <details><summary><b>Jira</b></summary>
            <ul>
              <li><b>What it does:</b> Create issues, manage projects in Jira.</li>
              <li><b>Use cases:</b> Bug tracking, support tickets, project management.</li>
              <li><b>How to connect:</b> Enter domain, email, API token, and project key.</li>
              <li><b>Triggers:</b> Issue created, updated, etc.</li>
              <li><b>Actions:</b> Create/update issue, add comment, etc.</li>
              <li><b>Example flow:</b> When a new bug is reported, create a Jira issue and notify your team.</li>
            </ul>
          </details>
          <details><summary><b>Monday.com</b></summary>
            <ul>
              <li><b>What it does:</b> Create items, manage boards in Monday.com.</li>
              <li><b>Use cases:</b> Project management, task automation.</li>
              <li><b>How to connect:</b> Enter API key and board ID.</li>
              <li><b>Triggers:</b> Item created, updated, etc.</li>
              <li><b>Actions:</b> Create/update item, move item, etc.</li>
              <li><b>Example flow:</b> When a new lead is captured, create a Monday.com item for follow-up.</li>
            </ul>
          </details>
          <details><summary><b>ClickUp</b></summary>
            <ul>
              <li><b>What it does:</b> Create tasks, manage lists in ClickUp.</li>
              <li><b>Use cases:</b> Task automation, project tracking.</li>
              <li><b>How to connect:</b> Enter API key and list ID.</li>
              <li><b>Triggers:</b> Task created, updated, completed, etc.</li>
              <li><b>Actions:</b> Create/update task, add comment, etc.</li>
              <li><b>Example flow:</b> When a new order is placed, create a ClickUp task for fulfillment.</li>
            </ul>
          </details>
          <details><summary><b>Calendly</b></summary>
            <ul>
              <li><b>What it does:</b> Schedule meetings via Calendly.</li>
              <li><b>Use cases:</b> Appointment booking, lead scheduling.</li>
              <li><b>How to connect:</b> Enter API key.</li>
              <li><b>Triggers:</b> Meeting scheduled, canceled, etc.</li>
              <li><b>Actions:</b> Create meeting, cancel meeting, etc.</li>
              <li><b>Example flow:</b> When a new lead is captured, schedule a Calendly meeting and send a confirmation email.</li>
            </ul>
          </details>

          {/* Developer Tools */}
          <details><summary><b>Custom Integration</b></summary>
            <ul>
              <li><b>What it does:</b> Build your own integration with custom logic, webhooks, and API calls.</li>
              <li><b>Use cases:</b> Any custom workflow or app not listed above.</li>
              <li><b>How to connect:</b> Enter webhook URL, method, headers, and body template.</li>
              <li><b>Triggers:</b> Custom event, webhook received.</li>
              <li><b>Actions:</b> Send webhook, call API, etc.</li>
              <li><b>Example flow:</b> When a new event occurs, trigger your custom API and log the result.</li>
            </ul>
          </details>
          <details><summary><b>REST API</b></summary>
            <ul>
              <li><b>What it does:</b> Call any REST API endpoint.</li>
              <li><b>Use cases:</b> Custom integrations, data sync, notifications.</li>
              <li><b>How to connect:</b> Enter API URL, method, headers, and API key.</li>
              <li><b>Triggers:</b> Custom event, webhook received.</li>
              <li><b>Actions:</b> Call API, send/receive data.</li>
              <li><b>Example flow:</b> When a new lead is captured, call your CRM’s REST API to add the contact.</li>
            </ul>
          </details>
          <details><summary><b>GraphQL</b></summary>
            <ul>
              <li><b>What it does:</b> Execute GraphQL queries and mutations.</li>
              <li><b>Use cases:</b> Custom integrations, data sync, analytics.</li>
              <li><b>How to connect:</b> Enter endpoint and headers.</li>
              <li><b>Triggers:</b> Custom event, webhook received.</li>
              <li><b>Actions:</b> Execute query/mutation, get data.</li>
              <li><b>Example flow:</b> When a new order is placed, update inventory via GraphQL API.</li>
            </ul>
          </details>
          <details><summary><b>GitHub</b></summary>
            <ul>
              <li><b>What it does:</b> Create issues, manage repos, automate GitHub workflows.</li>
              <li><b>Use cases:</b> Bug tracking, release automation, notifications.</li>
              <li><b>How to connect:</b> Enter access token, owner, and repo.</li>
              <li><b>Triggers:</b> Issue created, PR opened, etc.</li>
              <li><b>Actions:</b> Create issue, comment, close issue, etc.</li>
              <li><b>Example flow:</b> When a bug is reported, create a GitHub issue and notify your team.</li>
            </ul>
          </details>
        </div>
      </ScrollArea>
    </DashboardLayout>
  );
}
