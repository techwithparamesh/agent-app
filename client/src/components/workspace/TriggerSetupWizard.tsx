import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Webhook, 
  Calendar, 
  Mail, 
  Database, 
  Globe, 
  RefreshCw,
  ArrowRight,
  CheckCircle2 
} from "lucide-react";

export type TriggerType = 'webhook' | 'poll' | 'schedule' | 'email' | 'manual';

interface TriggerOption {
  id: TriggerType;
  name: string;
  description: string;
  icon: typeof Webhook;
  badge?: string;
  example: string;
}

const TRIGGER_OPTIONS: TriggerOption[] = [
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Trigger when a webhook URL receives data',
    icon: Webhook,
    badge: 'Real-time',
    example: 'When someone submits a form or makes a purchase'
  },
  {
    id: 'poll',
    name: 'Polling',
    description: 'Check for new data at regular intervals',
    icon: RefreshCw,
    badge: 'Scheduled',
    example: 'Check for new rows in Google Sheets every 5 minutes'
  },
  {
    id: 'schedule',
    name: 'Schedule',
    description: 'Run at specific times or intervals',
    icon: Calendar,
    badge: 'Time-based',
    example: 'Run every day at 9:00 AM'
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Trigger when an email is received',
    icon: Mail,
    example: 'When a new email arrives in inbox'
  },
  {
    id: 'manual',
    name: 'Manual',
    description: 'Trigger manually or via API call',
    icon: Globe,
    example: 'Run when you click the execute button'
  },
];

interface TriggerSetupWizardProps {
  appName: string;
  appIcon: string;
  onComplete: (triggerType: TriggerType) => void;
  onSkip?: () => void;
}

export function TriggerSetupWizard({ 
  appName, 
  appIcon,
  onComplete,
  onSkip 
}: TriggerSetupWizardProps) {
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | null>(null);

  return (
    <div className="h-full flex flex-col p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <span className="text-2xl">{appIcon}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">Set up {appName} Trigger</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose how this workflow should start
            </p>
          </div>
        </div>

        <Separator />

        {/* Trigger Selection */}
        <RadioGroup value={selectedTrigger || ''} onValueChange={(value) => setSelectedTrigger(value as TriggerType)}>
          <div className="space-y-3">
            {TRIGGER_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedTrigger === option.id;
              
              return (
                <Card 
                  key={option.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary shadow-md' : ''
                  }`}
                  onClick={() => setSelectedTrigger(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <RadioGroupItem 
                        value={option.id} 
                        id={option.id}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor={option.id} className="font-medium cursor-pointer">
                            {option.name}
                          </Label>
                          {option.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {option.badge}
                            </Badge>
                          )}
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {option.description}
                        </p>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                          <span className="font-medium">Example:</span>
                          <span className="italic">{option.example}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* Actions */}
      <div className="mt-auto pt-6 flex items-center justify-between">
        {onSkip && (
          <Button variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
        )}
        <Button 
          className="ml-auto gap-2"
          disabled={!selectedTrigger}
          onClick={() => selectedTrigger && onComplete(selectedTrigger)}
        >
          Continue to Configuration
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
