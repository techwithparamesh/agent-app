/**
 * Automation Platform App Configurations
 * 
 * n8n-style configurations for:
 * - Zapier
 * - Make (Integromat)
 * - n8n
 * - Power Automate
 */

import React from "react";
import {
  TextField,
  TextareaField,
  SelectField,
  SwitchField,
  CredentialField,
  ExpressionField,
  KeyValueField,
  CollectionField,
  InfoBox,
} from "../FieldComponents";

interface AppConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// ZAPIER CONFIG
// ============================================

export const ZapierConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <InfoBox type="info" title="Zapier Integration">
      Connect to Zapier via webhooks to trigger Zaps or receive data from Zapier.
    </InfoBox>

    <SelectField
      label="Mode"
      value={config.mode || 'trigger'}
      onChange={(v) => updateConfig('mode', v)}
      options={[
        { value: 'trigger', label: 'Trigger a Zap (Send to Zapier)' },
        { value: 'action', label: 'Receive from Zapier (Webhook)' },
      ]}
      required
    />

    {config.mode === 'trigger' && (
      <>
        <ExpressionField
          label="Zapier Webhook URL"
          value={config.webhookUrl || ''}
          onChange={(v) => updateConfig('webhookUrl', v)}
          placeholder="https://hooks.zapier.com/hooks/catch/..."
          description="Get this from your Zap's webhook trigger"
          required
        />

        <SelectField
          label="HTTP Method"
          value={config.method || 'POST'}
          onChange={(v) => updateConfig('method', v)}
          options={[
            { value: 'POST', label: 'POST' },
            { value: 'GET', label: 'GET' },
          ]}
        />

        <KeyValueField
          label="Data to Send"
          value={config.data || []}
          onChange={(v) => updateConfig('data', v)}
          keyPlaceholder="Field Name"
          valuePlaceholder="Value"
        />

        <CollectionField
          label="Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'timeout', displayName: 'Timeout (ms)', type: 'number' },
            { name: 'waitForResponse', displayName: 'Wait for Response', type: 'boolean' },
          ]}
        />
      </>
    )}

    {config.mode === 'action' && (
      <>
        <TextField
          label="Webhook Path"
          value={config.webhookPath || ''}
          onChange={(v) => updateConfig('webhookPath', v)}
          placeholder="/zapier/incoming"
          description="Path where Zapier will send data"
        />

        <SelectField
          label="Response Mode"
          value={config.responseMode || 'immediate'}
          onChange={(v) => updateConfig('responseMode', v)}
          options={[
            { value: 'immediate', label: 'Respond Immediately' },
            { value: 'afterProcess', label: 'Respond After Processing' },
          ]}
        />

        <SwitchField
          label="Validate Zapier Signature"
          value={config.validateSignature || false}
          onChange={(v) => updateConfig('validateSignature', v)}
          description="Enable for added security"
        />
      </>
    )}
  </div>
);

// ============================================
// MAKE (INTEGROMAT) CONFIG
// ============================================

export const MakeConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <InfoBox type="info" title="Make Integration">
      Connect to Make (formerly Integromat) via webhooks to trigger scenarios.
    </InfoBox>

    <SelectField
      label="Mode"
      value={config.mode || 'trigger'}
      onChange={(v) => updateConfig('mode', v)}
      options={[
        { value: 'trigger', label: 'Trigger a Scenario (Send to Make)' },
        { value: 'action', label: 'Receive from Make (Webhook)' },
      ]}
      required
    />

    {config.mode === 'trigger' && (
      <>
        <ExpressionField
          label="Make Webhook URL"
          value={config.webhookUrl || ''}
          onChange={(v) => updateConfig('webhookUrl', v)}
          placeholder="https://hook.us1.make.com/..."
          description="Get this from your scenario's webhook module"
          required
        />

        <SelectField
          label="HTTP Method"
          value={config.method || 'POST'}
          onChange={(v) => updateConfig('method', v)}
          options={[
            { value: 'POST', label: 'POST' },
            { value: 'GET', label: 'GET' },
          ]}
        />

        <SelectField
          label="Content Type"
          value={config.contentType || 'json'}
          onChange={(v) => updateConfig('contentType', v)}
          options={[
            { value: 'json', label: 'JSON' },
            { value: 'form', label: 'Form Data' },
          ]}
        />

        {config.contentType === 'json' && (
          <TextareaField
            label="JSON Body"
            value={config.body || ''}
            onChange={(v) => updateConfig('body', v)}
            placeholder='{"key": "value"}'
            rows={6}
          />
        )}

        {config.contentType === 'form' && (
          <KeyValueField
            label="Form Data"
            value={config.formData || []}
            onChange={(v) => updateConfig('formData', v)}
            keyPlaceholder="Field"
            valuePlaceholder="Value"
          />
        )}

        <KeyValueField
          label="Headers"
          value={config.headers || []}
          onChange={(v) => updateConfig('headers', v)}
          keyPlaceholder="Header"
          valuePlaceholder="Value"
        />
      </>
    )}

    {config.mode === 'action' && (
      <>
        <TextField
          label="Webhook Path"
          value={config.webhookPath || ''}
          onChange={(v) => updateConfig('webhookPath', v)}
          placeholder="/make/incoming"
        />

        <SelectField
          label="Response Mode"
          value={config.responseMode || 'immediate'}
          onChange={(v) => updateConfig('responseMode', v)}
          options={[
            { value: 'immediate', label: 'Respond Immediately' },
            { value: 'afterProcess', label: 'Respond After Processing' },
          ]}
        />

        <CollectionField
          label="Response Options"
          value={config.responseOptions || {}}
          onChange={(v) => updateConfig('responseOptions', v)}
          options={[
            { name: 'statusCode', displayName: 'Status Code', type: 'number' },
            { name: 'responseBody', displayName: 'Response Body', type: 'string' },
          ]}
        />
      </>
    )}
  </div>
);

// ============================================
// N8N CONFIG
// ============================================

export const N8nConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <InfoBox type="info" title="n8n Integration">
      Connect to n8n workflows via webhooks for distributed automation.
    </InfoBox>

    <SelectField
      label="Mode"
      value={config.mode || 'trigger'}
      onChange={(v) => updateConfig('mode', v)}
      options={[
        { value: 'trigger', label: 'Trigger n8n Workflow' },
        { value: 'action', label: 'Receive from n8n' },
      ]}
      required
    />

    {config.mode === 'trigger' && (
      <>
        <ExpressionField
          label="n8n Webhook URL"
          value={config.webhookUrl || ''}
          onChange={(v) => updateConfig('webhookUrl', v)}
          placeholder="https://your-n8n.com/webhook/..."
          description="Production or test webhook URL from n8n"
          required
        />

        <SelectField
          label="HTTP Method"
          value={config.method || 'POST'}
          onChange={(v) => updateConfig('method', v)}
          options={[
            { value: 'POST', label: 'POST' },
            { value: 'GET', label: 'GET' },
            { value: 'PUT', label: 'PUT' },
          ]}
        />

        <SelectField
          label="Authentication"
          value={config.authType || 'none'}
          onChange={(v) => updateConfig('authType', v)}
          options={[
            { value: 'none', label: 'None' },
            { value: 'basicAuth', label: 'Basic Auth' },
            { value: 'headerAuth', label: 'Header Auth' },
          ]}
        />

        {config.authType === 'basicAuth' && (
          <>
            <TextField
              label="Username"
              value={config.username || ''}
              onChange={(v) => updateConfig('username', v)}
            />
            <TextField
              label="Password"
              value={config.password || ''}
              onChange={(v) => updateConfig('password', v)}
            />
          </>
        )}

        {config.authType === 'headerAuth' && (
          <KeyValueField
            label="Auth Headers"
            value={config.authHeaders || []}
            onChange={(v) => updateConfig('authHeaders', v)}
            keyPlaceholder="Header Name"
            valuePlaceholder="Value"
          />
        )}

        <TextareaField
          label="JSON Body"
          value={config.body || ''}
          onChange={(v) => updateConfig('body', v)}
          placeholder='{"data": "value"}'
          rows={6}
        />

        <KeyValueField
          label="Query Parameters"
          value={config.queryParams || []}
          onChange={(v) => updateConfig('queryParams', v)}
          keyPlaceholder="Parameter"
          valuePlaceholder="Value"
        />
      </>
    )}

    {config.mode === 'action' && (
      <>
        <TextField
          label="Webhook Path"
          value={config.webhookPath || ''}
          onChange={(v) => updateConfig('webhookPath', v)}
          placeholder="/n8n/incoming"
        />

        <SwitchField
          label="Raw Body"
          value={config.rawBody || false}
          onChange={(v) => updateConfig('rawBody', v)}
          description="Receive raw request body without parsing"
        />

        <CollectionField
          label="Response"
          value={config.response || {}}
          onChange={(v) => updateConfig('response', v)}
          options={[
            { name: 'respondWith', displayName: 'Respond With', type: 'options', options: [
              { value: 'firstEntry', label: 'First Entry JSON' },
              { value: 'allEntries', label: 'All Entries JSON' },
              { value: 'noData', label: 'No Data' },
            ]},
            { name: 'statusCode', displayName: 'Status Code', type: 'number' },
          ]}
        />
      </>
    )}
  </div>
);

// ============================================
// POWER AUTOMATE CONFIG
// ============================================

export const PowerAutomateConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <InfoBox type="info" title="Power Automate Integration">
      Connect to Microsoft Power Automate via HTTP triggers.
    </InfoBox>

    <SelectField
      label="Mode"
      value={config.mode || 'trigger'}
      onChange={(v) => updateConfig('mode', v)}
      options={[
        { value: 'trigger', label: 'Trigger Power Automate Flow' },
        { value: 'action', label: 'Receive from Power Automate' },
      ]}
      required
    />

    {config.mode === 'trigger' && (
      <>
        <ExpressionField
          label="Flow HTTP Trigger URL"
          value={config.flowUrl || ''}
          onChange={(v) => updateConfig('flowUrl', v)}
          placeholder="https://prod-xx.westus.logic.azure.com/workflows/..."
          description="HTTP trigger URL from your Power Automate flow"
          required
        />

        <SelectField
          label="HTTP Method"
          value={config.method || 'POST'}
          onChange={(v) => updateConfig('method', v)}
          options={[
            { value: 'POST', label: 'POST' },
            { value: 'GET', label: 'GET' },
            { value: 'PUT', label: 'PUT' },
            { value: 'PATCH', label: 'PATCH' },
          ]}
        />

        <TextareaField
          label="Request Body (JSON)"
          value={config.body || ''}
          onChange={(v) => updateConfig('body', v)}
          placeholder='{"key": "value"}'
          rows={6}
        />

        <KeyValueField
          label="Headers"
          value={config.headers || []}
          onChange={(v) => updateConfig('headers', v)}
          keyPlaceholder="Header"
          valuePlaceholder="Value"
        />

        <CollectionField
          label="Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'timeout', displayName: 'Timeout (ms)', type: 'number' },
            { name: 'retries', displayName: 'Retry Count', type: 'number' },
          ]}
        />
      </>
    )}

    {config.mode === 'action' && (
      <>
        <TextField
          label="Webhook Path"
          value={config.webhookPath || ''}
          onChange={(v) => updateConfig('webhookPath', v)}
          placeholder="/power-automate/incoming"
        />

        <SelectField
          label="Response Mode"
          value={config.responseMode || 'immediate'}
          onChange={(v) => updateConfig('responseMode', v)}
          options={[
            { value: 'immediate', label: 'Respond Immediately' },
            { value: 'afterProcess', label: 'Respond After Processing' },
          ]}
        />

        <TextareaField
          label="Response Schema (JSON)"
          value={config.responseSchema || ''}
          onChange={(v) => updateConfig('responseSchema', v)}
          placeholder='{"type": "object", "properties": {}}'
          rows={4}
          description="Define response schema for Power Automate"
        />
      </>
    )}
  </div>
);

// ============================================
// EXPORTS
// ============================================

export const AutomationAppConfigs: Record<string, React.FC<AppConfigProps>> = {
  zapier: ZapierConfig,
  zapier_webhook: ZapierConfig,
  
  make: MakeConfig,
  integromat: MakeConfig,
  make_webhook: MakeConfig,
  
  n8n: N8nConfig,
  n8n_webhook: N8nConfig,
  
  power_automate: PowerAutomateConfig,
  powerautomate: PowerAutomateConfig,
  microsoft_flow: PowerAutomateConfig,
};

export default AutomationAppConfigs;
