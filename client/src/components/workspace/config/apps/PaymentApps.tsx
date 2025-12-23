/**
 * Payment & E-commerce App Configurations
 * 
 * n8n-style configurations for payment and e-commerce platforms:
 * - Stripe (Advanced)
 * - PayPal
 * - Razorpay
 * - Square
 * - Shopify
 * - WooCommerce
 * - Gumroad
 * - Paddle
 */

import React from "react";
import {
  TextField,
  TextareaField,
  SelectField,
  SwitchField,
  NumberField,
  CredentialField,
  ExpressionField,
  KeyValueField,
  CollectionField,
  FixedCollectionField,
  ResourceLocatorField,
  DateTimeField,
  FilterField,
  InfoBox,
  SectionHeader,
} from "../FieldComponents";

interface AppConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// STRIPE ADVANCED CONFIG
// ============================================

export const StripeAdvancedConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Stripe Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Stripe API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'charge'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'charge', label: 'Charge' },
        { value: 'customer', label: 'Customer' },
        { value: 'paymentIntent', label: 'Payment Intent' },
        { value: 'subscription', label: 'Subscription' },
        { value: 'invoice', label: 'Invoice' },
        { value: 'product', label: 'Product' },
        { value: 'price', label: 'Price' },
        { value: 'coupon', label: 'Coupon' },
        { value: 'refund', label: 'Refund' },
        { value: 'paymentMethod', label: 'Payment Method' },
        { value: 'checkout', label: 'Checkout Session' },
        { value: 'balance', label: 'Balance' },
      ]}
      required
    />

    {config.resource === 'charge' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Charge' },
            { value: 'get', label: 'Get Charge' },
            { value: 'getAll', label: 'Get All Charges' },
            { value: 'update', label: 'Update Charge' },
            { value: 'capture', label: 'Capture Charge' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Amount (cents)"
              value={config.amount || ''}
              onChange={(v) => updateConfig('amount', v)}
              placeholder="1000"
              description="Amount in smallest currency unit (e.g., cents)"
              required
            />

            <SelectField
              label="Currency"
              value={config.currency || 'usd'}
              onChange={(v) => updateConfig('currency', v)}
              options={[
                { value: 'usd', label: 'USD' },
                { value: 'eur', label: 'EUR' },
                { value: 'gbp', label: 'GBP' },
                { value: 'inr', label: 'INR' },
                { value: 'aud', label: 'AUD' },
                { value: 'cad', label: 'CAD' },
                { value: 'jpy', label: 'JPY' },
              ]}
              required
            />

            <SelectField
              label="Payment Source"
              value={config.sourceType || 'token'}
              onChange={(v) => updateConfig('sourceType', v)}
              options={[
                { value: 'token', label: 'Card Token' },
                { value: 'customer', label: 'Customer ID' },
              ]}
            />

            {config.sourceType === 'token' && (
              <ExpressionField
                label="Source Token"
                value={config.source || ''}
                onChange={(v) => updateConfig('source', v)}
                placeholder="tok_..."
                required
              />
            )}

            {config.sourceType === 'customer' && (
              <ExpressionField
                label="Customer ID"
                value={config.customer || ''}
                onChange={(v) => updateConfig('customer', v)}
                placeholder="cus_..."
                required
              />
            )}

            <CollectionField
              label="Additional Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'description', displayName: 'Description', type: 'string' },
                { name: 'receiptEmail', displayName: 'Receipt Email', type: 'string' },
                { name: 'statementDescriptor', displayName: 'Statement Descriptor', type: 'string' },
                { name: 'capture', displayName: 'Capture Immediately', type: 'boolean', default: true },
              ]}
            />

            <KeyValueField
              label="Metadata"
              value={config.metadata || []}
              onChange={(v) => updateConfig('metadata', v)}
              keyPlaceholder="Key"
              valuePlaceholder="Value"
            />
          </>
        )}

        {(config.operation === 'get' || config.operation === 'update' || config.operation === 'capture') && (
          <ExpressionField
            label="Charge ID"
            value={config.chargeId || ''}
            onChange={(v) => updateConfig('chargeId', v)}
            placeholder="ch_..."
            required
          />
        )}
      </>
    )}

    {config.resource === 'customer' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
            { value: 'update', label: 'Update' },
            { value: 'delete', label: 'Delete' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Email"
              value={config.email || ''}
              onChange={(v) => updateConfig('email', v)}
              required
            />

            <CollectionField
              label="Customer Details"
              value={config.details || {}}
              onChange={(v) => updateConfig('details', v)}
              options={[
                { name: 'name', displayName: 'Name', type: 'string' },
                { name: 'phone', displayName: 'Phone', type: 'string' },
                { name: 'description', displayName: 'Description', type: 'string' },
                { name: 'address_line1', displayName: 'Address Line 1', type: 'string' },
                { name: 'address_line2', displayName: 'Address Line 2', type: 'string' },
                { name: 'address_city', displayName: 'City', type: 'string' },
                { name: 'address_state', displayName: 'State', type: 'string' },
                { name: 'address_postal_code', displayName: 'Postal Code', type: 'string' },
                { name: 'address_country', displayName: 'Country', type: 'string' },
              ]}
            />

            <KeyValueField
              label="Metadata"
              value={config.metadata || []}
              onChange={(v) => updateConfig('metadata', v)}
              keyPlaceholder="Key"
              valuePlaceholder="Value"
            />
          </>
        )}

        {(config.operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Customer ID"
            value={config.customerId || ''}
            onChange={(v) => updateConfig('customerId', v)}
            placeholder="cus_..."
            required
          />
        )}
      </>
    )}

    {config.resource === 'paymentIntent' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
            { value: 'confirm', label: 'Confirm' },
            { value: 'cancel', label: 'Cancel' },
            { value: 'capture', label: 'Capture' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Amount (cents)"
              value={config.amount || ''}
              onChange={(v) => updateConfig('amount', v)}
              required
            />

            <SelectField
              label="Currency"
              value={config.currency || 'usd'}
              onChange={(v) => updateConfig('currency', v)}
              options={[
                { value: 'usd', label: 'USD' },
                { value: 'eur', label: 'EUR' },
                { value: 'gbp', label: 'GBP' },
                { value: 'inr', label: 'INR' },
              ]}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'customer', displayName: 'Customer ID', type: 'string' },
                { name: 'description', displayName: 'Description', type: 'string' },
                { name: 'receiptEmail', displayName: 'Receipt Email', type: 'string' },
                { name: 'setupFutureUsage', displayName: 'Setup Future Usage', type: 'options', options: [
                  { value: 'off_session', label: 'Off Session' },
                  { value: 'on_session', label: 'On Session' },
                ]},
                { name: 'captureMethod', displayName: 'Capture Method', type: 'options', options: [
                  { value: 'automatic', label: 'Automatic' },
                  { value: 'manual', label: 'Manual' },
                ]},
              ]}
            />
          </>
        )}

        {(config.operation !== 'create' && config.operation !== 'getAll') && (
          <ExpressionField
            label="Payment Intent ID"
            value={config.paymentIntentId || ''}
            onChange={(v) => updateConfig('paymentIntentId', v)}
            placeholder="pi_..."
            required
          />
        )}
      </>
    )}

    {config.resource === 'subscription' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
            { value: 'update', label: 'Update' },
            { value: 'cancel', label: 'Cancel' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Customer ID"
              value={config.customer || ''}
              onChange={(v) => updateConfig('customer', v)}
              placeholder="cus_..."
              required
            />

            <FixedCollectionField
              label="Items"
              value={config.items || []}
              onChange={(v) => updateConfig('items', v)}
              fields={[
                { name: 'price', displayName: 'Price ID', type: 'string', placeholder: 'price_...' },
                { name: 'quantity', displayName: 'Quantity', type: 'number' },
              ]}
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'trialPeriodDays', displayName: 'Trial Period (Days)', type: 'number' },
                { name: 'coupon', displayName: 'Coupon ID', type: 'string' },
                { name: 'cancelAtPeriodEnd', displayName: 'Cancel at Period End', type: 'boolean' },
                { name: 'paymentBehavior', displayName: 'Payment Behavior', type: 'options', options: [
                  { value: 'default_incomplete', label: 'Default Incomplete' },
                  { value: 'error_if_incomplete', label: 'Error if Incomplete' },
                  { value: 'allow_incomplete', label: 'Allow Incomplete' },
                  { value: 'pending_if_incomplete', label: 'Pending if Incomplete' },
                ]},
              ]}
            />
          </>
        )}

        {(config.operation !== 'create' && config.operation !== 'getAll') && (
          <ExpressionField
            label="Subscription ID"
            value={config.subscriptionId || ''}
            onChange={(v) => updateConfig('subscriptionId', v)}
            placeholder="sub_..."
            required
          />
        )}

        {config.operation === 'cancel' && (
          <SwitchField
            label="Cancel at Period End"
            value={config.cancelAtPeriodEnd || false}
            onChange={(v) => updateConfig('cancelAtPeriodEnd', v)}
            description="If true, subscription will be cancelled at the end of the current billing period"
          />
        )}
      </>
    )}

    {config.resource === 'invoice' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
            { value: 'finalize', label: 'Finalize' },
            { value: 'send', label: 'Send Invoice' },
            { value: 'pay', label: 'Pay Invoice' },
            { value: 'void', label: 'Void Invoice' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Customer ID"
              value={config.customer || ''}
              onChange={(v) => updateConfig('customer', v)}
              placeholder="cus_..."
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'autoAdvance', displayName: 'Auto Advance', type: 'boolean', default: true },
                { name: 'collectionMethod', displayName: 'Collection Method', type: 'options', options: [
                  { value: 'charge_automatically', label: 'Charge Automatically' },
                  { value: 'send_invoice', label: 'Send Invoice' },
                ]},
                { name: 'daysUntilDue', displayName: 'Days Until Due', type: 'number' },
                { name: 'description', displayName: 'Description', type: 'string' },
              ]}
            />
          </>
        )}

        {(config.operation !== 'create' && config.operation !== 'getAll') && (
          <ExpressionField
            label="Invoice ID"
            value={config.invoiceId || ''}
            onChange={(v) => updateConfig('invoiceId', v)}
            placeholder="in_..."
            required
          />
        )}
      </>
    )}

    {config.resource === 'checkout' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Session' },
            { value: 'get', label: 'Get Session' },
            { value: 'getAll', label: 'Get All Sessions' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <SelectField
              label="Mode"
              value={config.mode || 'payment'}
              onChange={(v) => updateConfig('mode', v)}
              options={[
                { value: 'payment', label: 'One-time Payment' },
                { value: 'subscription', label: 'Subscription' },
                { value: 'setup', label: 'Setup' },
              ]}
            />

            <FixedCollectionField
              label="Line Items"
              value={config.lineItems || []}
              onChange={(v) => updateConfig('lineItems', v)}
              fields={[
                { name: 'price', displayName: 'Price ID', type: 'string', placeholder: 'price_...' },
                { name: 'quantity', displayName: 'Quantity', type: 'number' },
              ]}
            />

            <ExpressionField
              label="Success URL"
              value={config.successUrl || ''}
              onChange={(v) => updateConfig('successUrl', v)}
              placeholder="https://example.com/success"
              required
            />

            <ExpressionField
              label="Cancel URL"
              value={config.cancelUrl || ''}
              onChange={(v) => updateConfig('cancelUrl', v)}
              placeholder="https://example.com/cancel"
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'customer', displayName: 'Customer ID', type: 'string' },
                { name: 'customerEmail', displayName: 'Customer Email', type: 'string' },
                { name: 'allowPromotionCodes', displayName: 'Allow Promotion Codes', type: 'boolean' },
              ]}
            />
          </>
        )}
      </>
    )}

    {config.resource === 'refund' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Refund' },
            { value: 'get', label: 'Get Refund' },
            { value: 'getAll', label: 'Get All Refunds' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <SelectField
              label="Refund From"
              value={config.refundFrom || 'charge'}
              onChange={(v) => updateConfig('refundFrom', v)}
              options={[
                { value: 'charge', label: 'Charge ID' },
                { value: 'paymentIntent', label: 'Payment Intent ID' },
              ]}
            />

            <ExpressionField
              label={config.refundFrom === 'charge' ? 'Charge ID' : 'Payment Intent ID'}
              value={config.sourceId || ''}
              onChange={(v) => updateConfig('sourceId', v)}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'amount', displayName: 'Amount (cents, partial refund)', type: 'number' },
                { name: 'reason', displayName: 'Reason', type: 'options', options: [
                  { value: 'duplicate', label: 'Duplicate' },
                  { value: 'fraudulent', label: 'Fraudulent' },
                  { value: 'requested_by_customer', label: 'Requested by Customer' },
                ]},
              ]}
            />
          </>
        )}
      </>
    )}
  </div>
);

// ============================================
// PAYPAL CONFIG
// ============================================

export const PayPalConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="PayPal Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="PayPal API"
      required
    />

    <SelectField
      label="Environment"
      value={config.environment || 'sandbox'}
      onChange={(v) => updateConfig('environment', v)}
      options={[
        { value: 'sandbox', label: 'Sandbox' },
        { value: 'live', label: 'Live' },
      ]}
    />

    <SelectField
      label="Resource"
      value={config.resource || 'payment'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'payment', label: 'Payment' },
        { value: 'order', label: 'Order' },
        { value: 'payout', label: 'Payout' },
        { value: 'subscription', label: 'Subscription' },
        { value: 'invoice', label: 'Invoice' },
      ]}
      required
    />

    {config.resource === 'order' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Order' },
            { value: 'get', label: 'Get Order' },
            { value: 'capture', label: 'Capture Order' },
            { value: 'authorize', label: 'Authorize Order' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <SelectField
              label="Intent"
              value={config.intent || 'CAPTURE'}
              onChange={(v) => updateConfig('intent', v)}
              options={[
                { value: 'CAPTURE', label: 'Capture (Immediate)' },
                { value: 'AUTHORIZE', label: 'Authorize (Later Capture)' },
              ]}
            />

            <FixedCollectionField
              label="Purchase Units"
              value={config.purchaseUnits || []}
              onChange={(v) => updateConfig('purchaseUnits', v)}
              fields={[
                { name: 'description', displayName: 'Description', type: 'string' },
                { name: 'amount', displayName: 'Amount', type: 'string', placeholder: '10.00' },
                { name: 'currency', displayName: 'Currency', type: 'string', placeholder: 'USD' },
              ]}
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'returnUrl', displayName: 'Return URL', type: 'string' },
                { name: 'cancelUrl', displayName: 'Cancel URL', type: 'string' },
                { name: 'brandName', displayName: 'Brand Name', type: 'string' },
              ]}
            />
          </>
        )}

        {(config.operation === 'get' || config.operation === 'capture' || config.operation === 'authorize') && (
          <ExpressionField
            label="Order ID"
            value={config.orderId || ''}
            onChange={(v) => updateConfig('orderId', v)}
            required
          />
        )}
      </>
    )}

    {config.resource === 'payout' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Payout' },
            { value: 'get', label: 'Get Payout' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <FixedCollectionField
              label="Recipients"
              value={config.items || []}
              onChange={(v) => updateConfig('items', v)}
              fields={[
                { name: 'email', displayName: 'Recipient Email', type: 'string' },
                { name: 'amount', displayName: 'Amount', type: 'string' },
                { name: 'currency', displayName: 'Currency', type: 'string', placeholder: 'USD' },
                { name: 'note', displayName: 'Note', type: 'string' },
              ]}
            />

            <TextField
              label="Sender Batch ID"
              value={config.senderBatchId || ''}
              onChange={(v) => updateConfig('senderBatchId', v)}
              description="Unique identifier for this batch"
            />
          </>
        )}
      </>
    )}

    {config.resource === 'subscription' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Subscription' },
            { value: 'get', label: 'Get Subscription' },
            { value: 'cancel', label: 'Cancel Subscription' },
            { value: 'suspend', label: 'Suspend Subscription' },
            { value: 'activate', label: 'Activate Subscription' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Plan ID"
              value={config.planId || ''}
              onChange={(v) => updateConfig('planId', v)}
              placeholder="P-..."
              required
            />

            <CollectionField
              label="Subscriber"
              value={config.subscriber || {}}
              onChange={(v) => updateConfig('subscriber', v)}
              options={[
                { name: 'email', displayName: 'Email', type: 'string' },
                { name: 'name', displayName: 'Name', type: 'string' },
              ]}
            />
          </>
        )}

        {config.operation !== 'create' && (
          <ExpressionField
            label="Subscription ID"
            value={config.subscriptionId || ''}
            onChange={(v) => updateConfig('subscriptionId', v)}
            placeholder="I-..."
            required
          />
        )}

        {config.operation === 'cancel' && (
          <TextField
            label="Cancellation Reason"
            value={config.reason || ''}
            onChange={(v) => updateConfig('reason', v)}
          />
        )}
      </>
    )}
  </div>
);

// ============================================
// RAZORPAY CONFIG
// ============================================

export const RazorpayConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Razorpay Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Razorpay API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'payment'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'payment', label: 'Payment' },
        { value: 'order', label: 'Order' },
        { value: 'refund', label: 'Refund' },
        { value: 'customer', label: 'Customer' },
        { value: 'subscription', label: 'Subscription' },
        { value: 'invoice', label: 'Invoice' },
        { value: 'paymentLink', label: 'Payment Link' },
      ]}
      required
    />

    {config.resource === 'order' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Order' },
            { value: 'get', label: 'Get Order' },
            { value: 'getAll', label: 'Get All Orders' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Amount (paise)"
              value={config.amount || ''}
              onChange={(v) => updateConfig('amount', v)}
              placeholder="10000"
              description="Amount in smallest currency unit (paise for INR)"
              required
            />

            <SelectField
              label="Currency"
              value={config.currency || 'INR'}
              onChange={(v) => updateConfig('currency', v)}
              options={[
                { value: 'INR', label: 'INR' },
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
              ]}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'receipt', displayName: 'Receipt ID', type: 'string' },
                { name: 'partial_payment', displayName: 'Allow Partial Payment', type: 'boolean' },
              ]}
            />

            <KeyValueField
              label="Notes"
              value={config.notes || []}
              onChange={(v) => updateConfig('notes', v)}
              keyPlaceholder="Key"
              valuePlaceholder="Value"
            />
          </>
        )}

        {config.operation === 'get' && (
          <ExpressionField
            label="Order ID"
            value={config.orderId || ''}
            onChange={(v) => updateConfig('orderId', v)}
            placeholder="order_..."
            required
          />
        )}
      </>
    )}

    {config.resource === 'payment' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Payment' },
            { value: 'getAll', label: 'Get All Payments' },
            { value: 'capture', label: 'Capture Payment' },
          ]}
        />

        {(config.operation === 'get' || config.operation === 'capture') && (
          <ExpressionField
            label="Payment ID"
            value={config.paymentId || ''}
            onChange={(v) => updateConfig('paymentId', v)}
            placeholder="pay_..."
            required
          />
        )}

        {config.operation === 'capture' && (
          <ExpressionField
            label="Amount (paise)"
            value={config.amount || ''}
            onChange={(v) => updateConfig('amount', v)}
            required
          />
        )}
      </>
    )}

    {config.resource === 'refund' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Refund' },
            { value: 'get', label: 'Get Refund' },
            { value: 'getAll', label: 'Get All Refunds' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Payment ID"
              value={config.paymentId || ''}
              onChange={(v) => updateConfig('paymentId', v)}
              placeholder="pay_..."
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'amount', displayName: 'Amount (paise, for partial)', type: 'number' },
                { name: 'speed', displayName: 'Refund Speed', type: 'options', options: [
                  { value: 'normal', label: 'Normal' },
                  { value: 'optimum', label: 'Optimum' },
                ]},
              ]}
            />
          </>
        )}
      </>
    )}

    {config.resource === 'paymentLink' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Payment Link' },
            { value: 'get', label: 'Get Payment Link' },
            { value: 'cancel', label: 'Cancel Payment Link' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Amount (paise)"
              value={config.amount || ''}
              onChange={(v) => updateConfig('amount', v)}
              required
            />

            <TextField
              label="Description"
              value={config.description || ''}
              onChange={(v) => updateConfig('description', v)}
              required
            />

            <CollectionField
              label="Customer"
              value={config.customer || {}}
              onChange={(v) => updateConfig('customer', v)}
              options={[
                { name: 'name', displayName: 'Name', type: 'string' },
                { name: 'email', displayName: 'Email', type: 'string' },
                { name: 'contact', displayName: 'Phone', type: 'string' },
              ]}
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'accept_partial', displayName: 'Accept Partial Payment', type: 'boolean' },
                { name: 'first_min_partial_amount', displayName: 'Min Partial Amount', type: 'number' },
                { name: 'expire_by', displayName: 'Expire By (Unix Timestamp)', type: 'number' },
                { name: 'callback_url', displayName: 'Callback URL', type: 'string' },
                { name: 'callback_method', displayName: 'Callback Method', type: 'options', options: [
                  { value: 'get', label: 'GET' },
                ]},
              ]}
            />
          </>
        )}
      </>
    )}
  </div>
);

// ============================================
// SHOPIFY CONFIG
// ============================================

export const ShopifyConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Shopify Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Shopify API"
      required
    />

    <TextField
      label="Shop Name"
      value={config.shopName || ''}
      onChange={(v) => updateConfig('shopName', v)}
      placeholder="mystore"
      description="Your Shopify store name (without .myshopify.com)"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'order'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'order', label: 'Order' },
        { value: 'product', label: 'Product' },
        { value: 'customer', label: 'Customer' },
        { value: 'inventory', label: 'Inventory' },
        { value: 'fulfillment', label: 'Fulfillment' },
      ]}
      required
    />

    {config.resource === 'order' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Order' },
            { value: 'getAll', label: 'Get All Orders' },
            { value: 'update', label: 'Update Order' },
            { value: 'delete', label: 'Delete Order' },
          ]}
        />

        {config.operation === 'get' && (
          <ExpressionField
            label="Order ID"
            value={config.orderId || ''}
            onChange={(v) => updateConfig('orderId', v)}
            required
          />
        )}

        {config.operation === 'getAll' && (
          <CollectionField
            label="Filters"
            value={config.filters || {}}
            onChange={(v) => updateConfig('filters', v)}
            options={[
              { name: 'status', displayName: 'Status', type: 'options', options: [
                { value: 'any', label: 'Any' },
                { value: 'open', label: 'Open' },
                { value: 'closed', label: 'Closed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]},
              { name: 'financial_status', displayName: 'Financial Status', type: 'options', options: [
                { value: 'any', label: 'Any' },
                { value: 'authorized', label: 'Authorized' },
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid' },
                { value: 'refunded', label: 'Refunded' },
              ]},
              { name: 'fulfillment_status', displayName: 'Fulfillment Status', type: 'options', options: [
                { value: 'any', label: 'Any' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'unshipped', label: 'Unshipped' },
                { value: 'partial', label: 'Partial' },
              ]},
              { name: 'created_at_min', displayName: 'Created After', type: 'string' },
              { name: 'created_at_max', displayName: 'Created Before', type: 'string' },
              { name: 'limit', displayName: 'Limit', type: 'number', default: 50 },
            ]}
          />
        )}
      </>
    )}

    {config.resource === 'product' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Product' },
            { value: 'get', label: 'Get Product' },
            { value: 'getAll', label: 'Get All Products' },
            { value: 'update', label: 'Update Product' },
            { value: 'delete', label: 'Delete Product' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Title"
              value={config.title || ''}
              onChange={(v) => updateConfig('title', v)}
              required
            />

            <TextareaField
              label="Description (HTML)"
              value={config.bodyHtml || ''}
              onChange={(v) => updateConfig('bodyHtml', v)}
              rows={4}
            />

            <CollectionField
              label="Product Details"
              value={config.details || {}}
              onChange={(v) => updateConfig('details', v)}
              options={[
                { name: 'vendor', displayName: 'Vendor', type: 'string' },
                { name: 'product_type', displayName: 'Product Type', type: 'string' },
                { name: 'tags', displayName: 'Tags (comma-separated)', type: 'string' },
                { name: 'status', displayName: 'Status', type: 'options', options: [
                  { value: 'active', label: 'Active' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'archived', label: 'Archived' },
                ]},
              ]}
            />

            <FixedCollectionField
              label="Variants"
              value={config.variants || []}
              onChange={(v) => updateConfig('variants', v)}
              fields={[
                { name: 'title', displayName: 'Title', type: 'string' },
                { name: 'price', displayName: 'Price', type: 'string' },
                { name: 'sku', displayName: 'SKU', type: 'string' },
                { name: 'inventory_quantity', displayName: 'Inventory Qty', type: 'number' },
              ]}
            />
          </>
        )}

        {(config.operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Product ID"
            value={config.productId || ''}
            onChange={(v) => updateConfig('productId', v)}
            required
          />
        )}
      </>
    )}

    {config.resource === 'customer' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Customer' },
            { value: 'get', label: 'Get Customer' },
            { value: 'getAll', label: 'Get All Customers' },
            { value: 'update', label: 'Update Customer' },
            { value: 'delete', label: 'Delete Customer' },
            { value: 'search', label: 'Search Customers' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Email"
              value={config.email || ''}
              onChange={(v) => updateConfig('email', v)}
              required
            />

            <CollectionField
              label="Customer Details"
              value={config.details || {}}
              onChange={(v) => updateConfig('details', v)}
              options={[
                { name: 'first_name', displayName: 'First Name', type: 'string' },
                { name: 'last_name', displayName: 'Last Name', type: 'string' },
                { name: 'phone', displayName: 'Phone', type: 'string' },
                { name: 'tags', displayName: 'Tags', type: 'string' },
                { name: 'note', displayName: 'Note', type: 'string' },
                { name: 'accepts_marketing', displayName: 'Accepts Marketing', type: 'boolean' },
              ]}
            />
          </>
        )}

        {config.operation === 'search' && (
          <TextField
            label="Search Query"
            value={config.query || ''}
            onChange={(v) => updateConfig('query', v)}
            placeholder="email:test@example.com"
            required
          />
        )}
      </>
    )}

    {config.resource === 'inventory' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Inventory Level' },
            { value: 'set', label: 'Set Inventory Level' },
            { value: 'adjust', label: 'Adjust Inventory' },
          ]}
        />

        <ExpressionField
          label="Inventory Item ID"
          value={config.inventoryItemId || ''}
          onChange={(v) => updateConfig('inventoryItemId', v)}
          required
        />

        <ExpressionField
          label="Location ID"
          value={config.locationId || ''}
          onChange={(v) => updateConfig('locationId', v)}
          required
        />

        {(config.operation === 'set' || config.operation === 'adjust') && (
          <ExpressionField
            label="Quantity"
            value={config.quantity || ''}
            onChange={(v) => updateConfig('quantity', v)}
            placeholder={config.operation === 'adjust' ? 'e.g., -5 or 10' : 'e.g., 100'}
            required
          />
        )}
      </>
    )}
  </div>
);

// ============================================
// WOOCOMMERCE CONFIG
// ============================================

export const WooCommerceConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="WooCommerce Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="WooCommerce API"
      required
    />

    <TextField
      label="Store URL"
      value={config.storeUrl || ''}
      onChange={(v) => updateConfig('storeUrl', v)}
      placeholder="https://mystore.com"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'order'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'order', label: 'Order' },
        { value: 'product', label: 'Product' },
        { value: 'customer', label: 'Customer' },
        { value: 'coupon', label: 'Coupon' },
      ]}
      required
    />

    {config.resource === 'order' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Order' },
            { value: 'get', label: 'Get Order' },
            { value: 'getAll', label: 'Get All Orders' },
            { value: 'update', label: 'Update Order' },
            { value: 'delete', label: 'Delete Order' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <CollectionField
              label="Billing"
              value={config.billing || {}}
              onChange={(v) => updateConfig('billing', v)}
              options={[
                { name: 'first_name', displayName: 'First Name', type: 'string' },
                { name: 'last_name', displayName: 'Last Name', type: 'string' },
                { name: 'email', displayName: 'Email', type: 'string' },
                { name: 'phone', displayName: 'Phone', type: 'string' },
                { name: 'address_1', displayName: 'Address', type: 'string' },
                { name: 'city', displayName: 'City', type: 'string' },
                { name: 'state', displayName: 'State', type: 'string' },
                { name: 'postcode', displayName: 'Postcode', type: 'string' },
                { name: 'country', displayName: 'Country', type: 'string' },
              ]}
            />

            <FixedCollectionField
              label="Line Items"
              value={config.lineItems || []}
              onChange={(v) => updateConfig('lineItems', v)}
              fields={[
                { name: 'product_id', displayName: 'Product ID', type: 'string' },
                { name: 'quantity', displayName: 'Quantity', type: 'number' },
              ]}
            />
          </>
        )}

        {(config.operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Order ID"
            value={config.orderId || ''}
            onChange={(v) => updateConfig('orderId', v)}
            required
          />
        )}

        {config.operation === 'update' && (
          <SelectField
            label="Status"
            value={config.status || ''}
            onChange={(v) => updateConfig('status', v)}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'processing', label: 'Processing' },
              { value: 'on-hold', label: 'On Hold' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'refunded', label: 'Refunded' },
              { value: 'failed', label: 'Failed' },
            ]}
          />
        )}
      </>
    )}

    {config.resource === 'product' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Product' },
            { value: 'get', label: 'Get Product' },
            { value: 'getAll', label: 'Get All Products' },
            { value: 'update', label: 'Update Product' },
            { value: 'delete', label: 'Delete Product' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required
            />

            <SelectField
              label="Type"
              value={config.type || 'simple'}
              onChange={(v) => updateConfig('type', v)}
              options={[
                { value: 'simple', label: 'Simple' },
                { value: 'variable', label: 'Variable' },
                { value: 'grouped', label: 'Grouped' },
                { value: 'external', label: 'External' },
              ]}
            />

            <CollectionField
              label="Product Details"
              value={config.details || {}}
              onChange={(v) => updateConfig('details', v)}
              options={[
                { name: 'regular_price', displayName: 'Regular Price', type: 'string' },
                { name: 'sale_price', displayName: 'Sale Price', type: 'string' },
                { name: 'description', displayName: 'Description', type: 'string' },
                { name: 'short_description', displayName: 'Short Description', type: 'string' },
                { name: 'sku', displayName: 'SKU', type: 'string' },
                { name: 'stock_quantity', displayName: 'Stock Quantity', type: 'number' },
                { name: 'manage_stock', displayName: 'Manage Stock', type: 'boolean' },
                { name: 'status', displayName: 'Status', type: 'options', options: [
                  { value: 'publish', label: 'Published' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'pending', label: 'Pending' },
                ]},
              ]}
            />
          </>
        )}
      </>
    )}

    {config.resource === 'coupon' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Coupon' },
            { value: 'get', label: 'Get Coupon' },
            { value: 'getAll', label: 'Get All Coupons' },
            { value: 'update', label: 'Update Coupon' },
            { value: 'delete', label: 'Delete Coupon' },
          ]}
        />

        {config.operation === 'create' && (
          <>
            <ExpressionField
              label="Coupon Code"
              value={config.code || ''}
              onChange={(v) => updateConfig('code', v)}
              required
            />

            <SelectField
              label="Discount Type"
              value={config.discountType || 'percent'}
              onChange={(v) => updateConfig('discountType', v)}
              options={[
                { value: 'percent', label: 'Percentage Discount' },
                { value: 'fixed_cart', label: 'Fixed Cart Discount' },
                { value: 'fixed_product', label: 'Fixed Product Discount' },
              ]}
            />

            <ExpressionField
              label="Amount"
              value={config.amount || ''}
              onChange={(v) => updateConfig('amount', v)}
              placeholder="10"
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'individual_use', displayName: 'Individual Use Only', type: 'boolean' },
                { name: 'usage_limit', displayName: 'Usage Limit', type: 'number' },
                { name: 'usage_limit_per_user', displayName: 'Usage Limit Per User', type: 'number' },
                { name: 'date_expires', displayName: 'Expiry Date', type: 'string' },
                { name: 'minimum_amount', displayName: 'Minimum Amount', type: 'string' },
                { name: 'maximum_amount', displayName: 'Maximum Amount', type: 'string' },
              ]}
            />
          </>
        )}
      </>
    )}
  </div>
);

// ============================================
// EXPORTS
// ============================================

export const PaymentAppConfigs: Record<string, React.FC<AppConfigProps>> = {
  // Stripe
  stripe_advanced: StripeAdvancedConfig,
  stripe: StripeAdvancedConfig,
  stripe_payment: StripeAdvancedConfig,
  
  // PayPal
  paypal: PayPalConfig,
  paypal_payment: PayPalConfig,
  
  // Razorpay
  razorpay: RazorpayConfig,
  razorpay_payment: RazorpayConfig,
  
  // Shopify
  shopify: ShopifyConfig,
  shopify_store: ShopifyConfig,
  
  // WooCommerce
  woocommerce: WooCommerceConfig,
  woo_commerce: WooCommerceConfig,
  woo: WooCommerceConfig,
};

export default PaymentAppConfigs;
