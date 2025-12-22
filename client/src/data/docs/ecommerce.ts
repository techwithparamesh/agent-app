import { IntegrationDoc } from './types';

export const ecommerceDocs: IntegrationDoc[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SHOPIFY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'shopify',
    name: 'Shopify',
    icon: '🛒',
    category: 'ecommerce',
    shortDescription: 'Manage orders, products, and customers in Shopify',
    overview: {
      what: 'Shopify integration connects your AI agent to Shopify stores for order management, product lookup, and customer support.',
      why: 'Shopify powers millions of stores. Automate customer inquiries, order status checks, and inventory updates.',
      useCases: ['Order status lookups', 'Product information', 'Inventory checks', 'Customer support automation', 'Abandoned cart recovery', 'Order notifications'],
      targetAudience: 'Shopify store owners who want to automate customer support and order management.',
    },
    prerequisites: {
      accounts: ['Shopify store (any plan)'],
      permissions: ['Admin API access', 'Custom app created'],
      preparations: ['Create private/custom app', 'Configure API scopes'],
    },
    connectionGuide: [
      { step: 1, title: 'Log into Shopify Admin', description: 'Go to your-store.myshopify.com/admin.', screenshot: 'Shopify – Admin Dashboard' },
      { step: 2, title: 'Go to Apps', description: 'Click "Settings" → "Apps and sales channels" → "Develop apps".', screenshot: 'Shopify – Apps Settings' },
      { step: 3, title: 'Create Custom App', description: 'Click "Create an app". Name it (e.g., "AgentForge Integration").', screenshot: 'Shopify – Create App' },
      { step: 4, title: 'Configure API Scopes', description: 'Click "Configure Admin API scopes". Select: read_orders, read_products, read_customers, write_orders.', screenshot: 'Shopify – API Scopes', tip: 'Only select scopes you need for security.' },
      { step: 5, title: 'Install App', description: 'Click "Install app" to generate API credentials.', screenshot: 'Shopify – Install App' },
      { step: 6, title: 'Get Access Token', description: 'Copy the Admin API access token.', screenshot: 'Shopify – Access Token', warning: 'Token shown only once. Save it securely!' },
      { step: 7, title: 'Note Store URL', description: 'Your store URL is: your-store.myshopify.com', screenshot: 'Shopify – Store URL' },
      { step: 8, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Shopify. Enter store URL and access token.', screenshot: 'AgentForge – Shopify Form' },
    ],
    triggers: [
      { id: 'order_created', name: 'Order Created', description: 'Fires when a new order is placed.', whenItFires: 'When customer completes checkout.', exampleScenario: 'Send order confirmation via WhatsApp.', dataProvided: ['Order ID', 'Customer info', 'Line items', 'Total', 'Shipping address'] },
      { id: 'order_paid', name: 'Order Paid', description: 'Fires when order payment is confirmed.', whenItFires: 'When payment is captured.', exampleScenario: 'Notify warehouse to start fulfillment.', dataProvided: ['Order ID', 'Payment status', 'Amount'] },
      { id: 'fulfillment_created', name: 'Order Fulfilled', description: 'Fires when order is shipped.', whenItFires: 'When fulfillment is created.', exampleScenario: 'Send tracking info to customer.', dataProvided: ['Order ID', 'Tracking number', 'Carrier'] },
    ],
    actions: [
      { id: 'get_order', name: 'Get Order', description: 'Retrieve order details by order number.', whenToUse: 'When customer asks about their order.', requiredFields: ['Order ID or Order Number'], example: 'Get order #1234 details.' },
      { id: 'get_product', name: 'Get Product', description: 'Retrieve product information.', whenToUse: 'When customer asks about a product.', requiredFields: ['Product ID or handle'], example: 'Get product details and availability.' },
      { id: 'search_orders', name: 'Search Orders', description: 'Search orders by customer email or other criteria.', whenToUse: 'To find customer\'s orders.', requiredFields: ['Search criteria'], example: 'Find all orders for customer@email.com.' },
    ],
    exampleFlow: { title: 'Order Status Flow', scenario: 'Customer asks about their order.', steps: ['Customer asks "Where is my order #1234?"', 'AI extracts order number', 'Shopify action retrieves order', 'AI checks fulfillment status', 'Responds with tracking info'] },
    troubleshooting: [
      { error: 'Invalid API key', cause: 'Token expired or app uninstalled.', solution: 'Reinstall app and get new token.' },
      { error: 'Resource not found', cause: 'Wrong order/product ID format.', solution: 'Use the correct ID format (numeric ID or gid).' },
      { error: 'Insufficient permissions', cause: 'Missing API scope.', solution: 'Add required scope and reinstall app.' },
    ],
    bestPractices: ['Request minimum required scopes', 'Use order name (#1234) for customer lookups', 'Cache product data when possible', 'Handle rate limits gracefully', 'Test with test orders first'],
    faq: [
      { question: 'Which Shopify plan do I need?', answer: 'Custom apps are available on all paid Shopify plans.' },
      { question: 'Can I modify orders?', answer: 'Yes, with write_orders scope. Be careful with order modifications.' },
      { question: 'What\'s the rate limit?', answer: 'Default: 2 requests/second. Shopify Plus: 4 requests/second.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WOOCOMMERCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    icon: '🛍️',
    category: 'ecommerce',
    shortDescription: 'Manage WooCommerce store orders and products',
    overview: {
      what: 'WooCommerce integration connects your AI agent to WordPress WooCommerce stores for order and product management.',
      why: 'WooCommerce powers 28% of online stores. Open-source and highly customizable.',
      useCases: ['Order tracking', 'Product queries', 'Stock updates', 'Customer lookup', 'Price inquiries', 'Store support automation'],
      targetAudience: 'WooCommerce store owners running WordPress who want to automate customer interactions.',
    },
    prerequisites: {
      accounts: ['WordPress site with WooCommerce'],
      permissions: ['Admin access to WordPress', 'REST API enabled'],
      preparations: ['Enable WooCommerce REST API', 'Generate API keys'],
    },
    connectionGuide: [
      { step: 1, title: 'Log into WordPress Admin', description: 'Go to your-site.com/wp-admin.', screenshot: 'WordPress – Admin' },
      { step: 2, title: 'Navigate to WooCommerce Settings', description: 'Go to WooCommerce → Settings → Advanced → REST API.', screenshot: 'WooCommerce – Settings' },
      { step: 3, title: 'Add API Key', description: 'Click "Add key". Enter description, select user, set permissions to "Read/Write".', screenshot: 'WooCommerce – Add Key' },
      { step: 4, title: 'Generate Keys', description: 'Click "Generate API key". Copy Consumer Key and Consumer Secret.', screenshot: 'WooCommerce – API Keys', warning: 'Secret is shown only once!' },
      { step: 5, title: 'Note Store URL', description: 'Your store URL is the WordPress site URL.', screenshot: 'WooCommerce – Store URL' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → WooCommerce. Enter store URL, consumer key, and secret.', screenshot: 'AgentForge – WooCommerce Form' },
    ],
    triggers: [
      { id: 'order_created', name: 'Order Created', description: 'Fires when a new order is placed.', whenItFires: 'When customer completes checkout.', exampleScenario: 'Send order confirmation message.', dataProvided: ['Order ID', 'Customer', 'Products', 'Total'] },
      { id: 'order_updated', name: 'Order Updated', description: 'Fires when order status changes.', whenItFires: 'When order is updated.', exampleScenario: 'Notify customer of status change.', dataProvided: ['Order ID', 'Old status', 'New status'] },
    ],
    actions: [
      { id: 'get_order', name: 'Get Order', description: 'Retrieve order by ID.', whenToUse: 'When customer asks about their order.', requiredFields: ['Order ID'], example: 'Get order #567 details.' },
      { id: 'get_product', name: 'Get Product', description: 'Retrieve product information.', whenToUse: 'For product queries.', requiredFields: ['Product ID or slug'], example: 'Get product price and stock.' },
      { id: 'update_order', name: 'Update Order', description: 'Update order status or details.', whenToUse: 'To change order status.', requiredFields: ['Order ID', 'Update data'], example: 'Update order status to "shipped".' },
    ],
    exampleFlow: { title: 'Product Inquiry Flow', scenario: 'Customer asks about product.', steps: ['Customer asks "Is Product X in stock?"', 'AI extracts product name', 'WooCommerce action searches products', 'Finds product and stock status', 'AI responds with availability and price'] },
    troubleshooting: [
      { error: 'Invalid signature', cause: 'Wrong consumer secret or encoding.', solution: 'Regenerate API keys and check for special characters.' },
      { error: 'REST API disabled', cause: 'API not enabled or blocked.', solution: 'Enable permalinks and check security plugins.' },
      { error: '401 Unauthorized', cause: 'Invalid credentials.', solution: 'Verify consumer key and secret are correct.' },
    ],
    bestPractices: ['Use HTTPS for API calls', 'Limit API key permissions', 'Cache product catalog locally', 'Handle webhooks for real-time updates', 'Test with staging site first'],
    faq: [
      { question: 'Does my site need SSL?', answer: 'Yes, HTTPS is required for REST API authentication.' },
      { question: 'Can I use with multisite?', answer: 'Yes, but each site needs its own API keys.' },
      { question: 'What about variations?', answer: 'Product variations are separate API endpoints from parent products.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STRIPE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    category: 'ecommerce',
    shortDescription: 'Process payments and manage subscriptions',
    overview: {
      what: 'Stripe integration enables your AI agent to process payments, manage subscriptions, and handle billing inquiries.',
      why: 'Stripe is the leading payment platform. Handle transactions, refunds, and subscription management automatically.',
      useCases: ['Payment processing', 'Subscription management', 'Invoice lookup', 'Refund processing', 'Payment link generation', 'Billing support'],
      targetAudience: 'Businesses using Stripe for payments who want to automate billing support and payment collection.',
    },
    prerequisites: {
      accounts: ['Stripe account'],
      permissions: ['API keys (test and/or live)'],
      preparations: ['Identify required API permissions', 'Set up webhook endpoints'],
    },
    connectionGuide: [
      { step: 1, title: 'Log into Stripe Dashboard', description: 'Go to dashboard.stripe.com.', screenshot: 'Stripe – Dashboard' },
      { step: 2, title: 'Navigate to API Keys', description: 'Click Developers → API keys.', screenshot: 'Stripe – Developers Menu' },
      { step: 3, title: 'Get API Keys', description: 'Copy the Publishable key and Secret key.', screenshot: 'Stripe – API Keys', tip: 'Use test keys for development, live keys for production.' },
      { step: 4, title: 'Create Restricted Key (Optional)', description: 'For security, create a restricted key with only needed permissions.', screenshot: 'Stripe – Restricted Key' },
      { step: 5, title: 'Set Up Webhooks', description: 'Go to Webhooks → Add endpoint. Add your webhook URL and select events.', screenshot: 'Stripe – Webhooks' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Stripe. Enter secret key and webhook secret.', screenshot: 'AgentForge – Stripe Form' },
    ],
    triggers: [
      { id: 'payment_succeeded', name: 'Payment Succeeded', description: 'Fires when a payment is successful.', whenItFires: 'When charge or payment intent succeeds.', exampleScenario: 'Send payment confirmation to customer.', dataProvided: ['Payment ID', 'Amount', 'Customer', 'Payment method'] },
      { id: 'subscription_created', name: 'Subscription Created', description: 'Fires when new subscription starts.', whenItFires: 'When customer subscribes.', exampleScenario: 'Welcome new subscriber and provide access.', dataProvided: ['Subscription ID', 'Plan', 'Customer', 'Start date'] },
      { id: 'invoice_paid', name: 'Invoice Paid', description: 'Fires when invoice is paid.', whenItFires: 'When invoice payment completes.', exampleScenario: 'Send receipt to customer.', dataProvided: ['Invoice ID', 'Amount', 'Customer'] },
    ],
    actions: [
      { id: 'create_payment_link', name: 'Create Payment Link', description: 'Generate a payment link for one-time payment.', whenToUse: 'To collect payment via link.', requiredFields: ['Amount', 'Currency'], optionalFields: ['Description', 'Success URL'], example: 'Create $99 payment link for service.' },
      { id: 'get_customer', name: 'Get Customer', description: 'Retrieve customer and their payment history.', whenToUse: 'For billing inquiries.', requiredFields: ['Customer ID or email'], example: 'Get customer payment history.' },
      { id: 'create_refund', name: 'Create Refund', description: 'Refund a payment partially or fully.', whenToUse: 'To process refunds.', requiredFields: ['Payment ID'], optionalFields: ['Amount', 'Reason'], example: 'Refund $50 from payment.' },
    ],
    exampleFlow: { title: 'Payment Collection Flow', scenario: 'Collect payment via chat.', steps: ['Customer agrees to purchase', 'AI confirms amount', 'Stripe action creates payment link', 'AI sends link to customer', 'Customer completes payment', 'Webhook confirms payment'] },
    troubleshooting: [
      { error: 'Invalid API key', cause: 'Using wrong environment key or key revoked.', solution: 'Verify using correct key (test vs live).' },
      { error: 'Card declined', cause: 'Customer\'s card issue.', solution: 'Ask customer to try different card or contact bank.' },
      { error: 'Webhook signature invalid', cause: 'Wrong webhook secret.', solution: 'Update webhook secret in configuration.' },
    ],
    bestPractices: ['Use restricted keys in production', 'Always use webhooks for payment confirmation', 'Store customer IDs for repeat customers', 'Use idempotency keys for safety', 'Test with test mode first'],
    faq: [
      { question: 'What are Stripe\'s fees?', answer: '2.9% + $0.30 per transaction (US). Varies by country.' },
      { question: 'Test vs live mode?', answer: 'Test mode uses test API keys. No real charges. Use 4242424242424242 as test card.' },
      { question: 'Can I do subscriptions?', answer: 'Yes, Stripe Billing handles recurring payments and subscriptions.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PAYPAL
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
    category: 'ecommerce',
    shortDescription: 'Accept PayPal payments and manage transactions',
    overview: {
      what: 'PayPal integration allows your AI agent to accept PayPal payments, create invoices, and manage transactions.',
      why: 'PayPal has 400+ million users worldwide. Offer customers a trusted payment method they already use.',
      useCases: ['Payment acceptance', 'Invoice creation', 'Payment status checks', 'Refund processing', 'Subscription billing', 'International payments'],
      targetAudience: 'Businesses wanting to accept PayPal as a payment method alongside or instead of credit cards.',
    },
    prerequisites: {
      accounts: ['PayPal Business account'],
      permissions: ['REST API credentials'],
      preparations: ['Create app in Developer Dashboard', 'Get client ID and secret'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to PayPal Developer', description: 'Visit developer.paypal.com and log in.', screenshot: 'PayPal – Developer Portal' },
      { step: 2, title: 'Create App', description: 'Go to Dashboard → My Apps → Create App.', screenshot: 'PayPal – Create App' },
      { step: 3, title: 'Name Your App', description: 'Enter app name and select sandbox/live mode.', screenshot: 'PayPal – App Name' },
      { step: 4, title: 'Get Credentials', description: 'Copy Client ID and Secret.', screenshot: 'PayPal – Credentials', tip: 'Sandbox for testing, Live for production.' },
      { step: 5, title: 'Configure Webhooks', description: 'Add webhook URL under Webhooks section.', screenshot: 'PayPal – Webhooks' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → PayPal. Enter client ID and secret.', screenshot: 'AgentForge – PayPal Form' },
    ],
    triggers: [
      { id: 'payment_completed', name: 'Payment Completed', description: 'Fires when payment is captured.', whenItFires: 'When PayPal payment completes.', exampleScenario: 'Confirm order after PayPal payment.', dataProvided: ['Transaction ID', 'Amount', 'Payer info'] },
      { id: 'invoice_paid', name: 'Invoice Paid', description: 'Fires when invoice is paid.', whenItFires: 'When customer pays invoice.', exampleScenario: 'Send thank you message.', dataProvided: ['Invoice ID', 'Amount', 'Payment date'] },
    ],
    actions: [
      { id: 'create_order', name: 'Create Order', description: 'Create a PayPal order for payment.', whenToUse: 'To initiate payment collection.', requiredFields: ['Amount', 'Currency'], optionalFields: ['Description', 'Return URL'], example: 'Create $50 payment order.' },
      { id: 'create_invoice', name: 'Create Invoice', description: 'Send a PayPal invoice.', whenToUse: 'For B2B or service payments.', requiredFields: ['Recipient email', 'Line items'], example: 'Send invoice for consulting services.' },
      { id: 'get_transaction', name: 'Get Transaction', description: 'Retrieve transaction details.', whenToUse: 'To check payment status.', requiredFields: ['Transaction ID'], example: 'Get details for transaction ABC123.' },
    ],
    exampleFlow: { title: 'Invoice Payment Flow', scenario: 'Send and track PayPal invoice.', steps: ['Service completed for customer', 'AI creates PayPal invoice', 'Invoice sent to customer email', 'Customer pays via PayPal', 'Webhook confirms payment', 'AI sends thank you message'] },
    troubleshooting: [
      { error: 'Invalid credentials', cause: 'Wrong client ID or secret.', solution: 'Verify credentials from developer dashboard.' },
      { error: 'PERMISSION_DENIED', cause: 'App lacks required permission.', solution: 'Enable required features in app settings.' },
      { error: 'Sandbox vs Live', cause: 'Using wrong environment credentials.', solution: 'Match credentials to environment (sandbox/live).' },
    ],
    bestPractices: ['Test with sandbox first', 'Use webhooks for payment confirmation', 'Handle pending payments', 'Store transaction IDs for reference', 'Provide clear payment descriptions'],
    faq: [
      { question: 'What are PayPal fees?', answer: '2.9% + $0.30 per transaction (US). International fees vary.' },
      { question: 'Sandbox vs Live?', answer: 'Sandbox is for testing with fake accounts. No real money moves.' },
      { question: 'Do buyers need PayPal?', answer: 'No, buyers can pay with credit card through PayPal checkout.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RAZORPAY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'razorpay',
    name: 'Razorpay',
    icon: '💰',
    category: 'ecommerce',
    shortDescription: 'Accept payments in India via Razorpay',
    overview: {
      what: 'Razorpay integration enables your AI agent to accept payments in India via UPI, cards, netbanking, and wallets.',
      why: 'Razorpay is India\'s leading payment gateway. Support all Indian payment methods including UPI.',
      useCases: ['UPI payments', 'Card payments', 'Netbanking', 'Wallet payments', 'Payment links', 'Subscription billing'],
      targetAudience: 'Businesses operating in India who need to accept local payment methods.',
    },
    prerequisites: {
      accounts: ['Razorpay account (activated)'],
      permissions: ['API keys'],
      preparations: ['Complete Razorpay KYC', 'Get API keys from dashboard'],
    },
    connectionGuide: [
      { step: 1, title: 'Log into Razorpay Dashboard', description: 'Go to dashboard.razorpay.com.', screenshot: 'Razorpay – Dashboard' },
      { step: 2, title: 'Navigate to API Keys', description: 'Go to Settings → API Keys.', screenshot: 'Razorpay – Settings' },
      { step: 3, title: 'Generate Keys', description: 'Click "Generate Key" for test or live mode.', screenshot: 'Razorpay – Generate Keys' },
      { step: 4, title: 'Copy Credentials', description: 'Copy Key ID and Key Secret.', screenshot: 'Razorpay – Credentials', warning: 'Secret shown only once!' },
      { step: 5, title: 'Set Up Webhooks', description: 'Go to Settings → Webhooks → Add New Webhook.', screenshot: 'Razorpay – Webhooks' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Razorpay. Enter key ID and secret.', screenshot: 'AgentForge – Razorpay Form' },
    ],
    triggers: [
      { id: 'payment_captured', name: 'Payment Captured', description: 'Fires when payment is captured.', whenItFires: 'When payment successfully captured.', exampleScenario: 'Send order confirmation.', dataProvided: ['Payment ID', 'Amount', 'Method', 'Contact'] },
      { id: 'payment_failed', name: 'Payment Failed', description: 'Fires when payment fails.', whenItFires: 'When payment attempt fails.', exampleScenario: 'Offer alternative payment method.', dataProvided: ['Error reason', 'Contact', 'Amount'] },
    ],
    actions: [
      { id: 'create_payment_link', name: 'Create Payment Link', description: 'Generate shareable payment link.', whenToUse: 'To collect payment easily.', requiredFields: ['Amount', 'Description'], optionalFields: ['Customer details', 'Expiry'], example: 'Create ₹999 payment link.' },
      { id: 'create_order', name: 'Create Order', description: 'Create order for checkout.', whenToUse: 'For integrated checkout flow.', requiredFields: ['Amount', 'Currency'], example: 'Create ₹1500 order.' },
      { id: 'fetch_payment', name: 'Fetch Payment', description: 'Get payment details.', whenToUse: 'To verify payment status.', requiredFields: ['Payment ID'], example: 'Get payment pay_ABC123 details.' },
    ],
    exampleFlow: { title: 'UPI Payment Flow', scenario: 'Collect payment via UPI.', steps: ['Customer confirms purchase', 'AI creates payment link', 'Customer opens link', 'Pays via UPI app', 'Razorpay confirms payment', 'AI sends receipt'] },
    troubleshooting: [
      { error: 'Invalid key', cause: 'Wrong key ID or secret.', solution: 'Regenerate and update API keys.' },
      { error: 'Payment failed', cause: 'Various bank/UPI issues.', solution: 'Check error code and advise customer accordingly.' },
      { error: 'Account not activated', cause: 'KYC incomplete.', solution: 'Complete KYC verification in Razorpay dashboard.' },
    ],
    bestPractices: ['Use test mode for development', 'Enable all payment methods', 'Handle payment failures gracefully', 'Verify webhook signatures', 'Store payment IDs for reconciliation'],
    faq: [
      { question: 'What are the fees?', answer: '2% for domestic cards, 3% for international. UPI: custom pricing.' },
      { question: 'What\'s the settlement time?', answer: 'T+2 days standard. Faster with Razorpay X.' },
      { question: 'Is activation required?', answer: 'Yes, KYC is required before accepting live payments.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SQUARE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'square',
    name: 'Square',
    icon: '⬜',
    category: 'ecommerce',
    shortDescription: 'Process payments and manage Square commerce',
    overview: {
      what: 'Square integration connects your AI agent to Square for payment processing, inventory management, and customer data.',
      why: 'Square offers unified commerce - accept payments online and in-person with one system.',
      useCases: ['Payment processing', 'Inventory lookup', 'Customer management', 'Invoice creation', 'Appointment booking', 'Loyalty programs'],
      targetAudience: 'Businesses using Square for POS and online payments who want unified AI support.',
    },
    prerequisites: {
      accounts: ['Square account'],
      permissions: ['Application created in Developer Dashboard'],
      preparations: ['Create Square application', 'Get API credentials'],
    },
    connectionGuide: [
      { step: 1, title: 'Go to Square Developer', description: 'Visit developer.squareup.com and sign in.', screenshot: 'Square – Developer Portal' },
      { step: 2, title: 'Create Application', description: 'Click "+" to create new application.', screenshot: 'Square – Create App' },
      { step: 3, title: 'Name Application', description: 'Enter application name and description.', screenshot: 'Square – App Name' },
      { step: 4, title: 'Get Credentials', description: 'Go to Credentials tab. Copy Access Token.', screenshot: 'Square – Credentials' },
      { step: 5, title: 'Get Location ID', description: 'Go to Locations in dashboard to get your location ID.', screenshot: 'Square – Location ID', tip: 'Each business location has its own ID.' },
      { step: 6, title: 'Connect in AgentForge', description: 'Open AgentForge → Integrations → Square. Enter access token and location ID.', screenshot: 'AgentForge – Square Form' },
    ],
    triggers: [
      { id: 'payment_completed', name: 'Payment Completed', description: 'Fires when payment is completed.', whenItFires: 'When Square payment succeeds.', exampleScenario: 'Send digital receipt.', dataProvided: ['Payment ID', 'Amount', 'Card details', 'Location'] },
      { id: 'order_created', name: 'Order Created', description: 'Fires when new order is created.', whenItFires: 'When order is placed.', exampleScenario: 'Start order preparation.', dataProvided: ['Order ID', 'Items', 'Customer'] },
    ],
    actions: [
      { id: 'create_payment', name: 'Create Payment', description: 'Process a payment.', whenToUse: 'To charge a customer.', requiredFields: ['Amount', 'Source ID'], example: 'Charge $25 to card on file.' },
      { id: 'create_invoice', name: 'Create Invoice', description: 'Create and send invoice.', whenToUse: 'For billing customers.', requiredFields: ['Customer ID', 'Line items'], example: 'Send $500 invoice for services.' },
      { id: 'search_catalog', name: 'Search Catalog', description: 'Search products in catalog.', whenToUse: 'For product inquiries.', requiredFields: ['Search query'], example: 'Find all coffee products.' },
    ],
    exampleFlow: { title: 'Catalog Inquiry Flow', scenario: 'Answer product availability questions.', steps: ['Customer asks about product', 'AI searches Square catalog', 'Gets inventory count', 'Responds with availability and price', 'Offers to reserve if low stock'] },
    troubleshooting: [
      { error: 'Invalid access token', cause: 'Token expired or revoked.', solution: 'Generate new access token.' },
      { error: 'Location not found', cause: 'Wrong location ID.', solution: 'Verify location ID from Locations page.' },
      { error: 'Insufficient permissions', cause: 'Token lacks required scope.', solution: 'Regenerate token with needed permissions.' },
    ],
    bestPractices: ['Use sandbox for testing', 'Handle idempotency for payments', 'Cache catalog data', 'Use location-specific queries', 'Monitor rate limits'],
    faq: [
      { question: 'What are Square fees?', answer: '2.6% + $0.10 per in-person tap/dip/swipe. 2.9% + $0.30 online.' },
      { question: 'Sandbox vs Production?', answer: 'Sandbox environment for testing without real transactions.' },
      { question: 'Multiple locations?', answer: 'Yes, use location ID to target specific location.' },
    ],
  },
];
