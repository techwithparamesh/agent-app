# WhatsApp Business Categories → Fields / Capabilities / Tools

This matrix describes what to collect during onboarding and what the platform can actually *do* today for each category.

Terminology:
- **Fields** → stored in `agent.businessInfo` (and for booking, `agent.businessInfo.appointmentSettings`).
- **Capabilities** → the checkboxes shown in the WhatsApp agent wizard.
- **Tools** → deterministic backend actions currently implemented in `server/whatsapp/toolEngine.ts`.

## Tools implemented today
- `check_availability`
- `book_appointment`
- `cancel_appointment`
- `reschedule_appointment`
- `get_appointment_status`
- `capture_lead`
- `human_handoff`
- `get_business_info`
- `search_knowledge`

Note: Some capabilities like **Orders**, **Delivery Tracking**, etc. are currently handled via knowledge-base responses + lead capture/handoff unless you add integrations/workflows.

---

## Healthcare & Clinics
**Core fields**
- `name` (required)
- `phone`, `email`, `address`, `workingHours`
- `specialties`, `doctors`, `insurance`
- `appointmentSettings` (multi-doctor hours, buffer, holidays)

**Recommended capabilities**
- Appointment Booking, Reminders, Billing Inquiries, Location & Directions, Doctor Information

**Tools used (today)**
- Booking: `check_availability`, `book_appointment`, `cancel_appointment`, `reschedule_appointment`, `get_appointment_status`
- Info: `get_business_info`, `search_knowledge`
- Escalation: `human_handoff`

---

## Salons & Spas
**Core fields**
- `name` (required)
- `phone`, `email`, `address`, `workingHours`
- `services`, `stylists`, `pricing`
- `appointmentSettings`

**Recommended capabilities**
- Appointment Booking, Reminders, Service Menu & Pricing, Stylist Selection, Offers & Packages, Payment & Billing

**Tools used (today)**
- Booking: `check_availability`, `book_appointment`, `cancel_appointment`, `reschedule_appointment`, `get_appointment_status`
- Info: `search_knowledge`, `get_business_info`
- Escalation: `human_handoff`

---

## Restaurants & Cafes
**Core fields**
- `name` (required)
- `phone`, `email`, `address`, `workingHours`
- `cuisine`, `specialties`, `delivery`

**Recommended capabilities**
- Table Reservations, Menu & Pricing, Food Orders, Delivery Tracking, Offers & Combos, Bill Payment

**Tools used (today)**
- Menu/info: `search_knowledge`, `get_business_info`
- Orders/tracking: typically `capture_lead` + `human_handoff` (until you add order-system integrations)

---

## Automotive Services
**Core fields**
- `name` (required)
- `phone`, `email`, `address`, `workingHours`
- `services`, `brands`, `pricing`
- `appointmentSettings`

**Recommended capabilities**
- Service Booking, Service Reminders, Service Status, Cost Estimates, Payment & Invoices

**Tools used (today)**
- Booking: `check_availability`, `book_appointment`, `cancel_appointment`, `reschedule_appointment`, `get_appointment_status`
- Status/estimates: typically `capture_lead` + `human_handoff` unless integrated

---

## Education & Coaching
**Core fields**
- `name` (required)
- `phone`, `email`, `address`, `workingHours`
- `courses`, `levels`, `mode`

**Recommended capabilities**
- Course Enrollment, Class Schedule, Fee Payment, Class Reminders, Doubt Clearing

**Tools used (today)**
- Info: `search_knowledge`, `get_business_info`
- Enrollment/fees: typically `capture_lead` + `human_handoff` unless integrated

---

## Real Estate
**Core fields**
- `name` (required)
- `phone`, `email`, `address`, `workingHours`
- `properties`, `locations`, `priceRange`

**Recommended capabilities**
- Property Listings, Schedule Viewings, Property Inquiries, Pricing & EMI Info

**Tools used (today)**
- Listings/info: `search_knowledge`
- Viewing scheduling & leads: `capture_lead`, `human_handoff`

---

## Professional Services
**Core fields**
- `name` (required)
- `phone`, `email`, `address`, `workingHours`
- `services`, `expertise`, `consultationFee`
- `appointmentSettings`

**Recommended capabilities**
- Consultation Booking, Meeting Reminders, Document Requests, Invoice & Billing, General Queries

**Tools used (today)**
- Booking: `check_availability`, `book_appointment`, `cancel_appointment`, `reschedule_appointment`, `get_appointment_status`
- Documents/billing: usually `human_handoff` (until integrated)

---

## Retail & E-Commerce
**Core fields**
- `name` (required)
- `phone`, `email`, `address`, `workingHours`
- `products`, `deliveryAreas`, `paymentModes`

**Recommended capabilities**
- Product Catalog, Order Placement, Order Tracking, Returns & Exchanges, Payment & Invoices, Product Support, Offers & Discounts

**Tools used (today)**
- Catalog/info: `search_knowledge`
- Orders/tracking/returns: `capture_lead` + `human_handoff` unless integrated

---

## General Business
**Core fields**
- `name` (required)
- `phone`, `email`, `address`, `workingHours`
- `services`, `highlights`
- `appointmentSettings` (if booking is enabled)

**Recommended capabilities**
- Appointment Booking, Reminders, Customer Support, Billing Inquiries, Location & Directions, FAQ & Information

**Tools used (today)**
- Booking: `check_availability`, `book_appointment`, `cancel_appointment`, `reschedule_appointment`, `get_appointment_status`
- Info: `search_knowledge`, `get_business_info`
- Escalation: `human_handoff`
