import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Webhook, 
  Calendar, 
  Mail, 
  Database, 
  Globe, 
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
  Info,
  Sparkles,
  Clock,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

export type TriggerType = 'webhook' | 'poll' | 'schedule' | 'email' | 'manual';

interface TriggerEvent {
  id: string;
  name: string;
  description: string;
  icon: typeof Plus;
  recommended?: boolean;
}

// App-specific events (this would be dynamic based on app)
const GOOGLE_SHEETS_EVENTS: TriggerEvent[] = [
  {
    id: 'row_added',
    name: 'On Row Added',
    description: 'Triggers when a new row is added to the spreadsheet',
    icon: Plus,
    recommended: true
  },
  {
    id: 'row_updated',
    name: 'On Row Updated',
    description: 'Triggers when an existing row is modified',
    icon: Edit
  },
  {
    id: 'row_deleted',
    name: 'On Row Deleted',
    description: 'Triggers when a row is removed from the spreadsheet',
    icon: Trash2
  },
  {
    id: 'row_added_or_updated',
    name: 'On Row Added or Updated',
    description: 'Triggers when a row is added or modified',
    icon: Sparkles,
    recommended: true
  },
];

interface TriggerMethod {
  id: TriggerType;
  name: string;
  description: string;
  icon: typeof Webhook;
  badge?: string;
  whenToUse: string;
  pros: string[];
  cons: string[];
}

const TRIGGER_METHODS: TriggerMethod[] = [
  {
    id: 'poll',
    name: 'Polling',
    description: 'Check for changes at regular intervals',
    icon: RefreshCw,
    badge: 'Recommended',
    whenToUse: 'When the app doesn\'t support webhooks or you want regular scheduled checks',
    pros: ['Easy to set up', 'Works with any app', 'Predictable timing'],
    cons: ['May have delays', 'Uses more resources']
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Instant notification when changes occur',
    icon: Webhook,
    badge: 'Instant',
    whenToUse: 'When you need real-time updates and the app supports webhooks',
    pros: ['Instant updates', 'Resource efficient', 'No delays'],
    cons: ['Requires webhook setup', 'Not all apps support it']
  },
];

interface TriggerConfig {
  event: string;
  method: TriggerType;
  eventName: string;
  methodName: string;
}

interface TriggerSetupWizardProps {
  appName: string;
  appIcon: string;
  appId: string;
  onComplete: (config: TriggerConfig) => void;
  onSkip?: () => void;
}

export function TriggerSetupWizard({ 
  appName, 
  appIcon,
  appId,
  onComplete,
  onSkip 
}: TriggerSetupWizardProps) {
  const [step, setStep] = useState<'event' | 'method'>('event');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<TriggerType | null>(null);

  // Get events based on app (this would be dynamic)
  const events = appId === 'google-sheets' ? GOOGLE_SHEETS_EVENTS : GOOGLE_SHEETS_EVENTS;

  const handleEventSelect = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const handleMethodSelect = (methodId: TriggerType) => {
    setSelectedMethod(methodId);
  };

  const handleContinue = () => {
    if (step === 'event' && selectedEvent) {
      setStep('method');
    } else if (step === 'method' && selectedMethod && selectedEvent) {
      const event = events.find(e => e.id === selectedEvent);
      const method = TRIGGER_METHODS.find(m => m.id === selectedMethod);
      onComplete({
        event: selectedEvent,
        method: selectedMethod,
        eventName: event?.name || '',
        methodName: method?.name || ''
      });
    }
  };

  const handleBack = () => {
    if (step === 'method') {
      setStep('event');
      setSelectedMethod(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-muted/30">
        <div className="flex items-start gap-3">
          {step === 'method' && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <span className="text-2xl">{appIcon}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{appName}</h2>
              <Badge variant="outline" className="text-xs">Trigger</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {step === 'event' ? 'Step 1 of 2: Choose when to trigger' : 'Step 2 of 2: Choose how to monitor'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {step === 'event' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-medium">When should this workflow start?</h3>
              <p className="text-sm text-muted-foreground">
                Select the event that will trigger your workflow
              </p>
            </div>

            <RadioGroup value={selectedEvent || ''} onValueChange={handleEventSelect}>
              <div className="space-y-2">
                {events.map((event) => {
                  const Icon = event.icon;
                  const isSelected = selectedEvent === event.id;
                  
                  return (
                    <Card 
                      key={event.id}
                      className={`cursor-pointer transition-all hover:shadow-sm border-2 ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => handleEventSelect(event.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem 
                            value={event.id} 
                            id={event.id}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                              <Label htmlFor={event.id} className="font-medium cursor-pointer">
                                {event.name}
                              </Label>
                              {event.recommended && (
                                <Badge variant="secondary" className="text-xs">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </RadioGroup>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-medium">How should we monitor for changes?</h3>
              <p className="text-sm text-muted-foreground">
                Choose how {appName} should check for {events.find(e => e.id === selectedEvent)?.name.toLowerCase()}
              </p>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                For most use cases, we recommend <strong>Polling</strong> as it's easier to set up and works reliably.
              </AlertDescription>
            </Alert>

            <RadioGroup value={selectedMethod || ''} onValueChange={(v) => handleMethodSelect(v as TriggerType)}>
              <div className="space-y-3">
                {TRIGGER_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  
                  return (
                    <Card 
                      key={method.id}
                      className={`cursor-pointer transition-all hover:shadow-sm border-2 ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => handleMethodSelect(method.id)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <RadioGroupItem 
                              value={method.id} 
                              id={method.id}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                                <Label htmlFor={method.id} className="font-medium cursor-pointer">
                                  {method.name}
                                </Label>
                                {method.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {method.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {method.description}
                              </p>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p><strong>When to use:</strong> {method.whenToUse}</p>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                          
                          {isSelected && (
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                              <div>
                                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Pros</p>
                                <ul className="text-xs text-muted-foreground space-y-0.5">
                                  {method.pros.map((pro, i) => (
                                    <li key={i}>• {pro}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">Cons</p>
                                <ul className="text-xs text-muted-foreground space-y-0.5">
                                  {method.cons.map((con, i) => (
                                    <li key={i}>• {con}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </RadioGroup>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t bg-muted/30 flex items-center justify-between">
        {onSkip && step === 'event' && (
          <Button variant="ghost" onClick={onSkip} size="sm">
            Skip for now
          </Button>
        )}
        <div className="ml-auto">
          <Button 
            className="gap-2"
            disabled={(step === 'event' && !selectedEvent) || (step === 'method' && !selectedMethod)}
            onClick={handleContinue}
            size="sm"
          >
            {step === 'event' ? 'Continue' : 'Complete Setup'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
