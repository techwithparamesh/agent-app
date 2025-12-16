/**
 * WhatsApp Agent Types and Interfaces
 * Core type definitions for the WhatsApp Agent Runtime
 */

// ========== WHATSAPP WEBHOOK TYPES ==========

export interface WhatsAppWebhookPayload {
  object: 'whatsapp_business_account';
  entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  value: WhatsAppValue;
  field: string;
}

export interface WhatsAppValue {
  messaging_product: string;
  metadata: WhatsAppMetadata;
  contacts?: WhatsAppContact[];
  messages?: WhatsAppIncomingMessage[];
  statuses?: WhatsAppStatus[];
}

export interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WhatsAppIncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'interactive' | 'button';
  text?: {
    body: string;
  };
  image?: WhatsAppMedia;
  document?: WhatsAppMedia;
  audio?: WhatsAppMedia;
  video?: WhatsAppMedia;
  location?: WhatsAppLocation;
  interactive?: WhatsAppInteractive;
  button?: WhatsAppButtonReply;
  context?: {
    from: string;
    id: string;
  };
}

export interface WhatsAppMedia {
  id: string;
  mime_type: string;
  sha256?: string;
  caption?: string;
  filename?: string;
}

export interface WhatsAppLocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface WhatsAppInteractive {
  type: 'button_reply' | 'list_reply';
  button_reply?: {
    id: string;
    title: string;
  };
  list_reply?: {
    id: string;
    title: string;
    description?: string;
  };
}

export interface WhatsAppButtonReply {
  text: string;
  payload: string;
}

export interface WhatsAppStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    origin: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: WhatsAppError[];
}

export interface WhatsAppError {
  code: number;
  title: string;
  message: string;
  error_data: {
    details: string;
  };
}

// ========== NORMALIZED INTERNAL EVENTS ==========

export interface NormalizedMessage {
  messageId: string;
  from: string;
  phoneNumberId: string;
  businessPhoneNumber: string;
  timestamp: Date;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  interactiveReply?: {
    type: 'button' | 'list';
    id: string;
    title: string;
  };
  context?: {
    from: string;
    messageId: string;
  };
  userName?: string;
}

export type MessageType = 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'interactive' | 'button';

// ========== AI DECISION TYPES ==========

export interface AIDecision {
  intent: Intent;
  entities: ExtractedEntities;
  confidence: number;
  requiresAction: boolean;
  suggestedTool?: ToolName;
  responseHint?: string;
}

export type Intent =
  | 'greeting'
  | 'book_appointment'
  | 'check_availability'
  | 'cancel_appointment'
  | 'reschedule_appointment'
  | 'check_status'
  | 'ask_question'
  | 'provide_info'
  | 'make_order'
  | 'track_order'
  | 'billing_inquiry'
  | 'human_handoff'
  | 'feedback'
  | 'goodbye'
  | 'unknown';

export interface ExtractedEntities {
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  name?: string;
  phone?: string;
  email?: string;
  serviceType?: string;
  quantity?: number;
  location?: string;
  appointmentId?: string;
  orderId?: string;
  [key: string]: any;
}

// ========== TOOL TYPES ==========

export type ToolName =
  | 'check_availability'
  | 'book_appointment'
  | 'cancel_appointment'
  | 'reschedule_appointment'
  | 'capture_lead'
  | 'human_handoff'
  | 'get_business_info'
  | 'search_knowledge'
  | 'get_appointment_status'
  | 'send_reminder';

export interface ToolInput {
  agentId: string;
  conversationId: string;
  [key: string]: any;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
  nextAction?: ToolName;
  options?: any[];
}

// Check Availability Input/Output
export interface CheckAvailabilityInput extends ToolInput {
  date: string;
  serviceType?: string;
}

export interface AvailableSlot {
  date: string;
  time: string;
  endTime: string;
  serviceType?: string;
  available: boolean;
}

export interface CheckAvailabilityResult extends ToolResult {
  data?: {
    requestedDate: string;
    availableSlots: AvailableSlot[];
    nextAvailableDates?: string[];
  };
}

// Book Appointment Input/Output
export interface BookAppointmentInput extends ToolInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  serviceType?: string;
  notes?: string;
}

export interface BookAppointmentResult extends ToolResult {
  data?: {
    appointmentId: string;
    customerName: string;
    date: string;
    time: string;
    serviceType?: string;
    status: string;
    confirmationMessage: string;
  };
}

// Capture Lead Input/Output
export interface CaptureLeadInput extends ToolInput {
  name?: string;
  phone: string;
  email?: string;
  interest?: string;
  notes?: string;
  customFields?: Record<string, any>;
}

export interface CaptureLeadResult extends ToolResult {
  data?: {
    leadId: string;
    status: string;
  };
}

// Human Handoff Input/Output
export interface HumanHandoffInput extends ToolInput {
  reason: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface HumanHandoffResult extends ToolResult {
  data?: {
    handoffId: string;
    queuePosition?: number;
    estimatedWait?: string;
  };
}

// ========== STATE MANAGEMENT ==========

export type ConversationState =
  | 'idle'
  | 'greeting'
  | 'collecting_info'
  | 'confirming'
  | 'processing'
  | 'awaiting_response'
  | 'handoff'
  | 'completed';

export type FlowType =
  | 'appointment_booking'
  | 'lead_capture'
  | 'inquiry'
  | 'order'
  | 'support'
  | 'feedback';

export interface ConversationContext {
  currentIntent?: Intent;
  collectedData: Record<string, any>;
  missingFields: string[];
  lastToolUsed?: ToolName;
  lastToolResult?: ToolResult;
  messageHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  knowledgeContext?: string;
}

export interface FlowDefinition {
  type: FlowType;
  steps: FlowStep[];
  requiredFields: string[];
  optionalFields: string[];
}

export interface FlowStep {
  id: number;
  name: string;
  field?: string;
  prompt: string;
  validation?: (value: string) => boolean;
  errorMessage?: string;
  skipIf?: (context: ConversationContext) => boolean;
}

// ========== OUTBOUND MESSAGE TYPES ==========

export interface OutboundMessage {
  to: string;
  type: 'text' | 'interactive' | 'template';
  text?: {
    body: string;
    preview_url?: boolean;
  };
  interactive?: InteractiveMessage;
  template?: TemplateMessage;
}

export interface InteractiveMessage {
  type: 'button' | 'list';
  header?: {
    type: 'text' | 'image' | 'document' | 'video';
    text?: string;
    image?: { link: string };
    document?: { link: string; filename: string };
    video?: { link: string };
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: InteractiveAction;
}

export interface InteractiveAction {
  buttons?: InteractiveButton[];
  button?: string;
  sections?: ListSection[];
}

export interface InteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

export interface ListSection {
  title?: string;
  rows: ListRow[];
}

export interface ListRow {
  id: string;
  title: string;
  description?: string;
}

export interface TemplateMessage {
  name: string;
  language: {
    code: string;
  };
  components?: TemplateComponent[];
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'button';
  parameters?: TemplateParameter[];
  sub_type?: 'quick_reply' | 'url';
  index?: number;
}

export interface TemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
  text?: string;
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
  image?: { link: string };
  document?: { link: string };
  video?: { link: string };
}

// ========== AGENT CONFIGURATION ==========

export interface AgentConfig {
  id: string;
  userId: string;
  name: string;
  systemPrompt: string;
  welcomeMessage: string;
  toneOfVoice?: string;
  language: string;
  capabilities: string[];
  businessCategory?: string;
  businessInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    workingHours?: string;
  };
  whatsappConfig?: {
    phoneNumberId: string;
    accessToken: string;
    businessId: string;
    verifyToken: string;
  };
}

// ========== RUNTIME CONTEXT ==========

export interface RuntimeContext {
  agent: AgentConfig;
  conversation: {
    id: string;
    state: ConversationState;
    context: ConversationContext;
    currentFlow?: FlowType;
    flowStep: number;
  };
  message: NormalizedMessage;
  user: {
    phone: string;
    name?: string;
    whatsappId: string;
  };
}
