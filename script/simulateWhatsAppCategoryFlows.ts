/**
 * Offline simulation harness for WhatsApp category flows.
 *
 * Goal: validate category-by-category that intents route to expected flows/tools
 * without needing DB access or Anthropic.
 *
 * Run:
 *   npx tsx script/simulateWhatsAppCategoryFlows.ts
 */

import {
  WHATSAPP_CATEGORY_MATRIX,
  getIntentsForCapabilities,
  getToolsForCapabilities,
  type WhatsAppBusinessCategoryId,
  type WhatsAppCapabilityId,
  type WhatsAppIntent,
} from '../shared/whatsappCategoryMatrix';

// Deterministic "now" for date-window simulations.
const SIM_NOW_UTC = new Date('2025-12-31T12:00:00.000Z');
const DEFAULT_MAX_DAYS_AHEAD = 2;

type FlowType = 'appointment_booking' | 'lead_capture' | 'inquiry' | 'order' | 'support' | 'feedback';

type ToolName =
  | 'check_availability'
  | 'book_appointment'
  | 'cancel_appointment'
  | 'reschedule_appointment'
  | 'capture_lead'
  | 'human_handoff'
  | 'get_business_info'
  | 'search_knowledge'
  | 'get_appointment_status';

const intentToolMap: Partial<Record<WhatsAppIntent, ToolName>> = {
  book_appointment: 'book_appointment',
  check_availability: 'check_availability',
  cancel_appointment: 'cancel_appointment',
  reschedule_appointment: 'reschedule_appointment',
  human_handoff: 'human_handoff',
  ask_question: 'search_knowledge',
  check_status: 'get_appointment_status',
};

const intentFlowMap: Partial<Record<WhatsAppIntent, FlowType>> = {
  book_appointment: 'appointment_booking',
  provide_info: 'lead_capture',
  ask_question: 'inquiry',
  feedback: 'feedback',
  make_order: 'order',
  track_order: 'support',
  billing_inquiry: 'support',
};

const flowRequiredFields: Record<FlowType, string[]> = {
  appointment_booking: ['name', 'phone', 'date', 'time'],
  lead_capture: ['name', 'phone'],
  inquiry: [],
  order: ['name', 'phone', 'items'],
  support: ['issue'],
  feedback: ['rating', 'comments'],
};

function allowedToolsFromCapabilities(caps: string[]): Set<ToolName> {
  const tools = new Set<ToolName>();
  for (const t of getToolsForCapabilities(caps)) tools.add(t as ToolName);
  tools.add('search_knowledge');
  tools.add('get_business_info');
  return tools;
}

function allowedIntentsFromCapabilities(caps: string[]): Set<WhatsAppIntent> {
  const intents = new Set<WhatsAppIntent>();
  for (const i of getIntentsForCapabilities(caps)) intents.add(i as WhatsAppIntent);
  intents.add('greeting');
  intents.add('goodbye');
  intents.add('ask_question');
  intents.add('provide_info');
  intents.add('human_handoff');
  intents.add('unknown');
  return intents;
}

function missingFields(required: string[], entities: Record<string, any>): string[] {
  return required.filter((f) => entities[f] == null || entities[f] === '');
}

type PlanResult = {
  safeIntent: WhatsAppIntent;
  flowType?: FlowType;
  toolName?: ToolName;
  action: 'start_flow' | 'execute_tool' | 'capture_lead' | 'answer';
  missing?: string[];
  invalid?: string[];
};

function parseISODateUTC(dateStr: string): Date | null {
  // Accept YYYY-MM-DD only.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map((p) => Number(p));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  const dt = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  // Reject invalid rollovers (e.g., 2025-02-30).
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}

function dayDiffUTC(a: Date, b: Date): number {
  const aUTC = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bUTC = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((bUTC - aUTC) / (24 * 60 * 60 * 1000));
}

function validateAppointmentWindow(dateStr: unknown, maxDaysAhead: number): { ok: true } | { ok: false; reason: string } {
  if (typeof dateStr !== 'string' || dateStr.trim() === '') return { ok: true };
  const dt = parseISODateUTC(dateStr.trim());
  if (!dt) return { ok: false, reason: 'invalidDate' };
  const deltaDays = dayDiffUTC(SIM_NOW_UTC, dt);
  if (deltaDays < 0) return { ok: false, reason: 'dateInPast' };
  if (deltaDays > maxDaysAhead) return { ok: false, reason: 'maxDaysAhead' };
  return { ok: true };
}

function plan(
  capabilities: string[],
  intent: WhatsAppIntent,
  entities: Record<string, any>,
  requiresAction: boolean
): PlanResult {
  const allowedTools = allowedToolsFromCapabilities(capabilities);
  const allowedIntents = allowedIntentsFromCapabilities(capabilities);

  const safeIntent: WhatsAppIntent = allowedIntents.has(intent) ? intent : 'ask_question';

  const effectiveEntities: Record<string, any> = {
    ...entities,
    name: entities.name ?? 'Test User',
    phone: entities.phone ?? '+10000000000',
  };

  const flowType = intentFlowMap[safeIntent];
  if (flowType) {
    if (flowType === 'appointment_booking') {
      const window = validateAppointmentWindow(effectiveEntities.date, DEFAULT_MAX_DAYS_AHEAD);
      if (!window.ok) {
        return { safeIntent, flowType, action: 'start_flow', invalid: [window.reason] };
      }
    }

    const required =
      flowType === 'support'
        ? safeIntent === 'track_order'
          ? ['orderId']
          : ['issue']
        : flowRequiredFields[flowType];

    const missing = missingFields(required, effectiveEntities);
    if (missing.length > 0) {
      return { safeIntent, flowType, action: 'start_flow', missing };
    }

    // Flows complete -> they end up as tool actions (capture_lead) or confirmation.
    if (flowType === 'order' || flowType === 'support' || flowType === 'lead_capture') {
      return { safeIntent, flowType, action: 'capture_lead' };
    }

    if (flowType === 'appointment_booking') {
      // If action is required, booking tool should run (otherwise confirm).
      const tool = intentToolMap[safeIntent];
      if (requiresAction && tool && allowedTools.has(tool)) {
        return { safeIntent, flowType, action: 'execute_tool', toolName: tool };
      }
      if (tool && !allowedTools.has(tool)) {
        return { safeIntent, flowType, action: 'capture_lead' };
      }
      return { safeIntent, flowType, action: 'answer' };
    }
  }

  // Booking-like fallback when appointment tools are not enabled
  if (
    safeIntent === 'book_appointment' ||
    safeIntent === 'check_availability' ||
    safeIntent === 'cancel_appointment' ||
    safeIntent === 'reschedule_appointment' ||
    safeIntent === 'check_status'
  ) {
    const mapped = intentToolMap[safeIntent];
    if (!mapped || !allowedTools.has(mapped)) {
      const bookingLikeFields = ['name', 'date', 'time', 'serviceType'];
      const missing = missingFields(bookingLikeFields, effectiveEntities);
      return missing.length > 0
        ? { safeIntent, action: 'start_flow', flowType: 'lead_capture', missing }
        : { safeIntent, action: 'capture_lead' };
    }
  }

  if (requiresAction) {
    const tool = intentToolMap[safeIntent];
    if (tool && allowedTools.has(tool)) return { safeIntent, action: 'execute_tool', toolName: tool };
    if (tool && !allowedTools.has(tool)) return { safeIntent, action: 'capture_lead', toolName: tool };
  }

  return { safeIntent, action: 'answer' };
}

type Scenario = {
  id: string;
  name: string;
  intent: WhatsAppIntent;
  entities: Record<string, any>;
  requiresAction: boolean;
  expect: (caps: WhatsAppCapabilityId[]) => boolean;
};

const scenarios: Scenario[] = [
  {
    id: 'appointments_book_slot',
    name: 'Appointments: book specific slot',
    intent: 'book_appointment',
    entities: { date: '2026-01-02', time: '10:00', serviceType: 'Dr Demo' },
    requiresAction: true,
    expect: (caps) => caps.includes('appointments'),
  },
  {
    id: 'appointments_too_far_ahead',
    name: 'Appointments: too far ahead',
    intent: 'book_appointment',
    entities: { date: '2026-01-05', time: '10:00', serviceType: 'Dr Demo' },
    requiresAction: true,
    expect: (caps) => caps.includes('appointments'),
  },
  {
    id: 'orders_place_order',
    name: 'Orders: place an order',
    intent: 'make_order',
    entities: { items: '2 pizzas, 1 coke' },
    requiresAction: false,
    expect: (caps) => caps.includes('orders'),
  },
  {
    id: 'tracking_track_order',
    name: 'Tracking: track an order',
    intent: 'track_order',
    entities: { orderId: 'ORDER123' },
    requiresAction: false,
    expect: (caps) => caps.includes('tracking') || caps.includes('delivery'),
  },
  {
    id: 'tracking_missing_order_id',
    name: 'Tracking: missing orderId',
    intent: 'track_order',
    entities: {},
    requiresAction: false,
    expect: (caps) => caps.includes('tracking') || caps.includes('delivery'),
  },
  {
    id: 'billing_inquiry',
    name: 'Billing: billing inquiry',
    intent: 'billing_inquiry',
    entities: { issue: 'I need my invoice' },
    requiresAction: false,
    expect: (caps) => caps.includes('billing') || caps.includes('fees'),
  },
  {
    id: 'reservations_request_table',
    name: 'Reservations: request a table',
    intent: 'book_appointment',
    entities: { date: '2026-01-02', time: '20:00' },
    requiresAction: true,
    expect: (caps) => caps.includes('reservations'),
  },
  {
    id: 'disallowed_interaction_slot_selected',
    name: 'Disallowed interaction: appointment slot selected',
    intent: 'book_appointment',
    entities: { date: '2026-01-02', time: '20:00', serviceType: 'Table for 2' },
    requiresAction: true,
    expect: (caps) => (caps.includes('reservations') || caps.includes('viewings')) && !caps.includes('appointments'),
  },
  {
    id: 'viewings_request_viewing',
    name: 'Viewings: request a viewing',
    intent: 'book_appointment',
    entities: { date: '2026-01-03', time: '11:00' },
    requiresAction: true,
    expect: (caps) => caps.includes('viewings'),
  },
];

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function run(): void {
  const failures: string[] = [];

  for (const [categoryId, category] of Object.entries(WHATSAPP_CATEGORY_MATRIX) as Array<[
    WhatsAppBusinessCategoryId,
    typeof WHATSAPP_CATEGORY_MATRIX[WhatsAppBusinessCategoryId]
  ]>) {
    const caps = category.defaultCapabilities;

    for (const scenario of scenarios) {
      const relevant = scenario.expect(caps);
      if (!relevant) continue;

      try {
        const p = plan(caps, scenario.intent, scenario.entities, scenario.requiresAction);

        // Basic expectations per scenario
        if (scenario.id === 'appointments_book_slot') {
          assert(p.safeIntent === 'book_appointment', `${category.name}: appointment intent downgraded unexpectedly`);
          assert(p.action !== 'capture_lead', `${category.name}: appointment booking fell back to lead capture unexpectedly`);
        }

        if (scenario.id === 'appointments_too_far_ahead') {
          assert(p.safeIntent === 'book_appointment', `${category.name}: appointment intent downgraded unexpectedly`);
          assert(p.action !== 'execute_tool', `${category.name}: max-days-ahead violation still executed booking tool`);
          assert(
            Array.isArray(p.invalid) && p.invalid.includes('maxDaysAhead'),
            `${category.name}: expected maxDaysAhead invalid reason`
          );
        }

        if (scenario.id === 'orders_place_order') {
          assert(p.safeIntent === 'make_order', `${category.name}: order intent downgraded unexpectedly`);
          assert(p.action === 'capture_lead' || p.action === 'start_flow', `${category.name}: order did not capture lead / start flow`);
        }

        if (scenario.id === 'tracking_track_order') {
          assert(p.safeIntent === 'track_order', `${category.name}: tracking intent downgraded unexpectedly`);
          // tracking is a support flow; with orderId present it should capture lead (support request)
          assert(p.action === 'capture_lead' || p.action === 'start_flow', `${category.name}: tracking did not capture lead / start flow`);
        }

        if (scenario.id === 'tracking_missing_order_id') {
          assert(p.safeIntent === 'track_order', `${category.name}: tracking intent downgraded unexpectedly`);
          assert(p.action === 'start_flow', `${category.name}: missing orderId should start flow (ask for orderId)`);
          assert(
            Array.isArray(p.missing) && p.missing.includes('orderId'),
            `${category.name}: missing orderId was not detected`
          );
        }

        if (scenario.id === 'billing_inquiry') {
          assert(p.safeIntent === 'billing_inquiry', `${category.name}: billing intent downgraded unexpectedly`);
          assert(p.action === 'capture_lead' || p.action === 'start_flow' || p.action === 'answer', `${category.name}: billing produced unexpected action ${p.action}`);
        }

        if (scenario.id === 'reservations_request_table') {
          // Reservation is modeled as booking intent but without appointment tools; should not execute booking tool.
          assert(p.action !== 'execute_tool', `${category.name}: reservation attempted to execute appointment tool`);
        }

        if (scenario.id === 'disallowed_interaction_slot_selected') {
          assert(p.action !== 'execute_tool', `${category.name}: disallowed interaction still executed appointment tool`);
          assert(
            p.action === 'capture_lead' || p.action === 'start_flow',
            `${category.name}: disallowed interaction did not fall back to lead capture / start flow`
          );
        }

        if (scenario.id === 'viewings_request_viewing') {
          assert(p.action !== 'execute_tool', `${category.name}: viewing attempted to execute appointment tool`);
        }
      } catch (e) {
        failures.push(`${category.name} / ${scenario.name}: ${(e as Error).message}`);
      }
    }
  }

  if (failures.length > 0) {
    console.error('\nSIMULATION FAILURES:');
    for (const f of failures) console.error(`- ${f}`);
    process.exit(1);
  }

  console.log('WhatsApp category simulation: PASS');
}

run();
