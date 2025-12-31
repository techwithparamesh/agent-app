export const templateCategories = [
  { value: "Appointments", label: "Appointment Booking" },
  { value: "Sales", label: "Sales & Lead Gen" },
  { value: "Billing", label: "Billing & Invoicing" },
  { value: "Orders", label: "Order Management" },
  { value: "Retail", label: "Retail & E-Commerce" },
  { value: "Support", label: "Customer Support" },
  { value: "Education", label: "Education & Training" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Automotive", label: "Automotive" },
  { value: "Business", label: "Business & B2B" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Finance", label: "Finance & Banking" },
  { value: "Legal", label: "Legal Services" },
  { value: "Other", label: "Other" },
] as const;

export type TemplateCategory = (typeof templateCategories)[number]["value"];

const templateCategorySet = new Set<string>(templateCategories.map((c) => c.value));

export function isTemplateCategory(value: string): value is TemplateCategory {
  return templateCategorySet.has(value);
}
