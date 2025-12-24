import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { FlowNode } from "./types";

interface WorkflowValidationResult {
  isValid: boolean;
  canExecute: boolean;
  errors: string[];
  warnings: string[];
  stage: 'setup' | 'configure' | 'ready';
}

export function validateWorkflow(nodes: FlowNode[]): WorkflowValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let stage: 'setup' | 'configure' | 'ready' = 'setup';

  // Check 1: Must have at least one trigger node
  const triggerNodes = nodes.filter(n => n.type === 'trigger');
  if (triggerNodes.length === 0) {
    errors.push('Workflow must start with a trigger node');
    return { isValid: false, canExecute: false, errors, warnings, stage };
  }

  // Check 2: Trigger must have trigger type configured
  const unconfiguredTriggers = triggerNodes.filter(n => !n.config?.triggerType);
  if (unconfiguredTriggers.length > 0) {
    errors.push(`${unconfiguredTriggers.length} trigger(s) need trigger type selection`);
    return { isValid: false, canExecute: false, errors, warnings, stage };
  }

  stage = 'configure';

  // Check 3: All trigger nodes must have credentials/connection
  const unconnectedTriggers = triggerNodes.filter(n => {
    // Check if node requires authentication and has it configured
    const needsAuth = ['google-sheets', 'gmail', 'slack'].includes(n.appId);
    if (needsAuth && !n.config?.apiKey && !n.config?.oauthToken) {
      return true;
    }
    return false;
  });

  if (unconnectedTriggers.length > 0) {
    errors.push(`${unconnectedTriggers.length} trigger(s) need authentication`);
  }

  // Check 4: All action nodes must be connected to triggers
  const actionNodes = nodes.filter(n => n.type === 'action');
  const orphanedActions = actionNodes.filter(action => {
    // Check if this action is reachable from any trigger
    // For now, simplified check
    return !action.connections || action.connections.length === 0;
  });

  if (orphanedActions.length > 0) {
    warnings.push(`${orphanedActions.length} action(s) not connected to workflow`);
  }

  // Check 5: All action nodes should have action type selected
  const unconfiguredActions = actionNodes.filter(n => !n.actionId);
  if (unconfiguredActions.length > 0) {
    errors.push(`${unconfiguredActions.length} action(s) need configuration`);
  }

  // Check 6: All nodes should have required fields
  const incompleteNodes = nodes.filter(n => n.status === 'incomplete');
  if (incompleteNodes.length > 0) {
    warnings.push(`${incompleteNodes.length} node(s) have incomplete configuration`);
  }

  // Determine if workflow can execute
  const canExecute = errors.length === 0 && warnings.length === 0;
  const isValid = errors.length === 0;

  if (canExecute) {
    stage = 'ready';
  }

  return { isValid, canExecute, errors, warnings, stage };
}

interface WorkflowStatusProps {
  validation: WorkflowValidationResult;
}

export function WorkflowStatus({ validation }: WorkflowStatusProps) {
  const { isValid, canExecute, errors, warnings, stage } = validation;

  const stageInfo = {
    setup: {
      label: 'Setup Required',
      icon: Clock,
      description: 'Configure your trigger to continue'
    },
    configure: {
      label: 'Configuration in Progress',
      icon: Clock,
      description: 'Complete authentication and node configuration'
    },
    ready: {
      label: 'Ready to Execute',
      icon: CheckCircle2,
      description: 'Your workflow is configured and ready to run'
    }
  };

  const currentStage = stageInfo[stage];
  const Icon = currentStage.icon;

  return (
    <div className="space-y-2">
      {/* Stage Indicator */}
      <Alert className={canExecute ? "border-green-200 dark:border-green-900" : ""}>
        <Icon className={`h-4 w-4 ${canExecute ? "text-green-600" : "text-yellow-600"}`} />
        <AlertTitle className="text-sm font-medium">
          {currentStage.label}
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground">
          {currentStage.description}
        </AlertDescription>
      </Alert>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm font-medium">
            {errors.length} Error{errors.length > 1 ? 's' : ''} Found
          </AlertTitle>
          <AlertDescription className="text-xs">
            <ul className="list-disc list-inside space-y-1 mt-2">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert className="border-yellow-200 dark:border-yellow-900">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription className="text-xs text-yellow-700 dark:text-yellow-300">
            <ul className="list-disc list-inside space-y-1 mt-2">
              {warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
