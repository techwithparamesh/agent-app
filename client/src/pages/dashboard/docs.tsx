import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DocsContent() {
  return (
    <ScrollArea className="max-w-4xl mx-auto py-8 px-4 md:px-8 h-[calc(100vh-100px)]">
      <div className="prose prose-lg max-w-none">
          <h1>Product Documentation</h1>
          <nav aria-label="Table of contents" className="mb-6">
            <ul className="list-disc ml-6 space-y-1 text-sm">
              <li><a href="#product-overview">1. Product Overview</a></li>
              <li><a href="#how-it-works">2. How It Works</a></li>
              <li><a href="#getting-started">3. Getting Started</a></li>
              <li><a href="#user-guide">4. User Guide</a></li>
              <li><a href="#integrations--workflow-automation">5. Integrations & Workflow Automation</a></li>
              <li><a href="#whatsapp-ai-agent">6. WhatsApp AI Agent</a></li>
              <li><a href="#admin-guide">7. Admin Guide</a></li>
              <li><a href="#faqs">8. FAQs</a></li>
              <li><a href="#best-practices">9. Best Practices</a></li>
              <li><a href="#glossary">10. Glossary</a></li>
              <li><a href="#links--resources">11. Links & Resources</a></li>
              <li><a href="#integration-app-guides">12. Integration App Guides</a></li>
            </ul>
          </nav>
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

          <h3>Quick Start — Live in 5 Minutes</h3>
          <p>This short path gets you from zero to a live chatbot in under five minutes. It's aimed at non-technical users and busy teams.</p>
          <ol>
            <li><b>Create an account:</b> Go to <a href="/signup">Sign Up</a>, enter your name and email, then confirm your account.</li>
            <li><b>Create an agent:</b> In the dashboard click <b>My Agents → Create New Agent</b>. Choose <i>Website</i> (or <i>WhatsApp</i>) and give it a name.</li>
            <li><b>Scan your website:</b> From the agent page choose <b>Scan Website</b>, enter your site URL (https://yourcompany.com) and start the scan — the system extracts pages, FAQs and text automatically.</li>
            <li><b>Test:</b> Open <b>Test Agents</b> (Test Chatbot), pick your agent, ask a question and confirm the response.</li>
            <li><b>Deploy:</b> Copy the widget snippet (see "Deploy on Website" below) into your site before <code>&lt;/body&gt;</code>.</li>
            <li><b>Optional — WhatsApp:</b> Go to <b>Integrations → WhatsApp</b> and follow the connect flow to assign a number.</li>
          </ol>
          <p className="text-sm text-muted-foreground">Tip: For best results, provide a clear site URL and add an FAQ or short documents for targeted answers.</p>

          <h3>Detailed Getting Started (step-by-step)</h3>
          <h4>Prerequisites</h4>
          <ul>
            <li>A registered account on AgentForge (email confirmed)</li>
            <li>Admin access to your website to paste the widget snippet</li>
            <li>Optional: WhatsApp Business account if you plan to use WhatsApp</li>
          </ul>

          <h4>Create and Configure an Agent</h4>
          <ol>
            <li>Open the dashboard and click <b>My Agents</b>.</li>
            <li>Click <b>Create New Agent</b> and enter a friendly name and short description.</li>
            <li>Choose the channel type: <b>Website</b> (widget) or <b>WhatsApp</b> (messaging).</li>
            <li>Save — you will be taken to the agent details page.</li>
          </ol>

          <h4>Populate Knowledge</h4>
          <ol>
            <li>From the agent page choose <b>Scan Website</b> and enter the URL you want scanned.</li>
            <li>Alternatively, go to <b>Knowledge → Add Knowledge</b> to paste text, upload PDFs, DOCX, or provide other URLs.</li>
            <li>Once uploaded, review parsed entries and remove duplicates or irrelevant content.</li>
          </ol>

          <h4>Test the Agent</h4>
          <ol>
            <li>Open <b>Test Agents</b> in the dashboard.</li>
            <li>Select the agent and ask common customer questions to validate replies.</li>
            <li>If answers are missing or incorrect, add or edit knowledge and re-test.</li>
          </ol>

          <h4>Deploy the Widget</h4>
          <ol>
            <li>From the agent settings copy the widget code snippet (see example below).</li>
            <li>Paste it before the closing <code>&lt;/body&gt;</code> tag on your website pages.</li>
            <li>Confirm the widget appears and test end-to-end by asking questions from the live site.</li>
          </ol>

          <h4>Connect WhatsApp (Optional)</h4>
          <ol>
            <li>Go to <b>Integrations → WhatsApp</b>.</li>
            <li>Follow the guided steps to connect your WhatsApp Business API or Twilio account and assign a phone number to the agent.</li>
            <li>Test by sending a message to the connected WhatsApp number.</li>
          </ol>

          <h4>Quick Troubleshooting</h4>
          <ul>
            <li><b>Scan incomplete:</b> Ensure your site allows crawling (no login wall), try starting from the sitemap URL.</li>
            <li><b>Wrong answers:</b> Improve or add targeted FAQ entries in <b>Knowledge</b>.</li>
            <li><b>Widget not showing:</b> Confirm the snippet is before <code>&lt;/body&gt;</code> and there are no console JS errors.</li>
            <li><b>WhatsApp not receiving messages:</b> Verify phone number and credentials in <b>Integrations</b>.</li>
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
          <p>Quick copy-paste widget. Place this snippet before your <code>&lt;/body&gt;</code> tag on any page where you want the chat widget to appear. Replace <code>YOUR_AGENT_ID</code> with your agent's ID.</p>
          <pre><code>{`<!-- AgentForge Chat Widget -->
<script>
  window.agentforge = window.agentforge || {};
  window.agentforge.agentId = "YOUR_AGENT_ID";
  (function(){
    var s=document.createElement('script');s.src='https://cdn.agentforge.app/widget.js';s.async=true;document.body.appendChild(s);
  })();
</script>
<!-- End AgentForge Chat Widget -->`}</code></pre>
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
          <h4 id="google-sheets">Google Sheets Integration — Detailed</h4>
          <p>Use Google Sheets as a lightweight database to log leads, orders or conversation transcripts. The integration supports both triggers (sheet → platform) and actions (platform → sheet).</p>
          <h5>How to connect</h5>
          <ol>
            <li>Open <b>Integrations → New Integration</b> and choose <b>Google Sheets</b>.</li>
            <li>Click <b>Connect Google Account</b> and complete the OAuth flow. Grant access to view and edit the specific spreadsheet(s).</li>
            <li>After connecting, choose the spreadsheet and worksheet (tab) you want the integration to use.</li>
          </ol>
          <h5>Supported triggers</h5>
          <ul>
            <li><b>New Row Added:</b> Fires when a new row is appended to the sheet.</li>
            <li><b>Row Updated:</b> Fires when an existing row is modified.</li>
          </ul>
          <h5>Supported actions</h5>
          <ul>
            <li><b>Add Row:</b> Append a new row with mapped fields.</li>
            <li><b>Update Row:</b> Update matching rows by index or filter condition.</li>
            <li><b>Find Row:</b> Search rows by cell value for conditional logic in flows.</li>
          </ul>
          <h5>Field mapping example</h5>
          <pre><code>{`Agent trigger payload:
{
  "customer_name": "Jane Doe",
  "customer_email": "jane@example.com",
  "message": "I need pricing details"
}

Map to sheet columns: [Name, Email, Message] -> [customer_name, customer_email, message]`}</code></pre>
          <h5>Common workflows</h5>
          <ol>
            <li>Log leads: When a user submits a lead form (trigger), append a row to Leads sheet.</li>
            <li>Sync customers: When a Stripe payment succeeds, add/update customer row with payment status.</li>
            <li>Conversation backup: On conversation end, append the transcript to a Sheet for analysis.</li>
          </ol>
          <h5>Troubleshooting</h5>
          <ul>
            <li>If rows aren't added, check sheet permissions and correct worksheet name.</li>
            <li>Ensure your OAuth token hasn't expired (reconnect the Google account if needed).</li>
            <li>For large sheets, enable header row indexing to map columns reliably.</li>
          </ul>
          <h4 id="slack">Slack Integration — Detailed</h4>
          <p>Use Slack to notify teams, create incident alerts, or post conversation summaries. The integration supports bot-based and incoming-webhook flows.</p>
          <h5>How to connect</h5>
          <ol>
            <li>Go to <b>Integrations → New Integration → Slack</b>.</li>
            <li>Click <b>Authorize Slack</b> and complete the OAuth flow for your workspace. Choose the channel scope (post messages, upload files, add reactions) when prompted.</li>
            <li>Alternatively, paste an incoming webhook URL if you prefer webhook-only integration.</li>
          </ol>
          <h5>Supported triggers</h5>
          <ul>
            <li><b>Message received (channel):</b> Fires when a message appears in a monitored channel.</li>
            <li><b>Mentioned:</b> Fires when the bot is mentioned.</li>
          </ul>
          <h5>Supported actions</h5>
          <ul>
            <li><b>Send message:</b> Post plain text or formatted blocks to a channel or user.</li>
            <li><b>Upload file:</b> Upload attachments or conversation logs.</li>
            <li><b>Add reaction:</b> Add emoji reactions to messages to mark status.</li>
          </ul>
          <h5>Message payload example</h5>
          <pre><code>{`Action: Send Message
Channel: #support
Text: New lead from {{customer_name}} — {{customer_email}}
Blocks: Optional JSON blocks for rich formatting`}</code></pre>
          <h5>Common workflows</h5>
          <ol>
            <li>Alert support: When a high-priority message arrives, send a formatted alert to #support with customer details.</li>
            <li>Log incidents: When an error is reported, create a thread and upload logs to the thread.</li>
          </ol>
          <h5>Troubleshooting</h5>
          <ul>
            <li>If messages don't appear, check bot permissions and that the app is installed in the target channel.</li>
            <li>For webhook failures, validate URL and header signing (if used).</li>
          </ul>
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
              <li><b>What it does:</b> Send/receive WhatsApp messages, templates, media, interactive buttons and list messages.</li>
              <li><b>Use cases:</b> Customer support, order updates, appointment reminders, OTPs.</li>
              <li><b>How to connect:</b> Integrations → WhatsApp → Connect account. Options:
                <ol>
                  <li>Official WhatsApp Business API (WABA) — follow guided steps to link your Facebook Business Manager and phone number.</li>
                  <li>Third-party providers (Twilio, Vonage) — add provider credentials and map phone number.</li>
                </ol>
              </li>
              <li><b>Authentication:</b> WABA access token or provider API key, phone number ID, and templates pre-approved for messaging templates.</li>
              <li><b>Triggers:</b> Message received, template response received, media received, button/list selection, message status updates.</li>
              <li><b>Actions:</b> Send text, send template, send media (image/document/audio), send interactive buttons, send list messages, mark message read, escalate to human agent.</li>
              <li><b>Template example (JSON):</b>
                <pre><code>{`{
  "template_name": "order_update",
  "language": "en_US",
  "components": [{ "type": "body", "parameters": [{ "type": "text", "text": "Order #12345" }] }]
}`}</code></pre>
              </li>
              <li><b>Example flow:</b> When a WhatsApp message is received, create a lead in Google Sheets, check order status via Shopify API, and reply with the current status or escalate to a human if not found.</li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>If messages fail, verify the phone number ID and access token are valid and not expired.</li>
                  <li>Template messages require pre-approval — use session messages for free-form replies within 24 hours of user message.</li>
                  <li>Check provider logs (Twilio, WABA) for delivery errors and rate limits.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Telegram</b></summary>
            <ul>
              <li><b>What it does:</b> Send/receive Telegram messages, photos, documents, and handle inline buttons and commands via a bot.</li>
              <li><b>Use cases:</b> Team alerts, customer notifications, automated responses in channels or groups.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Create a Telegram Bot using BotFather to receive a bot token.</li>
                  <li>In Integrations, select <b>Telegram</b> and enter the bot token and the target chat ID (or set up long-polling/webhook mode).</li>
                  <li>If using webhooks, provide a public HTTPS endpoint and configure it in BotFather or via Telegram API.</li>
                </ol>
              </li>
              <li><b>Authentication:</b> Bot token (keep it secret).</li>
              <li><b>Triggers:</b> Message received, command invoked (/start), inline button pressed, media received.</li>
              <li><b>Actions:</b> Send message, send photo, send document, send reply, send buttons (inline keyboards), edit message.</li>
              <li><b>Example action payload:</b>
                <pre><code>{`{
  "chat_id": 123456789,
  "text": "New order received: #12345",
  "reply_markup": { "inline_keyboard": [[{"text":"View","url":"https://app.example.com/order/12345"}]] }
}`}</code></pre>
              </li>
              <li><b>Common workflows:</b>
                <ol>
                  <li>Order alerts: Post new orders to a Telegram group with quick action buttons.</li>
                  <li>Support routing: When a user messages the bot, create a ticket and notify the support channel.</li>
                </ol>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>If messages fail, verify bot token and chat permissions (bots cannot message users who haven't started a conversation).</li>
                  <li>For webhooks, ensure your certificate/HTTPS endpoint is valid and reachable by Telegram.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Slack</b></summary>
            <ul>
              <li><b>What it does:</b> Send messages, upload files, reply in threads, receive Slack events and interactive actions.</li>
              <li><b>Use cases:</b> Team notifications, support escalation, alerting, daily summaries.</li>
              <li><b>How to connect:</b> Integrations → Slack → Authorize. Choose an OAuth app installation or use an Incoming Webhook URL.
                <ol>
                  <li>OAuth: Install the app to your workspace and grant scopes (`chat:write`, `files:write`, `reactions:write`, etc.).</li>
                  <li>Webhook: Paste the incoming webhook URL for a specific channel.</li>
                </ol>
              </li>
              <li><b>Authentication:</b> OAuth token (bot token) or webhook URL.</li>
              <li><b>Triggers:</b> Channel message, thread reply, mention, reaction added.</li>
              <li><b>Actions:</b> Send message (blocks/attachments supported), upload file, start thread reply, add reaction, invite user.</li>
              <li><b>Example action payload:</b>
                <pre><code>{`{
  "channel": "#support",
  "text": "New lead from {{customer_name}} ({{customer_email}})",
  "blocks": [ /* optional rich blocks */ ]
}`}</code></pre>
              </li>
              <li><b>Example flow:</b> When a high-priority message is received on WhatsApp, post a formatted alert to #support with a link to the conversation and customer contact details.</li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Ensure the bot is invited to the channel and has permission to post.</li>
                  <li>Check rate limits; batch or debounce high-frequency events.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Discord</b></summary>
            <ul>
              <li><b>What it does:</b> Send/receive Discord messages, publish rich embeds, react to messages, and manage channels/roles via a bot.</li>
              <li><b>Use cases:</b> Community notifications, moderation alerts, automated announcements, support routing.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Create a Discord application and bot in the Discord Developer Portal.</li>
                  <li>Invite the bot to your server with proper permissions (send messages, embed links, manage messages if needed).</li>
                  <li>In Integrations, paste the bot token and set the target channel ID to post messages.</li>
                </ol>
              </li>
              <li><b>Authentication:</b> Bot token; store securely and rotate as needed.</li>
              <li><b>Triggers:</b> Message created, reaction added, member join/leave, command invoked.</li>
              <li><b>Actions:</b> Send message (plain or embed), reply in thread, upload file, add reaction, assign/remove role.</li>
              <li><b>Example embed payload:</b>
                <pre><code>{`{
  "channel_id": "123456789",
  "embed": {
    "title": "New Support Ticket",
    "description": "Ticket #12345 — Customer: Jane Doe",
    "color": 16711680
  }
}`}</code></pre>
              </li>
              <li><b>Common workflows:</b>
                <ol>
                  <li>Community alerts: When a major outage is detected, post an embed in #status with details and links.</li>
                  <li>Support handoff: When escalation occurs, post conversation context to #support with a link to the full transcript.</li>
                </ol>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Ensure the bot is invited and has the required channel permissions.</li>
                  <li>Check Discord rate limits and implement backoff for high-volume events.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>SMS (Twilio)</b></summary>
            <ul>
              <li><b>What it does:</b> Send and receive SMS/MMS, handle delivery callbacks, and initiate voice calls via Twilio.</li>
              <li><b>Use cases:</b> OTP, appointment reminders, marketing blasts, transactional confirmations.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Go to Integrations → New Integration → Twilio.</li>
                  <li>Enter your Twilio Account SID, Auth Token and optionally a Messaging Service SID or Sender Phone Number.</li>
                  <li>For inbound SMS, configure your Twilio phone number to forward webhook callbacks to the platform's incoming webhook URL.</li>
                </ol>
              </li>
              <li><b>Authentication:</b> Use Twilio credentials; for extra security use environment variables and rotate tokens periodically.</li>
              <li><b>Triggers:</b> SMS received, MMS received, delivery status update, incoming call.</li>
              <li><b>Actions:</b> Send SMS, Send MMS (media), Start call, Gather DTMF input, Verify number (lookup).</li>
              <li><b>Example action payload:</b>
                <pre><code>{`{
  "to": "+15551234567",
  "from": "+15557654321",
  "body": "Thanks for contacting us, {{customer_name}}. We'll reply shortly."
}`}</code></pre>
              </li>
              <li><b>Common workflows</b>
                <ol>
                  <li>OTP: When a signup occurs, generate OTP → send SMS via Twilio → verify user input.</li>
                  <li>Appointment reminder: On scheduled event, send SMS reminder 24 hours before.</li>
                </ol>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>For undelivered messages, check Twilio console for error codes and carrier filtering issues.</li>
                  <li>If inbound messages aren't received, ensure your Twilio webhook URL is reachable and configured for the correct number.</li>
                </ul>
              </li>
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
              <li><b>What it does:</b> Send and receive HTTP webhooks to integrate with any service that supports webhooks or HTTP APIs.</li>
              <li><b>Use cases:</b> Push events to external systems, receive events from forms, payment gateways, or other platforms.</li>
              <li><b>How to connect (Outgoing):</b>
                <ol>
                  <li>Create a new integration and choose <b>Webhook (Outgoing)</b>.</li>
                  <li>Enter the target URL, HTTP method (POST/PUT/GET), headers (Authorization, Content-Type), and a JSON body template.</li>
                  <li>Map flow variables into the body using curly-brace templates (e.g., <code>{{customer_email}}</code>).</li>
                </ol>
              </li>
              <li><b>How to connect (Incoming):</b>
                <ol>
                  <li>Create a <b>Webhook (Incoming)</b> endpoint in Integrations and copy the generated URL.</li>
                  <li>Point your external service to that URL for events; the platform will parse payloads and trigger flows.</li>
                </ol>
              </li>
              <li><b>Supported features:</b> Header validation, HMAC signature verification, retries with exponential backoff, and payload parsing (JSON / form-encoded).</li>
              <li><b>Example outgoing payload:</b>
                <pre><code>{`POST /your-api
Content-Type: application/json
Authorization: Bearer XXXX

{
  "name": "{{customer_name}}",
  "email": "{{customer_email}}",
  "message": "{{message}}"
}
`}</code></pre>
              </li>
              <li><b>Example incoming use:</b> Receive a payment webhook from Stripe, validate the signature, then trigger an Order Fulfilled workflow.</li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>If incoming webhooks do not trigger, verify the sender endpoint and ensure the platform IPs are whitelisted if your firewall blocks external requests.</li>
                  <li>For signature mismatches, compare HMAC secrets and header names — configure the same secret on the sender side.</li>
                  <li>Check delivery logs for outgoing webhooks and enable retries or dead-letter logs for failed deliveries.</li>
                </ul>
              </li>
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
              <li><b>What it does:</b> Send transactional and templated emails using any SMTP provider (Mailgun, Postmark, self-hosted SMTP).</li>
              <li><b>Use cases:</b> Order receipts, password resets, notifications, reports.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Go to <b>Integrations → New Integration → SMTP</b>.</li>
                  <li>Provide the SMTP host, port, username, and password (or SMTP URL). If using TLS, enable the secure option.</li>
                  <li>Set a default "from" address and optionally test by sending a sample email.</li>
                </ol>
              </li>
              <li><b>Supported features:</b> Templated emails (with variables), attachments, CC/BCC, HTML content, DKIM/SPF recommendations for deliverability.</li>
              <li><b>Actions:</b> Send email (plain/text or HTML), Send templated email, Send with attachments.</li>
              <li><b>Template example (variables):</b>
                <pre><code>{`Subject: Order #{{order_id}} Confirmation
Hi {{customer_name}},

Thanks for your purchase of {{product_name}}. Your total is {{total}}.`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Check SMTP logs for authentication errors and ensure credentials are correct.</li>
                  <li>Use proper DNS records (SPF, DKIM) to avoid spam filtering.</li>
                  <li>If messages bounce, inspect bounce codes and update suppressed lists if necessary.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>SendGrid</b></summary>
            <ul>
              <li><b>What it does:</b> Send transactional and bulk emails, manage contacts, templates, and provide delivery analytics.</li>
              <li><b>Use cases:</b> Welcome emails, receipts, newsletters, scheduled campaigns.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Create an API key in the SendGrid dashboard (Settings → API Keys).</li>
                  <li>In Integrations, choose <b>SendGrid</b> and paste the API key. Optionally set a default sender identity.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> Webhook events such as delivered, open, click, bounce, deferred, spam report (configure Event Webhook in SendGrid).</li>
              <li><b>Supported actions:</b> Send email (templated or raw), send using Dynamic Templates, manage contacts, fetch stats.</li>
              <li><b>Dynamic template example:</b>
                <pre><code>{`POST /mail/send
{
  "personalizations": [{ "to": [{"email":"jane@example.com"}], "dynamic_template_data": {"name":"Jane"} }],
  "from": {"email":"no-reply@yourdomain.com"},
  "template_id": "d-12345"
}`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Enable Event Webhook and use the signature verification to validate events.</li>
                  <li>Check suppression lists for blocked addresses.</li>
                  <li>Use SendGrid's activity feed to debug delivery issues.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Mailchimp</b></summary>
            <ul>
              <li><b>What it does:</b> Manage subscribers, create campaigns, automate drip sequences, and segment contacts.</li>
              <li><b>Use cases:</b> Newsletter signup automation, onboarding sequences, campaign targeting by tags.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Go to Integrations → New Integration → Mailchimp.</li>
                  <li>Enter your Mailchimp API key (create one in Mailchimp Account → Extras → API keys).</li>
                  <li>Choose the Audience (list) and optionally a default tag or group to apply.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> New subscriber added, subscriber updated, campaign sent, email opened (via webhook).</li>
              <li><b>Supported actions:</b> Add/Update subscriber, Add tag, Remove tag, Send campaign (trigger a campaign), Create segment.</li>
              <li><b>Field mapping example:</b>
                <pre><code>{`Platform payload: {
  "first_name": "Jane",
  "email": "jane@example.com",
  "plan": "pro"
}

Map to Mailchimp: email_address -> email, merge_fields.FNAME -> first_name, tags -> [plan]`}</code></pre>
              </li>
              <li><b>Example flow:</b> When a user signs up, add them to Mailchimp Audience, apply the "trial" tag, and kick off a 7-day onboarding drip campaign.</li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>If subscribers aren't added, verify the API key and audience ID, and check Mailchimp rate limits.</li>
                  <li>For tag mismatches, ensure tags exist or use the API to create tags dynamically.</li>
                </ul>
              </li>
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
              <li><b>What it does:</b> Read and write records to Airtable bases and tables using the Airtable API.</li>
              <li><b>Use cases:</b> CRM, editorial calendars, inventory, lightweight databases for apps.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Create an API key in Airtable Account settings.</li>
                  <li>In Integrations, choose <b>Airtable</b> and add the API key, then pick the Base ID and Table name.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> New record created, record updated, record deleted (via polling/webhook depending on setup).</li>
              <li><b>Supported actions:</b> Create record, update record, delete record, find records with filters.</li>
              <li><b>Record mapping example:</b>
                <pre><code>{`Payload: {"name":"John Doe","email":"john@example.com"}

Map to fields: Name -> name, Email -> email`}</code></pre>
              </li>
              <li><b>Common workflows:</b>
                <ol>
                  <li>Lead capture: New form submission → create Airtable record → notify sales on Slack.</li>
                  <li>Content planning: New content idea → create record with status and assignee fields.</li>
                </ol>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Rate limits: Airtable has rate limits per base — batch writes where possible.</li>
                  <li>Field types: Ensure mapped values match field types (e.g., date string format for date fields).</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Notion</b></summary>
            <ul>
              <li><b>What it does:</b> Create and update pages and database entries in Notion using the Notion API.</li>
              <li><b>Use cases:</b> Knowledge base sync, task management, saving conversations to a wiki.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Create an integration in Notion and copy the internal integration token.</li>
                  <li>Share the target database or page with the integration so it has access.</li>
                  <li>In Integrations, choose <b>Notion</b> and paste the token and Database ID.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> New page created (via API or webhook proxy), new database entry.</li>
              <li><b>Supported actions:</b> Create page, create database item, update properties, append content blocks.</li>
              <li><b>Example payload:</b>
                <pre><code>{`{
  "parent": {"database_id": "abc123"},
  "properties": {"Name": {"title":[{"text":{"content":"New Ticket"}}]}, "Status": {"select":{"name":"Open"}}}
}`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Ensure the integration has been given access to the specific database or page.</li>
                  <li>Check rate limits and request size when sending large blocks of content.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Firebase</b></summary>
            <ul>
              <li><b>What it does:</b> Store and sync data in Firestore (Firebase) for real-time applications.</li>
              <li><b>Use cases:</b> Chat logs, presence, real-time dashboards and sync across clients.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Create a Firebase project and generate service account credentials (JSON).</li>
                  <li>In Integrations, choose <b>Firebase</b> and upload the service account JSON or provide the project ID and credentials.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> Document created/updated/deleted via Firestore listeners or webhook proxies.</li>
              <li><b>Supported actions:</b> Add document, update document, delete document, run queries.</li>
              <li><b>Example document payload:</b>
                <pre><code>{`{
  "collection": "conversations",
  "document": {"user":"jane@example.com","message":"Hello","timestamp": 1670000000}
}`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Ensure service account has correct IAM roles for Firestore access.</li>
                  <li>For real-time listeners, confirm rules allow reads/writes from your integration account.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Supabase</b></summary>
            <ul>
              <li><b>What it does:</b> Store and query data in Supabase (Postgres) and use real-time listeners for live events.</li>
              <li><b>Use cases:</b> User management, analytics, session tracking, chat logs.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Create a Supabase project and copy the API URL and anon/service key.</li>
                  <li>In Integrations, provide the Supabase URL and API key. For server-side operations, use the service role key (store securely).</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> Realtime changes on tables (INSERT/UPDATE/DELETE) via Supabase Realtime.</li>
              <li><b>Supported actions:</b> Insert row, update row, delete row, run SQL (careful with permissions).</li>
              <li><b>Example SQL/action:</b>
                <pre><code>{`-- Insert user
INSERT INTO users (email, display_name) VALUES ('jane@example.com','Jane');`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Ensure RLS (row level security) policies allow the integration's role to perform intended actions.</li>
                  <li>Use the service role key only on trusted server environments; never expose it client-side.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>MongoDB</b></summary>
            <ul>
              <li><b>What it does:</b> Read and write documents to MongoDB collections using a connection URI (Atlas or self-hosted).</li>
              <li><b>Use cases:</b> Chat transcripts, analytics events, flexible document storage for app state.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Get a MongoDB connection string (URI) containing user, password, host and options (e.g., from Atlas).</li>
                  <li>In Integrations, paste the URI, choose the database and collection to operate on, and test the connection.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> New document inserted, document updated, document deleted (via change streams or polling depending on your deployment).</li>
              <li><b>Supported actions:</b> Insert document, update document (by filter), delete document, run query or aggregation.</li>
              <li><b>Example document payload:</b>
                <pre><code>{`{
  "user": "jane@example.com",
  "message": "Hello",
  "ts": 1670000000
}`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>If connection fails, verify the URI, credentials, and that your IP is allowed (Atlas IP whitelist).</li>
                  <li>For change-stream triggers ensure your cluster is a replica set (required for oplog/change streams).</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Dropbox</b></summary>
            <ul>
              <li><b>What it does:</b> Upload and download files to/from Dropbox and manage folders and metadata.</li>
              <li><b>Use cases:</b> Document storage, automatic backups of generated reports, syncing user uploads.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Create an app in the Dropbox App Console and either generate an access token (for personal apps) or configure OAuth for multi-user access.</li>
                  <li>In Integrations, paste the access token or initiate the OAuth flow, then set a target folder path.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> File added/modified/deleted (via webhook or polling).</li>
              <li><b>Supported actions:</b> Upload file, download file, delete file, list folder contents, create folder.</li>
              <li><b>Example upload payload:</b>
                <pre><code>{`Path: /reports/{{order_id}}.pdf
File: base64-encoded-content
Return: shared link or file metadata`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Permission errors: ensure the token has the correct scopes and the app has access to the chosen folder.</li>
                  <li>Webhook issues: confirm webhook endpoint is reachable and registered inside the Dropbox app configuration.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>AWS S3</b></summary>
            <ul>
              <li><b>What it does:</b> Store and serve objects in S3 buckets; supports signed URLs and ACLs.</li>
              <li><b>Use cases:</b> Large media storage, backups, static asset hosting, export archives.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Create an IAM user with S3 permissions and obtain the Access Key ID and Secret Access Key.</li>
                  <li>In Integrations, enter the credentials, S3 bucket name, region, and optional path prefix.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> Object created, object removed (via S3 Event Notifications to an HTTP endpoint or SNS/SQS).</li>
              <li><b>Supported actions:</b> Upload object, download object, delete object, list objects, generate pre-signed URL.</li>
              <li><b>Example upload:</b>
                <pre><code>{`Bucket: my-bucket
Key: reports/{{date}}/report.pdf
Response: s3://my-bucket/reports/2025-12-21/report.pdf or pre-signed URL`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Verify IAM policies include s3:PutObject and s3:GetObject for the target bucket.</li>
                  <li>Confirm bucket region matches the configured region; enable CORS for browser uploads.</li>
                </ul>
              </li>
            </ul>
          </details>

          {/* E-commerce & Payments */}
          <details><summary><b>Stripe</b></summary>
            <ul>
              <li><b>What it does:</b> Manage payments, customers, invoices and receive webhooks for payment events.</li>
              <li><b>Use cases:</b> Payment confirmations, subscription management, refunds, revenue logging.</li>
              <li><b>How to connect:</b> Integrations → Stripe → Enter your Stripe Secret Key (recommended: use a restricted key with the minimum scopes for production).</li>
              <li><b>Authentication:</b> Use Stripe API keys stored in the integration settings. For maximum security, rotate keys periodically.</li>
              <li><b>Triggers:</b> charge.succeeded, invoice.paid, payment_intent.succeeded, charge.refunded, customer.created, subscription.updated.</li>
              <li><b>Actions:</b> Create customer, create charge, refund charge, create invoice, update subscription.</li>
              <li><b>Example webhook payload (shortened):</b>
                <pre><code>{`{
  "id": "evt_1...",
  "type": "charge.succeeded",
  "data": { "object": { "id": "ch_1...", "amount": 1999, "currency": "usd", "customer": "cus_123" } }
}`}</code></pre>
              </li>
              <li><b>Example flow:</b> When a payment is received (charge.succeeded), update order status in Shopify, add a row to Google Sheets, and send a WhatsApp receipt to the customer.</li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Verify webhook signing secret if events are not accepted.</li>
                  <li>Check that the Stripe key used has sufficient permissions for the actions you need.</li>
                  <li>Inspect Stripe dashboard logs for delivery errors and retry information.</li>
                </ul>
              </li>
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
              <li><b>What it does:</b> Sync orders, products, inventory and customers with Shopify via Admin API or webhooks.</li>
              <li><b>Use cases:</b> Order notifications, inventory updates, customer creation, fulfillment triggers.</li>
              <li><b>How to connect:</b> Integrations → Shopify → Enter shop domain and Admin API access token (or install a private app) and set webhook topics if using webhooks.</li>
              <li><b>Authentication:</b> Use a scoped Admin API token or app credentials; prefer least-privilege access for production.</li>
              <li><b>Triggers:</b> orders/create, orders/paid, products/update, customers/create, inventory/levels_update.</li>
              <li><b>Actions:</b> Create/update order (limited), update product metafields, send order notifications, update inventory mappings.</li>
              <li><b>Field mapping example:</b>
                <pre><code>{`When order created webhook arrives:
map: order.id -> Order ID
     order.customer.email -> Customer Email
     order.total_price -> Order Total`}</code></pre>
              </li>
              <li><b>Example flow:</b> When a new order is placed, create a task in Asana, update Google Sheets with order details, and notify the fulfillment channel on Slack.</li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>If webhooks are not received, confirm webhook URLs and shared secret in Shopify settings.</li>
                  <li>Check rate limits and queue processing for high-volume stores.</li>
                </ul>
              </li>
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
              <li><b>What it does:</b> Create and update Trello cards, lists and boards to track tasks and tickets.</li>
              <li><b>Use cases:</b> Turning support tickets into tasks, sprint planning, backlog management.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Obtain a Trello API key and token from your Trello account settings.</li>
                  <li>In Integrations, enter the key and token and choose the Board ID and List ID where cards should be created.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> Card created, card moved, card updated, comment added (via webhook).</li>
              <li><b>Supported actions:</b> Create card, update card, move card to a list, add comment, add member, set labels.</li>
              <li><b>Example card payload:</b>
                <pre><code>{`List: To Do
Name: "Support: {{subject}}"
Desc: "Customer: {{customer_email}}\n{{message}}"`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>If cards don't appear, verify the API token and that the integration has access to the specified board.</li>
                  <li>For webhook issues, check that your endpoint is reachable and that Trello has the correct callback URL registered.</li>
                </ul>
              </li>
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
              <li><b>What it does:</b> Create and manage issues, comments, PRs, triggers workflows, and call GitHub APIs to automate repository tasks.</li>
              <li><b>Use cases:</b> Auto-creating issues from support tickets, annotating releases, triggering CI via workflow_dispatch.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Create a Personal Access Token (PAT) with repo and workflow scopes, or install a GitHub App and authorize the repository.</li>
                  <li>In Integrations, paste the PAT or complete the OAuth/GitHub App install and select the owner and repository.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> Issue opened, issue commented, PR opened, PR merged, push event (via webhook).</li>
              <li><b>Supported actions:</b> Create issue, add comment, add/remove label, trigger workflow_dispatch, create release, add PR comment.</li>
              <li><b>Example create-issue payload:</b>
                <pre><code>{`Title: "Support: {{subject}}"
Body: "Customer: {{customer_email}}\nDetails: {{message}}"
Labels: [support, triage]`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Check that tokens have the proper scopes and the integration is installed on the target repo.</li>
                  <li>Inspect webhook delivery logs in the repository settings for failed webhooks or retries.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>GitLab</b></summary>
            <ul>
              <li><b>What it does:</b> Create issues, trigger pipelines, and interact with GitLab APIs to automate project workflows.</li>
              <li><b>Use cases:</b> Auto-create issues from support tickets, trigger CI/CD on demand, post deployment notes.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Create a Personal Access Token (PAT) in GitLab with API scope or install a GitLab Application.</li>
                  <li>In Integrations, paste the token and select the target project (namespace/project).</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> Issue created, merge request opened, pipeline status events (via webhooks).</li>
              <li><b>Supported actions:</b> Create issue, add comment, trigger pipeline (via API), add label, close issue.</li>
              <li><b>Example create-issue payload:</b>
                <pre><code>{`Title: "Support: {{subject}}"
Description: "Customer: {{customer_email}}\nDetails: {{message}}"
Labels: support,triage`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Ensure the token has API access and the user has permission on the project.</li>
                  <li>Check project webhook delivery logs for failures and inspect the event payloads.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Bitbucket</b></summary>
            <ul>
              <li><b>What it does:</b> Create issues, post comments, and trigger pipelines in Bitbucket Cloud/Server.</li>
              <li><b>Use cases:</b> Automate issue creation, notify repos on deploys, trigger builds.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Create an App Password (Bitbucket Cloud) or an OAuth Consumer and obtain credentials.</li>
                  <li>In Integrations, enter credentials and choose the workspace and repository to operate on.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> Push, pull request created, issue created (via webhooks).</li>
              <li><b>Supported actions:</b> Create issue, add comment, trigger pipeline, post commit status.</li>
              <li><b>Example action:</b>
                <pre><code>{`Create Issue
Title: "Support: {{subject}}"
Content: "{{message}}\nCustomer: {{customer_email}}"`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Verify app password scopes (issues, repositories) and repository permissions.</li>
                  <li>Check webhook deliveries in repository settings for any errors.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Redis</b></summary>
            <ul>
              <li><b>What it does:</b> Read/write ephemeral or persistent key-value data in Redis for caching, counters, or pub/sub.</li>
              <li><b>Use cases:</b> Session storage, rate limiting, real-time counters, pub/sub notifications.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Provide Redis host, port, and password (or a connection URL). For clusters, provide the sentinel/cluster config.</li>
                  <li>In Integrations, paste the connection info and test read/write operations.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> Pub/Sub message received (subscribe), key expiration (if configured with notifications).</li>
              <li><b>Supported actions:</b> Set key, get key, delete key, publish message to channel, increment counters.</li>
              <li><b>Example action (publish):</b>
                <pre><code>{`Channel: notifications
Message: {"type":"support","id":"{{ticket_id}}"}`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Check network connectivity and firewall rules; ensure Redis requires TLS if exposed publicly.</li>
                  <li>For cluster mode, ensure client supports cluster and correct endpoints are provided.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Elasticsearch</b></summary>
            <ul>
              <li><b>What it does:</b> Index and search documents using Elasticsearch/OpenSearch for full-text search and analytics.</li>
              <li><b>Use cases:</b> Searchable conversation logs, analytics dashboards, relevance-based retrieval for agents.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Provide the Elasticsearch endpoint(s), and credentials (API key or basic auth). For cloud providers, use the cloud ID or managed endpoint.</li>
                  <li>In Integrations, enter endpoint and index name and test indexing/searching.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> New document indexed (via webhook or polling), scheduled re-index events.</li>
              <li><b>Supported actions:</b> Index document, update document, delete document, search query.</li>
              <li><b>Example index payload:</b>
                <pre><code>{`Index: conversations
Document: {"user":"jane@example.com","text":"Hello","ts":1670000000}`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Verify index mapping matches the document types you send; mismatches cause unexpected search results.</li>
                  <li>Check cluster health and resource limits; large indexing bursts may require throttling.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Google Drive</b></summary>
            <ul>
              <li><b>What it does:</b> Upload, download and list files in Google Drive; support sharing links and folder management.</li>
              <li><b>Use cases:</b> Save reports, export conversation transcripts, share files with teams.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Use OAuth to connect a Google account with the Drive API enabled (or create a service account for domain-wide setups).</li>
                  <li>In Integrations, complete OAuth and select the target folder to store files.</li>
                </ol>
              </li>
              <li><b>Supported triggers:</b> File added/updated (via Drive push notifications or polling).</li>
              <li><b>Supported actions:</b> Upload file, download file, create folder, set sharing permissions, generate shareable link.</li>
              <li><b>Example upload:</b>
                <pre><code>{`Path (folder): /AgentExports/{{agent_id}}
File name: transcript-{{conversation_id}}.txt
Return: shareable link`}</code></pre>
              </li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>For OAuth permission errors, re-consent the Google account and ensure Drive API is enabled in Google Cloud Console.</li>
                  <li>When push notifications fail, verify the webhook endpoint and subscription settings in Drive API notifications.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Google Calendar</b></summary>
            <ul>
              <li><b>What it does:</b> Create and manage calendar events using Google Calendar API.</li>
              <li><b>Use cases:</b> Schedule appointments, send reminders, sync booking events from forms or chats.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>In Integrations, choose <b>Google Calendar</b> and complete the OAuth flow granting calendar access.</li>
                  <li>Select or create the calendar to use for events and configure default reminders.</li>
                </ol>
              </li>
              <li><b>Triggers:</b> Event created, event updated, event cancelled (via push notifications or polling).</li>
              <li><b>Actions:</b> Create event, update event, delete event, list events, add attendees.</li>
              <li><b>Example flow:</b> When an appointment is booked via the chatbot, create a Google Calendar event and send a confirmation message to the user.</li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Ensure the OAuth token has calendar scopes and the calendar is shared with the connected account if necessary.</li>
                  <li>Check API quotas and enable push notifications in Google Cloud Console if relying on real-time triggers.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Google Docs</b></summary>
            <ul>
              <li><b>What it does:</b> Create and edit Google Docs programmatically for reports, transcripts, and templates.</li>
              <li><b>Use cases:</b> Generate conversation transcripts, create templated reports, export knowledge snippets.</li>
              <li><b>How to connect:</b> Complete OAuth for Google Drive/Docs scopes in Integrations and select the target folder for generated docs.</li>
              <li><b>Triggers:</b> N/A (typically action-driven: create or update document).</li>
              <li><b>Actions:</b> Create document from template, append content, replace variables in templates, export as PDF.</li>
              <li><b>Example flow:</b> On conversation end, generate a Google Doc transcript and share a link with the support team.</li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>Ensure the integration account has permission to create/edit files in the target Drive folder.</li>
                  <li>Watch API quotas when generating many large documents; batch operations where possible.</li>
                </ul>
              </li>
            </ul>
          </details>
          <details><summary><b>Google Forms</b></summary>
            <ul>
              <li><b>What it does:</b> Receive form submissions via Google Forms and trigger flows from new responses.</li>
              <li><b>Use cases:</b> Lead capture, feedback collection, survey responses feeding into workflows.</li>
              <li><b>How to connect:</b>
                <ol>
                  <li>Create a Google Form and enable response notifications or wire a webhook via Apps Script.</li>
                  <li>In Integrations, choose <b>Google Forms</b> and supply form or webhook details to capture responses.</li>
                </ol>
              </li>
              <li><b>Triggers:</b> New response submitted.</li>
              <li><b>Actions:</b> Parse response, add row to Google Sheets, create lead in CRM, send notification.</li>
              <li><b>Example flow:</b> When a form is submitted, add the response to Google Sheets and create a lead in HubSpot.</li>
              <li><b>Troubleshooting:</b>
                <ul>
                  <li>For missing responses, verify the webhook or Apps Script is deployed and reachable by the platform.</li>
                  <li>Map form field IDs to platform variables to avoid mismatches after form edits.</li>
                </ul>
              </li>
            </ul>
          </details>
        </div>
      </ScrollArea>
  );
}

export default function Docs() {
  return (
    <DashboardLayout title="Product Documentation">
      <DocsContent />
    </DashboardLayout>
  );
}
