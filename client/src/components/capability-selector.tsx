import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Calendar,
  HeadphonesIcon,
  TrendingUp,
  Receipt,
  Bell,
  Package,
  Users,
  Stethoscope,
  GraduationCap,
  Home,
  UtensilsCrossed,
  Car,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";
import type { CapabilityCategory } from "@shared/capabilities";

interface CapabilityOption {
  id: CapabilityCategory;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  actions: string[];
}

const capabilityOptions: CapabilityOption[] = [
  {
    id: "appointments",
    name: "Appointment Booking",
    description: "Schedule, reschedule, and manage appointments",
    icon: Calendar,
    color: "text-blue-500",
    actions: ["Book appointments", "Reschedule", "Cancel", "Check availability"],
  },
  {
    id: "customer_support",
    name: "Customer Support",
    description: "Handle inquiries, complaints, and feedback",
    icon: HeadphonesIcon,
    color: "text-green-500",
    actions: ["Answer FAQs", "Raise complaints", "Track issues", "Collect feedback"],
  },
  {
    id: "sales",
    name: "Sales & Lead Generation",
    description: "Capture leads, qualify prospects, schedule demos",
    icon: TrendingUp,
    color: "text-purple-500",
    actions: ["Product info", "Get quotes", "Schedule demos", "Capture leads"],
  },
  {
    id: "billing",
    name: "Billing & Invoicing",
    description: "Handle payments, invoices, and billing queries",
    icon: Receipt,
    color: "text-yellow-500",
    actions: ["Send invoices", "Payment reminders", "Payment links", "Confirm payments"],
  },
  {
    id: "reminders",
    name: "Reminders & Notifications",
    description: "Set reminders and manage notifications",
    icon: Bell,
    color: "text-orange-500",
    actions: ["Set reminders", "Appointment reminders", "Payment reminders"],
  },
  {
    id: "orders",
    name: "Order Management",
    description: "Track orders, handle returns, manage deliveries",
    icon: Package,
    color: "text-teal-500",
    actions: ["Track orders", "Cancel orders", "Returns/exchanges", "Reorder"],
  },
  {
    id: "hr",
    name: "HR & Recruitment",
    description: "Job inquiries, applications, and HR queries",
    icon: Users,
    color: "text-pink-500",
    actions: ["Job listings", "Submit applications", "Interview scheduling", "Application status"],
  },
  {
    id: "healthcare",
    name: "Healthcare Assistant",
    description: "Medical appointments and patient support",
    icon: Stethoscope,
    color: "text-red-500",
    actions: ["Book consultations", "Doctor availability", "Lab reports", "Prescription refills"],
  },
  {
    id: "education",
    name: "Education & Training",
    description: "Course inquiries, enrollment, and academic support",
    icon: GraduationCap,
    color: "text-indigo-500",
    actions: ["Course info", "Enrollment", "Fee inquiry", "Class schedules"],
  },
  {
    id: "real_estate",
    name: "Real Estate",
    description: "Property listings, viewings, and inquiries",
    icon: Home,
    color: "text-emerald-500",
    actions: ["Property search", "Schedule viewings", "Property details", "Price inquiries"],
  },
  {
    id: "hospitality",
    name: "Hospitality & Restaurants",
    description: "Reservations, menu info, and food orders",
    icon: UtensilsCrossed,
    color: "text-amber-500",
    actions: ["Table reservations", "Menu info", "Food orders", "Special requests"],
  },
  {
    id: "automotive",
    name: "Automotive",
    description: "Vehicle sales, service booking, and queries",
    icon: Car,
    color: "text-slate-500",
    actions: ["Vehicle info", "Test drives", "Service booking", "Repair status"],
  },
  {
    id: "general",
    name: "General Assistant",
    description: "General purpose conversational agent",
    icon: MessageSquare,
    color: "text-gray-500",
    actions: ["Answer questions", "Provide info", "Contact requests"],
  },
];

interface CapabilitySelectorProps {
  selectedCapabilities: CapabilityCategory[];
  onChange: (capabilities: CapabilityCategory[]) => void;
  maxSelections?: number;
}

export function CapabilitySelector({ 
  selectedCapabilities, 
  onChange, 
  maxSelections = 5 
}: CapabilitySelectorProps) {
  const [expandedCapability, setExpandedCapability] = useState<string | null>(null);

  const toggleCapability = (capabilityId: CapabilityCategory) => {
    if (selectedCapabilities.includes(capabilityId)) {
      onChange(selectedCapabilities.filter(id => id !== capabilityId));
    } else if (selectedCapabilities.length < maxSelections) {
      onChange([...selectedCapabilities, capabilityId]);
    }
  };

  const selectAllCore = () => {
    const coreCapabilities: CapabilityCategory[] = ["appointments", "customer_support", "billing", "general"];
    onChange(coreCapabilities);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agent Capabilities</h3>
          <p className="text-sm text-muted-foreground">
            Select what your agent can do ({selectedCapabilities.length}/{maxSelections} selected)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={selectAllCore}>
          <Sparkles className="h-4 w-4 mr-2" />
          Quick Select Core
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {capabilityOptions.map((capability) => {
          const Icon = capability.icon;
          const isSelected = selectedCapabilities.includes(capability.id);
          const isDisabled = !isSelected && selectedCapabilities.length >= maxSelections;

          return (
            <Collapsible 
              key={capability.id}
              open={expandedCapability === capability.id}
              onOpenChange={(open) => setExpandedCapability(open ? capability.id : null)}
            >
              <Card 
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : isDisabled 
                    ? "opacity-50" 
                    : "hover:border-primary/50"
                }`}
              >
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={() => toggleCapability(capability.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${capability.color}`} />
                        <CardTitle className="text-sm font-medium">
                          {capability.name}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs mt-1 line-clamp-1">
                        {capability.description}
                      </CardDescription>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {expandedCapability === capability.id ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="p-3 pt-0">
                    <div className="text-xs text-muted-foreground mb-2">Actions:</div>
                    <div className="flex flex-wrap gap-1">
                      {capability.actions.map((action) => (
                        <Badge key={action} variant="secondary" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>

      {selectedCapabilities.length === 0 && (
        <div className="text-center text-sm text-muted-foreground p-4 border rounded-lg border-dashed">
          Select at least one capability for your agent
        </div>
      )}

      {selectedCapabilities.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">Selected:</span>
          {selectedCapabilities.map((capId) => {
            const cap = capabilityOptions.find(c => c.id === capId);
            if (!cap) return null;
            const Icon = cap.icon;
            return (
              <Badge key={capId} variant="default" className="gap-1">
                <Icon className="h-3 w-3" />
                {cap.name}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Preset configurations for common use cases
export const CAPABILITY_PRESETS = {
  appointment_booking: {
    name: "Appointment Booking",
    capabilities: ["appointments", "reminders", "general"] as CapabilityCategory[],
    description: "Perfect for clinics, salons, consultants",
  },
  customer_service: {
    name: "Customer Service",
    capabilities: ["customer_support", "orders", "billing", "general"] as CapabilityCategory[],
    description: "For e-commerce and service businesses",
  },
  sales_agent: {
    name: "Sales Agent",
    capabilities: ["sales", "appointments", "general"] as CapabilityCategory[],
    description: "Lead generation and sales support",
  },
  healthcare: {
    name: "Healthcare Assistant",
    capabilities: ["healthcare", "appointments", "reminders", "general"] as CapabilityCategory[],
    description: "For clinics and hospitals",
  },
  restaurant: {
    name: "Restaurant Assistant",
    capabilities: ["hospitality", "orders", "reminders", "general"] as CapabilityCategory[],
    description: "For restaurants and cafes",
  },
};
