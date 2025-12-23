/**
 * CRM App Configurations
 * 
 * n8n-style configurations for CRM and sales platforms:
 * - HubSpot (Advanced)
 * - Salesforce
 * - Pipedrive
 * - Zoho CRM
 * - Freshsales
 * - Monday.com
 * - Copper
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
  FixedCollectionField,
  ResourceLocatorField,
  ResourceMapperField,
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
// HUBSPOT ADVANCED CONFIG
// ============================================

export const HubSpotAdvancedConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="HubSpot Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="HubSpot OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'contact'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'contact', label: 'Contact' },
        { value: 'company', label: 'Company' },
        { value: 'deal', label: 'Deal' },
        { value: 'ticket', label: 'Ticket' },
        { value: 'engagement', label: 'Engagement (Activity)' },
        { value: 'form', label: 'Form Submission' },
        { value: 'contactList', label: 'Contact List' },
      ]}
      required
    />

    {resource === 'contact' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'update', label: 'Update' },
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
            { value: 'delete', label: 'Delete' },
            { value: 'search', label: 'Search' },
          ]}
        />

        {(operation === 'create' || config.operation === 'update') && (
          <>
            {operation === 'update' && (
              <ResourceLocatorField
                label="Contact"
                value={config.contactId || { mode: 'id', value: '' }}
                onChange={(v) => updateConfig('contactId', v)}
                modes={['id', 'list']}
                resourceType="Contact"
                required
              />
            )}

            <ExpressionField
              label="Email"
              value={config.email || ''}
              onChange={(v) => updateConfig('email', v)}
              placeholder="contact@company.com"
              required={operation === 'create'}
            />

            <CollectionField
              label="Properties"
              value={config.properties || {}}
              onChange={(v) => updateConfig('properties', v)}
              options={[
                { name: 'firstname', displayName: 'First Name', type: 'string' },
                { name: 'lastname', displayName: 'Last Name', type: 'string' },
                { name: 'phone', displayName: 'Phone', type: 'string' },
                { name: 'company', displayName: 'Company', type: 'string' },
                { name: 'jobtitle', displayName: 'Job Title', type: 'string' },
                { name: 'website', displayName: 'Website', type: 'string' },
                { name: 'address', displayName: 'Street Address', type: 'string' },
                { name: 'city', displayName: 'City', type: 'string' },
                { name: 'state', displayName: 'State/Region', type: 'string' },
                { name: 'zip', displayName: 'Postal Code', type: 'string' },
                { name: 'country', displayName: 'Country', type: 'string' },
                { name: 'lifecyclestage', displayName: 'Lifecycle Stage', type: 'options', options: [
                  { value: 'subscriber', label: 'Subscriber' },
                  { value: 'lead', label: 'Lead' },
                  { value: 'marketingqualifiedlead', label: 'Marketing Qualified Lead' },
                  { value: 'salesqualifiedlead', label: 'Sales Qualified Lead' },
                  { value: 'opportunity', label: 'Opportunity' },
                  { value: 'customer', label: 'Customer' },
                  { value: 'evangelist', label: 'Evangelist' },
                  { value: 'other', label: 'Other' },
                ]},
                { name: 'hs_lead_status', displayName: 'Lead Status', type: 'options', options: [
                  { value: 'NEW', label: 'New' },
                  { value: 'OPEN', label: 'Open' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'OPEN_DEAL', label: 'Open Deal' },
                  { value: 'UNQUALIFIED', label: 'Unqualified' },
                  { value: 'ATTEMPTED_TO_CONTACT', label: 'Attempted to Contact' },
                  { value: 'CONNECTED', label: 'Connected' },
                  { value: 'BAD_TIMING', label: 'Bad Timing' },
                ]},
              ]}
            />

            <KeyValueField
              label="Custom Properties"
              value={config.customProperties || []}
              onChange={(v) => updateConfig('customProperties', v)}
              keyPlaceholder="Property name"
              valuePlaceholder="Value"
            />
          </>
        )}

        {operation === 'search' && (
          <>
            <FilterField
              label="Search Filters"
              value={config.filters || { conditions: [] }}
              onChange={(v) => updateConfig('filters', v)}
              fields={[
                { value: 'email', label: 'Email', type: 'string' },
                { value: 'firstname', label: 'First Name', type: 'string' },
                { value: 'lastname', label: 'Last Name', type: 'string' },
                { value: 'phone', label: 'Phone', type: 'string' },
                { value: 'company', label: 'Company', type: 'string' },
                { value: 'lifecyclestage', label: 'Lifecycle Stage', type: 'string' },
              ]}
            />
            <TextField
              label="Limit"
              value={config.limit || ''}
              onChange={(v) => updateConfig('limit', v)}
              placeholder="100"
            />
          </>
        )}

        {operation === 'getAll' && (
          <CollectionField
            label="Options"
            value={config.options || {}}
            onChange={(v) => updateConfig('options', v)}
            options={[
              { name: 'limit', displayName: 'Limit', type: 'number', default: 100 },
              { name: 'propertiesWithHistory', displayName: 'Include History', type: 'boolean' },
            ]}
          />
        )}
      </>
    )}

    {resource === 'company' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'update', label: 'Update' },
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
            { value: 'delete', label: 'Delete' },
            { value: 'search', label: 'Search' },
          ]}
        />

        {(operation === 'create' || config.operation === 'update') && (
          <>
            {operation === 'update' && (
              <TextField
                label="Company ID"
                value={config.companyId || ''}
                onChange={(v) => updateConfig('companyId', v)}
                required
              />
            )}

            <ExpressionField
              label="Company Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required={operation === 'create'}
            />

            <CollectionField
              label="Properties"
              value={config.properties || {}}
              onChange={(v) => updateConfig('properties', v)}
              options={[
                { name: 'domain', displayName: 'Website Domain', type: 'string' },
                { name: 'phone', displayName: 'Phone', type: 'string' },
                { name: 'industry', displayName: 'Industry', type: 'string' },
                { name: 'numberofemployees', displayName: 'Number of Employees', type: 'number' },
                { name: 'annualrevenue', displayName: 'Annual Revenue', type: 'number' },
                { name: 'city', displayName: 'City', type: 'string' },
                { name: 'state', displayName: 'State/Region', type: 'string' },
                { name: 'country', displayName: 'Country', type: 'string' },
                { name: 'description', displayName: 'Description', type: 'string' },
                { name: 'type', displayName: 'Type', type: 'options', options: [
                  { value: 'PROSPECT', label: 'Prospect' },
                  { value: 'PARTNER', label: 'Partner' },
                  { value: 'RESELLER', label: 'Reseller' },
                  { value: 'VENDOR', label: 'Vendor' },
                  { value: 'OTHER', label: 'Other' },
                ]},
              ]}
            />
          </>
        )}
      </>
    )}

    {resource === 'deal' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'update', label: 'Update' },
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
            { value: 'delete', label: 'Delete' },
            { value: 'search', label: 'Search' },
          ]}
        />

        {(operation === 'create' || config.operation === 'update') && (
          <>
            {operation === 'update' && (
              <TextField
                label="Deal ID"
                value={config.dealId || ''}
                onChange={(v) => updateConfig('dealId', v)}
                required
              />
            )}

            <ExpressionField
              label="Deal Name"
              value={config.dealname || ''}
              onChange={(v) => updateConfig('dealname', v)}
              required={operation === 'create'}
            />

            <CollectionField
              label="Properties"
              value={config.properties || {}}
              onChange={(v) => updateConfig('properties', v)}
              options={[
                { name: 'pipeline', displayName: 'Pipeline', type: 'string' },
                { name: 'dealstage', displayName: 'Deal Stage', type: 'string' },
                { name: 'amount', displayName: 'Amount', type: 'number' },
                { name: 'closedate', displayName: 'Close Date', type: 'string' },
                { name: 'hubspot_owner_id', displayName: 'Owner ID', type: 'string' },
                { name: 'dealtype', displayName: 'Deal Type', type: 'options', options: [
                  { value: 'newbusiness', label: 'New Business' },
                  { value: 'existingbusiness', label: 'Existing Business' },
                ]},
                { name: 'description', displayName: 'Description', type: 'string' },
              ]}
            />

            <FixedCollectionField
              label="Associations"
              value={config.associations || []}
              onChange={(v) => updateConfig('associations', v)}
              fields={[
                { name: 'type', displayName: 'Association Type', type: 'options', options: [
                  { value: 'contact', label: 'Contact' },
                  { value: 'company', label: 'Company' },
                ]},
                { name: 'id', displayName: 'Record ID', type: 'string' },
              ]}
            />
          </>
        )}
      </>
    )}

    {resource === 'ticket' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'update', label: 'Update' },
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
            { value: 'delete', label: 'Delete' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Subject"
              value={config.subject || ''}
              onChange={(v) => updateConfig('subject', v)}
              required
            />

            <TextareaField
              label="Content"
              value={config.content || ''}
              onChange={(v) => updateConfig('content', v)}
            />

            <CollectionField
              label="Properties"
              value={config.properties || {}}
              onChange={(v) => updateConfig('properties', v)}
              options={[
                { name: 'hs_pipeline', displayName: 'Pipeline', type: 'string' },
                { name: 'hs_pipeline_stage', displayName: 'Pipeline Stage', type: 'string' },
                { name: 'hs_ticket_priority', displayName: 'Priority', type: 'options', options: [
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                ]},
                { name: 'hubspot_owner_id', displayName: 'Owner ID', type: 'string' },
                { name: 'hs_ticket_category', displayName: 'Category', type: 'string' },
              ]}
            />
          </>
        )}
      </>
    )}

    {resource === 'engagement' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
          ]}
        />

        {operation === 'create' && (
          <>
            <SelectField
              label="Engagement Type"
              value={config.engagementType || 'NOTE'}
              onChange={(v) => updateConfig('engagementType', v)}
              options={[
                { value: 'NOTE', label: 'Note' },
                { value: 'TASK', label: 'Task' },
                { value: 'EMAIL', label: 'Email' },
                { value: 'CALL', label: 'Call' },
                { value: 'MEETING', label: 'Meeting' },
              ]}
              required
            />

            <TextareaField
              label="Body"
              value={config.body || ''}
              onChange={(v) => updateConfig('body', v)}
              required
            />

            <FixedCollectionField
              label="Associations"
              value={config.associations || []}
              onChange={(v) => updateConfig('associations', v)}
              fields={[
                { name: 'type', displayName: 'Type', type: 'options', options: [
                  { value: 'contactIds', label: 'Contact IDs' },
                  { value: 'companyIds', label: 'Company IDs' },
                  { value: 'dealIds', label: 'Deal IDs' },
                  { value: 'ticketIds', label: 'Ticket IDs' },
                ]},
                { name: 'ids', displayName: 'IDs (comma-separated)', type: 'string' },
              ]}
            />
          </>
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// SALESFORCE CONFIG
// ============================================

export const SalesforceConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Salesforce Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Salesforce OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'lead'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'lead', label: 'Lead' },
        { value: 'contact', label: 'Contact' },
        { value: 'account', label: 'Account' },
        { value: 'opportunity', label: 'Opportunity' },
        { value: 'case', label: 'Case' },
        { value: 'task', label: 'Task' },
        { value: 'custom', label: 'Custom Object' },
      ]}
      required
    />

    {resource === 'custom' && (
      <TextField
        label="Object API Name"
        value={config.customObject || ''}
        onChange={(v) => updateConfig('customObject', v)}
        placeholder="Custom_Object__c"
        required
      />
    )}

    <SelectField
      label="Operation"
      value={config.operation || 'create'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'create', label: 'Create' },
        { value: 'update', label: 'Update' },
        { value: 'upsert', label: 'Upsert' },
        { value: 'get', label: 'Get' },
        { value: 'getAll', label: 'Get All' },
        { value: 'delete', label: 'Delete' },
        { value: 'query', label: 'Query (SOQL)' },
      ]}
    />

    {operation === 'query' && (
      <TextareaField
        label="SOQL Query"
        value={config.query || ''}
        onChange={(v) => updateConfig('query', v)}
        placeholder="SELECT Id, Name FROM Account WHERE CreatedDate = THIS_MONTH"
        rows={4}
        required
      />
    )}

    {(operation === 'update' || config.operation === 'get' || config.operation === 'delete') && (
      <TextField
        label="Record ID"
        value={config.recordId || ''}
        onChange={(v) => updateConfig('recordId', v)}
        placeholder="001..."
        required
      />
    )}

    {operation === 'upsert' && (
      <>
        <TextField
          label="External ID Field"
          value={config.externalIdField || ''}
          onChange={(v) => updateConfig('externalIdField', v)}
          placeholder="External_Id__c"
          required
        />
        <TextField
          label="External ID Value"
          value={config.externalIdValue || ''}
          onChange={(v) => updateConfig('externalIdValue', v)}
          required
        />
      </>
    )}

    {(operation === 'create' || config.operation === 'update' || config.operation === 'upsert') && (
      <>
        {resource === 'lead' && (
          <CollectionField
            label="Lead Fields"
            value={config.fields || {}}
            onChange={(v) => updateConfig('fields', v)}
            options={[
              { name: 'FirstName', displayName: 'First Name', type: 'string' },
              { name: 'LastName', displayName: 'Last Name', type: 'string' },
              { name: 'Email', displayName: 'Email', type: 'string' },
              { name: 'Phone', displayName: 'Phone', type: 'string' },
              { name: 'Company', displayName: 'Company', type: 'string' },
              { name: 'Title', displayName: 'Title', type: 'string' },
              { name: 'Status', displayName: 'Status', type: 'string' },
              { name: 'LeadSource', displayName: 'Lead Source', type: 'string' },
              { name: 'Industry', displayName: 'Industry', type: 'string' },
              { name: 'Rating', displayName: 'Rating', type: 'options', options: [
                { value: 'Hot', label: 'Hot' },
                { value: 'Warm', label: 'Warm' },
                { value: 'Cold', label: 'Cold' },
              ]},
              { name: 'Description', displayName: 'Description', type: 'string' },
            ]}
          />
        )}

        {resource === 'contact' && (
          <CollectionField
            label="Contact Fields"
            value={config.fields || {}}
            onChange={(v) => updateConfig('fields', v)}
            options={[
              { name: 'FirstName', displayName: 'First Name', type: 'string' },
              { name: 'LastName', displayName: 'Last Name', type: 'string' },
              { name: 'Email', displayName: 'Email', type: 'string' },
              { name: 'Phone', displayName: 'Phone', type: 'string' },
              { name: 'AccountId', displayName: 'Account ID', type: 'string' },
              { name: 'Title', displayName: 'Title', type: 'string' },
              { name: 'Department', displayName: 'Department', type: 'string' },
              { name: 'MailingCity', displayName: 'Mailing City', type: 'string' },
              { name: 'MailingState', displayName: 'Mailing State', type: 'string' },
              { name: 'MailingCountry', displayName: 'Mailing Country', type: 'string' },
            ]}
          />
        )}

        {resource === 'account' && (
          <CollectionField
            label="Account Fields"
            value={config.fields || {}}
            onChange={(v) => updateConfig('fields', v)}
            options={[
              { name: 'Name', displayName: 'Account Name', type: 'string' },
              { name: 'Phone', displayName: 'Phone', type: 'string' },
              { name: 'Website', displayName: 'Website', type: 'string' },
              { name: 'Industry', displayName: 'Industry', type: 'string' },
              { name: 'Type', displayName: 'Type', type: 'string' },
              { name: 'NumberOfEmployees', displayName: 'Employees', type: 'number' },
              { name: 'AnnualRevenue', displayName: 'Annual Revenue', type: 'number' },
              { name: 'BillingCity', displayName: 'Billing City', type: 'string' },
              { name: 'BillingState', displayName: 'Billing State', type: 'string' },
              { name: 'BillingCountry', displayName: 'Billing Country', type: 'string' },
            ]}
          />
        )}

        {resource === 'opportunity' && (
          <CollectionField
            label="Opportunity Fields"
            value={config.fields || {}}
            onChange={(v) => updateConfig('fields', v)}
            options={[
              { name: 'Name', displayName: 'Name', type: 'string' },
              { name: 'AccountId', displayName: 'Account ID', type: 'string' },
              { name: 'Amount', displayName: 'Amount', type: 'number' },
              { name: 'StageName', displayName: 'Stage', type: 'string' },
              { name: 'CloseDate', displayName: 'Close Date', type: 'string' },
              { name: 'Probability', displayName: 'Probability (%)', type: 'number' },
              { name: 'LeadSource', displayName: 'Lead Source', type: 'string' },
              { name: 'Type', displayName: 'Type', type: 'string' },
              { name: 'NextStep', displayName: 'Next Step', type: 'string' },
              { name: 'Description', displayName: 'Description', type: 'string' },
            ]}
          />
        )}

        {resource === 'custom' && (
          <KeyValueField
            label="Custom Fields"
            value={config.customFields || []}
            onChange={(v) => updateConfig('customFields', v)}
            keyPlaceholder="Field API Name"
            valuePlaceholder="Value"
          />
        )}
      </>
    )}

    {operation === 'getAll' && (
      <CollectionField
        label="Options"
        value={config.options || {}}
        onChange={(v) => updateConfig('options', v)}
        options={[
          { name: 'limit', displayName: 'Limit', type: 'number', default: 50 },
          { name: 'fields', displayName: 'Fields (comma-separated)', type: 'string' },
        ]}
      />
    )}
  </div>
  );
};

// ============================================
// PIPEDRIVE CONFIG
// ============================================

export const PipedriveConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Pipedrive Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Pipedrive API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'deal'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'deal', label: 'Deal' },
        { value: 'person', label: 'Person' },
        { value: 'organization', label: 'Organization' },
        { value: 'activity', label: 'Activity' },
        { value: 'lead', label: 'Lead' },
        { value: 'note', label: 'Note' },
        { value: 'product', label: 'Product' },
      ]}
      required
    />

    <SelectField
      label="Operation"
      value={config.operation || 'create'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'create', label: 'Create' },
        { value: 'update', label: 'Update' },
        { value: 'get', label: 'Get' },
        { value: 'getAll', label: 'Get All' },
        { value: 'delete', label: 'Delete' },
        { value: 'search', label: 'Search' },
      ]}
    />

    {(operation === 'update' || config.operation === 'get' || config.operation === 'delete') && (
      <TextField
        label={`${config.resource?.charAt(0).toUpperCase()}${config.resource?.slice(1)} ID`}
        value={config.resourceId || ''}
        onChange={(v) => updateConfig('resourceId', v)}
        required
      />
    )}

    {(operation === 'create' || config.operation === 'update') && (
      <>
        {resource === 'deal' && (
          <>
            <ExpressionField
              label="Title"
              value={config.title || ''}
              onChange={(v) => updateConfig('title', v)}
              required={operation === 'create'}
            />

            <CollectionField
              label="Deal Fields"
              value={config.fields || {}}
              onChange={(v) => updateConfig('fields', v)}
              options={[
                { name: 'value', displayName: 'Value', type: 'number' },
                { name: 'currency', displayName: 'Currency', type: 'string', default: 'USD' },
                { name: 'stage_id', displayName: 'Stage ID', type: 'number' },
                { name: 'pipeline_id', displayName: 'Pipeline ID', type: 'number' },
                { name: 'status', displayName: 'Status', type: 'options', options: [
                  { value: 'open', label: 'Open' },
                  { value: 'won', label: 'Won' },
                  { value: 'lost', label: 'Lost' },
                  { value: 'deleted', label: 'Deleted' },
                ]},
                { name: 'expected_close_date', displayName: 'Expected Close Date', type: 'string' },
                { name: 'probability', displayName: 'Probability', type: 'number' },
                { name: 'person_id', displayName: 'Person ID', type: 'number' },
                { name: 'org_id', displayName: 'Organization ID', type: 'number' },
                { name: 'user_id', displayName: 'Owner User ID', type: 'number' },
              ]}
            />
          </>
        )}

        {resource === 'person' && (
          <>
            <ExpressionField
              label="Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required={operation === 'create'}
            />

            <CollectionField
              label="Person Fields"
              value={config.fields || {}}
              onChange={(v) => updateConfig('fields', v)}
              options={[
                { name: 'email', displayName: 'Email', type: 'string' },
                { name: 'phone', displayName: 'Phone', type: 'string' },
                { name: 'org_id', displayName: 'Organization ID', type: 'number' },
                { name: 'label', displayName: 'Label ID', type: 'number' },
                { name: 'visible_to', displayName: 'Visible To', type: 'options', options: [
                  { value: '1', label: 'Owner Only' },
                  { value: '3', label: 'Entire Company' },
                ]},
              ]}
            />
          </>
        )}

        {resource === 'organization' && (
          <>
            <ExpressionField
              label="Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required={operation === 'create'}
            />

            <CollectionField
              label="Organization Fields"
              value={config.fields || {}}
              onChange={(v) => updateConfig('fields', v)}
              options={[
                { name: 'address', displayName: 'Address', type: 'string' },
                { name: 'label', displayName: 'Label ID', type: 'number' },
                { name: 'owner_id', displayName: 'Owner User ID', type: 'number' },
                { name: 'visible_to', displayName: 'Visible To', type: 'options', options: [
                  { value: '1', label: 'Owner Only' },
                  { value: '3', label: 'Entire Company' },
                ]},
              ]}
            />
          </>
        )}

        {resource === 'activity' && (
          <>
            <ExpressionField
              label="Subject"
              value={config.subject || ''}
              onChange={(v) => updateConfig('subject', v)}
              required
            />

            <SelectField
              label="Type"
              value={config.type || 'call'}
              onChange={(v) => updateConfig('type', v)}
              options={[
                { value: 'call', label: 'Call' },
                { value: 'meeting', label: 'Meeting' },
                { value: 'task', label: 'Task' },
                { value: 'deadline', label: 'Deadline' },
                { value: 'email', label: 'Email' },
                { value: 'lunch', label: 'Lunch' },
              ]}
            />

            <CollectionField
              label="Activity Fields"
              value={config.fields || {}}
              onChange={(v) => updateConfig('fields', v)}
              options={[
                { name: 'due_date', displayName: 'Due Date', type: 'string' },
                { name: 'due_time', displayName: 'Due Time', type: 'string' },
                { name: 'duration', displayName: 'Duration (minutes)', type: 'number' },
                { name: 'deal_id', displayName: 'Deal ID', type: 'number' },
                { name: 'person_id', displayName: 'Person ID', type: 'number' },
                { name: 'org_id', displayName: 'Organization ID', type: 'number' },
                { name: 'note', displayName: 'Note', type: 'string' },
                { name: 'done', displayName: 'Completed', type: 'boolean' },
              ]}
            />
          </>
        )}
      </>
    )}

    {operation === 'search' && (
      <>
        <TextField
          label="Search Term"
          value={config.term || ''}
          onChange={(v) => updateConfig('term', v)}
          required
        />
        <CollectionField
          label="Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'fields', displayName: 'Search Fields', type: 'options', options: [
              { value: 'custom_fields', label: 'Custom Fields' },
              { value: 'email', label: 'Email' },
              { value: 'notes', label: 'Notes' },
              { value: 'phone', label: 'Phone' },
              { value: 'title', label: 'Title' },
            ]},
            { name: 'exact_match', displayName: 'Exact Match', type: 'boolean' },
            { name: 'limit', displayName: 'Limit', type: 'number' },
          ]}
        />
      </>
    )}
  </div>
  );
};

// ============================================
// ZOHO CRM CONFIG
// ============================================

export const ZohoCRMConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const module = config.module || '';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Zoho CRM Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Zoho OAuth2"
      required
    />

    <SelectField
      label="Module"
      value={config.module || 'Leads'}
      onChange={(v) => updateConfig('module', v)}
      options={[
        { value: 'Leads', label: 'Leads' },
        { value: 'Contacts', label: 'Contacts' },
        { value: 'Accounts', label: 'Accounts' },
        { value: 'Deals', label: 'Deals' },
        { value: 'Tasks', label: 'Tasks' },
        { value: 'Campaigns', label: 'Campaigns' },
        { value: 'Products', label: 'Products' },
        { value: 'Quotes', label: 'Quotes' },
        { value: 'Invoices', label: 'Invoices' },
      ]}
      required
    />

    <SelectField
      label="Operation"
      value={config.operation || 'create'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'create', label: 'Create' },
        { value: 'update', label: 'Update' },
        { value: 'upsert', label: 'Upsert' },
        { value: 'get', label: 'Get' },
        { value: 'getAll', label: 'Get All' },
        { value: 'delete', label: 'Delete' },
        { value: 'search', label: 'Search' },
      ]}
    />

    {(operation === 'update' || config.operation === 'get' || config.operation === 'delete') && (
      <TextField
        label="Record ID"
        value={config.recordId || ''}
        onChange={(v) => updateConfig('recordId', v)}
        required
      />
    )}

    {(operation === 'create' || config.operation === 'update' || config.operation === 'upsert') && (
      <>
        {config.module === 'Leads' && (
          <CollectionField
            label="Lead Fields"
            value={config.fields || {}}
            onChange={(v) => updateConfig('fields', v)}
            options={[
              { name: 'Last_Name', displayName: 'Last Name', type: 'string' },
              { name: 'First_Name', displayName: 'First Name', type: 'string' },
              { name: 'Email', displayName: 'Email', type: 'string' },
              { name: 'Phone', displayName: 'Phone', type: 'string' },
              { name: 'Company', displayName: 'Company', type: 'string' },
              { name: 'Title', displayName: 'Title', type: 'string' },
              { name: 'Lead_Status', displayName: 'Lead Status', type: 'string' },
              { name: 'Lead_Source', displayName: 'Lead Source', type: 'string' },
              { name: 'Industry', displayName: 'Industry', type: 'string' },
              { name: 'Annual_Revenue', displayName: 'Annual Revenue', type: 'number' },
              { name: 'Description', displayName: 'Description', type: 'string' },
            ]}
          />
        )}

        {config.module === 'Deals' && (
          <CollectionField
            label="Deal Fields"
            value={config.fields || {}}
            onChange={(v) => updateConfig('fields', v)}
            options={[
              { name: 'Deal_Name', displayName: 'Deal Name', type: 'string' },
              { name: 'Amount', displayName: 'Amount', type: 'number' },
              { name: 'Stage', displayName: 'Stage', type: 'string' },
              { name: 'Closing_Date', displayName: 'Closing Date', type: 'string' },
              { name: 'Pipeline', displayName: 'Pipeline', type: 'string' },
              { name: 'Probability', displayName: 'Probability', type: 'number' },
              { name: 'Account_Name', displayName: 'Account ID', type: 'string' },
              { name: 'Contact_Name', displayName: 'Contact ID', type: 'string' },
              { name: 'Type', displayName: 'Type', type: 'string' },
              { name: 'Lead_Source', displayName: 'Lead Source', type: 'string' },
            ]}
          />
        )}

        <KeyValueField
          label="Additional/Custom Fields"
          value={config.customFields || []}
          onChange={(v) => updateConfig('customFields', v)}
          keyPlaceholder="Field API Name"
          valuePlaceholder="Value"
        />
      </>
    )}

    {operation === 'search' && (
      <>
        <TextField
          label="Search Criteria"
          value={config.criteria || ''}
          onChange={(v) => updateConfig('criteria', v)}
          placeholder="(Email:equals:test@example.com)"
          description="Zoho CRM search criteria syntax"
          required
        />
        <CollectionField
          label="Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'per_page', displayName: 'Per Page', type: 'number', default: 200 },
            { name: 'page', displayName: 'Page', type: 'number', default: 1 },
          ]}
        />
      </>
    )}
  </div>
  );
};

// ============================================
// MONDAY.COM CONFIG
// ============================================

export const MondayConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Monday.com Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Monday.com API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'item'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'item', label: 'Item' },
        { value: 'board', label: 'Board' },
        { value: 'group', label: 'Group' },
        { value: 'boardColumn', label: 'Board Column' },
      ]}
      required
    />

    {resource === 'item' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create' },
            { value: 'update', label: 'Update' },
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
            { value: 'delete', label: 'Delete' },
            { value: 'move', label: 'Move to Group' },
            { value: 'changeColumnValue', label: 'Change Column Value' },
          ]}
        />

        <ResourceLocatorField
          label="Board"
          value={config.boardId || { mode: 'list', value: '' }}
          onChange={(v) => updateConfig('boardId', v)}
          modes={['list', 'id']}
          resourceType="Board"
          required
        />

        {operation === 'create' && (
          <>
            <ResourceLocatorField
              label="Group"
              value={config.groupId || { mode: 'list', value: '' }}
              onChange={(v) => updateConfig('groupId', v)}
              modes={['list', 'id']}
              resourceType="Group"
              required
            />

            <ExpressionField
              label="Item Name"
              value={config.itemName || ''}
              onChange={(v) => updateConfig('itemName', v)}
              required
            />

            <KeyValueField
              label="Column Values"
              value={config.columnValues || []}
              onChange={(v) => updateConfig('columnValues', v)}
              keyPlaceholder="Column ID"
              valuePlaceholder="Value (JSON for complex types)"
            />
          </>
        )}

        {operation === 'update' && (
          <>
            <TextField
              label="Item ID"
              value={config.itemId || ''}
              onChange={(v) => updateConfig('itemId', v)}
              required
            />
            <KeyValueField
              label="Column Values"
              value={config.columnValues || []}
              onChange={(v) => updateConfig('columnValues', v)}
              keyPlaceholder="Column ID"
              valuePlaceholder="Value"
            />
          </>
        )}

        {operation === 'changeColumnValue' && (
          <>
            <TextField
              label="Item ID"
              value={config.itemId || ''}
              onChange={(v) => updateConfig('itemId', v)}
              required
            />
            <TextField
              label="Column ID"
              value={config.columnId || ''}
              onChange={(v) => updateConfig('columnId', v)}
              required
            />
            <TextareaField
              label="Value (JSON)"
              value={config.value || ''}
              onChange={(v) => updateConfig('value', v)}
              placeholder='{"text": "New value"}'
              rows={3}
              required
            />
          </>
        )}
      </>
    )}

    {resource === 'board' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get' },
            { value: 'getAll', label: 'Get All' },
            { value: 'create', label: 'Create' },
          ]}
        />

        {operation === 'create' && (
          <>
            <TextField
              label="Board Name"
              value={config.boardName || ''}
              onChange={(v) => updateConfig('boardName', v)}
              required
            />
            <SelectField
              label="Board Kind"
              value={config.boardKind || 'public'}
              onChange={(v) => updateConfig('boardKind', v)}
              options={[
                { value: 'public', label: 'Public' },
                { value: 'private', label: 'Private' },
                { value: 'share', label: 'Shareable' },
              ]}
            />
            <TextField
              label="Workspace ID"
              value={config.workspaceId || ''}
              onChange={(v) => updateConfig('workspaceId', v)}
              description="Optional: Specify workspace"
            />
          </>
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export const CRMAppConfigs: Record<string, React.FC<AppConfigProps>> = {
  // HubSpot
  hubspot_advanced: HubSpotAdvancedConfig,
  hubspot: HubSpotAdvancedConfig,
  hubspot_crm: HubSpotAdvancedConfig,
  
  // Salesforce
  salesforce: SalesforceConfig,
  salesforce_crm: SalesforceConfig,
  sfdc: SalesforceConfig,
  
  // Pipedrive
  pipedrive: PipedriveConfig,
  pipedrive_crm: PipedriveConfig,
  
  // Zoho CRM
  zoho_crm: ZohoCRMConfig,
  zohocrm: ZohoCRMConfig,
  zoho: ZohoCRMConfig,
  
  // Monday.com
  monday: MondayConfig,
  mondaycom: MondayConfig,
  monday_com: MondayConfig,
};

export default CRMAppConfigs;
