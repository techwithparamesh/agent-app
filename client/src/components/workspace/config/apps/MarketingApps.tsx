/**
 * Marketing App Configurations
 * 
 * n8n-style configurations for:
 * - Google Analytics
 * - Facebook Ads
 * - Google Ads
 * - Intercom (already in CommunicationApps, re-export)
 * - LinkedIn
 */

import React from "react";
import {
  TextField,
  TextareaField,
  SelectField,
  NumberField,
  CredentialField,
  ExpressionField,
  CollectionField,
  DateTimeField,
  KeyValueField,
} from "../FieldComponents";

interface AppConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// GOOGLE ANALYTICS CONFIG
// ============================================

export const GoogleAnalyticsConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const apiVersion = config.apiVersion || '';
  const resource = config.resource || 'message';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Google Analytics Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google OAuth2"
      required
    />

    <SelectField
      label="API Version"
      value={config.apiVersion || 'ga4'}
      onChange={(v) => updateConfig('apiVersion', v)}
      options={[
        { value: 'ga4', label: 'GA4 (Google Analytics 4)' },
        { value: 'ua', label: 'Universal Analytics (Legacy)' },
      ]}
    />

    <ExpressionField
      label="Property ID"
      value={config.propertyId || ''}
      onChange={(v) => updateConfig('propertyId', v)}
      placeholder={config.apiVersion === 'ga4' ? '123456789' : 'UA-123456-1'}
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'report'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'report', label: 'Report' },
        { value: 'realtime', label: 'Realtime Data' },
        { value: 'event', label: 'Event (Measurement Protocol)' },
      ]}
      required
    />

    {resource === 'report' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Report' },
          ]}
        />

        <DateTimeField
          label="Start Date"
          value={config.startDate || ''}
          onChange={(v) => updateConfig('startDate', v)}
          required
        />

        <DateTimeField
          label="End Date"
          value={config.endDate || ''}
          onChange={(v) => updateConfig('endDate', v)}
          required
        />

        <CollectionField
          label="Metrics"
          value={config.metrics || {}}
          onChange={(v) => updateConfig('metrics', v)}
          options={[
            { name: 'sessions', displayName: 'Sessions', type: 'boolean' },
            { name: 'users', displayName: 'Users', type: 'boolean' },
            { name: 'pageviews', displayName: 'Page Views', type: 'boolean' },
            { name: 'bounceRate', displayName: 'Bounce Rate', type: 'boolean' },
            { name: 'avgSessionDuration', displayName: 'Avg Session Duration', type: 'boolean' },
            { name: 'conversions', displayName: 'Conversions', type: 'boolean' },
          ]}
        />

        <CollectionField
          label="Dimensions"
          value={config.dimensions || {}}
          onChange={(v) => updateConfig('dimensions', v)}
          options={[
            { name: 'date', displayName: 'Date', type: 'boolean' },
            { name: 'country', displayName: 'Country', type: 'boolean' },
            { name: 'city', displayName: 'City', type: 'boolean' },
            { name: 'deviceCategory', displayName: 'Device Category', type: 'boolean' },
            { name: 'source', displayName: 'Source', type: 'boolean' },
            { name: 'medium', displayName: 'Medium', type: 'boolean' },
            { name: 'pagePath', displayName: 'Page Path', type: 'boolean' },
          ]}
        />

        <NumberField
          label="Row Limit"
          value={config.limit || 1000}
          onChange={(v) => updateConfig('limit', v)}
        />
      </>
    )}

    {resource === 'event' && (
      <>
        <ExpressionField
          label="Measurement ID"
          value={config.measurementId || ''}
          onChange={(v) => updateConfig('measurementId', v)}
          placeholder="G-XXXXXXXXXX"
          required
        />

        <ExpressionField
          label="API Secret"
          value={config.apiSecret || ''}
          onChange={(v) => updateConfig('apiSecret', v)}
          required
        />

        <ExpressionField
          label="Client ID"
          value={config.clientId || ''}
          onChange={(v) => updateConfig('clientId', v)}
          required
        />

        <ExpressionField
          label="Event Name"
          value={config.eventName || ''}
          onChange={(v) => updateConfig('eventName', v)}
          placeholder="purchase"
          required
        />

        <KeyValueField
          label="Event Parameters"
          value={config.eventParams || []}
          onChange={(v) => updateConfig('eventParams', v)}
          keyPlaceholder="Parameter"
          valuePlaceholder="Value"
        />
      </>
    )}
  </div>
  );
};

// ============================================
// FACEBOOK ADS CONFIG
// ============================================

export const FacebookAdsConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Facebook Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Facebook OAuth2"
      required
    />

    <ExpressionField
      label="Ad Account ID"
      value={config.adAccountId || ''}
      onChange={(v) => updateConfig('adAccountId', v)}
      placeholder="act_123456789"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'campaign'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'campaign', label: 'Campaign' },
        { value: 'adset', label: 'Ad Set' },
        { value: 'ad', label: 'Ad' },
        { value: 'insights', label: 'Insights' },
        { value: 'customAudience', label: 'Custom Audience' },
      ]}
      required
    />

    {resource === 'campaign' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Campaign' },
            { value: 'get', label: 'Get Campaign' },
            { value: 'getAll', label: 'Get All Campaigns' },
            { value: 'update', label: 'Update Campaign' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Campaign Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required
            />

            <SelectField
              label="Objective"
              value={config.objective || 'OUTCOME_AWARENESS'}
              onChange={(v) => updateConfig('objective', v)}
              options={[
                { value: 'OUTCOME_AWARENESS', label: 'Awareness' },
                { value: 'OUTCOME_TRAFFIC', label: 'Traffic' },
                { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement' },
                { value: 'OUTCOME_LEADS', label: 'Leads' },
                { value: 'OUTCOME_APP_PROMOTION', label: 'App Promotion' },
                { value: 'OUTCOME_SALES', label: 'Sales' },
              ]}
            />

            <SelectField
              label="Status"
              value={config.status || 'PAUSED'}
              onChange={(v) => updateConfig('status', v)}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'PAUSED', label: 'Paused' },
              ]}
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'dailyBudget', displayName: 'Daily Budget (cents)', type: 'number' },
                { name: 'lifetimeBudget', displayName: 'Lifetime Budget (cents)', type: 'number' },
                { name: 'bidStrategy', displayName: 'Bid Strategy', type: 'options', options: [
                  { value: 'LOWEST_COST_WITHOUT_CAP', label: 'Lowest Cost' },
                  { value: 'LOWEST_COST_WITH_BID_CAP', label: 'Bid Cap' },
                  { value: 'COST_CAP', label: 'Cost Cap' },
                ]},
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update') && (
          <ExpressionField
            label="Campaign ID"
            value={config.campaignId || ''}
            onChange={(v) => updateConfig('campaignId', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'insights' && (
      <>
        <SelectField
          label="Level"
          value={config.level || 'account'}
          onChange={(v) => updateConfig('level', v)}
          options={[
            { value: 'account', label: 'Account' },
            { value: 'campaign', label: 'Campaign' },
            { value: 'adset', label: 'Ad Set' },
            { value: 'ad', label: 'Ad' },
          ]}
        />

        {config.level !== 'account' && (
          <ExpressionField
            label={`${config.level.charAt(0).toUpperCase() + config.level.slice(1)} ID`}
            value={config.objectId || ''}
            onChange={(v) => updateConfig('objectId', v)}
            required
          />
        )}

        <SelectField
          label="Date Preset"
          value={config.datePreset || 'last_7d'}
          onChange={(v) => updateConfig('datePreset', v)}
          options={[
            { value: 'today', label: 'Today' },
            { value: 'yesterday', label: 'Yesterday' },
            { value: 'last_7d', label: 'Last 7 Days' },
            { value: 'last_30d', label: 'Last 30 Days' },
            { value: 'this_month', label: 'This Month' },
            { value: 'last_month', label: 'Last Month' },
          ]}
        />

        <CollectionField
          label="Fields"
          value={config.fields || {}}
          onChange={(v) => updateConfig('fields', v)}
          options={[
            { name: 'impressions', displayName: 'Impressions', type: 'boolean' },
            { name: 'clicks', displayName: 'Clicks', type: 'boolean' },
            { name: 'spend', displayName: 'Spend', type: 'boolean' },
            { name: 'cpm', displayName: 'CPM', type: 'boolean' },
            { name: 'cpc', displayName: 'CPC', type: 'boolean' },
            { name: 'ctr', displayName: 'CTR', type: 'boolean' },
            { name: 'reach', displayName: 'Reach', type: 'boolean' },
            { name: 'conversions', displayName: 'Conversions', type: 'boolean' },
          ]}
        />
      </>
    )}

    {resource === 'customAudience' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Audience' },
            { value: 'get', label: 'Get Audience' },
            { value: 'addUsers', label: 'Add Users' },
            { value: 'removeUsers', label: 'Remove Users' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Audience Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required
            />

            <TextField
              label="Description"
              value={config.description || ''}
              onChange={(v) => updateConfig('description', v)}
            />

            <SelectField
              label="Subtype"
              value={config.subtype || 'CUSTOM'}
              onChange={(v) => updateConfig('subtype', v)}
              options={[
                { value: 'CUSTOM', label: 'Custom' },
                { value: 'WEBSITE', label: 'Website' },
                { value: 'APP', label: 'App' },
                { value: 'OFFLINE_CONVERSION', label: 'Offline Conversion' },
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
// GOOGLE ADS CONFIG
// ============================================

export const GoogleAdsConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Google Ads Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google Ads OAuth2"
      required
    />

    <ExpressionField
      label="Customer ID"
      value={config.customerId || ''}
      onChange={(v) => updateConfig('customerId', v)}
      placeholder="123-456-7890"
      description="Without dashes"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'campaign'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'campaign', label: 'Campaign' },
        { value: 'adGroup', label: 'Ad Group' },
        { value: 'ad', label: 'Ad' },
        { value: 'keyword', label: 'Keyword' },
        { value: 'report', label: 'Report' },
      ]}
      required
    />

    {resource === 'campaign' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Campaign' },
            { value: 'getAll', label: 'Get All Campaigns' },
            { value: 'update', label: 'Update Campaign' },
          ]}
        />

        {(operation === 'get' || config.operation === 'update') && (
          <ExpressionField
            label="Campaign ID"
            value={config.campaignId || ''}
            onChange={(v) => updateConfig('campaignId', v)}
            required
          />
        )}

        {operation === 'update' && (
          <CollectionField
            label="Update Fields"
            value={config.updateFields || {}}
            onChange={(v) => updateConfig('updateFields', v)}
            options={[
              { name: 'status', displayName: 'Status', type: 'options', options: [
                { value: 'ENABLED', label: 'Enabled' },
                { value: 'PAUSED', label: 'Paused' },
              ]},
              { name: 'name', displayName: 'Name', type: 'string' },
            ]}
          />
        )}
      </>
    )}

    {resource === 'report' && (
      <>
        <SelectField
          label="Report Type"
          value={config.reportType || 'campaign'}
          onChange={(v) => updateConfig('reportType', v)}
          options={[
            { value: 'campaign', label: 'Campaign Performance' },
            { value: 'adGroup', label: 'Ad Group Performance' },
            { value: 'keyword', label: 'Keyword Performance' },
            { value: 'searchQuery', label: 'Search Query' },
          ]}
        />

        <DateTimeField
          label="Start Date"
          value={config.startDate || ''}
          onChange={(v) => updateConfig('startDate', v)}
          required
        />

        <DateTimeField
          label="End Date"
          value={config.endDate || ''}
          onChange={(v) => updateConfig('endDate', v)}
          required
        />

        <CollectionField
          label="Metrics"
          value={config.metrics || {}}
          onChange={(v) => updateConfig('metrics', v)}
          options={[
            { name: 'impressions', displayName: 'Impressions', type: 'boolean' },
            { name: 'clicks', displayName: 'Clicks', type: 'boolean' },
            { name: 'cost', displayName: 'Cost', type: 'boolean' },
            { name: 'conversions', displayName: 'Conversions', type: 'boolean' },
            { name: 'ctr', displayName: 'CTR', type: 'boolean' },
            { name: 'averageCpc', displayName: 'Avg CPC', type: 'boolean' },
          ]}
        />
      </>
    )}
  </div>
  );
};

// ============================================
// LINKEDIN CONFIG
// ============================================

export const LinkedInConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  const postAs = config.postAs || '';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="LinkedIn Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="LinkedIn OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'post'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'post', label: 'Post' },
        { value: 'company', label: 'Company Page' },
        { value: 'message', label: 'Message' },
        { value: 'profile', label: 'Profile' },
      ]}
      required
    />

    {resource === 'post' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Post' },
            { value: 'get', label: 'Get Post' },
            { value: 'delete', label: 'Delete Post' },
          ]}
        />

        {operation === 'create' && (
          <>
            <SelectField
              label="Post As"
              value={config.postAs || 'person'}
              onChange={(v) => updateConfig('postAs', v)}
              options={[
                { value: 'person', label: 'Personal Profile' },
                { value: 'organization', label: 'Company Page' },
              ]}
            />

            {config.postAs === 'organization' && (
              <ExpressionField
                label="Organization ID"
                value={config.organizationId || ''}
                onChange={(v) => updateConfig('organizationId', v)}
                required
              />
            )}

            <TextareaField
              label="Post Content"
              value={config.text || ''}
              onChange={(v) => updateConfig('text', v)}
              rows={4}
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'visibility', displayName: 'Visibility', type: 'options', options: [
                  { value: 'PUBLIC', label: 'Public' },
                  { value: 'CONNECTIONS', label: 'Connections Only' },
                ]},
                { name: 'mediaUrl', displayName: 'Media URL', type: 'string' },
                { name: 'mediaTitle', displayName: 'Media Title', type: 'string' },
                { name: 'mediaDescription', displayName: 'Media Description', type: 'string' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'delete') && (
          <ExpressionField
            label="Post URN"
            value={config.postUrn || ''}
            onChange={(v) => updateConfig('postUrn', v)}
            placeholder="urn:li:share:123456789"
            required
          />
        )}
      </>
    )}

    {resource === 'company' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Company' },
            { value: 'getFollowerCount', label: 'Get Follower Count' },
          ]}
        />

        <ExpressionField
          label="Organization ID"
          value={config.organizationId || ''}
          onChange={(v) => updateConfig('organizationId', v)}
          required
        />
      </>
    )}

    {resource === 'message' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'send'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'send', label: 'Send Message' },
          ]}
        />

        <ExpressionField
          label="Recipient URN"
          value={config.recipientUrn || ''}
          onChange={(v) => updateConfig('recipientUrn', v)}
          placeholder="urn:li:person:xxxxx"
          required
        />

        <TextareaField
          label="Message"
          value={config.message || ''}
          onChange={(v) => updateConfig('message', v)}
          rows={4}
          required
        />
      </>
    )}

    {resource === 'profile' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get My Profile' },
          ]}
        />
      </>
    )}
  </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export const MarketingAppConfigs: Record<string, React.FC<AppConfigProps>> = {
  google_analytics: GoogleAnalyticsConfig,
  ga: GoogleAnalyticsConfig,
  ga4: GoogleAnalyticsConfig,
  
  facebook_ads: FacebookAdsConfig,
  meta_ads: FacebookAdsConfig,
  fb_ads: FacebookAdsConfig,
  
  google_ads: GoogleAdsConfig,
  adwords: GoogleAdsConfig,
  
  linkedin: LinkedInConfig,
  linkedin_ads: LinkedInConfig,
};

export default MarketingAppConfigs;
