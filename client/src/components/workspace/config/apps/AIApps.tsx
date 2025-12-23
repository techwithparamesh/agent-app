/**
 * AI/ML App Configurations
 * 
 * n8n-style configurations for AI and machine learning services:
 * - OpenAI (GPT, DALL-E, Whisper, TTS, Embeddings)
 * - Anthropic Claude
 * - Google Gemini (Vertex AI)
 * - Hugging Face
 * - Stability AI
 * - Replicate
 * - Cohere
 * - Perplexity
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
  InfoBox,
  SectionHeader,
} from "../FieldComponents";

interface AppConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// OPENAI ADVANCED CONFIG (n8n style)
// ============================================

export const OpenAIAdvancedConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="OpenAI Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="OpenAI API Key"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'text'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'text', label: 'Text' },
        { value: 'image', label: 'Image' },
        { value: 'audio', label: 'Audio' },
        { value: 'file', label: 'File' },
        { value: 'assistant', label: 'Assistant' },
        { value: 'embedding', label: 'Embedding' },
      ]}
      required
    />

    {config.resource === 'text' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'message'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'message', label: 'Chat Completion' },
            { value: 'classify', label: 'Classify Text' },
            { value: 'moderate', label: 'Content Moderation' },
          ]}
        />

        {config.operation === 'message' && (
          <>
            <SelectField
              label="Model"
              value={config.model || 'gpt-4o'}
              onChange={(v) => updateConfig('model', v)}
              options={[
                { value: 'gpt-4o', label: 'GPT-4o (Latest)' },
                { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
                { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
                { value: 'gpt-4', label: 'GPT-4' },
                { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                { value: 'o1-preview', label: 'o1 Preview (Reasoning)' },
                { value: 'o1-mini', label: 'o1 Mini' },
              ]}
            />

            <TextareaField
              label="System Prompt"
              value={config.systemPrompt || ''}
              onChange={(v) => updateConfig('systemPrompt', v)}
              placeholder="You are a helpful assistant..."
              rows={3}
            />

            <ExpressionField
              label="User Message"
              value={config.userMessage || ''}
              onChange={(v) => updateConfig('userMessage', v)}
              placeholder="Enter your prompt..."
              required
            />

            <SwitchField
              label="Include Chat History"
              value={config.includeChatHistory || false}
              onChange={(v) => updateConfig('includeChatHistory', v)}
              description="Include previous messages in context"
            />

            {config.includeChatHistory && (
              <FixedCollectionField
                label="Chat History"
                value={config.chatHistory || []}
                onChange={(v) => updateConfig('chatHistory', v)}
                fields={[
                  { name: 'role', displayName: 'Role', type: 'options', options: [
                    { value: 'user', label: 'User' },
                    { value: 'assistant', label: 'Assistant' },
                    { value: 'system', label: 'System' },
                  ]},
                  { name: 'content', displayName: 'Content', type: 'string' },
                ]}
                sortable
              />
            )}

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'temperature', displayName: 'Temperature', type: 'number', default: 0.7 },
                { name: 'maxTokens', displayName: 'Max Tokens', type: 'number', default: 4096 },
                { name: 'topP', displayName: 'Top P', type: 'number', default: 1 },
                { name: 'frequencyPenalty', displayName: 'Frequency Penalty', type: 'number', default: 0 },
                { name: 'presencePenalty', displayName: 'Presence Penalty', type: 'number', default: 0 },
                { name: 'stream', displayName: 'Stream Response', type: 'boolean' },
                { name: 'responseFormat', displayName: 'Response Format', type: 'options', options: [
                  { value: 'text', label: 'Text' },
                  { value: 'json_object', label: 'JSON Object' },
                ]},
              ]}
            />

            <SwitchField
              label="Enable Tools/Functions"
              value={config.enableTools || false}
              onChange={(v) => updateConfig('enableTools', v)}
            />

            {config.enableTools && (
              <TextareaField
                label="Tools JSON"
                value={config.toolsJson || ''}
                onChange={(v) => updateConfig('toolsJson', v)}
                placeholder='[{"type": "function", "function": {"name": "get_weather", "parameters": {...}}}]'
                rows={6}
                description="OpenAI function calling schema"
              />
            )}
          </>
        )}

        {config.operation === 'moderate' && (
          <ExpressionField
            label="Input Text"
            value={config.input || ''}
            onChange={(v) => updateConfig('input', v)}
            required
          />
        )}
      </>
    )}

    {config.resource === 'image' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'generate'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'generate', label: 'Generate Image (DALL-E)' },
            { value: 'analyze', label: 'Analyze Image (Vision)' },
            { value: 'edit', label: 'Edit Image' },
            { value: 'variation', label: 'Create Variation' },
          ]}
        />

        {config.operation === 'generate' && (
          <>
            <SelectField
              label="Model"
              value={config.model || 'dall-e-3'}
              onChange={(v) => updateConfig('model', v)}
              options={[
                { value: 'dall-e-3', label: 'DALL-E 3' },
                { value: 'dall-e-2', label: 'DALL-E 2' },
              ]}
            />

            <TextareaField
              label="Prompt"
              value={config.prompt || ''}
              onChange={(v) => updateConfig('prompt', v)}
              placeholder="A beautiful sunset over mountains..."
              rows={3}
              required
            />

            <SelectField
              label="Size"
              value={config.size || '1024x1024'}
              onChange={(v) => updateConfig('size', v)}
              options={[
                { value: '1024x1024', label: '1024x1024' },
                { value: '1024x1792', label: '1024x1792 (Portrait)' },
                { value: '1792x1024', label: '1792x1024 (Landscape)' },
                { value: '512x512', label: '512x512 (DALL-E 2 only)' },
                { value: '256x256', label: '256x256 (DALL-E 2 only)' },
              ]}
            />

            <SelectField
              label="Quality"
              value={config.quality || 'standard'}
              onChange={(v) => updateConfig('quality', v)}
              options={[
                { value: 'standard', label: 'Standard' },
                { value: 'hd', label: 'HD' },
              ]}
            />

            <SelectField
              label="Style"
              value={config.style || 'vivid'}
              onChange={(v) => updateConfig('style', v)}
              options={[
                { value: 'vivid', label: 'Vivid' },
                { value: 'natural', label: 'Natural' },
              ]}
            />

            <TextField
              label="Number of Images"
              value={config.n || '1'}
              onChange={(v) => updateConfig('n', v)}
              description="1-10 for DALL-E 2, only 1 for DALL-E 3"
            />
          </>
        )}

        {config.operation === 'analyze' && (
          <>
            <SelectField
              label="Image Input Type"
              value={config.imageInputType || 'url'}
              onChange={(v) => updateConfig('imageInputType', v)}
              options={[
                { value: 'url', label: 'Image URL' },
                { value: 'base64', label: 'Base64 Data' },
              ]}
            />

            {config.imageInputType === 'url' && (
              <ExpressionField
                label="Image URL"
                value={config.imageUrl || ''}
                onChange={(v) => updateConfig('imageUrl', v)}
                required
              />
            )}

            <ExpressionField
              label="Prompt"
              value={config.prompt || ''}
              onChange={(v) => updateConfig('prompt', v)}
              placeholder="What's in this image?"
              required
            />

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'detail', displayName: 'Detail Level', type: 'options', options: [
                  { value: 'auto', label: 'Auto' },
                  { value: 'low', label: 'Low' },
                  { value: 'high', label: 'High' },
                ]},
                { name: 'maxTokens', displayName: 'Max Tokens', type: 'number' },
              ]}
            />
          </>
        )}
      </>
    )}

    {config.resource === 'audio' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'transcribe'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'transcribe', label: 'Transcribe (Speech-to-Text)' },
            { value: 'translate', label: 'Translate to English' },
            { value: 'generate', label: 'Generate Speech (TTS)' },
          ]}
        />

        {(config.operation === 'transcribe' || config.operation === 'translate') && (
          <>
            <SelectField
              label="Input Type"
              value={config.inputType || 'binary'}
              onChange={(v) => updateConfig('inputType', v)}
              options={[
                { value: 'binary', label: 'Binary Data' },
                { value: 'url', label: 'Audio URL' },
              ]}
            />

            {config.inputType === 'url' && (
              <ExpressionField
                label="Audio URL"
                value={config.audioUrl || ''}
                onChange={(v) => updateConfig('audioUrl', v)}
                required
              />
            )}

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'language', displayName: 'Language', type: 'string', placeholder: 'en' },
                { name: 'prompt', displayName: 'Transcription Prompt', type: 'string' },
                { name: 'temperature', displayName: 'Temperature', type: 'number' },
                { name: 'responseFormat', displayName: 'Response Format', type: 'options', options: [
                  { value: 'json', label: 'JSON' },
                  { value: 'text', label: 'Text' },
                  { value: 'srt', label: 'SRT' },
                  { value: 'verbose_json', label: 'Verbose JSON' },
                  { value: 'vtt', label: 'VTT' },
                ]},
              ]}
            />
          </>
        )}

        {config.operation === 'generate' && (
          <>
            <SelectField
              label="Model"
              value={config.model || 'tts-1'}
              onChange={(v) => updateConfig('model', v)}
              options={[
                { value: 'tts-1', label: 'TTS-1' },
                { value: 'tts-1-hd', label: 'TTS-1 HD' },
              ]}
            />

            <ExpressionField
              label="Text to Speak"
              value={config.input || ''}
              onChange={(v) => updateConfig('input', v)}
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

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'speed', displayName: 'Speed (0.25-4.0)', type: 'number', default: 1.0 },
                { name: 'responseFormat', displayName: 'Output Format', type: 'options', options: [
                  { value: 'mp3', label: 'MP3' },
                  { value: 'opus', label: 'Opus' },
                  { value: 'aac', label: 'AAC' },
                  { value: 'flac', label: 'FLAC' },
                ]},
              ]}
            />
          </>
        )}
      </>
    )}

    {config.resource === 'embedding' && (
      <>
        <SelectField
          label="Model"
          value={config.model || 'text-embedding-3-small'}
          onChange={(v) => updateConfig('model', v)}
          options={[
            { value: 'text-embedding-3-small', label: 'text-embedding-3-small' },
            { value: 'text-embedding-3-large', label: 'text-embedding-3-large' },
            { value: 'text-embedding-ada-002', label: 'text-embedding-ada-002' },
          ]}
        />

        <ExpressionField
          label="Input Text"
          value={config.input || ''}
          onChange={(v) => updateConfig('input', v)}
          required
        />

        <CollectionField
          label="Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'dimensions', displayName: 'Dimensions', type: 'number', description: 'Only for embedding-3 models' },
            { name: 'encodingFormat', displayName: 'Encoding Format', type: 'options', options: [
              { value: 'float', label: 'Float' },
              { value: 'base64', label: 'Base64' },
            ]},
          ]}
        />
      </>
    )}

    {config.resource === 'assistant' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'message'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'message', label: 'Send Message' },
            { value: 'create', label: 'Create Assistant' },
            { value: 'update', label: 'Update Assistant' },
            { value: 'list', label: 'List Assistants' },
            { value: 'delete', label: 'Delete Assistant' },
          ]}
        />

        {config.operation === 'message' && (
          <>
            <ResourceLocatorField
              label="Assistant"
              value={config.assistantId || { mode: 'list', value: '' }}
              onChange={(v) => updateConfig('assistantId', v)}
              modes={['list', 'id']}
              resourceType="Assistant"
              required
            />

            <ExpressionField
              label="Message"
              value={config.message || ''}
              onChange={(v) => updateConfig('message', v)}
              required
            />

            <TextField
              label="Thread ID"
              value={config.threadId || ''}
              onChange={(v) => updateConfig('threadId', v)}
              description="Leave empty to create new thread"
            />
          </>
        )}

        {config.operation === 'create' && (
          <>
            <TextField
              label="Name"
              value={config.name || ''}
              onChange={(v) => updateConfig('name', v)}
              required
            />

            <TextareaField
              label="Instructions"
              value={config.instructions || ''}
              onChange={(v) => updateConfig('instructions', v)}
              rows={4}
            />

            <SelectField
              label="Model"
              value={config.model || 'gpt-4o'}
              onChange={(v) => updateConfig('model', v)}
              options={[
                { value: 'gpt-4o', label: 'GPT-4o' },
                { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
                { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
                { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
              ]}
            />

            <CollectionField
              label="Tools"
              value={config.tools || {}}
              onChange={(v) => updateConfig('tools', v)}
              options={[
                { name: 'code_interpreter', displayName: 'Code Interpreter', type: 'boolean' },
                { name: 'file_search', displayName: 'File Search', type: 'boolean' },
              ]}
            />
          </>
        )}
      </>
    )}

    {config.resource === 'file' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'upload'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'upload', label: 'Upload File' },
            { value: 'list', label: 'List Files' },
            { value: 'delete', label: 'Delete File' },
          ]}
        />

        {config.operation === 'upload' && (
          <>
            <SelectField
              label="Purpose"
              value={config.purpose || 'assistants'}
              onChange={(v) => updateConfig('purpose', v)}
              options={[
                { value: 'assistants', label: 'Assistants' },
                { value: 'fine-tune', label: 'Fine-tuning' },
                { value: 'batch', label: 'Batch' },
              ]}
            />
            <InfoBox type="info" title="File Upload">
              Binary data from previous node will be uploaded
            </InfoBox>
          </>
        )}
      </>
    )}
  </div>
);

// ============================================
// ANTHROPIC CLAUDE CONFIG
// ============================================

export const AnthropicConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Anthropic Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Anthropic API Key"
      required
    />

    <SelectField
      label="Operation"
      value={config.operation || 'message'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'message', label: 'Send Message' },
      ]}
    />

    <SelectField
      label="Model"
      value={config.model || 'claude-sonnet-4-20250514'}
      onChange={(v) => updateConfig('model', v)}
      options={[
        { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Latest)' },
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
        { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
      ]}
    />

    <TextareaField
      label="System Prompt"
      value={config.systemPrompt || ''}
      onChange={(v) => updateConfig('systemPrompt', v)}
      placeholder="You are a helpful AI assistant..."
      rows={3}
    />

    <ExpressionField
      label="User Message"
      value={config.userMessage || ''}
      onChange={(v) => updateConfig('userMessage', v)}
      required
    />

    <SwitchField
      label="Include Chat History"
      value={config.includeChatHistory || false}
      onChange={(v) => updateConfig('includeChatHistory', v)}
    />

    {config.includeChatHistory && (
      <FixedCollectionField
        label="Messages"
        value={config.messages || []}
        onChange={(v) => updateConfig('messages', v)}
        fields={[
          { name: 'role', displayName: 'Role', type: 'options', options: [
            { value: 'user', label: 'User' },
            { value: 'assistant', label: 'Assistant' },
          ]},
          { name: 'content', displayName: 'Content', type: 'string' },
        ]}
        sortable
      />
    )}

    <SwitchField
      label="Include Vision"
      value={config.includeVision || false}
      onChange={(v) => updateConfig('includeVision', v)}
      description="Send images along with text"
    />

    {config.includeVision && (
      <SelectField
        label="Image Input Type"
        value={config.imageInputType || 'url'}
        onChange={(v) => updateConfig('imageInputType', v)}
        options={[
          { value: 'url', label: 'Image URL' },
          { value: 'base64', label: 'Base64 Data' },
        ]}
      />
    )}

    <CollectionField
      label="Options"
      value={config.options || {}}
      onChange={(v) => updateConfig('options', v)}
      options={[
        { name: 'maxTokens', displayName: 'Max Tokens', type: 'number', default: 4096 },
        { name: 'temperature', displayName: 'Temperature', type: 'number', default: 0.7 },
        { name: 'topP', displayName: 'Top P', type: 'number', default: 1 },
        { name: 'topK', displayName: 'Top K', type: 'number' },
        { name: 'stream', displayName: 'Stream Response', type: 'boolean' },
      ]}
    />

    <SwitchField
      label="Enable Tools"
      value={config.enableTools || false}
      onChange={(v) => updateConfig('enableTools', v)}
    />

    {config.enableTools && (
      <TextareaField
        label="Tools JSON"
        value={config.toolsJson || ''}
        onChange={(v) => updateConfig('toolsJson', v)}
        placeholder='[{"name": "get_weather", "description": "...", "input_schema": {...}}]'
        rows={6}
      />
    )}
  </div>
);

// ============================================
// GOOGLE GEMINI CONFIG
// ============================================

export const GoogleGeminiConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Google AI Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google AI API Key"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'text'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'text', label: 'Text Generation' },
        { value: 'vision', label: 'Vision' },
        { value: 'embedding', label: 'Embedding' },
      ]}
    />

    <SelectField
      label="Model"
      value={config.model || 'gemini-1.5-pro'}
      onChange={(v) => updateConfig('model', v)}
      options={[
        { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
        { value: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash-8B' },
        { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro' },
      ]}
    />

    {config.resource === 'text' && (
      <>
        <TextareaField
          label="System Instruction"
          value={config.systemInstruction || ''}
          onChange={(v) => updateConfig('systemInstruction', v)}
          rows={3}
        />

        <ExpressionField
          label="Prompt"
          value={config.prompt || ''}
          onChange={(v) => updateConfig('prompt', v)}
          required
        />

        <SwitchField
          label="Include History"
          value={config.includeHistory || false}
          onChange={(v) => updateConfig('includeHistory', v)}
        />

        {config.includeHistory && (
          <FixedCollectionField
            label="Chat History"
            value={config.history || []}
            onChange={(v) => updateConfig('history', v)}
            fields={[
              { name: 'role', displayName: 'Role', type: 'options', options: [
                { value: 'user', label: 'User' },
                { value: 'model', label: 'Model' },
              ]},
              { name: 'parts', displayName: 'Text', type: 'string' },
            ]}
            sortable
          />
        )}
      </>
    )}

    {config.resource === 'vision' && (
      <>
        <ExpressionField
          label="Prompt"
          value={config.prompt || ''}
          onChange={(v) => updateConfig('prompt', v)}
          placeholder="Describe this image..."
          required
        />

        <SelectField
          label="Image Input Type"
          value={config.imageInputType || 'url'}
          onChange={(v) => updateConfig('imageInputType', v)}
          options={[
            { value: 'url', label: 'Image URL' },
            { value: 'base64', label: 'Base64 Data' },
          ]}
        />

        {config.imageInputType === 'url' && (
          <ExpressionField
            label="Image URL"
            value={config.imageUrl || ''}
            onChange={(v) => updateConfig('imageUrl', v)}
            required
          />
        )}
      </>
    )}

    {config.resource === 'embedding' && (
      <>
        <SelectField
          label="Model"
          value={config.embeddingModel || 'text-embedding-004'}
          onChange={(v) => updateConfig('embeddingModel', v)}
          options={[
            { value: 'text-embedding-004', label: 'text-embedding-004' },
            { value: 'embedding-001', label: 'embedding-001' },
          ]}
        />

        <ExpressionField
          label="Text"
          value={config.text || ''}
          onChange={(v) => updateConfig('text', v)}
          required
        />
      </>
    )}

    <CollectionField
      label="Generation Config"
      value={config.generationConfig || {}}
      onChange={(v) => updateConfig('generationConfig', v)}
      options={[
        { name: 'temperature', displayName: 'Temperature', type: 'number', default: 0.7 },
        { name: 'maxOutputTokens', displayName: 'Max Output Tokens', type: 'number', default: 8192 },
        { name: 'topP', displayName: 'Top P', type: 'number', default: 0.95 },
        { name: 'topK', displayName: 'Top K', type: 'number', default: 40 },
        { name: 'candidateCount', displayName: 'Candidate Count', type: 'number', default: 1 },
        { name: 'stopSequences', displayName: 'Stop Sequences (comma-separated)', type: 'string' },
      ]}
    />

    <CollectionField
      label="Safety Settings"
      value={config.safetySettings || {}}
      onChange={(v) => updateConfig('safetySettings', v)}
      options={[
        { name: 'harassmentThreshold', displayName: 'Harassment', type: 'options', options: [
          { value: 'BLOCK_NONE', label: 'Block None' },
          { value: 'BLOCK_LOW_AND_ABOVE', label: 'Block Low+' },
          { value: 'BLOCK_MEDIUM_AND_ABOVE', label: 'Block Medium+' },
          { value: 'BLOCK_ONLY_HIGH', label: 'Block High Only' },
        ]},
        { name: 'dangerousContentThreshold', displayName: 'Dangerous Content', type: 'options', options: [
          { value: 'BLOCK_NONE', label: 'Block None' },
          { value: 'BLOCK_LOW_AND_ABOVE', label: 'Block Low+' },
          { value: 'BLOCK_MEDIUM_AND_ABOVE', label: 'Block Medium+' },
          { value: 'BLOCK_ONLY_HIGH', label: 'Block High Only' },
        ]},
      ]}
    />
  </div>
);

// ============================================
// HUGGING FACE CONFIG
// ============================================

export const HuggingFaceConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Hugging Face Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Hugging Face API Token"
      required
    />

    <SelectField
      label="Task"
      value={config.task || 'text-generation'}
      onChange={(v) => updateConfig('task', v)}
      options={[
        { value: 'text-generation', label: 'Text Generation' },
        { value: 'text-classification', label: 'Text Classification' },
        { value: 'summarization', label: 'Summarization' },
        { value: 'translation', label: 'Translation' },
        { value: 'question-answering', label: 'Question Answering' },
        { value: 'fill-mask', label: 'Fill Mask' },
        { value: 'sentence-similarity', label: 'Sentence Similarity' },
        { value: 'feature-extraction', label: 'Feature Extraction (Embeddings)' },
        { value: 'image-classification', label: 'Image Classification' },
        { value: 'object-detection', label: 'Object Detection' },
        { value: 'image-to-text', label: 'Image to Text' },
        { value: 'text-to-image', label: 'Text to Image' },
        { value: 'automatic-speech-recognition', label: 'Speech Recognition' },
      ]}
      required
    />

    <TextField
      label="Model"
      value={config.model || ''}
      onChange={(v) => updateConfig('model', v)}
      placeholder="meta-llama/Meta-Llama-3-8B-Instruct"
      description="Hugging Face model ID"
      required
    />

    {config.task === 'text-generation' && (
      <>
        <TextareaField
          label="Prompt"
          value={config.inputs || ''}
          onChange={(v) => updateConfig('inputs', v)}
          rows={4}
          required
        />

        <CollectionField
          label="Parameters"
          value={config.parameters || {}}
          onChange={(v) => updateConfig('parameters', v)}
          options={[
            { name: 'max_new_tokens', displayName: 'Max New Tokens', type: 'number', default: 256 },
            { name: 'temperature', displayName: 'Temperature', type: 'number', default: 0.7 },
            { name: 'top_p', displayName: 'Top P', type: 'number', default: 0.9 },
            { name: 'top_k', displayName: 'Top K', type: 'number' },
            { name: 'repetition_penalty', displayName: 'Repetition Penalty', type: 'number', default: 1.0 },
            { name: 'do_sample', displayName: 'Do Sample', type: 'boolean', default: true },
            { name: 'return_full_text', displayName: 'Return Full Text', type: 'boolean' },
          ]}
        />
      </>
    )}

    {config.task === 'text-classification' && (
      <TextareaField
        label="Text to Classify"
        value={config.inputs || ''}
        onChange={(v) => updateConfig('inputs', v)}
        required
      />
    )}

    {config.task === 'summarization' && (
      <>
        <TextareaField
          label="Text to Summarize"
          value={config.inputs || ''}
          onChange={(v) => updateConfig('inputs', v)}
          rows={6}
          required
        />
        <CollectionField
          label="Parameters"
          value={config.parameters || {}}
          onChange={(v) => updateConfig('parameters', v)}
          options={[
            { name: 'max_length', displayName: 'Max Length', type: 'number' },
            { name: 'min_length', displayName: 'Min Length', type: 'number' },
          ]}
        />
      </>
    )}

    {config.task === 'translation' && (
      <>
        <TextareaField
          label="Text to Translate"
          value={config.inputs || ''}
          onChange={(v) => updateConfig('inputs', v)}
          required
        />
        <InfoBox type="info" title="Translation">
          Use appropriate translation model (e.g., Helsinki-NLP/opus-mt-en-fr)
        </InfoBox>
      </>
    )}

    {config.task === 'question-answering' && (
      <>
        <TextareaField
          label="Context"
          value={config.context || ''}
          onChange={(v) => updateConfig('context', v)}
          rows={4}
          required
        />
        <TextField
          label="Question"
          value={config.question || ''}
          onChange={(v) => updateConfig('question', v)}
          required
        />
      </>
    )}

    {config.task === 'text-to-image' && (
      <>
        <TextareaField
          label="Prompt"
          value={config.inputs || ''}
          onChange={(v) => updateConfig('inputs', v)}
          placeholder="A beautiful landscape painting..."
          rows={3}
          required
        />
        <CollectionField
          label="Parameters"
          value={config.parameters || {}}
          onChange={(v) => updateConfig('parameters', v)}
          options={[
            { name: 'negative_prompt', displayName: 'Negative Prompt', type: 'string' },
            { name: 'width', displayName: 'Width', type: 'number', default: 512 },
            { name: 'height', displayName: 'Height', type: 'number', default: 512 },
            { name: 'num_inference_steps', displayName: 'Inference Steps', type: 'number', default: 50 },
            { name: 'guidance_scale', displayName: 'Guidance Scale', type: 'number', default: 7.5 },
          ]}
        />
      </>
    )}

    <SwitchField
      label="Wait for Model"
      value={config.waitForModel || true}
      onChange={(v) => updateConfig('waitForModel', v)}
      description="Wait if model is loading"
    />
  </div>
);

// ============================================
// STABILITY AI CONFIG
// ============================================

export const StabilityAIConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Stability AI Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Stability AI API Key"
      required
    />

    <SelectField
      label="Operation"
      value={config.operation || 'textToImage'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'textToImage', label: 'Text to Image' },
        { value: 'imageToImage', label: 'Image to Image' },
        { value: 'upscale', label: 'Upscale Image' },
        { value: 'inpaint', label: 'Inpainting' },
      ]}
    />

    {config.operation === 'textToImage' && (
      <>
        <SelectField
          label="Model"
          value={config.model || 'stable-diffusion-xl-1024-v1-0'}
          onChange={(v) => updateConfig('model', v)}
          options={[
            { value: 'stable-diffusion-xl-1024-v1-0', label: 'SDXL 1.0' },
            { value: 'stable-diffusion-v1-6', label: 'SD 1.6' },
            { value: 'stable-diffusion-xl-beta-v2-2-2', label: 'SDXL Beta' },
          ]}
        />

        <TextareaField
          label="Prompt"
          value={config.prompt || ''}
          onChange={(v) => updateConfig('prompt', v)}
          rows={3}
          required
        />

        <TextareaField
          label="Negative Prompt"
          value={config.negativePrompt || ''}
          onChange={(v) => updateConfig('negativePrompt', v)}
          placeholder="blurry, low quality, distorted..."
          rows={2}
        />

        <SelectField
          label="Size"
          value={config.size || '1024x1024'}
          onChange={(v) => updateConfig('size', v)}
          options={[
            { value: '1024x1024', label: '1024x1024' },
            { value: '1152x896', label: '1152x896' },
            { value: '896x1152', label: '896x1152' },
            { value: '1216x832', label: '1216x832' },
            { value: '832x1216', label: '832x1216' },
            { value: '512x512', label: '512x512' },
          ]}
        />

        <CollectionField
          label="Generation Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'samples', displayName: 'Number of Images', type: 'number', default: 1 },
            { name: 'steps', displayName: 'Steps', type: 'number', default: 30 },
            { name: 'cfgScale', displayName: 'CFG Scale', type: 'number', default: 7 },
            { name: 'seed', displayName: 'Seed', type: 'number', description: '0 for random' },
            { name: 'sampler', displayName: 'Sampler', type: 'options', options: [
              { value: 'DDIM', label: 'DDIM' },
              { value: 'DDPM', label: 'DDPM' },
              { value: 'K_DPMPP_2M', label: 'DPM++ 2M' },
              { value: 'K_DPMPP_2S_ANCESTRAL', label: 'DPM++ 2S Ancestral' },
              { value: 'K_DPM_2', label: 'DPM 2' },
              { value: 'K_EULER', label: 'Euler' },
              { value: 'K_EULER_ANCESTRAL', label: 'Euler Ancestral' },
              { value: 'K_HEUN', label: 'Heun' },
              { value: 'K_LMS', label: 'LMS' },
            ]},
            { name: 'stylePreset', displayName: 'Style Preset', type: 'options', options: [
              { value: 'enhance', label: 'Enhance' },
              { value: 'anime', label: 'Anime' },
              { value: 'photographic', label: 'Photographic' },
              { value: 'digital-art', label: 'Digital Art' },
              { value: 'comic-book', label: 'Comic Book' },
              { value: 'fantasy-art', label: 'Fantasy Art' },
              { value: 'line-art', label: 'Line Art' },
              { value: 'analog-film', label: 'Analog Film' },
              { value: 'neon-punk', label: 'Neon Punk' },
              { value: 'isometric', label: 'Isometric' },
              { value: 'low-poly', label: 'Low Poly' },
              { value: 'origami', label: 'Origami' },
              { value: 'modeling-compound', label: 'Modeling Compound' },
              { value: 'cinematic', label: 'Cinematic' },
              { value: '3d-model', label: '3D Model' },
              { value: 'pixel-art', label: 'Pixel Art' },
              { value: 'tile-texture', label: 'Tile Texture' },
            ]},
          ]}
        />
      </>
    )}

    {config.operation === 'imageToImage' && (
      <>
        <TextareaField
          label="Prompt"
          value={config.prompt || ''}
          onChange={(v) => updateConfig('prompt', v)}
          required
        />
        <CollectionField
          label="Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'imageStrength', displayName: 'Image Strength', type: 'number', default: 0.35 },
            { name: 'steps', displayName: 'Steps', type: 'number', default: 30 },
            { name: 'cfgScale', displayName: 'CFG Scale', type: 'number', default: 7 },
          ]}
        />
        <InfoBox type="info" title="Image Input">
          Binary image data from previous node will be used
        </InfoBox>
      </>
    )}

    {config.operation === 'upscale' && (
      <>
        <SelectField
          label="Upscale Engine"
          value={config.engine || 'esrgan-v1-x2plus'}
          onChange={(v) => updateConfig('engine', v)}
          options={[
            { value: 'esrgan-v1-x2plus', label: 'ESRGAN 2x' },
            { value: 'stable-diffusion-x4-latent-upscaler', label: 'SD x4 Latent Upscaler' },
          ]}
        />
        <InfoBox type="info" title="Upscale">
          Binary image data from previous node will be upscaled
        </InfoBox>
      </>
    )}
  </div>
);

// ============================================
// PERPLEXITY CONFIG
// ============================================

export const PerplexityConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => (
  <div className="space-y-4">
    <CredentialField
      label="Perplexity Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Perplexity API Key"
      required
    />

    <SelectField
      label="Model"
      value={config.model || 'llama-3.1-sonar-small-128k-online'}
      onChange={(v) => updateConfig('model', v)}
      options={[
        { value: 'llama-3.1-sonar-small-128k-online', label: 'Sonar Small (Online)' },
        { value: 'llama-3.1-sonar-large-128k-online', label: 'Sonar Large (Online)' },
        { value: 'llama-3.1-sonar-huge-128k-online', label: 'Sonar Huge (Online)' },
        { value: 'llama-3.1-sonar-small-128k-chat', label: 'Sonar Small (Chat)' },
        { value: 'llama-3.1-sonar-large-128k-chat', label: 'Sonar Large (Chat)' },
        { value: 'llama-3.1-8b-instruct', label: 'Llama 3.1 8B Instruct' },
        { value: 'llama-3.1-70b-instruct', label: 'Llama 3.1 70B Instruct' },
      ]}
    />

    <TextareaField
      label="System Prompt"
      value={config.systemPrompt || ''}
      onChange={(v) => updateConfig('systemPrompt', v)}
      placeholder="Be precise and concise."
      rows={2}
    />

    <ExpressionField
      label="User Query"
      value={config.query || ''}
      onChange={(v) => updateConfig('query', v)}
      required
    />

    <SwitchField
      label="Include Chat History"
      value={config.includeHistory || false}
      onChange={(v) => updateConfig('includeHistory', v)}
    />

    {config.includeHistory && (
      <FixedCollectionField
        label="Messages"
        value={config.messages || []}
        onChange={(v) => updateConfig('messages', v)}
        fields={[
          { name: 'role', displayName: 'Role', type: 'options', options: [
            { value: 'user', label: 'User' },
            { value: 'assistant', label: 'Assistant' },
          ]},
          { name: 'content', displayName: 'Content', type: 'string' },
        ]}
        sortable
      />
    )}

    <CollectionField
      label="Options"
      value={config.options || {}}
      onChange={(v) => updateConfig('options', v)}
      options={[
        { name: 'temperature', displayName: 'Temperature', type: 'number', default: 0.2 },
        { name: 'maxTokens', displayName: 'Max Tokens', type: 'number' },
        { name: 'topP', displayName: 'Top P', type: 'number', default: 0.9 },
        { name: 'topK', displayName: 'Top K', type: 'number' },
        { name: 'presencePenalty', displayName: 'Presence Penalty', type: 'number' },
        { name: 'frequencyPenalty', displayName: 'Frequency Penalty', type: 'number' },
        { name: 'returnCitations', displayName: 'Return Citations', type: 'boolean', default: true },
        { name: 'returnImages', displayName: 'Return Images', type: 'boolean' },
        { name: 'returnRelatedQuestions', displayName: 'Return Related Questions', type: 'boolean' },
      ]}
    />
  </div>
);

// ============================================
// EXPORTS
// ============================================

export const AIAppConfigs: Record<string, React.FC<AppConfigProps>> = {
  // OpenAI
  openai_advanced: OpenAIAdvancedConfig,
  openai: OpenAIAdvancedConfig,
  gpt: OpenAIAdvancedConfig,
  chatgpt: OpenAIAdvancedConfig,
  dalle: OpenAIAdvancedConfig,
  whisper: OpenAIAdvancedConfig,
  
  // Anthropic
  anthropic: AnthropicConfig,
  claude: AnthropicConfig,
  anthropic_claude: AnthropicConfig,
  
  // Google Gemini
  google_gemini: GoogleGeminiConfig,
  gemini: GoogleGeminiConfig,
  google_ai: GoogleGeminiConfig,
  
  // Hugging Face
  huggingface: HuggingFaceConfig,
  hugging_face: HuggingFaceConfig,
  hf: HuggingFaceConfig,
  
  // Stability AI
  stability_ai: StabilityAIConfig,
  stabilityai: StabilityAIConfig,
  stable_diffusion: StabilityAIConfig,
  
  // Perplexity
  perplexity: PerplexityConfig,
  perplexity_ai: PerplexityConfig,
};

export default AIAppConfigs;
