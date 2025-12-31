/**
 * WhatsApp Category Matrix
 *
 * Pure-data mapping used to:
 * - document what each business category needs (fields)
 * - map UI capabilities to runtime intents/tools
 *
 * Note: This file intentionally avoids React/UI concerns.
 */

export type WhatsAppBusinessCategoryId =
  | 'healthcare'
  | 'salon'
  | 'restaurant'
  | 'automotive'
  | 'education'
  | 'realestate'
  | 'professional'
  | 'retail'
  | 'general';

// These are the capability IDs used by the WhatsApp onboarding catalog.
export type WhatsAppCapabilityId =
  | 'appointments'
  | 'reminders'
  | 'prescriptions'
  | 'reports'
  | 'billing'
  | 'insurance'
  | 'directions'
  | 'doctors'
  | 'services'
  | 'stylists'
  | 'offers'
  | 'feedback'
  | 'reservations'
  | 'menu'
  | 'orders'
  | 'delivery'
  | 'status'
  | 'estimates'
  | 'pickup'
  | 'history'
  | 'enrollment'
  | 'schedule'
  | 'fees'
  | 'attendance'
  | 'progress'
  | 'support'
  | 'listings'
  | 'viewings'
  | 'inquiries'
  | 'pricing'
  | 'documents'
  | 'updates'
  | 'catalog'
  | 'tracking'
  | 'returns'
  | 'faq'
  ;

// Tool names that exist in server/whatsapp/toolEngine.ts.
export type WhatsAppToolName =
  | 'check_availability'
  | 'book_appointment'
  | 'cancel_appointment'
  | 'reschedule_appointment'
  | 'get_appointment_status'
  | 'capture_lead'
  | 'human_handoff'
  | 'get_business_info'
  | 'search_knowledge';

// Intent list used by server/whatsapp/aiDecisionLayer.ts.
export type WhatsAppIntent =
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

export type CapabilityTooling = {
  tools: WhatsAppToolName[];
  intents: WhatsAppIntent[];
  // Business info keys that materially improve this capability.
  businessInfoKeys: string[];
};

export const WHATSAPP_CAPABILITY_TOOLING: Record<WhatsAppCapabilityId, CapabilityTooling> = {
  appointments: {
    tools: ['check_availability', 'book_appointment', 'cancel_appointment', 'reschedule_appointment', 'get_appointment_status'],
    intents: ['book_appointment', 'check_availability', 'cancel_appointment', 'reschedule_appointment', 'check_status'],
    businessInfoKeys: ['workingHours', 'address', 'appointmentSettings', 'doctors', 'specialties', 'services', 'stylists'],
  },
  reservations: {
    tools: ['capture_lead', 'human_handoff'],
    intents: ['book_appointment'],
    businessInfoKeys: ['workingHours', 'address'],
  },
  viewings: {
    tools: ['capture_lead', 'human_handoff'],
    intents: ['book_appointment'],
    businessInfoKeys: ['locations', 'properties', 'priceRange'],
  },
  reminders: {
    tools: [],
    intents: ['provide_info'],
    businessInfoKeys: [],
  },
  billing: {
    tools: ['human_handoff'],
    intents: ['billing_inquiry'],
    businessInfoKeys: ['billingPolicy', 'paymentModes', 'fees', 'consultationFee'],
  },
  fees: {
    tools: ['human_handoff'],
    intents: ['billing_inquiry'],
    businessInfoKeys: ['fees'],
  },
  pricing: {
    tools: ['capture_lead', 'human_handoff'],
    intents: ['ask_question'],
    businessInfoKeys: ['pricing', 'priceRange'],
  },
  estimates: {
    tools: ['capture_lead', 'human_handoff'],
    intents: ['ask_question'],
    businessInfoKeys: ['pricing'],
  },
  orders: {
    tools: ['capture_lead', 'human_handoff'],
    intents: ['make_order'],
    businessInfoKeys: ['catalog', 'menu'],
  },
  tracking: {
    tools: ['human_handoff'],
    intents: ['track_order'],
    businessInfoKeys: [],
  },
  delivery: {
    tools: ['human_handoff'],
    intents: ['track_order'],
    businessInfoKeys: ['deliveryAreas'],
  },
  returns: {
    tools: ['human_handoff'],
    intents: ['ask_question'],
    businessInfoKeys: ['returnsPolicy'],
  },
  menu: {
    tools: ['search_knowledge'],
    intents: ['ask_question'],
    businessInfoKeys: ['cuisine', 'specialties'],
  },
  services: {
    tools: ['search_knowledge'],
    intents: ['ask_question'],
    businessInfoKeys: ['services', 'specialties'],
  },
  catalog: {
    tools: ['search_knowledge'],
    intents: ['ask_question'],
    businessInfoKeys: ['products'],
  },
  support: {
    tools: ['search_knowledge', 'human_handoff'],
    intents: ['ask_question', 'human_handoff'],
    businessInfoKeys: ['supportHours', 'address', 'phone', 'email'],
  },
  inquiries: {
    tools: ['capture_lead', 'human_handoff'],
    intents: ['ask_question'],
    businessInfoKeys: ['properties', 'locations', 'priceRange'],
  },
  directions: {
    tools: ['get_business_info'],
    intents: ['ask_question'],
    businessInfoKeys: ['address'],
  },
  doctors: {
    tools: ['search_knowledge'],
    intents: ['ask_question'],
    businessInfoKeys: ['doctors', 'specialties'],
  },
  stylists: {
    tools: ['search_knowledge'],
    intents: ['ask_question'],
    businessInfoKeys: ['stylists', 'services'],
  },
  offers: {
    tools: ['search_knowledge'],
    intents: ['ask_question'],
    businessInfoKeys: ['offers'],
  },
  feedback: {
    tools: ['capture_lead'],
    intents: ['feedback'],
    businessInfoKeys: [],
  },
  prescriptions: {
    tools: ['human_handoff'],
    intents: ['ask_question'],
    businessInfoKeys: ['prescriptionsPolicy'],
  },
  reports: {
    tools: ['human_handoff'],
    intents: ['ask_question'],
    businessInfoKeys: ['reportsPolicy'],
  },
  insurance: {
    tools: ['search_knowledge', 'human_handoff'],
    intents: ['ask_question'],
    businessInfoKeys: ['insurance'],
  },
  status: {
    tools: ['get_appointment_status', 'human_handoff'],
    intents: ['check_status'],
    businessInfoKeys: [],
  },
  pickup: {
    tools: ['capture_lead', 'human_handoff'],
    intents: ['book_appointment'],
    businessInfoKeys: ['address'],
  },
  history: {
    tools: ['get_appointment_status', 'human_handoff'],
    intents: ['check_status'],
    businessInfoKeys: [],
  },
  enrollment: {
    tools: ['capture_lead', 'human_handoff'],
    intents: ['provide_info'],
    businessInfoKeys: ['courses', 'levels', 'mode'],
  },
  schedule: {
    tools: ['search_knowledge'],
    intents: ['ask_question'],
    businessInfoKeys: ['schedule'],
  },
  attendance: {
    tools: ['human_handoff'],
    intents: ['ask_question'],
    businessInfoKeys: [],
  },
  progress: {
    tools: ['human_handoff'],
    intents: ['ask_question'],
    businessInfoKeys: [],
  },
  listings: {
    tools: ['search_knowledge', 'capture_lead'],
    intents: ['ask_question'],
    businessInfoKeys: ['properties', 'locations', 'priceRange'],
  },
  documents: {
    tools: ['human_handoff'],
    intents: ['provide_info'],
    businessInfoKeys: [],
  },
  updates: {
    tools: ['search_knowledge'],
    intents: ['ask_question'],
    businessInfoKeys: [],
  },
  faq: {
    tools: ['search_knowledge'],
    intents: ['ask_question'],
    businessInfoKeys: [],
  },
};

export type CategoryMatrix = {
  id: WhatsAppBusinessCategoryId;
  name: string;
  // Keys expected under agent.businessInfo or agent.businessInfo.appointmentSettings.
  requiredBusinessInfoKeys: string[];
  optionalBusinessInfoKeys: string[];
  // Capability IDs recommended by default for this category.
  defaultCapabilities: WhatsAppCapabilityId[];
};

export const WHATSAPP_CATEGORY_MATRIX: Record<WhatsAppBusinessCategoryId, CategoryMatrix> = {
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare & Clinics',
    requiredBusinessInfoKeys: ['name'],
    optionalBusinessInfoKeys: ['phone', 'email', 'address', 'workingHours', 'specialties', 'doctors', 'insurance', 'appointmentSettings'],
    defaultCapabilities: ['appointments', 'reminders', 'billing', 'directions', 'doctors'],
  },
  salon: {
    id: 'salon',
    name: 'Salons & Spas',
    requiredBusinessInfoKeys: ['name'],
    optionalBusinessInfoKeys: ['phone', 'email', 'address', 'workingHours', 'services', 'stylists', 'pricing', 'appointmentSettings'],
    defaultCapabilities: ['appointments', 'reminders', 'services', 'stylists', 'offers', 'billing'],
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurants & Cafes',
    requiredBusinessInfoKeys: ['name'],
    optionalBusinessInfoKeys: ['phone', 'email', 'address', 'workingHours', 'cuisine', 'specialties', 'delivery'],
    defaultCapabilities: ['reservations', 'menu', 'orders', 'delivery', 'offers', 'billing'],
  },
  automotive: {
    id: 'automotive',
    name: 'Automotive Services',
    requiredBusinessInfoKeys: ['name'],
    optionalBusinessInfoKeys: ['phone', 'email', 'address', 'workingHours', 'services', 'brands', 'pricing', 'appointmentSettings'],
    defaultCapabilities: ['appointments', 'reminders', 'status', 'estimates', 'billing'],
  },
  education: {
    id: 'education',
    name: 'Education & Coaching',
    requiredBusinessInfoKeys: ['name'],
    optionalBusinessInfoKeys: ['phone', 'email', 'address', 'workingHours', 'courses', 'levels', 'mode'],
    defaultCapabilities: ['enrollment', 'schedule', 'fees', 'reminders', 'support'],
  },
  realestate: {
    id: 'realestate',
    name: 'Real Estate',
    requiredBusinessInfoKeys: ['name'],
    optionalBusinessInfoKeys: ['phone', 'email', 'address', 'workingHours', 'properties', 'locations', 'priceRange'],
    defaultCapabilities: ['listings', 'viewings', 'inquiries', 'pricing'],
  },
  professional: {
    id: 'professional',
    name: 'Professional Services',
    requiredBusinessInfoKeys: ['name'],
    optionalBusinessInfoKeys: ['phone', 'email', 'address', 'workingHours', 'services', 'expertise', 'consultationFee', 'appointmentSettings'],
    defaultCapabilities: ['appointments', 'reminders', 'documents', 'billing', 'support'],
  },
  retail: {
    id: 'retail',
    name: 'Retail & E-Commerce',
    requiredBusinessInfoKeys: ['name'],
    optionalBusinessInfoKeys: ['phone', 'email', 'address', 'workingHours', 'products', 'deliveryAreas', 'paymentModes'],
    defaultCapabilities: ['catalog', 'orders', 'tracking', 'returns', 'billing', 'support', 'offers'],
  },
  general: {
    id: 'general',
    name: 'General Business',
    requiredBusinessInfoKeys: ['name'],
    optionalBusinessInfoKeys: ['phone', 'email', 'address', 'workingHours', 'services', 'highlights', 'appointmentSettings'],
    defaultCapabilities: ['appointments', 'reminders', 'support', 'billing', 'directions', 'faq'],
  },
};

export function getToolsForCapabilities(capabilityIds: string[]): WhatsAppToolName[] {
  const tools = new Set<WhatsAppToolName>();
  for (const id of capabilityIds) {
    const tooling = (WHATSAPP_CAPABILITY_TOOLING as Record<string, CapabilityTooling | undefined>)[id];
    if (!tooling) continue;
    for (const tool of tooling.tools) tools.add(tool);
  }
  return Array.from(tools);
}

export function getIntentsForCapabilities(capabilityIds: string[]): WhatsAppIntent[] {
  const intents = new Set<WhatsAppIntent>();
  for (const id of capabilityIds) {
    const tooling = (WHATSAPP_CAPABILITY_TOOLING as Record<string, CapabilityTooling | undefined>)[id];
    if (!tooling) continue;
    for (const intent of tooling.intents) intents.add(intent);
  }
  return Array.from(intents);
}
