import { Integration } from './types';

export const shopifyIntegration: Integration = {
  id: 'shopify',
  name: 'Shopify',
  description: 'Use the Shopify node to manage your e-commerce store. n8n supports products, orders, customers, inventory, and fulfillment operations for complete store automation.',
  shortDescription: 'E-commerce store management',
  category: 'ecommerce',
  icon: 'shopify',
  color: '#96BF48',
  website: 'https://shopify.com',
  documentationUrl: 'https://shopify.dev/docs/api',

  features: [
    'Order management',
    'Product catalog handling',
    'Customer management',
    'Inventory tracking',
    'Fulfillment automation',
    'Discount code creation',
    'Collection management',
    'Webhook support',
  ],

  useCases: [
    'Order fulfillment automation',
    'Inventory sync across channels',
    'Customer data enrichment',
    'Abandoned cart recovery',
    'Product catalog sync',
    'Return/refund processing',
    'Sales reporting',
    'Multi-store management',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Create Custom App',
      description: 'In Shopify Admin, go to Settings > Apps and sales channels > Develop apps.',
    },
    {
      step: 2,
      title: 'Enable Custom App Development',
      description: 'Click "Allow custom app development" if not already enabled.',
    },
    {
      step: 3,
      title: 'Create App',
      description: 'Click "Create an app" and give it a name.',
    },
    {
      step: 4,
      title: 'Configure Scopes',
      description: 'In "Configure Admin API scopes", select required permissions (orders, products, customers).',
      note: 'Only select scopes you actually need for security.',
    },
    {
      step: 5,
      title: 'Install App',
      description: 'Click "Install app" to generate access tokens.',
    },
    {
      step: 6,
      title: 'Copy Credentials',
      description: 'Copy the Admin API access token. Note your store URL (mystore.myshopify.com).',
    },
    {
      step: 7,
      title: 'Configure in AgentForge',
      description: 'Enter store URL and access token in Integrations > Shopify.',
    },
  ],

  operations: [
    {
      name: 'Get Orders',
      description: 'Retrieve orders from your store',
      fields: [
        { name: 'status', type: 'select', required: false, description: 'any, open, closed, cancelled' },
        { name: 'fulfillment_status', type: 'select', required: false, description: 'shipped, partial, unshipped' },
        { name: 'created_at_min', type: 'date', required: false, description: 'Orders created after date' },
        { name: 'limit', type: 'number', required: false, description: 'Max orders to return' },
      ],
    },
    {
      name: 'Create Product',
      description: 'Add a new product to store',
      fields: [
        { name: 'title', type: 'string', required: true, description: 'Product title' },
        { name: 'body_html', type: 'string', required: false, description: 'Product description (HTML)' },
        { name: 'vendor', type: 'string', required: false, description: 'Product vendor' },
        { name: 'product_type', type: 'string', required: false, description: 'Product category' },
        { name: 'variants', type: 'array', required: false, description: 'Product variants with prices' },
        { name: 'images', type: 'array', required: false, description: 'Product images' },
      ],
    },
    {
      name: 'Update Inventory',
      description: 'Adjust inventory levels',
      fields: [
        { name: 'inventory_item_id', type: 'string', required: true, description: 'Inventory item ID' },
        { name: 'location_id', type: 'string', required: true, description: 'Location ID' },
        { name: 'available', type: 'number', required: true, description: 'New quantity' },
      ],
    },
    {
      name: 'Create Fulfillment',
      description: 'Fulfill an order',
      fields: [
        { name: 'order_id', type: 'string', required: true, description: 'Order ID' },
        { name: 'tracking_number', type: 'string', required: false, description: 'Shipping tracking number' },
        { name: 'tracking_company', type: 'string', required: false, description: 'Carrier name' },
        { name: 'notify_customer', type: 'boolean', required: false, description: 'Send shipping notification' },
      ],
    },
    {
      name: 'Create Customer',
      description: 'Add a new customer',
      fields: [
        { name: 'email', type: 'string', required: true, description: 'Customer email' },
        { name: 'first_name', type: 'string', required: false, description: 'First name' },
        { name: 'last_name', type: 'string', required: false, description: 'Last name' },
        { name: 'phone', type: 'string', required: false, description: 'Phone number' },
        { name: 'tags', type: 'string', required: false, description: 'Comma-separated tags' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Order Created',
      description: 'Triggers when a new order is placed',
      when: 'New order received',
      outputFields: ['id', 'order_number', 'email', 'total_price', 'line_items', 'shipping_address'],
    },
    {
      name: 'Order Paid',
      description: 'Triggers when payment is confirmed',
      when: 'Order financial_status = paid',
      outputFields: ['id', 'order_number', 'total_price', 'payment_gateway'],
    },
    {
      name: 'Order Fulfilled',
      description: 'Triggers when order is shipped',
      when: 'Fulfillment created',
      outputFields: ['id', 'order_id', 'tracking_number', 'tracking_company'],
    },
    {
      name: 'Product Created',
      description: 'Triggers when a product is added',
      when: 'New product in catalog',
      outputFields: ['id', 'title', 'variants', 'created_at'],
    },
    {
      name: 'Customer Created',
      description: 'Triggers when a new customer registers',
      when: 'New customer account',
      outputFields: ['id', 'email', 'first_name', 'last_name', 'created_at'],
    },
  ],

  actions: [
    {
      name: 'Create Order',
      description: 'Create a draft order or order',
      inputFields: ['line_items', 'customer', 'shipping_address', 'financial_status'],
      outputFields: ['id', 'order_number', 'total_price'],
    },
    {
      name: 'Cancel Order',
      description: 'Cancel an existing order',
      inputFields: ['order_id', 'reason', 'email', 'restock'],
      outputFields: ['id', 'cancelled_at'],
    },
    {
      name: 'Issue Refund',
      description: 'Process a refund for an order',
      inputFields: ['order_id', 'amount', 'note'],
      outputFields: ['id', 'amount', 'created_at'],
    },
  ],

  examples: [
    {
      title: 'Order to Fulfillment Flow',
      description: 'Automate order processing',
      steps: [
        'Trigger: New order received',
        'Check inventory availability',
        'Send order to fulfillment center (API)',
        'Update order tags to "processing"',
        'When shipped, create fulfillment with tracking',
        'Send custom shipping notification email',
      ],
      code: `{
  "order_id": "{{order.id}}",
  "fulfillment": {
    "tracking_number": "{{shipment.trackingNumber}}",
    "tracking_company": "{{shipment.carrier}}",
    "notify_customer": true
  }
}`,
    },
    {
      title: 'Inventory Sync',
      description: 'Sync inventory from warehouse system',
      steps: [
        'Trigger: Inventory updated in warehouse',
        'Map warehouse SKU to Shopify variant',
        'Update inventory level in Shopify',
        'If low stock, add product tag "low-stock"',
      ],
    },
  ],

  commonIssues: [
    {
      problem: 'Invalid API key or access token',
      cause: 'App uninstalled or token expired.',
      solution: 'Reinstall the custom app and generate new tokens.',
    },
    {
      problem: 'Product variant not found',
      cause: 'Using wrong variant ID or product deleted.',
      solution: 'Verify variant exists by fetching product first.',
    },
    {
      problem: 'Inventory item not stocked at location',
      cause: 'Product not enabled for the specified location.',
      solution: 'Enable product for the location in Shopify admin.',
    },
    {
      problem: 'Rate limit exceeded',
      cause: 'Too many API calls (40 calls/second for basic).',
      solution: 'Implement request throttling or upgrade Shopify plan.',
    },
  ],

  relatedIntegrations: ['stripe', 'woocommerce', 'sendgrid'],
  externalResources: [
    { title: 'Shopify Admin API', url: 'https://shopify.dev/docs/api/admin-rest' },
    { title: 'Webhooks Guide', url: 'https://shopify.dev/docs/apps/webhooks' },
  ],
};

export const stripeIntegration: Integration = {
  id: 'stripe',
  name: 'Stripe',
  description: 'Use the Stripe node for payment processing, subscription management, and financial operations. n8n supports charges, customers, invoices, and webhook handling.',
  shortDescription: 'Payment processing and subscriptions',
  category: 'ecommerce',
  icon: 'stripe',
  color: '#635BFF',
  website: 'https://stripe.com',
  documentationUrl: 'https://stripe.com/docs/api',

  features: [
    'Payment processing',
    'Subscription management',
    'Customer management',
    'Invoice generation',
    'Refund processing',
    'Webhook handling',
    'Product/price management',
    'Payment method handling',
  ],

  useCases: [
    'One-time payments',
    'Recurring subscriptions',
    'Checkout automation',
    'Invoice generation',
    'Refund processing',
    'Failed payment recovery',
    'Subscription lifecycle management',
    'Revenue reporting',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Log into Stripe Dashboard',
      description: 'Go to dashboard.stripe.com and sign in.',
    },
    {
      step: 2,
      title: 'Navigate to API Keys',
      description: 'Go to Developers > API keys.',
    },
    {
      step: 3,
      title: 'Copy Secret Key',
      description: 'Copy the Secret key (starts with sk_live_ or sk_test_).',
      note: 'Use test keys (sk_test_) for development.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter the Secret key in Integrations > Stripe.',
    },
  ],

  operations: [
    {
      name: 'Create Customer',
      description: 'Create a new Stripe customer',
      fields: [
        { name: 'email', type: 'string', required: true, description: 'Customer email' },
        { name: 'name', type: 'string', required: false, description: 'Customer name' },
        { name: 'metadata', type: 'json', required: false, description: 'Custom key-value data' },
      ],
    },
    {
      name: 'Create Charge',
      description: 'Charge a payment method',
      fields: [
        { name: 'amount', type: 'number', required: true, description: 'Amount in cents' },
        { name: 'currency', type: 'string', required: true, description: 'Three-letter currency code' },
        { name: 'customer', type: 'string', required: false, description: 'Customer ID' },
        { name: 'source', type: 'string', required: false, description: 'Payment source token' },
        { name: 'description', type: 'string', required: false, description: 'Charge description' },
      ],
    },
    {
      name: 'Create Subscription',
      description: 'Subscribe customer to a plan',
      fields: [
        { name: 'customer', type: 'string', required: true, description: 'Customer ID' },
        { name: 'price', type: 'string', required: true, description: 'Price ID (price_xxx)' },
        { name: 'trial_period_days', type: 'number', required: false, description: 'Trial days' },
        { name: 'metadata', type: 'json', required: false, description: 'Custom metadata' },
      ],
    },
    {
      name: 'Create Refund',
      description: 'Refund a charge',
      fields: [
        { name: 'charge', type: 'string', required: true, description: 'Charge ID to refund' },
        { name: 'amount', type: 'number', required: false, description: 'Amount to refund (full if omitted)' },
        { name: 'reason', type: 'select', required: false, description: 'duplicate, fraudulent, requested_by_customer' },
      ],
    },
    {
      name: 'Create Invoice',
      description: 'Create a one-off invoice',
      fields: [
        { name: 'customer', type: 'string', required: true, description: 'Customer ID' },
        { name: 'auto_advance', type: 'boolean', required: false, description: 'Auto-finalize invoice' },
        { name: 'collection_method', type: 'select', required: false, description: 'charge_automatically, send_invoice' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Payment Succeeded',
      description: 'Triggers when payment is successful',
      when: 'charge.succeeded webhook',
      outputFields: ['id', 'amount', 'currency', 'customer', 'receipt_url'],
    },
    {
      name: 'Payment Failed',
      description: 'Triggers when payment fails',
      when: 'charge.failed webhook',
      outputFields: ['id', 'amount', 'customer', 'failure_message'],
    },
    {
      name: 'Subscription Created',
      description: 'Triggers on new subscription',
      when: 'customer.subscription.created',
      outputFields: ['id', 'customer', 'status', 'current_period_end'],
    },
    {
      name: 'Subscription Cancelled',
      description: 'Triggers when subscription is cancelled',
      when: 'customer.subscription.deleted',
      outputFields: ['id', 'customer', 'canceled_at'],
    },
    {
      name: 'Invoice Payment Failed',
      description: 'Triggers on failed invoice payment',
      when: 'invoice.payment_failed',
      outputFields: ['id', 'customer', 'amount_due', 'next_payment_attempt'],
    },
  ],

  actions: [
    {
      name: 'Charge Customer',
      description: 'Process a payment',
      inputFields: ['customer', 'amount', 'currency'],
      outputFields: ['id', 'status', 'receipt_url'],
    },
    {
      name: 'Cancel Subscription',
      description: 'Cancel a subscription',
      inputFields: ['subscription_id', 'cancel_at_period_end'],
      outputFields: ['id', 'status', 'canceled_at'],
    },
    {
      name: 'Update Subscription',
      description: 'Change subscription plan or quantity',
      inputFields: ['subscription_id', 'price', 'quantity', 'proration_behavior'],
      outputFields: ['id', 'status', 'current_period_end'],
    },
  ],

  examples: [
    {
      title: 'Failed Payment Recovery',
      description: 'Handle failed subscription payments',
      steps: [
        'Trigger: invoice.payment_failed webhook',
        'Get customer email from Stripe',
        'Send payment failure email',
        'Create task in CRM for follow-up',
        'If 3rd failure, pause subscription',
      ],
      code: `{
  "to": "{{customer.email}}",
  "subject": "Payment Failed - Action Required",
  "body": "Hi {{customer.name}},\\n\\nWe were unable to process your payment of {{formatCurrency(invoice.amount_due)}}.\\n\\nPlease update your payment method: {{invoice.hosted_invoice_url}}"
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Card declined',
      cause: 'Insufficient funds or card blocked.',
      solution: 'Ask customer to use different payment method or contact bank.',
    },
    {
      problem: 'Invalid API key',
      cause: 'Using test key in production or vice versa.',
      solution: 'Ensure you\'re using the correct key for your environment.',
    },
    {
      problem: 'Webhook signature verification failed',
      cause: 'Wrong webhook secret or request tampering.',
      solution: 'Verify webhook endpoint secret matches Stripe dashboard.',
    },
  ],

  relatedIntegrations: ['shopify', 'woocommerce', 'paypal'],
  externalResources: [
    { title: 'Stripe API Reference', url: 'https://stripe.com/docs/api' },
    { title: 'Webhooks Guide', url: 'https://stripe.com/docs/webhooks' },
  ],
};

export const woocommerceIntegration: Integration = {
  id: 'woocommerce',
  name: 'WooCommerce',
  description: 'Use the WooCommerce node to manage your WordPress e-commerce store. n8n supports products, orders, customers, and coupons through the REST API.',
  shortDescription: 'WordPress e-commerce management',
  category: 'ecommerce',
  icon: 'woocommerce',
  color: '#96588A',
  website: 'https://woocommerce.com',
  documentationUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs/',

  features: [
    'Order management',
    'Product management',
    'Customer handling',
    'Coupon management',
    'Inventory control',
    'Order notes',
    'Product variations',
    'Shipping zones',
  ],

  useCases: [
    'Order processing automation',
    'Inventory synchronization',
    'Customer data management',
    'Coupon distribution',
    'Multi-channel selling',
    'Fulfillment automation',
    'Sales reporting',
    'Product import/export',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Enable REST API',
      description: 'In WordPress, go to WooCommerce > Settings > Advanced > REST API.',
    },
    {
      step: 2,
      title: 'Add API Key',
      description: 'Click "Add key" to create new API credentials.',
    },
    {
      step: 3,
      title: 'Configure Permissions',
      description: 'Set description, user, and permissions (Read/Write).',
    },
    {
      step: 4,
      title: 'Generate API Key',
      description: 'Click "Generate API key" and copy Consumer Key and Secret.',
      note: 'The secret is shown only once - save it securely.',
    },
    {
      step: 5,
      title: 'Configure in AgentForge',
      description: 'Enter your store URL, Consumer Key, and Consumer Secret.',
    },
  ],

  operations: [
    {
      name: 'Get Orders',
      description: 'Retrieve orders from store',
      fields: [
        { name: 'status', type: 'select', required: false, description: 'pending, processing, completed, etc.' },
        { name: 'after', type: 'date', required: false, description: 'Orders after date' },
        { name: 'per_page', type: 'number', required: false, description: 'Results per page' },
      ],
    },
    {
      name: 'Update Order Status',
      description: 'Change order status',
      fields: [
        { name: 'id', type: 'number', required: true, description: 'Order ID' },
        { name: 'status', type: 'select', required: true, description: 'New status' },
      ],
    },
    {
      name: 'Create Product',
      description: 'Add a new product',
      fields: [
        { name: 'name', type: 'string', required: true, description: 'Product name' },
        { name: 'type', type: 'select', required: false, description: 'simple, variable, grouped' },
        { name: 'regular_price', type: 'string', required: false, description: 'Regular price' },
        { name: 'description', type: 'string', required: false, description: 'Full description' },
        { name: 'sku', type: 'string', required: false, description: 'Stock keeping unit' },
        { name: 'stock_quantity', type: 'number', required: false, description: 'Stock quantity' },
      ],
    },
    {
      name: 'Create Coupon',
      description: 'Create a discount coupon',
      fields: [
        { name: 'code', type: 'string', required: true, description: 'Coupon code' },
        { name: 'discount_type', type: 'select', required: true, description: 'percent, fixed_cart, fixed_product' },
        { name: 'amount', type: 'string', required: true, description: 'Discount amount' },
        { name: 'usage_limit', type: 'number', required: false, description: 'Usage limit' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Order Created',
      description: 'Triggers on new order',
      when: 'New order placed',
      outputFields: ['id', 'number', 'status', 'total', 'billing', 'line_items'],
    },
    {
      name: 'Order Status Changed',
      description: 'Triggers when order status updates',
      when: 'Order status field changes',
      outputFields: ['id', 'number', 'old_status', 'new_status'],
    },
    {
      name: 'Product Low Stock',
      description: 'Triggers when product stock is low',
      when: 'Stock reaches threshold',
      outputFields: ['id', 'name', 'stock_quantity', 'low_stock_amount'],
    },
  ],

  actions: [
    {
      name: 'Complete Order',
      description: 'Mark order as completed',
      inputFields: ['order_id'],
      outputFields: ['id', 'status', 'date_completed'],
    },
    {
      name: 'Add Order Note',
      description: 'Add a note to an order',
      inputFields: ['order_id', 'note', 'customer_note'],
      outputFields: ['id', 'note'],
    },
  ],

  examples: [
    {
      title: 'Order Processing Automation',
      description: 'Auto-process orders based on payment',
      steps: [
        'Trigger: Order created with status "processing"',
        'Send order to fulfillment system',
        'Add order note with fulfillment ID',
        'Update order status to "shipped" when fulfilled',
      ],
    },
  ],

  commonIssues: [
    {
      problem: 'Consumer key invalid',
      cause: 'API keys deleted or regenerated.',
      solution: 'Generate new API keys in WooCommerce settings.',
    },
    {
      problem: 'SSL/HTTPS required',
      cause: 'WooCommerce API requires HTTPS.',
      solution: 'Ensure your site uses HTTPS or enable HTTP Basic Auth.',
    },
    {
      problem: 'Permission denied',
      cause: 'API key doesn\'t have required permissions.',
      solution: 'Recreate API key with Read/Write permissions.',
    },
  ],

  relatedIntegrations: ['shopify', 'stripe', 'sendgrid'],
  externalResources: [
    { title: 'WooCommerce REST API', url: 'https://woocommerce.github.io/woocommerce-rest-api-docs/' },
  ],
};

export const paypalIntegration: Integration = {
  id: 'paypal',
  name: 'PayPal',
  description: 'Use the PayPal node for payment processing, invoicing, and payouts. n8n supports orders, payments, subscriptions, and webhook handling.',
  shortDescription: 'Payment processing and invoicing',
  category: 'ecommerce',
  icon: 'paypal',
  color: '#003087',
  website: 'https://paypal.com',
  documentationUrl: 'https://developer.paypal.com/docs/api/overview/',

  features: [
    'Payment processing',
    'Invoice creation',
    'Subscription billing',
    'Payouts',
    'Refunds',
    'Order management',
    'Webhook handling',
    'Multi-currency support',
  ],

  useCases: [
    'Accept payments',
    'Send invoices',
    'Process refunds',
    'Subscription management',
    'Mass payouts',
    'International payments',
    'Marketplace payments',
    'Donation processing',
  ],

  credentialType: 'oauth2',
  credentialSteps: [
    {
      step: 1,
      title: 'Create PayPal Developer Account',
      description: 'Sign up at developer.paypal.com.',
    },
    {
      step: 2,
      title: 'Create App',
      description: 'Go to Dashboard > My Apps & Credentials and create a new app.',
    },
    {
      step: 3,
      title: 'Select Account Type',
      description: 'Choose Sandbox for testing or Live for production.',
    },
    {
      step: 4,
      title: 'Copy Credentials',
      description: 'Copy the Client ID and Secret.',
    },
    {
      step: 5,
      title: 'Configure in AgentForge',
      description: 'Enter credentials in Integrations > PayPal.',
    },
  ],

  operations: [
    {
      name: 'Create Order',
      description: 'Create a PayPal order',
      fields: [
        { name: 'intent', type: 'select', required: true, description: 'CAPTURE or AUTHORIZE' },
        { name: 'amount', type: 'number', required: true, description: 'Order amount' },
        { name: 'currency', type: 'string', required: true, description: 'Currency code' },
        { name: 'description', type: 'string', required: false, description: 'Order description' },
      ],
    },
    {
      name: 'Capture Payment',
      description: 'Capture an authorized payment',
      fields: [
        { name: 'order_id', type: 'string', required: true, description: 'Order ID' },
      ],
    },
    {
      name: 'Create Invoice',
      description: 'Create and send an invoice',
      fields: [
        { name: 'recipient_email', type: 'string', required: true, description: 'Recipient email' },
        { name: 'items', type: 'array', required: true, description: 'Invoice line items' },
        { name: 'note', type: 'string', required: false, description: 'Invoice note' },
      ],
    },
    {
      name: 'Process Refund',
      description: 'Refund a captured payment',
      fields: [
        { name: 'capture_id', type: 'string', required: true, description: 'Capture ID' },
        { name: 'amount', type: 'number', required: false, description: 'Refund amount (full if omitted)' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Payment Completed',
      description: 'Triggers when payment is completed',
      when: 'PAYMENT.CAPTURE.COMPLETED webhook',
      outputFields: ['id', 'amount', 'payer', 'create_time'],
    },
    {
      name: 'Subscription Activated',
      description: 'Triggers on subscription activation',
      when: 'BILLING.SUBSCRIPTION.ACTIVATED',
      outputFields: ['id', 'plan_id', 'subscriber', 'start_time'],
    },
  ],

  actions: [
    {
      name: 'Send Invoice',
      description: 'Send invoice to customer',
      inputFields: ['invoice_id'],
      outputFields: ['id', 'status'],
    },
  ],

  examples: [
    {
      title: 'Invoice Automation',
      description: 'Send PayPal invoices for service bookings',
      steps: [
        'Trigger: Service booking confirmed',
        'Create invoice with booking details',
        'Send invoice to customer email',
        'Update booking status when paid',
      ],
      code: `{
  "detail": {
    "invoice_number": "INV-{{booking.id}}",
    "currency_code": "USD",
    "note": "Thank you for booking with us!"
  },
  "primary_recipients": [{
    "billing_info": {
      "email_address": "{{customer.email}}"
    }
  }],
  "items": [{
    "name": "{{service.name}}",
    "quantity": "1",
    "unit_amount": { "currency_code": "USD", "value": "{{service.price}}" }
  }]
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Invalid client credentials',
      cause: 'Using sandbox credentials in production.',
      solution: 'Ensure you\'re using the correct credentials for your environment.',
    },
    {
      problem: 'Currency not supported',
      cause: 'PayPal doesn\'t support all currencies in all regions.',
      solution: 'Check PayPal\'s supported currencies documentation.',
    },
  ],

  relatedIntegrations: ['stripe', 'shopify', 'woocommerce'],
  externalResources: [
    { title: 'PayPal REST API', url: 'https://developer.paypal.com/docs/api/overview/' },
  ],
};

export const razorpayIntegration: Integration = {
  id: 'razorpay',
  name: 'Razorpay',
  description: 'Use the Razorpay node to manage payments, orders, and customers. Supports payment capture, refunds, and subscription management for Indian payment workflows.',
  shortDescription: 'Indian payment gateway',
  category: 'ecommerce',
  icon: 'razorpay',
  color: '#0066FF',
  website: 'https://razorpay.com',
  documentationUrl: 'https://razorpay.com/docs/api/',

  features: [
    'Payment processing',
    'Order management',
    'Refund handling',
    'Subscription billing',
    'Invoice generation',
    'UPI payments',
    'Bank transfers',
    'Webhook events',
  ],

  useCases: [
    'E-commerce payments',
    'Subscription billing',
    'Invoice payments',
    'UPI collection',
    'Payout automation',
    'Refund processing',
    'Payment links',
    'Recurring payments',
  ],

  credentialType: 'api_key',
  credentialSteps: [
    {
      step: 1,
      title: 'Go to Dashboard',
      description: 'Log in to Razorpay Dashboard and go to Settings > API Keys.',
    },
    {
      step: 2,
      title: 'Generate Key',
      description: 'Click "Generate Key" to create Key ID and Secret.',
    },
    {
      step: 3,
      title: 'Copy Credentials',
      description: 'Copy both Key ID and Key Secret immediately.',
      note: 'Secret is shown only once. Store it securely.',
    },
    {
      step: 4,
      title: 'Configure in AgentForge',
      description: 'Enter Key ID and Secret in Integrations > Razorpay.',
    },
  ],

  operations: [
    {
      name: 'Create Order',
      description: 'Create a new payment order',
      fields: [
        { name: 'amount', type: 'number', required: true, description: 'Amount in paise (INR)' },
        { name: 'currency', type: 'string', required: true, description: 'Currency code (INR)' },
        { name: 'receipt', type: 'string', required: false, description: 'Receipt ID for reference' },
        { name: 'notes', type: 'json', required: false, description: 'Custom notes' },
      ],
    },
    {
      name: 'Capture Payment',
      description: 'Capture an authorized payment',
      fields: [
        { name: 'payment_id', type: 'string', required: true, description: 'Payment ID' },
        { name: 'amount', type: 'number', required: true, description: 'Amount to capture' },
      ],
    },
    {
      name: 'Create Refund',
      description: 'Refund a captured payment',
      fields: [
        { name: 'payment_id', type: 'string', required: true, description: 'Payment ID' },
        { name: 'amount', type: 'number', required: false, description: 'Partial refund amount' },
      ],
    },
  ],

  triggers: [
    {
      name: 'Payment Captured',
      description: 'Triggers when payment is captured',
      when: 'payment.captured webhook',
      outputFields: ['payment_id', 'amount', 'email', 'contact'],
    },
    {
      name: 'Payment Failed',
      description: 'Triggers when payment fails',
      when: 'payment.failed webhook',
      outputFields: ['payment_id', 'error_code', 'error_description'],
    },
  ],

  actions: [
    {
      name: 'Create Order',
      description: 'Create payment order',
      inputFields: ['amount', 'currency', 'receipt'],
      outputFields: ['id', 'amount', 'status'],
    },
    {
      name: 'Process Refund',
      description: 'Initiate refund',
      inputFields: ['payment_id', 'amount'],
      outputFields: ['id', 'status', 'amount'],
    },
  ],

  examples: [
    {
      title: 'Order Payment Flow',
      description: 'Create order and handle payment',
      steps: [
        'Trigger: Customer places order',
        'Create Razorpay order',
        'Return order ID to frontend',
        'Handle payment.captured webhook',
        'Update order status',
      ],
      code: `{
  "amount": {{order.total * 100}},
  "currency": "INR",
  "receipt": "order_{{order.id}}",
  "notes": {
    "customer_id": "{{customer.id}}",
    "order_items": "{{order.items.length}} items"
  }
}`,
    },
  ],

  commonIssues: [
    {
      problem: 'Invalid amount',
      cause: 'Amount not in paise (smallest unit).',
      solution: 'Multiply rupee amount by 100 to convert to paise.',
    },
    {
      problem: 'Signature mismatch',
      cause: 'Webhook signature verification failed.',
      solution: 'Ensure you\'re using correct webhook secret.',
    },
  ],

  relatedIntegrations: ['stripe', 'paypal', 'shopify'],
  externalResources: [
    { title: 'Razorpay API Docs', url: 'https://razorpay.com/docs/api/' },
  ],
};
