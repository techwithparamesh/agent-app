/**
 * Action Configuration Components
 * 
 * Production-ready configuration UIs for all action types.
 * Includes HTTP, AI, Messaging, Email, CRM, and more.
 */

import React from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  TextField,
  PasswordField,
  NumberField,
  TextareaField,
  SelectField,
  SwitchField,
  SliderField,
  CodeField,
  CredentialField,
  ExpressionField,
  InfoBox,
  SectionHeader,
  CopyableField,
  KeyValueField,
  TagsField,
} from "./FieldComponents";
import {
  Globe,
  Code,
  Bot,
  MessageCircle,
  Mail,
  Database,
  FileText,
  Send,
  Webhook,
  Sparkles,
  Cpu,
  Image,
  Settings,
  Phone,
  Video,
  Users,
  CreditCard,
  Calendar,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface ActionConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// HTTP REQUEST ACTION
// ============================================

export const HttpRequestConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Globe className="h-4 w-4 text-blue-500" />}
      title="HTTP Request Configuration"
    />

    <SelectField
      label="Method"
      value={config.method || 'GET'}
      onChange={(v) => updateConfig('method', v)}
      options={[
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'PATCH', label: 'PATCH' },
        { value: 'DELETE', label: 'DELETE' },
        { value: 'HEAD', label: 'HEAD' },
        { value: 'OPTIONS', label: 'OPTIONS' },
      ]}
    />

    <ExpressionField
      label="URL"
      value={config.url || ''}
      onChange={(v) => updateConfig('url', v)}
      placeholder="https://api.example.com/endpoint"
      description="Supports expressions like {{$node.previous.data.id}}"
      required
    />

    <Separator />

    <SectionHeader
      icon={<Settings className="h-4 w-4 text-gray-500" />}
      title="Authentication"
    />

    <SelectField
      label="Authentication"
      value={config.authentication || 'none'}
      onChange={(v) => updateConfig('authentication', v)}
      options={[
        { value: 'none', label: 'None' },
        { value: 'basicAuth', label: 'Basic Auth' },
        { value: 'bearerToken', label: 'Bearer Token' },
        { value: 'apiKey', label: 'API Key' },
        { value: 'oauth2', label: 'OAuth2' },
        { value: 'digest', label: 'Digest Auth' },
      ]}
    />

    {config.authentication === 'basicAuth' && (
      <>
        <TextField
          label="Username"
          value={config.username || ''}
          onChange={(v) => updateConfig('username', v)}
        />
        <PasswordField
          label="Password"
          value={config.password || ''}
          onChange={(v) => updateConfig('password', v)}
        />
      </>
    )}

    {config.authentication === 'bearerToken' && (
      <PasswordField
        label="Bearer Token"
        value={config.bearerToken || ''}
        onChange={(v) => updateConfig('bearerToken', v)}
        placeholder="Enter your bearer token"
      />
    )}

    {config.authentication === 'apiKey' && (
      <>
        <SelectField
          label="Add API Key to"
          value={config.apiKeyLocation || 'header'}
          onChange={(v) => updateConfig('apiKeyLocation', v)}
          options={[
            { value: 'header', label: 'Header' },
            { value: 'query', label: 'Query Parameter' },
          ]}
        />
        <TextField
          label="Key Name"
          value={config.apiKeyName || 'X-API-Key'}
          onChange={(v) => updateConfig('apiKeyName', v)}
          placeholder="X-API-Key"
        />
        <PasswordField
          label="API Key Value"
          value={config.apiKeyValue || ''}
          onChange={(v) => updateConfig('apiKeyValue', v)}
        />
      </>
    )}

    <Separator />

    <SectionHeader
      icon={<FileText className="h-4 w-4 text-violet-500" />}
      title="Headers & Parameters"
    />

    <KeyValueField
      label="Headers"
      value={config.headers || []}
      onChange={(v) => updateConfig('headers', v)}
      keyPlaceholder="Header name"
      valuePlaceholder="Header value"
    />

    <KeyValueField
      label="Query Parameters"
      value={config.queryParams || []}
      onChange={(v) => updateConfig('queryParams', v)}
      keyPlaceholder="Parameter name"
      valuePlaceholder="Parameter value"
    />

    {['POST', 'PUT', 'PATCH'].includes(config.method) && (
      <>
        <Separator />

        <SectionHeader
          icon={<Code className="h-4 w-4 text-green-500" />}
          title="Request Body"
        />

        <SelectField
          label="Content Type"
          value={config.contentType || 'json'}
          onChange={(v) => updateConfig('contentType', v)}
          options={[
            { value: 'json', label: 'JSON' },
            { value: 'form-urlencoded', label: 'Form URL Encoded' },
            { value: 'multipart', label: 'Multipart Form Data' },
            { value: 'raw', label: 'Raw / Custom' },
          ]}
        />

        {config.contentType === 'json' && (
          <CodeField
            label="JSON Body"
            value={config.jsonBody || '{\n  \n}'}
            onChange={(v) => updateConfig('jsonBody', v)}
            language="json"
            rows={8}
          />
        )}

        {config.contentType === 'form-urlencoded' && (
          <KeyValueField
            label="Form Fields"
            value={config.formFields || []}
            onChange={(v) => updateConfig('formFields', v)}
            keyPlaceholder="Field name"
            valuePlaceholder="Field value"
          />
        )}

        {config.contentType === 'raw' && (
          <TextareaField
            label="Raw Body"
            value={config.rawBody || ''}
            onChange={(v) => updateConfig('rawBody', v)}
            rows={6}
            placeholder="Enter raw request body"
          />
        )}
      </>
    )}

    <Separator />

    <SectionHeader
      icon={<Settings className="h-4 w-4 text-gray-500" />}
      title="Options"
    />

    <NumberField
      label="Timeout (ms)"
      value={config.timeout || 30000}
      onChange={(v) => updateConfig('timeout', v)}
      min={1000}
      max={300000}
      description="Request timeout in milliseconds"
    />

    <SwitchField
      label="Follow Redirects"
      description="Automatically follow HTTP redirects"
      value={config.followRedirects ?? true}
      onChange={(v) => updateConfig('followRedirects', v)}
    />

    <SwitchField
      label="Ignore SSL Errors"
      description="Skip SSL certificate validation (not recommended)"
      value={config.ignoreSSL ?? false}
      onChange={(v) => updateConfig('ignoreSSL', v)}
    />

    <SelectField
      label="Response Format"
      value={config.responseFormat || 'auto'}
      onChange={(v) => updateConfig('responseFormat', v)}
      options={[
        { value: 'auto', label: 'Auto-detect' },
        { value: 'json', label: 'JSON' },
        { value: 'text', label: 'Text' },
        { value: 'binary', label: 'Binary / File' },
      ]}
    />

    <SelectField
      label="Error Handling"
      value={config.errorHandling || 'throw'}
      onChange={(v) => updateConfig('errorHandling', v)}
      options={[
        { value: 'throw', label: 'Stop Workflow on Error' },
        { value: 'continue', label: 'Continue on Error' },
        { value: 'retry', label: 'Retry on Error' },
      ]}
    />

    {config.errorHandling === 'retry' && (
      <NumberField
        label="Max Retries"
        value={config.maxRetries || 3}
        onChange={(v) => updateConfig('maxRetries', v)}
        min={1}
        max={10}
      />
    )}
  </div>
);

// ============================================
// AI - OPENAI CONFIG
// ============================================

export const OpenAIConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Bot className="h-4 w-4 text-green-600" />}
      title="OpenAI Configuration"
    />

    <CredentialField
      label="OpenAI Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="OpenAI API"
      connected={!!config.credential}
      connectionName="OpenAI"
    />

    <PasswordField
      label="API Key"
      value={config.apiKey || ''}
      onChange={(v) => updateConfig('apiKey', v)}
      placeholder="sk-..."
      description="Your OpenAI API key"
    />

    <Separator />

    <SectionHeader
      icon={<Sparkles className="h-4 w-4 text-violet-500" />}
      title="Model Settings"
    />

    <SelectField
      label="Operation"
      value={config.operation || 'chat'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'chat', label: 'Chat Completion' },
        { value: 'completion', label: 'Text Completion (Legacy)' },
        { value: 'embedding', label: 'Create Embedding' },
        { value: 'image', label: 'Generate Image (DALL·E)' },
        { value: 'transcription', label: 'Audio Transcription (Whisper)' },
        { value: 'tts', label: 'Text to Speech' },
        { value: 'moderation', label: 'Content Moderation' },
      ]}
    />

    {config.operation === 'chat' && (
      <>
        <SelectField
          label="Model"
          value={config.model || 'gpt-4o'}
          onChange={(v) => updateConfig('model', v)}
          options={[
            { value: 'gpt-4o', label: 'GPT-4o (Latest)' },
            { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cheap)' },
            { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
            { value: 'gpt-4', label: 'GPT-4' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
            { value: 'o1', label: 'o1 (Reasoning)' },
            { value: 'o1-mini', label: 'o1 Mini (Reasoning)' },
            { value: 'o1-preview', label: 'o1 Preview' },
          ]}
        />

        <TextareaField
          label="System Prompt"
          value={config.systemPrompt || ''}
          onChange={(v) => updateConfig('systemPrompt', v)}
          placeholder="You are a helpful assistant..."
          rows={4}
          description="Instructions that guide the AI's behavior"
        />

        <ExpressionField
          label="User Message"
          value={config.userMessage || ''}
          onChange={(v) => updateConfig('userMessage', v)}
          placeholder="{{$node.trigger.data.message}}"
          description="The message to send to the AI"
          required
        />

        <Separator />

        <SectionHeader
          icon={<Settings className="h-4 w-4 text-gray-500" />}
          title="Parameters"
        />

        <SliderField
          label="Temperature"
          value={config.temperature ?? 0.7}
          onChange={(v) => updateConfig('temperature', v)}
          min={0}
          max={2}
          step={0.1}
          description="Higher = more creative, Lower = more focused"
        />

        <NumberField
          label="Max Tokens"
          value={config.maxTokens || 1024}
          onChange={(v) => updateConfig('maxTokens', v)}
          min={1}
          max={128000}
          description="Maximum response length"
        />

        <SliderField
          label="Top P"
          value={config.topP ?? 1}
          onChange={(v) => updateConfig('topP', v)}
          min={0}
          max={1}
          step={0.05}
          description="Nucleus sampling parameter"
        />

        <SliderField
          label="Frequency Penalty"
          value={config.frequencyPenalty ?? 0}
          onChange={(v) => updateConfig('frequencyPenalty', v)}
          min={-2}
          max={2}
          step={0.1}
          description="Reduce repetition of token sequences"
        />

        <SliderField
          label="Presence Penalty"
          value={config.presencePenalty ?? 0}
          onChange={(v) => updateConfig('presencePenalty', v)}
          min={-2}
          max={2}
          step={0.1}
          description="Encourage talking about new topics"
        />

        <SwitchField
          label="JSON Mode"
          description="Force response to be valid JSON"
          value={config.jsonMode ?? false}
          onChange={(v) => updateConfig('jsonMode', v)}
        />

        <SwitchField
          label="Stream Response"
          description="Stream response tokens as they're generated"
          value={config.stream ?? false}
          onChange={(v) => updateConfig('stream', v)}
        />
      </>
    )}

    {config.operation === 'image' && (
      <>
        <SelectField
          label="Model"
          value={config.model || 'dall-e-3'}
          onChange={(v) => updateConfig('model', v)}
          options={[
            { value: 'dall-e-3', label: 'DALL·E 3' },
            { value: 'dall-e-2', label: 'DALL·E 2' },
          ]}
        />

        <ExpressionField
          label="Prompt"
          value={config.prompt || ''}
          onChange={(v) => updateConfig('prompt', v)}
          placeholder="A beautiful sunset over mountains..."
          description="Description of the image to generate"
          required
        />

        <SelectField
          label="Size"
          value={config.size || '1024x1024'}
          onChange={(v) => updateConfig('size', v)}
          options={
            config.model === 'dall-e-3'
              ? [
                  { value: '1024x1024', label: '1024x1024 (Square)' },
                  { value: '1792x1024', label: '1792x1024 (Landscape)' },
                  { value: '1024x1792', label: '1024x1792 (Portrait)' },
                ]
              : [
                  { value: '256x256', label: '256x256' },
                  { value: '512x512', label: '512x512' },
                  { value: '1024x1024', label: '1024x1024' },
                ]
          }
        />

        <SelectField
          label="Quality"
          value={config.quality || 'standard'}
          onChange={(v) => updateConfig('quality', v)}
          options={[
            { value: 'standard', label: 'Standard' },
            { value: 'hd', label: 'HD (Higher Detail)' },
          ]}
        />

        <SelectField
          label="Style"
          value={config.style || 'vivid'}
          onChange={(v) => updateConfig('style', v)}
          options={[
            { value: 'vivid', label: 'Vivid (Dramatic)' },
            { value: 'natural', label: 'Natural (Realistic)' },
          ]}
        />
      </>
    )}

    {config.operation === 'transcription' && (
      <>
        <SelectField
          label="Model"
          value={config.model || 'whisper-1'}
          onChange={(v) => updateConfig('model', v)}
          options={[{ value: 'whisper-1', label: 'Whisper V2' }]}
        />

        <ExpressionField
          label="Audio File"
          value={config.audioFile || ''}
          onChange={(v) => updateConfig('audioFile', v)}
          placeholder="{{$node.previous.data.fileUrl}}"
          description="URL or path to audio file"
          required
        />

        <SelectField
          label="Response Format"
          value={config.responseFormat || 'json'}
          onChange={(v) => updateConfig('responseFormat', v)}
          options={[
            { value: 'json', label: 'JSON' },
            { value: 'text', label: 'Plain Text' },
            { value: 'srt', label: 'SRT (Subtitles)' },
            { value: 'vtt', label: 'VTT (Web Subtitles)' },
            { value: 'verbose_json', label: 'Verbose JSON' },
          ]}
        />

        <TextField
          label="Language (optional)"
          value={config.language || ''}
          onChange={(v) => updateConfig('language', v)}
          placeholder="en"
          description="ISO-639-1 language code"
        />
      </>
    )}

    {config.operation === 'tts' && (
      <>
        <SelectField
          label="Model"
          value={config.model || 'tts-1'}
          onChange={(v) => updateConfig('model', v)}
          options={[
            { value: 'tts-1', label: 'TTS-1 (Fast)' },
            { value: 'tts-1-hd', label: 'TTS-1 HD (High Quality)' },
          ]}
        />

        <ExpressionField
          label="Text"
          value={config.text || ''}
          onChange={(v) => updateConfig('text', v)}
          placeholder="Hello, how are you today?"
          description="Text to convert to speech"
          required
        />

        <SelectField
          label="Voice"
          value={config.voice || 'alloy'}
          onChange={(v) => updateConfig('voice', v)}
          options={[
            { value: 'alloy', label: 'Alloy' },
            { value: 'echo', label: 'Echo' },
            { value: 'fable', label: 'Fable' },
            { value: 'onyx', label: 'Onyx' },
            { value: 'nova', label: 'Nova' },
            { value: 'shimmer', label: 'Shimmer' },
          ]}
        />

        <SliderField
          label="Speed"
          value={config.speed ?? 1}
          onChange={(v) => updateConfig('speed', v)}
          min={0.25}
          max={4}
          step={0.25}
          description="Speech speed multiplier"
        />
      </>
    )}
  </div>
);

// ============================================
// AI - ANTHROPIC/CLAUDE CONFIG
// ============================================

export const AnthropicConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Bot className="h-4 w-4 text-orange-500" />}
      title="Anthropic Claude Configuration"
    />

    <CredentialField
      label="Anthropic Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Anthropic API"
      connected={!!config.credential}
      connectionName="Anthropic"
    />

    <PasswordField
      label="API Key"
      value={config.apiKey || ''}
      onChange={(v) => updateConfig('apiKey', v)}
      placeholder="sk-ant-..."
      description="Your Anthropic API key"
    />

    <Separator />

    <SectionHeader
      icon={<Sparkles className="h-4 w-4 text-violet-500" />}
      title="Model Settings"
    />

    <SelectField
      label="Model"
      value={config.model || 'claude-sonnet-4-20250514'}
      onChange={(v) => updateConfig('model', v)}
      options={[
        { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Latest)' },
        { value: 'claude-opus-4-20250514', label: 'Claude Opus 4 (Most Capable)' },
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
        { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Fast)' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
      ]}
    />

    <TextareaField
      label="System Prompt"
      value={config.systemPrompt || ''}
      onChange={(v) => updateConfig('systemPrompt', v)}
      placeholder="You are a helpful assistant..."
      rows={4}
      description="Instructions that guide Claude's behavior"
    />

    <ExpressionField
      label="User Message"
      value={config.userMessage || ''}
      onChange={(v) => updateConfig('userMessage', v)}
      placeholder="{{$node.trigger.data.message}}"
      description="The message to send to Claude"
      required
    />

    <Separator />

    <SectionHeader
      icon={<Settings className="h-4 w-4 text-gray-500" />}
      title="Parameters"
    />

    <SliderField
      label="Temperature"
      value={config.temperature ?? 1}
      onChange={(v) => updateConfig('temperature', v)}
      min={0}
      max={1}
      step={0.1}
      description="Higher = more creative, Lower = more focused"
    />

    <NumberField
      label="Max Tokens"
      value={config.maxTokens || 4096}
      onChange={(v) => updateConfig('maxTokens', v)}
      min={1}
      max={200000}
      description="Maximum response length"
    />

    <SliderField
      label="Top P"
      value={config.topP ?? 1}
      onChange={(v) => updateConfig('topP', v)}
      min={0}
      max={1}
      step={0.05}
      description="Nucleus sampling parameter"
    />

    <SwitchField
      label="Enable Tool Use"
      description="Allow Claude to use external tools/functions"
      value={config.enableTools ?? false}
      onChange={(v) => updateConfig('enableTools', v)}
    />

    {config.enableTools && (
      <CodeField
        label="Tools Definition (JSON)"
        value={config.tools || '[]'}
        onChange={(v) => updateConfig('tools', v)}
        language="json"
        rows={8}
        description="Define available tools for Claude"
      />
    )}

    <SwitchField
      label="Stream Response"
      description="Stream response tokens as they're generated"
      value={config.stream ?? false}
      onChange={(v) => updateConfig('stream', v)}
    />
  </div>
);

// ============================================
// AI - GOOGLE GEMINI CONFIG
// ============================================

export const GeminiConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Bot className="h-4 w-4 text-blue-500" />}
      title="Google Gemini Configuration"
    />

    <CredentialField
      label="Google AI Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google AI API"
      connected={!!config.credential}
      connectionName="Google AI"
    />

    <PasswordField
      label="API Key"
      value={config.apiKey || ''}
      onChange={(v) => updateConfig('apiKey', v)}
      description="Your Google AI API key"
    />

    <Separator />

    <SectionHeader
      icon={<Sparkles className="h-4 w-4 text-violet-500" />}
      title="Model Settings"
    />

    <SelectField
      label="Model"
      value={config.model || 'gemini-2.0-flash'}
      onChange={(v) => updateConfig('model', v)}
      options={[
        { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Latest)' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)' },
        { value: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash 8B' },
        { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro' },
      ]}
    />

    <TextareaField
      label="System Instruction"
      value={config.systemPrompt || ''}
      onChange={(v) => updateConfig('systemPrompt', v)}
      placeholder="You are a helpful assistant..."
      rows={4}
    />

    <ExpressionField
      label="User Message"
      value={config.userMessage || ''}
      onChange={(v) => updateConfig('userMessage', v)}
      placeholder="{{$node.trigger.data.message}}"
      required
    />

    <Separator />

    <SectionHeader
      icon={<Settings className="h-4 w-4 text-gray-500" />}
      title="Parameters"
    />

    <SliderField
      label="Temperature"
      value={config.temperature ?? 1}
      onChange={(v) => updateConfig('temperature', v)}
      min={0}
      max={2}
      step={0.1}
    />

    <NumberField
      label="Max Output Tokens"
      value={config.maxTokens || 8192}
      onChange={(v) => updateConfig('maxTokens', v)}
      min={1}
      max={8192}
    />

    <SliderField
      label="Top P"
      value={config.topP ?? 0.95}
      onChange={(v) => updateConfig('topP', v)}
      min={0}
      max={1}
      step={0.05}
    />

    <NumberField
      label="Top K"
      value={config.topK || 64}
      onChange={(v) => updateConfig('topK', v)}
      min={1}
      max={100}
    />

    <SwitchField
      label="Enable Google Search"
      description="Allow Gemini to search the web"
      value={config.enableSearch ?? false}
      onChange={(v) => updateConfig('enableSearch', v)}
    />
  </div>
);

// ============================================
// SEND WHATSAPP MESSAGE
// ============================================

export const SendWhatsAppConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<MessageCircle className="h-4 w-4 text-green-500" />}
      title="Send WhatsApp Message"
    />

    <CredentialField
      label="WhatsApp Business Account"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="WhatsApp Business API"
      connected={!!config.credential}
      connectionName={config.credentialName}
    />

    <Separator />

    <SectionHeader
      icon={<Send className="h-4 w-4 text-blue-500" />}
      title="Message Settings"
    />

    <ExpressionField
      label="Recipient Phone Number"
      value={config.to || ''}
      onChange={(v) => updateConfig('to', v)}
      placeholder="{{$node.trigger.data.from}} or +919876543210"
      description="Phone number with country code"
      required
    />

    <SelectField
      label="Message Type"
      value={config.messageType || 'text'}
      onChange={(v) => updateConfig('messageType', v)}
      options={[
        { value: 'text', label: 'Text Message' },
        { value: 'template', label: 'Template Message' },
        { value: 'image', label: 'Image' },
        { value: 'video', label: 'Video' },
        { value: 'document', label: 'Document' },
        { value: 'audio', label: 'Audio' },
        { value: 'location', label: 'Location' },
        { value: 'contacts', label: 'Contact Card' },
        { value: 'interactive', label: 'Interactive (Buttons/List)' },
      ]}
    />

    {config.messageType === 'text' && (
      <>
        <ExpressionField
          label="Message Text"
          value={config.text || ''}
          onChange={(v) => updateConfig('text', v)}
          placeholder="Hello {{$node.trigger.data.name}}!"
          description="Supports expressions and variables"
          required
        />
        <SwitchField
          label="Enable Preview"
          description="Show URL preview if message contains link"
          value={config.previewUrl ?? true}
          onChange={(v) => updateConfig('previewUrl', v)}
        />
      </>
    )}

    {config.messageType === 'template' && (
      <>
        <TextField
          label="Template Name"
          value={config.templateName || ''}
          onChange={(v) => updateConfig('templateName', v)}
          placeholder="order_confirmation"
          required
        />
        <TextField
          label="Template Language"
          value={config.templateLanguage || 'en'}
          onChange={(v) => updateConfig('templateLanguage', v)}
          placeholder="en"
        />
        <CodeField
          label="Template Variables (JSON)"
          value={config.templateVariables || '[]'}
          onChange={(v) => updateConfig('templateVariables', v)}
          language="json"
          rows={4}
          description='Array of variable values: ["John", "Order #123"]'
        />
      </>
    )}

    {['image', 'video', 'document', 'audio'].includes(config.messageType) && (
      <>
        <ExpressionField
          label="Media URL"
          value={config.mediaUrl || ''}
          onChange={(v) => updateConfig('mediaUrl', v)}
          placeholder="https://example.com/image.jpg"
          required
        />
        <TextField
          label="Caption (optional)"
          value={config.caption || ''}
          onChange={(v) => updateConfig('caption', v)}
          placeholder="Check out this image!"
        />
        {config.messageType === 'document' && (
          <TextField
            label="Filename"
            value={config.filename || ''}
            onChange={(v) => updateConfig('filename', v)}
            placeholder="document.pdf"
          />
        )}
      </>
    )}

    {config.messageType === 'location' && (
      <>
        <ExpressionField
          label="Latitude"
          value={config.latitude || ''}
          onChange={(v) => updateConfig('latitude', v)}
          placeholder="12.9716"
          required
        />
        <ExpressionField
          label="Longitude"
          value={config.longitude || ''}
          onChange={(v) => updateConfig('longitude', v)}
          placeholder="77.5946"
          required
        />
        <TextField
          label="Location Name"
          value={config.locationName || ''}
          onChange={(v) => updateConfig('locationName', v)}
          placeholder="Our Office"
        />
        <TextField
          label="Address"
          value={config.address || ''}
          onChange={(v) => updateConfig('address', v)}
          placeholder="123 Main Street, City"
        />
      </>
    )}

    {config.messageType === 'interactive' && (
      <>
        <SelectField
          label="Interactive Type"
          value={config.interactiveType || 'button'}
          onChange={(v) => updateConfig('interactiveType', v)}
          options={[
            { value: 'button', label: 'Buttons (up to 3)' },
            { value: 'list', label: 'List Menu' },
          ]}
        />
        <TextareaField
          label="Body Text"
          value={config.bodyText || ''}
          onChange={(v) => updateConfig('bodyText', v)}
          placeholder="Please select an option:"
          rows={2}
          required
        />
        <TextField
          label="Header Text (optional)"
          value={config.headerText || ''}
          onChange={(v) => updateConfig('headerText', v)}
        />
        <TextField
          label="Footer Text (optional)"
          value={config.footerText || ''}
          onChange={(v) => updateConfig('footerText', v)}
        />
        <CodeField
          label={config.interactiveType === 'button' ? 'Buttons (JSON)' : 'List Sections (JSON)'}
          value={config.interactiveData || '[]'}
          onChange={(v) => updateConfig('interactiveData', v)}
          language="json"
          rows={6}
        />
      </>
    )}
  </div>
);

// ============================================
// SEND EMAIL (SMTP/GMAIL)
// ============================================

export const SendEmailConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Mail className="h-4 w-4 text-red-500" />}
      title="Send Email"
    />

    <SelectField
      label="Email Service"
      value={config.service || 'gmail'}
      onChange={(v) => updateConfig('service', v)}
      options={[
        { value: 'gmail', label: 'Gmail' },
        { value: 'outlook', label: 'Outlook / Microsoft 365' },
        { value: 'smtp', label: 'Custom SMTP' },
        { value: 'sendgrid', label: 'SendGrid' },
        { value: 'mailgun', label: 'Mailgun' },
        { value: 'ses', label: 'Amazon SES' },
      ]}
    />

    <CredentialField
      label={`${config.service || 'Email'} Account`}
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType={`${config.service || 'Email'} credentials`}
      connected={!!config.credential}
    />

    {config.service === 'smtp' && (
      <>
        <TextField
          label="SMTP Host"
          value={config.smtpHost || ''}
          onChange={(v) => updateConfig('smtpHost', v)}
          placeholder="smtp.example.com"
        />
        <NumberField
          label="SMTP Port"
          value={config.smtpPort || 587}
          onChange={(v) => updateConfig('smtpPort', v)}
          min={1}
          max={65535}
        />
        <TextField
          label="Username"
          value={config.username || ''}
          onChange={(v) => updateConfig('username', v)}
        />
        <PasswordField
          label="Password"
          value={config.password || ''}
          onChange={(v) => updateConfig('password', v)}
        />
        <SwitchField
          label="Use TLS"
          value={config.useTls ?? true}
          onChange={(v) => updateConfig('useTls', v)}
        />
      </>
    )}

    <Separator />

    <SectionHeader
      icon={<Send className="h-4 w-4 text-blue-500" />}
      title="Email Content"
    />

    <ExpressionField
      label="To"
      value={config.to || ''}
      onChange={(v) => updateConfig('to', v)}
      placeholder="recipient@example.com"
      description="Multiple addresses separated by commas"
      required
    />

    <TextField
      label="CC"
      value={config.cc || ''}
      onChange={(v) => updateConfig('cc', v)}
      placeholder="cc@example.com"
    />

    <TextField
      label="BCC"
      value={config.bcc || ''}
      onChange={(v) => updateConfig('bcc', v)}
      placeholder="bcc@example.com"
    />

    <TextField
      label="From Name"
      value={config.fromName || ''}
      onChange={(v) => updateConfig('fromName', v)}
      placeholder="Your Company"
    />

    <TextField
      label="Reply To"
      value={config.replyTo || ''}
      onChange={(v) => updateConfig('replyTo', v)}
      placeholder="reply@example.com"
    />

    <ExpressionField
      label="Subject"
      value={config.subject || ''}
      onChange={(v) => updateConfig('subject', v)}
      placeholder="Order Confirmation - {{$node.previous.data.orderId}}"
      required
    />

    <SelectField
      label="Content Type"
      value={config.contentType || 'html'}
      onChange={(v) => updateConfig('contentType', v)}
      options={[
        { value: 'html', label: 'HTML' },
        { value: 'text', label: 'Plain Text' },
      ]}
    />

    {config.contentType === 'html' ? (
      <CodeField
        label="HTML Body"
        value={config.htmlBody || '<p>Hello {{name}},</p>\n<p>Thank you for your order!</p>'}
        onChange={(v) => updateConfig('htmlBody', v)}
        language="html"
        rows={10}
      />
    ) : (
      <TextareaField
        label="Plain Text Body"
        value={config.textBody || ''}
        onChange={(v) => updateConfig('textBody', v)}
        rows={8}
      />
    )}

    <SwitchField
      label="Include Attachments"
      value={config.includeAttachments ?? false}
      onChange={(v) => updateConfig('includeAttachments', v)}
    />

    {config.includeAttachments && (
      <ExpressionField
        label="Attachment URLs"
        value={config.attachments || ''}
        onChange={(v) => updateConfig('attachments', v)}
        placeholder="{{$node.previous.data.fileUrl}}"
        description="Comma-separated URLs or expressions"
      />
    )}
  </div>
);

// ============================================
// CODE / JAVASCRIPT
// ============================================

export const CodeConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Code className="h-4 w-4 text-yellow-500" />}
      title="Code Execution"
    />

    <SelectField
      label="Language"
      value={config.language || 'javascript'}
      onChange={(v) => updateConfig('language', v)}
      options={[
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
      ]}
    />

    <InfoBox type="info" title="Available Variables">
      <ul className="mt-1 space-y-1 text-xs">
        <li><code>$input</code> - Data from previous node</li>
        <li><code>$node</code> - Access other nodes' data</li>
        <li><code>$env</code> - Environment variables</li>
        <li><code>$execution</code> - Current execution info</li>
      </ul>
    </InfoBox>

    <CodeField
      label="Code"
      value={config.code || '// Process the input data\nconst input = $input.all();\n\n// Your code here\nconst result = input.map(item => ({\n  ...item,\n  processed: true\n}));\n\nreturn result;'}
      onChange={(v) => updateConfig('code', v)}
      language={config.language || 'javascript'}
      rows={15}
    />

    <SwitchField
      label="Run for Each Item"
      description="Execute code once for each input item"
      value={config.runOnceForEachItem ?? false}
      onChange={(v) => updateConfig('runOnceForEachItem', v)}
    />

    <NumberField
      label="Timeout (seconds)"
      value={config.timeout || 30}
      onChange={(v) => updateConfig('timeout', v)}
      min={1}
      max={300}
      description="Maximum execution time"
    />
  </div>
);

// ============================================
// DATABASE QUERY
// ============================================

export const DatabaseQueryConfig: React.FC<ActionConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <SectionHeader
      icon={<Database className="h-4 w-4 text-blue-500" />}
      title="Database Query"
    />

    <SelectField
      label="Database Type"
      value={config.dbType || 'postgres'}
      onChange={(v) => updateConfig('dbType', v)}
      options={[
        { value: 'postgres', label: 'PostgreSQL' },
        { value: 'mysql', label: 'MySQL / MariaDB' },
        { value: 'mongodb', label: 'MongoDB' },
        { value: 'sqlite', label: 'SQLite' },
        { value: 'mssql', label: 'Microsoft SQL Server' },
        { value: 'redis', label: 'Redis' },
      ]}
    />

    <CredentialField
      label="Database Connection"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Database"
      connected={!!config.credential}
    />

    {config.dbType !== 'mongodb' && config.dbType !== 'redis' && (
      <>
        <TextField
          label="Host"
          value={config.host || 'localhost'}
          onChange={(v) => updateConfig('host', v)}
        />
        <NumberField
          label="Port"
          value={config.port || (config.dbType === 'postgres' ? 5432 : config.dbType === 'mysql' ? 3306 : 1433)}
          onChange={(v) => updateConfig('port', v)}
        />
        <TextField
          label="Database Name"
          value={config.database || ''}
          onChange={(v) => updateConfig('database', v)}
        />
        <TextField
          label="Username"
          value={config.username || ''}
          onChange={(v) => updateConfig('username', v)}
        />
        <PasswordField
          label="Password"
          value={config.password || ''}
          onChange={(v) => updateConfig('password', v)}
        />
      </>
    )}

    {config.dbType === 'mongodb' && (
      <TextField
        label="Connection String"
        value={config.connectionString || ''}
        onChange={(v) => updateConfig('connectionString', v)}
        placeholder="mongodb://localhost:27017/mydb"
      />
    )}

    <Separator />

    <SectionHeader
      icon={<Code className="h-4 w-4 text-green-500" />}
      title="Query"
    />

    <SelectField
      label="Operation"
      value={config.operation || 'select'}
      onChange={(v) => updateConfig('operation', v)}
      options={
        config.dbType === 'mongodb'
          ? [
              { value: 'find', label: 'Find' },
              { value: 'findOne', label: 'Find One' },
              { value: 'insertOne', label: 'Insert One' },
              { value: 'insertMany', label: 'Insert Many' },
              { value: 'updateOne', label: 'Update One' },
              { value: 'updateMany', label: 'Update Many' },
              { value: 'deleteOne', label: 'Delete One' },
              { value: 'deleteMany', label: 'Delete Many' },
              { value: 'aggregate', label: 'Aggregate' },
            ]
          : [
              { value: 'select', label: 'SELECT' },
              { value: 'insert', label: 'INSERT' },
              { value: 'update', label: 'UPDATE' },
              { value: 'delete', label: 'DELETE' },
              { value: 'raw', label: 'Raw Query' },
            ]
      }
    />

    {config.dbType === 'mongodb' ? (
      <>
        <TextField
          label="Collection"
          value={config.collection || ''}
          onChange={(v) => updateConfig('collection', v)}
          placeholder="users"
          required
        />
        <CodeField
          label="Query / Filter"
          value={config.query || '{}'}
          onChange={(v) => updateConfig('query', v)}
          language="json"
          rows={4}
        />
        {['find', 'findOne'].includes(config.operation) && (
          <CodeField
            label="Projection (optional)"
            value={config.projection || '{}'}
            onChange={(v) => updateConfig('projection', v)}
            language="json"
            rows={2}
          />
        )}
        {['updateOne', 'updateMany'].includes(config.operation) && (
          <CodeField
            label="Update"
            value={config.update || '{ "$set": {} }'}
            onChange={(v) => updateConfig('update', v)}
            language="json"
            rows={4}
          />
        )}
      </>
    ) : (
      <CodeField
        label="SQL Query"
        value={config.query || 'SELECT * FROM users WHERE id = $1'}
        onChange={(v) => updateConfig('query', v)}
        language="sql"
        rows={6}
      />
    )}

    {config.dbType !== 'mongodb' && (
      <CodeField
        label="Parameters (JSON Array)"
        value={config.parameters || '[]'}
        onChange={(v) => updateConfig('parameters', v)}
        language="json"
        rows={2}
        description="Parameters for prepared statement: [value1, value2]"
      />
    )}
  </div>
);

// ============================================
// EXPORT ALL ACTION CONFIGS
// ============================================

export const ActionConfigs: Record<string, React.FC<ActionConfigProps>> = {
  http_request: HttpRequestConfig,
  webhook_response: HttpRequestConfig,
  openai_chat: OpenAIConfig,
  openai_completion: OpenAIConfig,
  openai_image: OpenAIConfig,
  openai_transcription: OpenAIConfig,
  openai_tts: OpenAIConfig,
  anthropic_chat: AnthropicConfig,
  claude_chat: AnthropicConfig,
  claude: AnthropicConfig,
  google_gemini: GeminiConfig,
  gemini: GeminiConfig,
  send_whatsapp: SendWhatsAppConfig,
  whatsapp_send: SendWhatsAppConfig,
  send_email: SendEmailConfig,
  gmail_send: SendEmailConfig,
  outlook_send: SendEmailConfig,
  code: CodeConfig,
  javascript: CodeConfig,
  python: CodeConfig,
  database_query: DatabaseQueryConfig,
  postgres: DatabaseQueryConfig,
  mysql: DatabaseQueryConfig,
  mongodb: DatabaseQueryConfig,
};

export default ActionConfigs;
