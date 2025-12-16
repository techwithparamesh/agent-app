/**
 * AI Agent Capabilities Configuration
 * 
 * This defines all the capabilities an AI agent can have.
 * Each capability has actions, required data fields, and response templates.
 */

export type CapabilityCategory = 
  | "appointments"
  | "customer_support"
  | "sales"
  | "billing"
  | "reminders"
  | "orders"
  | "hr"
  | "healthcare"
  | "education"
  | "real_estate"
  | "hospitality"
  | "automotive"
  | "general";

export interface ActionField {
  name: string;
  label: string;
  type: "text" | "email" | "phone" | "date" | "time" | "datetime" | "number" | "select" | "textarea";
  required: boolean;
  options?: string[]; // For select type
  placeholder?: string;
  validation?: string; // Regex pattern
}

export interface AgentAction {
  id: string;
  name: string;
  description: string;
  triggerPhrases: string[]; // Keywords that trigger this action
  requiredFields: ActionField[];
  confirmationRequired: boolean;
  responseTemplate: string;
}

export interface Capability {
  id: CapabilityCategory;
  name: string;
  description: string;
  icon: string; // lucide icon name
  color: string;
  actions: AgentAction[];
  systemPromptAddition: string; // Added to system prompt when this capability is enabled
  suggestedQuestions: string[];
}

// ============================================================
// CAPABILITY DEFINITIONS
// ============================================================

export const AGENT_CAPABILITIES: Capability[] = [
  // ==================== APPOINTMENTS ====================
  {
    id: "appointments",
    name: "Appointment Booking",
    description: "Schedule, reschedule, and manage appointments",
    icon: "Calendar",
    color: "blue",
    actions: [
      {
        id: "book_appointment",
        name: "Book Appointment",
        description: "Schedule a new appointment",
        triggerPhrases: ["book", "schedule", "appointment", "meeting", "slot", "available"],
        requiredFields: [
          { name: "name", label: "Full Name", type: "text", required: true, placeholder: "Enter your full name" },
          { name: "phone", label: "Phone Number", type: "phone", required: true, placeholder: "+91 XXXXX XXXXX" },
          { name: "email", label: "Email", type: "email", required: false, placeholder: "your@email.com" },
          { name: "service", label: "Service Required", type: "select", required: true, options: [] },
          { name: "date", label: "Preferred Date", type: "date", required: true },
          { name: "time", label: "Preferred Time", type: "time", required: true },
          { name: "notes", label: "Additional Notes", type: "textarea", required: false, placeholder: "Any special requests..." },
        ],
        confirmationRequired: true,
        responseTemplate: "Great! I've noted your appointment request:\n📅 Date: {{date}}\n⏰ Time: {{time}}\n👤 Name: {{name}}\n📱 Phone: {{phone}}\n🔧 Service: {{service}}\n\nShall I confirm this booking?",
      },
      {
        id: "reschedule_appointment",
        name: "Reschedule Appointment",
        description: "Change an existing appointment",
        triggerPhrases: ["reschedule", "change", "move", "different time", "another date"],
        requiredFields: [
          { name: "phone", label: "Phone Number", type: "phone", required: true, placeholder: "Registered phone number" },
          { name: "new_date", label: "New Date", type: "date", required: true },
          { name: "new_time", label: "New Time", type: "time", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "I'll reschedule your appointment to:\n📅 New Date: {{new_date}}\n⏰ New Time: {{new_time}}\n\nShall I confirm this change?",
      },
      {
        id: "cancel_appointment",
        name: "Cancel Appointment",
        description: "Cancel an existing appointment",
        triggerPhrases: ["cancel", "delete", "remove", "don't want"],
        requiredFields: [
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "reason", label: "Reason for Cancellation", type: "text", required: false },
        ],
        confirmationRequired: true,
        responseTemplate: "I'll cancel your appointment. Are you sure you want to proceed?",
      },
      {
        id: "check_availability",
        name: "Check Availability",
        description: "Check available slots",
        triggerPhrases: ["available", "slots", "free", "when", "timings", "open"],
        requiredFields: [
          { name: "date", label: "Date to Check", type: "date", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Here are the available slots for {{date}}:\n{{available_slots}}\n\nWould you like to book any of these?",
      },
    ],
    systemPromptAddition: `
## Appointment Booking Capability
You can help users book, reschedule, or cancel appointments.

When booking appointments, collect:
1. Full name
2. Phone number
3. Preferred date and time
4. Service/reason for appointment
5. Any special requests

Always confirm the details before finalizing. Be helpful if requested slot is unavailable - suggest alternatives.
Mention working hours and available services when asked.`,
    suggestedQuestions: [
      "I want to book an appointment",
      "What time slots are available?",
      "Can I reschedule my appointment?",
      "What services do you offer?",
    ],
  },

  // ==================== CUSTOMER SUPPORT ====================
  {
    id: "customer_support",
    name: "Customer Support",
    description: "Handle inquiries, complaints, and provide assistance",
    icon: "HeadphonesIcon",
    color: "green",
    actions: [
      {
        id: "answer_faq",
        name: "Answer FAQ",
        description: "Respond to common questions",
        triggerPhrases: ["what", "how", "why", "where", "when", "tell me", "explain"],
        requiredFields: [],
        confirmationRequired: false,
        responseTemplate: "{{answer}}",
      },
      {
        id: "raise_complaint",
        name: "Raise Complaint",
        description: "Register a customer complaint",
        triggerPhrases: ["complaint", "issue", "problem", "not working", "bad", "unhappy", "disappointed"],
        requiredFields: [
          { name: "name", label: "Your Name", type: "text", required: true },
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "order_id", label: "Order/Reference ID", type: "text", required: false },
          { name: "complaint", label: "Describe the Issue", type: "textarea", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "I'm sorry to hear about this issue. I've registered your complaint:\n\n📋 Complaint ID: {{complaint_id}}\n📝 Issue: {{complaint}}\n\nOur team will contact you within 24-48 hours. Is there anything else I can help with?",
      },
      {
        id: "track_complaint",
        name: "Track Complaint Status",
        description: "Check status of existing complaint",
        triggerPhrases: ["status", "track", "update", "follow up", "complaint status"],
        requiredFields: [
          { name: "complaint_id", label: "Complaint ID", type: "text", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Your complaint status:\n\n📋 ID: {{complaint_id}}\n📊 Status: {{status}}\n📅 Last Updated: {{updated_at}}",
      },
      {
        id: "collect_feedback",
        name: "Collect Feedback",
        description: "Gather customer feedback",
        triggerPhrases: ["feedback", "review", "rate", "experience", "suggestion"],
        requiredFields: [
          { name: "rating", label: "Rating (1-5)", type: "number", required: true },
          { name: "feedback", label: "Your Feedback", type: "textarea", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Thank you for your feedback! ⭐ {{rating}}/5\n\nYour input helps us improve. We appreciate you taking the time!",
      },
    ],
    systemPromptAddition: `
## Customer Support Capability
You are a helpful customer support agent. 

Guidelines:
- Be empathetic and understanding
- Apologize for any inconvenience
- Provide clear solutions
- Escalate complex issues appropriately
- Always ask if there's anything else you can help with
- Collect relevant information for complaints (name, contact, order ID if applicable)`,
    suggestedQuestions: [
      "I have a question about your service",
      "I want to file a complaint",
      "Can you help me with an issue?",
      "I'd like to give feedback",
    ],
  },

  // ==================== SALES & LEAD GEN ====================
  {
    id: "sales",
    name: "Sales & Lead Generation",
    description: "Handle product inquiries, quotes, and lead capture",
    icon: "TrendingUp",
    color: "purple",
    actions: [
      {
        id: "product_inquiry",
        name: "Product Inquiry",
        description: "Answer questions about products/services",
        triggerPhrases: ["product", "service", "offer", "feature", "details", "tell me about"],
        requiredFields: [],
        confirmationRequired: false,
        responseTemplate: "{{product_info}}",
      },
      {
        id: "get_quote",
        name: "Get Quote",
        description: "Provide pricing/quotation",
        triggerPhrases: ["price", "cost", "quote", "quotation", "how much", "rate", "charges"],
        requiredFields: [
          { name: "name", label: "Your Name", type: "text", required: true },
          { name: "company", label: "Company Name", type: "text", required: false },
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "requirements", label: "Your Requirements", type: "textarea", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "Thank you for your interest! Here's what I have:\n\n👤 Name: {{name}}\n🏢 Company: {{company}}\n📧 Email: {{email}}\n📝 Requirements: {{requirements}}\n\nOur sales team will send you a detailed quote within 24 hours. Shall I proceed?",
      },
      {
        id: "schedule_demo",
        name: "Schedule Demo",
        description: "Book a product demonstration",
        triggerPhrases: ["demo", "demonstration", "show me", "trial", "see how it works"],
        requiredFields: [
          { name: "name", label: "Your Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "company", label: "Company Name", type: "text", required: false },
          { name: "date", label: "Preferred Date", type: "date", required: true },
          { name: "time", label: "Preferred Time", type: "time", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "Great! I'll schedule a demo for you:\n\n📅 Date: {{date}}\n⏰ Time: {{time}}\n👤 Name: {{name}}\n📧 Email: {{email}}\n\nYou'll receive a calendar invite shortly. Shall I confirm?",
      },
      {
        id: "lead_capture",
        name: "Capture Lead",
        description: "Collect contact information for follow-up",
        triggerPhrases: ["interested", "contact me", "call me", "more info", "learn more"],
        requiredFields: [
          { name: "name", label: "Your Name", type: "text", required: true },
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "email", label: "Email", type: "email", required: false },
          { name: "interest", label: "What are you interested in?", type: "text", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Thank you for your interest! Our team will reach out to you shortly at {{phone}}. Is there a preferred time for us to call?",
      },
    ],
    systemPromptAddition: `
## Sales & Lead Generation Capability
You are a helpful sales assistant.

Guidelines:
- Be enthusiastic but not pushy
- Highlight benefits, not just features
- Capture lead information naturally
- Qualify leads by understanding their needs
- Offer to schedule demos or calls
- Answer pricing questions with ranges when possible`,
    suggestedQuestions: [
      "What services do you offer?",
      "How much does it cost?",
      "Can I see a demo?",
      "Tell me more about your product",
    ],
  },

  // ==================== BILLING & INVOICING ====================
  {
    id: "billing",
    name: "Billing & Invoicing",
    description: "Handle payments, invoices, and billing queries",
    icon: "Receipt",
    color: "yellow",
    actions: [
      {
        id: "send_invoice",
        name: "Send Invoice",
        description: "Request invoice to be sent",
        triggerPhrases: ["invoice", "bill", "receipt", "payment details"],
        requiredFields: [
          { name: "phone", label: "Registered Phone", type: "phone", required: true },
          { name: "email", label: "Email for Invoice", type: "email", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "I'll send the invoice to {{email}}. You should receive it within a few minutes. Shall I proceed?",
      },
      {
        id: "payment_reminder",
        name: "Payment Reminder",
        description: "Inquire about pending payments",
        triggerPhrases: ["pending", "due", "outstanding", "payment reminder", "balance"],
        requiredFields: [
          { name: "phone", label: "Registered Phone", type: "phone", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Here's your payment status:\n\n💰 Outstanding Amount: {{amount}}\n📅 Due Date: {{due_date}}\n📋 Invoice #: {{invoice_number}}\n\nWould you like to make a payment now?",
      },
      {
        id: "payment_confirmation",
        name: "Payment Confirmation",
        description: "Confirm payment received",
        triggerPhrases: ["paid", "payment done", "transferred", "confirm payment"],
        requiredFields: [
          { name: "phone", label: "Registered Phone", type: "phone", required: true },
          { name: "transaction_id", label: "Transaction ID/Reference", type: "text", required: false },
          { name: "amount", label: "Amount Paid", type: "number", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "Thank you! I'll verify your payment:\n\n💰 Amount: ₹{{amount}}\n🔖 Reference: {{transaction_id}}\n\nYou'll receive a confirmation once verified. Anything else I can help with?",
      },
      {
        id: "request_payment_link",
        name: "Request Payment Link",
        description: "Send payment link",
        triggerPhrases: ["payment link", "pay online", "how to pay", "UPI", "card payment"],
        requiredFields: [
          { name: "phone", label: "Registered Phone", type: "phone", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Here's your payment link:\n\n🔗 {{payment_link}}\n💰 Amount: ₹{{amount}}\n\nYou can pay via UPI, Card, or Net Banking. The link is valid for 24 hours.",
      },
    ],
    systemPromptAddition: `
## Billing & Invoicing Capability
You can help with payment and billing queries.

Guidelines:
- Always verify identity with registered phone number
- Provide clear payment information
- Offer multiple payment options
- Be patient with payment-related concerns
- Confirm payment details before processing`,
    suggestedQuestions: [
      "Send me my invoice",
      "What's my pending balance?",
      "I've made a payment",
      "How can I pay online?",
    ],
  },

  // ==================== REMINDERS ====================
  {
    id: "reminders",
    name: "Reminders & Notifications",
    description: "Set reminders and manage notifications",
    icon: "Bell",
    color: "orange",
    actions: [
      {
        id: "set_reminder",
        name: "Set Reminder",
        description: "Create a reminder",
        triggerPhrases: ["remind", "reminder", "don't forget", "alert me", "notify me"],
        requiredFields: [
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "message", label: "Reminder Message", type: "text", required: true },
          { name: "datetime", label: "When to Remind", type: "datetime", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "I'll set a reminder:\n\n📝 Message: {{message}}\n⏰ Time: {{datetime}}\n📱 To: {{phone}}\n\nShall I confirm this reminder?",
      },
      {
        id: "appointment_reminder",
        name: "Appointment Reminder",
        description: "Reminder for upcoming appointment",
        triggerPhrases: ["appointment reminder", "when is my appointment", "upcoming appointment"],
        requiredFields: [
          { name: "phone", label: "Registered Phone", type: "phone", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Your upcoming appointment:\n\n📅 Date: {{date}}\n⏰ Time: {{time}}\n📍 Location: {{location}}\n🔧 Service: {{service}}\n\nWould you like me to send you a reminder before the appointment?",
      },
      {
        id: "cancel_reminder",
        name: "Cancel Reminder",
        description: "Remove a set reminder",
        triggerPhrases: ["cancel reminder", "remove reminder", "stop reminder"],
        requiredFields: [
          { name: "phone", label: "Phone Number", type: "phone", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "I'll cancel your reminder. Are you sure?",
      },
    ],
    systemPromptAddition: `
## Reminders Capability
You can help users set and manage reminders.

Guidelines:
- Confirm reminder details clearly
- Support various date/time formats
- Offer to set recurring reminders if appropriate
- Send reminders at appropriate times (not too early/late)`,
    suggestedQuestions: [
      "Remind me about my appointment",
      "Set a reminder for tomorrow",
      "What reminders do I have?",
      "Cancel my reminders",
    ],
  },

  // ==================== ORDER MANAGEMENT ====================
  {
    id: "orders",
    name: "Order Management",
    description: "Track orders, handle returns, and manage deliveries",
    icon: "Package",
    color: "teal",
    actions: [
      {
        id: "track_order",
        name: "Track Order",
        description: "Check order status",
        triggerPhrases: ["track", "where is my order", "order status", "delivery status", "shipping"],
        requiredFields: [
          { name: "order_id", label: "Order ID", type: "text", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Here's your order status:\n\n📦 Order ID: {{order_id}}\n📊 Status: {{status}}\n🚚 Delivery: {{delivery_date}}\n📍 Current Location: {{current_location}}",
      },
      {
        id: "cancel_order",
        name: "Cancel Order",
        description: "Cancel an existing order",
        triggerPhrases: ["cancel order", "don't want order", "stop order", "cancel my order"],
        requiredFields: [
          { name: "order_id", label: "Order ID", type: "text", required: true },
          { name: "reason", label: "Reason for Cancellation", type: "select", required: true, options: ["Changed my mind", "Found better price", "Ordered by mistake", "Delivery too late", "Other"] },
        ],
        confirmationRequired: true,
        responseTemplate: "I'll process the cancellation for Order #{{order_id}}.\n\nReason: {{reason}}\n\nRefund will be processed within 5-7 business days. Confirm cancellation?",
      },
      {
        id: "return_order",
        name: "Return/Exchange",
        description: "Initiate return or exchange",
        triggerPhrases: ["return", "exchange", "refund", "replace", "wrong item", "damaged"],
        requiredFields: [
          { name: "order_id", label: "Order ID", type: "text", required: true },
          { name: "reason", label: "Reason for Return", type: "select", required: true, options: ["Defective/Damaged", "Wrong item received", "Not as described", "Changed my mind", "Size/Fit issue", "Other"] },
          { name: "action", label: "Preferred Action", type: "select", required: true, options: ["Refund", "Exchange", "Replacement"] },
        ],
        confirmationRequired: true,
        responseTemplate: "I'll initiate a {{action}} for your order:\n\n📦 Order ID: {{order_id}}\n📝 Reason: {{reason}}\n\nOur team will arrange pickup within 2-3 business days. Confirm?",
      },
      {
        id: "reorder",
        name: "Reorder",
        description: "Place same order again",
        triggerPhrases: ["reorder", "order again", "same order", "repeat order"],
        requiredFields: [
          { name: "order_id", label: "Previous Order ID", type: "text", required: true },
          { name: "address", label: "Delivery Address", type: "textarea", required: false, placeholder: "Leave blank for same address" },
        ],
        confirmationRequired: true,
        responseTemplate: "I'll place the same order:\n\n📦 Items: {{items}}\n💰 Total: ₹{{total}}\n📍 Address: {{address}}\n\nShall I confirm this order?",
      },
    ],
    systemPromptAddition: `
## Order Management Capability
You can help with order tracking, cancellations, returns, and reorders.

Guidelines:
- Always ask for Order ID to look up orders
- Provide clear status updates
- Explain refund/return policies
- Be helpful with delivery concerns
- Offer alternatives when items are unavailable`,
    suggestedQuestions: [
      "Where is my order?",
      "I want to return an item",
      "Cancel my order",
      "Track my delivery",
    ],
  },

  // ==================== HR & RECRUITMENT ====================
  {
    id: "hr",
    name: "HR & Recruitment",
    description: "Handle job inquiries, applications, and HR queries",
    icon: "Users",
    color: "pink",
    actions: [
      {
        id: "job_inquiry",
        name: "Job Inquiry",
        description: "Information about open positions",
        triggerPhrases: ["jobs", "hiring", "openings", "career", "vacancy", "positions"],
        requiredFields: [],
        confirmationRequired: false,
        responseTemplate: "Here are our current openings:\n\n{{job_listings}}\n\nWould you like to apply for any of these positions?",
      },
      {
        id: "submit_application",
        name: "Submit Application",
        description: "Apply for a position",
        triggerPhrases: ["apply", "application", "submit resume", "want to work"],
        requiredFields: [
          { name: "name", label: "Full Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "position", label: "Position Applying For", type: "text", required: true },
          { name: "experience", label: "Years of Experience", type: "number", required: true },
          { name: "current_ctc", label: "Current CTC (LPA)", type: "text", required: false },
          { name: "expected_ctc", label: "Expected CTC (LPA)", type: "text", required: false },
          { name: "notice_period", label: "Notice Period", type: "text", required: false },
        ],
        confirmationRequired: true,
        responseTemplate: "Thank you for your application!\n\n👤 Name: {{name}}\n💼 Position: {{position}}\n📧 Email: {{email}}\n\nPlease send your resume to careers@company.com with subject: 'Application for {{position}}'\n\nOur HR team will review and get back to you within 5-7 business days.",
      },
      {
        id: "application_status",
        name: "Application Status",
        description: "Check application status",
        triggerPhrases: ["application status", "interview status", "selection", "shortlisted"],
        requiredFields: [
          { name: "email", label: "Email used for application", type: "email", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Your application status:\n\n💼 Position: {{position}}\n📊 Status: {{status}}\n📅 Applied: {{applied_date}}\n\n{{next_steps}}",
      },
      {
        id: "schedule_interview",
        name: "Schedule Interview",
        description: "Book interview slot",
        triggerPhrases: ["interview", "schedule interview", "interview time"],
        requiredFields: [
          { name: "email", label: "Email", type: "email", required: true },
          { name: "date", label: "Preferred Date", type: "date", required: true },
          { name: "time", label: "Preferred Time", type: "time", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "I'll schedule your interview:\n\n📅 Date: {{date}}\n⏰ Time: {{time}}\n📍 Mode: {{mode}}\n\nYou'll receive a calendar invite shortly. Confirm?",
      },
    ],
    systemPromptAddition: `
## HR & Recruitment Capability
You can help with job inquiries, applications, and HR-related questions.

Guidelines:
- Provide clear job descriptions
- Collect complete candidate information
- Be encouraging but realistic about processes
- Guide candidates through application steps
- Respect confidentiality of HR matters`,
    suggestedQuestions: [
      "Are you hiring?",
      "How do I apply?",
      "What's my application status?",
      "Schedule an interview",
    ],
  },

  // ==================== HEALTHCARE ====================
  {
    id: "healthcare",
    name: "Healthcare Assistant",
    description: "Medical appointments, health queries, and patient support",
    icon: "Stethoscope",
    color: "red",
    actions: [
      {
        id: "book_consultation",
        name: "Book Consultation",
        description: "Schedule doctor consultation",
        triggerPhrases: ["doctor", "consultation", "checkup", "appointment", "visit"],
        requiredFields: [
          { name: "name", label: "Patient Name", type: "text", required: true },
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "age", label: "Age", type: "number", required: true },
          { name: "gender", label: "Gender", type: "select", required: true, options: ["Male", "Female", "Other"] },
          { name: "department", label: "Department", type: "select", required: true, options: ["General Medicine", "Pediatrics", "Orthopedics", "Dermatology", "ENT", "Gynecology", "Cardiology", "Other"] },
          { name: "symptoms", label: "Brief Description of Symptoms", type: "textarea", required: true },
          { name: "date", label: "Preferred Date", type: "date", required: true },
          { name: "time", label: "Preferred Time", type: "time", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "I've noted your consultation request:\n\n👤 Patient: {{name}}\n🏥 Department: {{department}}\n📅 Date: {{date}}\n⏰ Time: {{time}}\n📝 Symptoms: {{symptoms}}\n\nPlease arrive 15 minutes early. Shall I confirm?",
      },
      {
        id: "doctor_availability",
        name: "Doctor Availability",
        description: "Check doctor schedules",
        triggerPhrases: ["available", "doctor schedule", "when is doctor", "timings"],
        requiredFields: [
          { name: "department", label: "Department", type: "select", required: true, options: ["General Medicine", "Pediatrics", "Orthopedics", "Dermatology", "ENT", "Gynecology", "Cardiology", "Other"] },
          { name: "date", label: "Date to Check", type: "date", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Available doctors for {{department}} on {{date}}:\n\n{{doctor_list}}\n\nWould you like to book an appointment?",
      },
      {
        id: "lab_reports",
        name: "Lab Reports",
        description: "Request lab reports",
        triggerPhrases: ["lab report", "test results", "reports", "pathology"],
        requiredFields: [
          { name: "phone", label: "Registered Phone", type: "phone", required: true },
          { name: "patient_id", label: "Patient ID (if known)", type: "text", required: false },
        ],
        confirmationRequired: true,
        responseTemplate: "I'll send your lab reports to your registered email/WhatsApp. Please note:\n\n⚠️ For detailed interpretation, please consult your doctor.\n\nShall I proceed?",
      },
      {
        id: "prescription_refill",
        name: "Prescription Refill",
        description: "Request prescription refill",
        triggerPhrases: ["prescription", "refill", "medicine", "medication", "drugs"],
        requiredFields: [
          { name: "phone", label: "Registered Phone", type: "phone", required: true },
          { name: "medication", label: "Medication Name", type: "text", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "I'll forward your refill request to the doctor:\n\n💊 Medication: {{medication}}\n\nThe doctor will review and approve. You'll receive confirmation within 24 hours.",
      },
    ],
    systemPromptAddition: `
## Healthcare Assistant Capability
You assist with medical appointments and patient queries.

IMPORTANT GUIDELINES:
- NEVER provide medical diagnosis or treatment advice
- Always recommend consulting a healthcare professional
- Collect symptoms for doctor's reference only
- Maintain patient confidentiality
- Be empathetic with health concerns
- Emergency: Direct to nearest hospital/call 108`,
    suggestedQuestions: [
      "I need to see a doctor",
      "What are the doctor's timings?",
      "Get my lab reports",
      "I need to refill my prescription",
    ],
  },

  // ==================== EDUCATION ====================
  {
    id: "education",
    name: "Education & Training",
    description: "Course inquiries, enrollment, and academic support",
    icon: "GraduationCap",
    color: "indigo",
    actions: [
      {
        id: "course_inquiry",
        name: "Course Inquiry",
        description: "Information about courses",
        triggerPhrases: ["courses", "programs", "classes", "training", "learn", "study"],
        requiredFields: [],
        confirmationRequired: false,
        responseTemplate: "Here are our available courses:\n\n{{course_list}}\n\nWould you like more details on any specific course?",
      },
      {
        id: "enroll_course",
        name: "Course Enrollment",
        description: "Enroll in a course",
        triggerPhrases: ["enroll", "register", "join", "admission", "sign up"],
        requiredFields: [
          { name: "name", label: "Student Name", type: "text", required: true },
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "email", label: "Email", type: "email", required: true },
          { name: "course", label: "Course Name", type: "text", required: true },
          { name: "qualification", label: "Highest Qualification", type: "text", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "Great! Here's your enrollment request:\n\n👤 Name: {{name}}\n📚 Course: {{course}}\n📧 Email: {{email}}\n\nFees: {{fees}}\n\nOur admission team will contact you with next steps. Confirm?",
      },
      {
        id: "fee_inquiry",
        name: "Fee Inquiry",
        description: "Course fees and payment info",
        triggerPhrases: ["fees", "cost", "price", "payment", "installment"],
        requiredFields: [
          { name: "course", label: "Course Name", type: "text", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Fee details for {{course}}:\n\n💰 Total Fee: {{total_fee}}\n📅 Payment Options:\n{{payment_options}}\n\nWould you like to enroll?",
      },
      {
        id: "class_schedule",
        name: "Class Schedule",
        description: "View class timings",
        triggerPhrases: ["schedule", "timetable", "timings", "when is class", "batch"],
        requiredFields: [
          { name: "course", label: "Course Name", type: "text", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Class schedule for {{course}}:\n\n{{schedule}}\n\nWould you like to enroll in any batch?",
      },
    ],
    systemPromptAddition: `
## Education Capability
You help with course information, enrollment, and academic queries.

Guidelines:
- Provide clear course information
- Explain prerequisites if any
- Share fee structure and payment options
- Guide through enrollment process
- Be encouraging about learning goals`,
    suggestedQuestions: [
      "What courses do you offer?",
      "How do I enroll?",
      "What are the fees?",
      "When do classes start?",
    ],
  },

  // ==================== REAL ESTATE ====================
  {
    id: "real_estate",
    name: "Real Estate",
    description: "Property listings, viewings, and real estate queries",
    icon: "Home",
    color: "emerald",
    actions: [
      {
        id: "property_search",
        name: "Property Search",
        description: "Search for properties",
        triggerPhrases: ["property", "house", "flat", "apartment", "rent", "buy", "looking for"],
        requiredFields: [
          { name: "type", label: "Property Type", type: "select", required: true, options: ["Apartment", "Villa", "Independent House", "Plot", "Commercial"] },
          { name: "purpose", label: "Purpose", type: "select", required: true, options: ["Buy", "Rent", "Lease"] },
          { name: "location", label: "Preferred Location", type: "text", required: true },
          { name: "budget", label: "Budget Range", type: "text", required: true },
          { name: "bedrooms", label: "Number of Bedrooms", type: "select", required: false, options: ["1 BHK", "2 BHK", "3 BHK", "4+ BHK"] },
        ],
        confirmationRequired: false,
        responseTemplate: "Based on your requirements:\n\n🏠 Type: {{type}}\n📍 Location: {{location}}\n💰 Budget: {{budget}}\n\nHere are matching properties:\n{{property_list}}\n\nWould you like to schedule a viewing?",
      },
      {
        id: "schedule_viewing",
        name: "Schedule Viewing",
        description: "Book property visit",
        triggerPhrases: ["visit", "viewing", "see property", "site visit"],
        requiredFields: [
          { name: "name", label: "Your Name", type: "text", required: true },
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "property_id", label: "Property ID", type: "text", required: true },
          { name: "date", label: "Preferred Date", type: "date", required: true },
          { name: "time", label: "Preferred Time", type: "time", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "I'll schedule your property viewing:\n\n🏠 Property: {{property_id}}\n📅 Date: {{date}}\n⏰ Time: {{time}}\n\nOur agent will meet you at the location. Confirm?",
      },
      {
        id: "property_inquiry",
        name: "Property Inquiry",
        description: "Detailed property information",
        triggerPhrases: ["details", "more info", "tell me about", "specifications"],
        requiredFields: [
          { name: "property_id", label: "Property ID", type: "text", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Property Details:\n\n{{property_details}}\n\nWould you like to schedule a viewing?",
      },
    ],
    systemPromptAddition: `
## Real Estate Capability
You help with property searches, viewings, and real estate queries.

Guidelines:
- Understand buyer/renter requirements
- Suggest properties within budget
- Highlight key features and amenities
- Provide neighborhood information
- Schedule viewings at convenient times`,
    suggestedQuestions: [
      "I'm looking for a property",
      "Show me available flats",
      "Schedule a property visit",
      "What's the price range?",
    ],
  },

  // ==================== HOSPITALITY ====================
  {
    id: "hospitality",
    name: "Hospitality & Restaurants",
    description: "Reservations, menu info, and hospitality services",
    icon: "UtensilsCrossed",
    color: "amber",
    actions: [
      {
        id: "table_reservation",
        name: "Table Reservation",
        description: "Book a table",
        triggerPhrases: ["book table", "reservation", "reserve", "table for", "dinner", "lunch"],
        requiredFields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "guests", label: "Number of Guests", type: "number", required: true },
          { name: "date", label: "Date", type: "date", required: true },
          { name: "time", label: "Time", type: "time", required: true },
          { name: "special_requests", label: "Special Requests", type: "textarea", required: false, placeholder: "Birthday, anniversary, dietary needs..." },
        ],
        confirmationRequired: true,
        responseTemplate: "I'll reserve a table for you:\n\n👤 Name: {{name}}\n👥 Guests: {{guests}}\n📅 Date: {{date}}\n⏰ Time: {{time}}\n\nSpecial Requests: {{special_requests}}\n\nConfirm reservation?",
      },
      {
        id: "menu_inquiry",
        name: "Menu Inquiry",
        description: "View menu and prices",
        triggerPhrases: ["menu", "food", "dishes", "what do you serve", "specials", "cuisine"],
        requiredFields: [],
        confirmationRequired: false,
        responseTemplate: "Here's our menu:\n\n{{menu}}\n\n🌟 Today's Special: {{special}}\n\nWould you like to place an order or make a reservation?",
      },
      {
        id: "food_order",
        name: "Food Order",
        description: "Place food order",
        triggerPhrases: ["order", "delivery", "takeaway", "home delivery"],
        requiredFields: [
          { name: "name", label: "Name", type: "text", required: true },
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "items", label: "Items to Order", type: "textarea", required: true },
          { name: "address", label: "Delivery Address", type: "textarea", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "Your order:\n\n📝 Items: {{items}}\n📍 Address: {{address}}\n💰 Total: ₹{{total}}\n⏱️ Delivery Time: {{delivery_time}}\n\nConfirm order?",
      },
    ],
    systemPromptAddition: `
## Hospitality Capability
You help with restaurant reservations, menu inquiries, and food orders.

Guidelines:
- Be warm and welcoming
- Highlight specials and recommendations
- Note dietary restrictions
- Confirm reservation details
- Provide accurate delivery estimates`,
    suggestedQuestions: [
      "Book a table for tonight",
      "What's on the menu?",
      "Order food for delivery",
      "What are your specials?",
    ],
  },

  // ==================== AUTOMOTIVE ====================
  {
    id: "automotive",
    name: "Automotive",
    description: "Vehicle sales, service booking, and automotive queries",
    icon: "Car",
    color: "slate",
    actions: [
      {
        id: "vehicle_inquiry",
        name: "Vehicle Inquiry",
        description: "Information about vehicles",
        triggerPhrases: ["car", "vehicle", "bike", "scooter", "model", "price"],
        requiredFields: [],
        confirmationRequired: false,
        responseTemplate: "{{vehicle_info}}\n\nWould you like to schedule a test drive?",
      },
      {
        id: "test_drive",
        name: "Book Test Drive",
        description: "Schedule test drive",
        triggerPhrases: ["test drive", "try", "drive", "experience"],
        requiredFields: [
          { name: "name", label: "Your Name", type: "text", required: true },
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "vehicle", label: "Vehicle Model", type: "text", required: true },
          { name: "date", label: "Preferred Date", type: "date", required: true },
          { name: "time", label: "Preferred Time", type: "time", required: true },
        ],
        confirmationRequired: true,
        responseTemplate: "Test drive scheduled:\n\n🚗 Vehicle: {{vehicle}}\n👤 Name: {{name}}\n📅 Date: {{date}}\n⏰ Time: {{time}}\n📍 Location: {{location}}\n\nPlease bring your driving license. Confirm?",
      },
      {
        id: "service_booking",
        name: "Service Booking",
        description: "Book vehicle service",
        triggerPhrases: ["service", "repair", "maintenance", "oil change", "checkup"],
        requiredFields: [
          { name: "name", label: "Owner Name", type: "text", required: true },
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "vehicle", label: "Vehicle (Model/Registration)", type: "text", required: true },
          { name: "service_type", label: "Service Type", type: "select", required: true, options: ["Regular Service", "Major Service", "Oil Change", "Brake Service", "AC Service", "General Repair", "Accident Repair"] },
          { name: "date", label: "Preferred Date", type: "date", required: true },
          { name: "pickup", label: "Need Pickup?", type: "select", required: false, options: ["Yes", "No"] },
        ],
        confirmationRequired: true,
        responseTemplate: "Service booking:\n\n🚗 Vehicle: {{vehicle}}\n🔧 Service: {{service_type}}\n📅 Date: {{date}}\n🚐 Pickup: {{pickup}}\n\nEstimated Cost: ₹{{estimate}}\n\nConfirm booking?",
      },
    ],
    systemPromptAddition: `
## Automotive Capability
You help with vehicle sales, service bookings, and automotive queries.

Guidelines:
- Provide accurate vehicle information
- Highlight features and benefits
- Book test drives with convenience
- Explain service options clearly
- Provide cost estimates when possible`,
    suggestedQuestions: [
      "Tell me about your vehicles",
      "Book a test drive",
      "I need to service my car",
      "What are the latest offers?",
    ],
  },

  // ==================== GENERAL ====================
  {
    id: "general",
    name: "General Assistant",
    description: "General purpose conversational agent",
    icon: "MessageSquare",
    color: "gray",
    actions: [
      {
        id: "general_query",
        name: "General Query",
        description: "Answer general questions",
        triggerPhrases: [],
        requiredFields: [],
        confirmationRequired: false,
        responseTemplate: "{{response}}",
      },
      {
        id: "contact_request",
        name: "Contact Request",
        description: "Request callback or contact",
        triggerPhrases: ["contact", "call me", "reach out", "speak to someone", "human"],
        requiredFields: [
          { name: "name", label: "Your Name", type: "text", required: true },
          { name: "phone", label: "Phone Number", type: "phone", required: true },
          { name: "query", label: "Brief Query", type: "text", required: true },
        ],
        confirmationRequired: false,
        responseTemplate: "Thank you! Our team will contact you shortly at {{phone}}.\n\nQuery: {{query}}\n\nIs there anything else I can help with?",
      },
    ],
    systemPromptAddition: `
## General Assistant Capability
You are a helpful general assistant.

Guidelines:
- Be friendly and conversational
- Answer questions clearly
- Guide users to appropriate resources
- Know when to escalate to human support`,
    suggestedQuestions: [
      "Tell me about your services",
      "I have a question",
      "Please contact me",
      "Help me with something",
    ],
  },
];

// Helper function to get capability by ID
export function getCapabilityById(id: CapabilityCategory): Capability | undefined {
  return AGENT_CAPABILITIES.find(cap => cap.id === id);
}

// Helper function to generate system prompt from selected capabilities
export function generateSystemPromptFromCapabilities(
  capabilities: CapabilityCategory[],
  businessName: string,
  businessInfo: string,
  customInstructions?: string
): string {
  let prompt = `You are an AI assistant for ${businessName}.

## About the Business
${businessInfo}

## Your Role
You help users with their queries in a friendly, professional manner. Respond in the same language the user writes in.
`;

  // Add capability-specific prompts
  for (const capId of capabilities) {
    const capability = getCapabilityById(capId);
    if (capability) {
      prompt += capability.systemPromptAddition + "\n";
    }
  }

  // Add custom instructions if provided
  if (customInstructions) {
    prompt += `\n## Additional Instructions\n${customInstructions}\n`;
  }

  prompt += `
## Guidelines
- Be conversational and friendly
- Collect information one step at a time, don't overwhelm users
- Confirm important details before finalizing actions
- If unsure, ask clarifying questions
- Respect user privacy
- Offer to connect with human support when needed
`;

  return prompt;
}

// Helper function to get suggested questions for selected capabilities
export function getSuggestedQuestionsForCapabilities(capabilities: CapabilityCategory[]): string[] {
  const questions: string[] = [];
  for (const capId of capabilities) {
    const capability = getCapabilityById(capId);
    if (capability) {
      questions.push(...capability.suggestedQuestions);
    }
  }
  // Return unique questions, max 6
  return Array.from(new Set(questions)).slice(0, 6);
}
