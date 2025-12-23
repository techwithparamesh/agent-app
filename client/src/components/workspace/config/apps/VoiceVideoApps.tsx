/**
 * Voice, Video & Scheduling App Configurations
 * 
 * n8n-style configurations for:
 * - Twilio Voice
 * - Zoom
 * - Google Meet
 * - ElevenLabs
 * - Calendly
 */

import React from "react";
import {
  TextField,
  TextareaField,
  SelectField,
  NumberField,
  SwitchField,
  CredentialField,
  ExpressionField,
  CollectionField,
  DateTimeField,
} from "../FieldComponents";

interface AppConfigProps {
  config: Record<string, any>;
  updateConfig: (key: string, value: any) => void;
}

// ============================================
// TWILIO VOICE CONFIG
// ============================================

export const TwilioVoiceConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  const callType = config.callType || '';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Twilio Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Twilio API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'call'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'call', label: 'Voice Call' },
        { value: 'recording', label: 'Recording' },
        { value: 'transcription', label: 'Transcription' },
      ]}
      required
    />

    {resource === 'call' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Make Call' },
            { value: 'get', label: 'Get Call' },
            { value: 'getAll', label: 'Get All Calls' },
            { value: 'update', label: 'Update Call' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="From Number"
              value={config.from || ''}
              onChange={(v) => updateConfig('from', v)}
              placeholder="+1234567890"
              description="Your Twilio phone number"
              required
            />

            <ExpressionField
              label="To Number"
              value={config.to || ''}
              onChange={(v) => updateConfig('to', v)}
              placeholder="+1234567890"
              required
            />

            <SelectField
              label="Call Type"
              value={config.callType || 'twiml'}
              onChange={(v) => updateConfig('callType', v)}
              options={[
                { value: 'twiml', label: 'TwiML Instructions' },
                { value: 'url', label: 'TwiML URL' },
                { value: 'say', label: 'Text-to-Speech' },
              ]}
            />

            {config.callType === 'twiml' && (
              <TextareaField
                label="TwiML"
                value={config.twiml || ''}
                onChange={(v) => updateConfig('twiml', v)}
                placeholder='<Response><Say>Hello World</Say></Response>'
                rows={6}
              />
            )}

            {config.callType === 'url' && (
              <ExpressionField
                label="TwiML URL"
                value={config.url || ''}
                onChange={(v) => updateConfig('url', v)}
                placeholder="https://example.com/twiml"
              />
            )}

            {config.callType === 'say' && (
              <>
                <TextareaField
                  label="Message"
                  value={config.message || ''}
                  onChange={(v) => updateConfig('message', v)}
                  rows={3}
                />

                <SelectField
                  label="Voice"
                  value={config.voice || 'alice'}
                  onChange={(v) => updateConfig('voice', v)}
                  options={[
                    { value: 'alice', label: 'Alice (English)' },
                    { value: 'man', label: 'Man' },
                    { value: 'woman', label: 'Woman' },
                    { value: 'Polly.Joanna', label: 'Polly Joanna' },
                    { value: 'Polly.Matthew', label: 'Polly Matthew' },
                  ]}
                />
              </>
            )}

            <CollectionField
              label="Options"
              value={config.options || {}}
              onChange={(v) => updateConfig('options', v)}
              options={[
                { name: 'record', displayName: 'Record Call', type: 'boolean' },
                { name: 'timeout', displayName: 'Timeout (seconds)', type: 'number' },
                { name: 'machineDetection', displayName: 'Answering Machine Detection', type: 'options', options: [
                  { value: 'Enable', label: 'Enable' },
                  { value: 'DetectMessageEnd', label: 'Detect Message End' },
                ]},
                { name: 'statusCallback', displayName: 'Status Callback URL', type: 'string' },
              ]}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update') && (
          <ExpressionField
            label="Call SID"
            value={config.callSid || ''}
            onChange={(v) => updateConfig('callSid', v)}
            placeholder="CA..."
            required
          />
        )}

        {operation === 'update' && (
          <SelectField
            label="Action"
            value={config.action || 'complete'}
            onChange={(v) => updateConfig('action', v)}
            options={[
              { value: 'complete', label: 'End Call' },
              { value: 'hold', label: 'Put on Hold' },
            ]}
          />
        )}
      </>
    )}

    {resource === 'recording' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Recording' },
            { value: 'getAll', label: 'Get All Recordings' },
            { value: 'delete', label: 'Delete Recording' },
          ]}
        />

        {(operation === 'get' || config.operation === 'delete') && (
          <ExpressionField
            label="Recording SID"
            value={config.recordingSid || ''}
            onChange={(v) => updateConfig('recordingSid', v)}
            placeholder="RE..."
            required
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// ZOOM CONFIG
// ============================================

export const ZoomConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Zoom Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Zoom OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'meeting'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'meeting', label: 'Meeting' },
        { value: 'webinar', label: 'Webinar' },
        { value: 'user', label: 'User' },
        { value: 'recording', label: 'Recording' },
      ]}
      required
    />

    {resource === 'meeting' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Meeting' },
            { value: 'get', label: 'Get Meeting' },
            { value: 'getAll', label: 'Get All Meetings' },
            { value: 'update', label: 'Update Meeting' },
            { value: 'delete', label: 'Delete Meeting' },
          ]}
        />

        {operation === 'create' && (
          <>
            <ExpressionField
              label="Topic"
              value={config.topic || ''}
              onChange={(v) => updateConfig('topic', v)}
              required
            />

            <SelectField
              label="Meeting Type"
              value={config.type || '2'}
              onChange={(v) => updateConfig('type', v)}
              options={[
                { value: '1', label: 'Instant Meeting' },
                { value: '2', label: 'Scheduled Meeting' },
                { value: '3', label: 'Recurring (No Fixed Time)' },
                { value: '8', label: 'Recurring (Fixed Time)' },
              ]}
            />

            {(config.type === '2' || config.type === '8') && (
              <DateTimeField
                label="Start Time"
                value={config.startTime || ''}
                onChange={(v) => updateConfig('startTime', v)}
                required
              />
            )}

            <NumberField
              label="Duration (minutes)"
              value={config.duration || 60}
              onChange={(v) => updateConfig('duration', v)}
            />

            <CollectionField
              label="Settings"
              value={config.settings || {}}
              onChange={(v) => updateConfig('settings', v)}
              options={[
                { name: 'hostVideo', displayName: 'Host Video On', type: 'boolean' },
                { name: 'participantVideo', displayName: 'Participant Video On', type: 'boolean' },
                { name: 'joinBeforeHost', displayName: 'Join Before Host', type: 'boolean' },
                { name: 'muteUponEntry', displayName: 'Mute on Entry', type: 'boolean' },
                { name: 'waitingRoom', displayName: 'Waiting Room', type: 'boolean' },
                { name: 'autoRecording', displayName: 'Auto Recording', type: 'options', options: [
                  { value: 'none', label: 'None' },
                  { value: 'local', label: 'Local' },
                  { value: 'cloud', label: 'Cloud' },
                ]},
              ]}
            />

            <TextField
              label="Password"
              value={config.password || ''}
              onChange={(v) => updateConfig('password', v)}
              description="Meeting password (optional)"
            />

            <TextareaField
              label="Agenda"
              value={config.agenda || ''}
              onChange={(v) => updateConfig('agenda', v)}
              rows={3}
            />
          </>
        )}

        {(operation === 'get' || config.operation === 'update' || config.operation === 'delete') && (
          <ExpressionField
            label="Meeting ID"
            value={config.meetingId || ''}
            onChange={(v) => updateConfig('meetingId', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'recording' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Recording' },
            { value: 'getAll', label: 'Get All Recordings' },
            { value: 'delete', label: 'Delete Recording' },
          ]}
        />

        {(operation === 'get' || config.operation === 'delete') && (
          <ExpressionField
            label="Meeting ID"
            value={config.meetingId || ''}
            onChange={(v) => updateConfig('meetingId', v)}
            required
          />
        )}
      </>
    )}
  </div>
  );
};

// ============================================
// GOOGLE MEET CONFIG
// ============================================

export const GoogleMeetConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Google Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Google OAuth2"
      required
    />

    <SelectField
      label="Operation"
      value={config.operation || 'create'}
      onChange={(v) => updateConfig('operation', v)}
      options={[
        { value: 'create', label: 'Create Meeting (via Calendar)' },
        { value: 'get', label: 'Get Meeting Details' },
      ]}
      required
    />

    {operation === 'create' && (
      <>
        <ExpressionField
          label="Meeting Title"
          value={config.summary || ''}
          onChange={(v) => updateConfig('summary', v)}
          required
        />

        <DateTimeField
          label="Start Time"
          value={config.startTime || ''}
          onChange={(v) => updateConfig('startTime', v)}
          required
        />

        <DateTimeField
          label="End Time"
          value={config.endTime || ''}
          onChange={(v) => updateConfig('endTime', v)}
          required
        />

        <TextareaField
          label="Description"
          value={config.description || ''}
          onChange={(v) => updateConfig('description', v)}
          rows={3}
        />

        <TextField
          label="Attendees (comma-separated emails)"
          value={config.attendees || ''}
          onChange={(v) => updateConfig('attendees', v)}
          placeholder="email1@example.com, email2@example.com"
        />

        <CollectionField
          label="Options"
          value={config.options || {}}
          onChange={(v) => updateConfig('options', v)}
          options={[
            { name: 'sendInvites', displayName: 'Send Email Invites', type: 'boolean' },
            { name: 'guestsCanModify', displayName: 'Guests Can Modify', type: 'boolean' },
            { name: 'guestsCanInvite', displayName: 'Guests Can Invite Others', type: 'boolean' },
          ]}
        />
      </>
    )}

    {operation === 'get' && (
      <ExpressionField
        label="Event ID"
        value={config.eventId || ''}
        onChange={(v) => updateConfig('eventId', v)}
        required
      />
    )}
  </div>
  );
};

// ============================================
// ELEVENLABS CONFIG
// ============================================

export const ElevenLabsConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="ElevenLabs API Key"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="ElevenLabs API"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'textToSpeech'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'textToSpeech', label: 'Text to Speech' },
        { value: 'speechToSpeech', label: 'Speech to Speech' },
        { value: 'voice', label: 'Voice' },
        { value: 'voiceClone', label: 'Voice Clone' },
      ]}
      required
    />

    {resource === 'textToSpeech' && (
      <>
        <ExpressionField
          label="Voice ID"
          value={config.voiceId || ''}
          onChange={(v) => updateConfig('voiceId', v)}
          placeholder="21m00Tcm4TlvDq8ikWAM"
          description="Voice ID from ElevenLabs"
          required
        />

        <TextareaField
          label="Text"
          value={config.text || ''}
          onChange={(v) => updateConfig('text', v)}
          rows={4}
          required
        />

        <SelectField
          label="Model"
          value={config.model || 'eleven_multilingual_v2'}
          onChange={(v) => updateConfig('model', v)}
          options={[
            { value: 'eleven_multilingual_v2', label: 'Multilingual v2' },
            { value: 'eleven_turbo_v2', label: 'Turbo v2 (Fast)' },
            { value: 'eleven_monolingual_v1', label: 'English v1' },
          ]}
        />

        <CollectionField
          label="Voice Settings"
          value={config.voiceSettings || {}}
          onChange={(v) => updateConfig('voiceSettings', v)}
          options={[
            { name: 'stability', displayName: 'Stability (0-1)', type: 'number' },
            { name: 'similarityBoost', displayName: 'Similarity Boost (0-1)', type: 'number' },
            { name: 'style', displayName: 'Style (0-1)', type: 'number' },
            { name: 'useSpeakerBoost', displayName: 'Speaker Boost', type: 'boolean' },
          ]}
        />

        <SelectField
          label="Output Format"
          value={config.outputFormat || 'mp3_44100_128'}
          onChange={(v) => updateConfig('outputFormat', v)}
          options={[
            { value: 'mp3_44100_128', label: 'MP3 44.1kHz 128kbps' },
            { value: 'mp3_44100_192', label: 'MP3 44.1kHz 192kbps' },
            { value: 'pcm_16000', label: 'PCM 16kHz' },
            { value: 'pcm_22050', label: 'PCM 22.05kHz' },
            { value: 'pcm_44100', label: 'PCM 44.1kHz' },
          ]}
        />
      </>
    )}

    {resource === 'voice' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'getAll'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'getAll', label: 'Get All Voices' },
            { value: 'get', label: 'Get Voice' },
          ]}
        />

        {operation === 'get' && (
          <ExpressionField
            label="Voice ID"
            value={config.voiceId || ''}
            onChange={(v) => updateConfig('voiceId', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'voiceClone' && (
      <>
        <ExpressionField
          label="Voice Name"
          value={config.name || ''}
          onChange={(v) => updateConfig('name', v)}
          required
        />

        <TextField
          label="Description"
          value={config.description || ''}
          onChange={(v) => updateConfig('description', v)}
        />

        <ExpressionField
          label="Audio File URL"
          value={config.audioUrl || ''}
          onChange={(v) => updateConfig('audioUrl', v)}
          description="URL to audio sample for cloning"
          required
        />
      </>
    )}
  </div>
  );
};

// ============================================
// CALENDLY CONFIG
// ============================================

export const CalendlyConfig: React.FC<AppConfigProps> = ({ config, updateConfig }) => {
  const resource = config.resource || 'message';
  const operation = config.operation || 'send';
  
  return (
  <div className="space-y-4">
    <CredentialField
      label="Calendly Credentials"
      value={config.credential || ''}
      onChange={(v) => updateConfig('credential', v)}
      credentialType="Calendly OAuth2"
      required
    />

    <SelectField
      label="Resource"
      value={config.resource || 'event'}
      onChange={(v) => updateConfig('resource', v)}
      options={[
        { value: 'event', label: 'Event' },
        { value: 'eventType', label: 'Event Type' },
        { value: 'invitee', label: 'Invitee' },
        { value: 'schedulingLink', label: 'Scheduling Link' },
      ]}
      required
    />

    {resource === 'event' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'get'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'get', label: 'Get Event' },
            { value: 'getAll', label: 'Get All Events' },
            { value: 'cancel', label: 'Cancel Event' },
          ]}
        />

        {operation === 'get' && (
          <ExpressionField
            label="Event UUID"
            value={config.eventUuid || ''}
            onChange={(v) => updateConfig('eventUuid', v)}
            required
          />
        )}

        {operation === 'getAll' && (
          <CollectionField
            label="Filters"
            value={config.filters || {}}
            onChange={(v) => updateConfig('filters', v)}
            options={[
              { name: 'status', displayName: 'Status', type: 'options', options: [
                { value: 'active', label: 'Active' },
                { value: 'canceled', label: 'Canceled' },
              ]},
              { name: 'minStartTime', displayName: 'Min Start Time', type: 'string' },
              { name: 'maxStartTime', displayName: 'Max Start Time', type: 'string' },
              { name: 'count', displayName: 'Limit', type: 'number' },
            ]}
          />
        )}

        {operation === 'cancel' && (
          <>
            <ExpressionField
              label="Event UUID"
              value={config.eventUuid || ''}
              onChange={(v) => updateConfig('eventUuid', v)}
              required
            />

            <TextField
              label="Cancellation Reason"
              value={config.reason || ''}
              onChange={(v) => updateConfig('reason', v)}
            />
          </>
        )}
      </>
    )}

    {resource === 'eventType' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'getAll'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'getAll', label: 'Get All Event Types' },
            { value: 'get', label: 'Get Event Type' },
          ]}
        />

        {operation === 'get' && (
          <ExpressionField
            label="Event Type UUID"
            value={config.eventTypeUuid || ''}
            onChange={(v) => updateConfig('eventTypeUuid', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'invitee' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'getAll'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'getAll', label: 'Get All Invitees' },
            { value: 'get', label: 'Get Invitee' },
          ]}
        />

        <ExpressionField
          label="Event UUID"
          value={config.eventUuid || ''}
          onChange={(v) => updateConfig('eventUuid', v)}
          description="Get invitees for this event"
          required
        />

        {operation === 'get' && (
          <ExpressionField
            label="Invitee UUID"
            value={config.inviteeUuid || ''}
            onChange={(v) => updateConfig('inviteeUuid', v)}
            required
          />
        )}
      </>
    )}

    {resource === 'schedulingLink' && (
      <>
        <SelectField
          label="Operation"
          value={config.operation || 'create'}
          onChange={(v) => updateConfig('operation', v)}
          options={[
            { value: 'create', label: 'Create Scheduling Link' },
          ]}
        />

        <ExpressionField
          label="Event Type UUID"
          value={config.eventTypeUuid || ''}
          onChange={(v) => updateConfig('eventTypeUuid', v)}
          required
        />

        <NumberField
          label="Max Uses"
          value={config.maxUses || 1}
          onChange={(v) => updateConfig('maxUses', v)}
          description="Maximum number of bookings for this link"
        />
      </>
    )}
  </div>
  );
};

// ============================================
// EXPORTS
// ============================================

export const VoiceVideoAppConfigs: Record<string, React.FC<AppConfigProps>> = {
  twilio_voice: TwilioVoiceConfig,
  twilio_call: TwilioVoiceConfig,
  
  zoom: ZoomConfig,
  zoom_meeting: ZoomConfig,
  
  google_meet: GoogleMeetConfig,
  gmeet: GoogleMeetConfig,
  
  elevenlabs: ElevenLabsConfig,
  eleven_labs: ElevenLabsConfig,
  tts: ElevenLabsConfig,
  
  calendly: CalendlyConfig,
  calendly_schedule: CalendlyConfig,
};

export default VoiceVideoAppConfigs;
