/**
 * FlowValidator - Workflow Validation Engine
 * 
 * Validates workflows before activation:
 * - Must have exactly one trigger node
 * - All required fields must be configured
 * - Connections must be valid
 * - Credentials must be authenticated
 * - No orphan nodes
 */

import type { FlowNode, Connection, FlowNodeType, FlowNodeStatus } from './types';
import { NODE_SCHEMAS, validateNodeConfig, getNodeSchema } from './NodeSchemas';

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  canActivate: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: ValidationSummary;
}

export interface ValidationError {
  nodeId?: string;
  nodeName?: string;
  code: ErrorCode;
  message: string;
  field?: string;
  severity: 'error';
}

export interface ValidationWarning {
  nodeId?: string;
  nodeName?: string;
  code: WarningCode;
  message: string;
  severity: 'warning';
}

export interface ValidationSummary {
  totalNodes: number;
  configuredNodes: number;
  triggerCount: number;
  actionCount: number;
  aiNodeCount: number;
  logicNodeCount: number;
  orphanNodes: number;
  missingCredentials: number;
}

export type ErrorCode =
  | 'NO_TRIGGER'
  | 'MULTIPLE_TRIGGERS'
  | 'MISSING_REQUIRED_FIELD'
  | 'INVALID_FIELD_VALUE'
  | 'MISSING_CREDENTIAL'
  | 'INVALID_CREDENTIAL'
  | 'ORPHAN_NODE'
  | 'CIRCULAR_DEPENDENCY'
  | 'INVALID_CONNECTION'
  | 'EMPTY_FLOW'
  | 'UNCONFIGURED_NODE'
  | 'TRIGGER_NOT_FIRST';

export type WarningCode =
  | 'UNUSED_NODE_OUTPUT'
  | 'DEAD_END_NODE'
  | 'LONG_CHAIN'
  | 'MISSING_ERROR_HANDLER'
  | 'HIGH_COMPLEXITY'
  | 'DEPRECATED_NODE';

// ============================================================================
// MAIN VALIDATOR
// ============================================================================

export class FlowValidator {
  private nodes: FlowNode[];
  private connections: Connection[];
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  constructor(nodes: FlowNode[], connections: Connection[]) {
    this.nodes = nodes;
    this.connections = connections;
  }

  /**
   * Run full validation
   */
  validate(): ValidationResult {
    this.errors = [];
    this.warnings = [];

    // Run all validation checks
    this.checkEmptyFlow();
    this.checkTriggerRules();
    this.checkNodeConfiguration();
    this.checkCredentials();
    this.checkConnections();
    this.checkOrphanNodes();
    this.checkCircularDependencies();
    
    // Generate warnings
    this.checkDeadEndNodes();
    this.checkUnusedOutputs();
    this.checkComplexity();

    const summary = this.generateSummary();
    
    return {
      valid: this.errors.length === 0,
      canActivate: this.errors.length === 0 && summary.triggerCount > 0,
      errors: this.errors,
      warnings: this.warnings,
      summary,
    };
  }

  /**
   * Quick validation for real-time UI feedback
   */
  quickValidate(): { hasErrors: boolean; errorCount: number; messages: string[] } {
    this.errors = [];
    
    this.checkEmptyFlow();
    this.checkTriggerRules();
    this.checkNodeConfiguration();
    
    return {
      hasErrors: this.errors.length > 0,
      errorCount: this.errors.length,
      messages: this.errors.slice(0, 3).map(e => e.message),
    };
  }

  // ============================================================================
  // VALIDATION CHECKS
  // ============================================================================

  private checkEmptyFlow(): void {
    if (this.nodes.length === 0) {
      this.addError({
        code: 'EMPTY_FLOW',
        message: 'Workflow has no nodes. Add a trigger to get started.',
      });
    }
  }

  private checkTriggerRules(): void {
    const triggerNodes = this.nodes.filter(n => n.type === 'trigger');

    if (triggerNodes.length === 0 && this.nodes.length > 0) {
      this.addError({
        code: 'NO_TRIGGER',
        message: 'Workflow must have a trigger node. Add a webhook, schedule, or manual trigger.',
      });
    }

    if (triggerNodes.length > 1) {
      this.addError({
        code: 'MULTIPLE_TRIGGERS',
        message: `Workflow has ${triggerNodes.length} triggers. Only one trigger is allowed per workflow.`,
      });
    }

    // Check trigger is first node (no incoming connections)
    for (const trigger of triggerNodes) {
      const hasIncoming = this.connections.some(c => c.targetId === trigger.id);
      if (hasIncoming) {
        this.addError({
          nodeId: trigger.id,
          nodeName: trigger.config?.name || 'Trigger',
          code: 'TRIGGER_NOT_FIRST',
          message: 'Trigger node cannot have incoming connections.',
        });
      }
    }
  }

  private checkNodeConfiguration(): void {
    for (const node of this.nodes) {
      // Skip nodes that are just placeholders
      if (node.status === 'idle' && !node.config) continue;

      // Get schema for node type
      const schemaKey = this.getSchemaKey(node);
      const schema = schemaKey ? getNodeSchema(schemaKey) : null;

      if (schema) {
        const validation = validateNodeConfig(schema, node.config || {});
        for (const error of validation.errors) {
          this.addError({
            nodeId: node.id,
            nodeName: node.config?.name || node.appId || node.type,
            code: 'MISSING_REQUIRED_FIELD',
            message: error,
            field: error.split(' ')[0],
          });
        }
      }

      // Check node-specific requirements
      if (node.type === 'action' && !node.actionId) {
        this.addError({
          nodeId: node.id,
          nodeName: node.config?.name || node.appId || 'Action',
          code: 'UNCONFIGURED_NODE',
          message: 'Action node is not configured. Select an action to perform.',
        });
      }

      if (node.type === 'trigger' && !node.triggerId && node.config?.triggerType !== 'manual') {
        this.addError({
          nodeId: node.id,
          nodeName: node.config?.name || 'Trigger',
          code: 'UNCONFIGURED_NODE',
          message: 'Trigger node is not configured. Select a trigger type.',
        });
      }
    }
  }

  private checkCredentials(): void {
    for (const node of this.nodes) {
      // Check nodes that require authentication
      const requiresAuth = node.appId && !['manual-trigger', 'schedule', 'webhook'].includes(node.appId);
      
      if (requiresAuth && node.type !== 'trigger') {
        const isAuthenticated = node.config?.isAuthenticated === true;
        
        if (!isAuthenticated) {
          this.addError({
            nodeId: node.id,
            nodeName: node.config?.name || node.appId || 'Node',
            code: 'MISSING_CREDENTIAL',
            message: `${node.appId || 'This node'} requires authentication. Connect your account.`,
          });
        }
      }
    }
  }

  private checkConnections(): void {
    for (const connection of this.connections) {
      const sourceNode = this.nodes.find(n => n.id === connection.sourceId);
      const targetNode = this.nodes.find(n => n.id === connection.targetId);

      if (!sourceNode) {
        this.addError({
          code: 'INVALID_CONNECTION',
          message: `Connection references non-existent source node: ${connection.sourceId}`,
        });
      }

      if (!targetNode) {
        this.addError({
          code: 'INVALID_CONNECTION',
          message: `Connection references non-existent target node: ${connection.targetId}`,
        });
      }

      // Check for self-connections
      if (connection.sourceId === connection.targetId) {
        this.addError({
          nodeId: connection.sourceId,
          code: 'INVALID_CONNECTION',
          message: 'Node cannot connect to itself.',
        });
      }
    }
  }

  private checkOrphanNodes(): void {
    // Find nodes with no connections (except triggers which are entry points)
    for (const node of this.nodes) {
      if (node.type === 'trigger') continue;

      const hasIncoming = this.connections.some(c => c.targetId === node.id);
      
      if (!hasIncoming) {
        this.addError({
          nodeId: node.id,
          nodeName: node.config?.name || node.appId || node.type,
          code: 'ORPHAN_NODE',
          message: 'Node is not connected to the workflow. Connect it to a previous node.',
        });
      }
    }
  }

  private checkCircularDependencies(): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoing = this.connections.filter(c => c.sourceId === nodeId);
      for (const conn of outgoing) {
        if (!visited.has(conn.targetId)) {
          if (hasCycle(conn.targetId)) return true;
        } else if (recursionStack.has(conn.targetId)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of this.nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          this.addError({
            code: 'CIRCULAR_DEPENDENCY',
            message: 'Workflow contains a circular dependency. Remove the loop.',
          });
          break;
        }
      }
    }
  }

  // ============================================================================
  // WARNING CHECKS
  // ============================================================================

  private checkDeadEndNodes(): void {
    for (const node of this.nodes) {
      const hasOutgoing = this.connections.some(c => c.sourceId === node.id);
      
      // Actions without outgoing connections might be intentional end points
      // But we warn anyway
      if (!hasOutgoing && node.type !== 'trigger' && this.nodes.length > 1) {
        const isLastNode = !this.connections.some(c => c.sourceId === node.id);
        if (isLastNode && this.nodes.indexOf(node) < this.nodes.length - 1) {
          this.addWarning({
            nodeId: node.id,
            nodeName: node.config?.name || node.appId || node.type,
            code: 'DEAD_END_NODE',
            message: 'Node has no outgoing connections. Is this intentional?',
          });
        }
      }
    }
  }

  private checkUnusedOutputs(): void {
    // Check if expensive nodes (AI, API calls) have their outputs used
    const expensiveTypes = ['ai-agent', 'action'];
    
    for (const node of this.nodes) {
      if (!expensiveTypes.includes(node.type)) continue;

      const hasOutgoing = this.connections.some(c => c.sourceId === node.id);
      if (!hasOutgoing) {
        this.addWarning({
          nodeId: node.id,
          nodeName: node.config?.name || node.appId || node.type,
          code: 'UNUSED_NODE_OUTPUT',
          message: 'This node\'s output is not used. Consider connecting it to another node.',
        });
      }
    }
  }

  private checkComplexity(): void {
    if (this.nodes.length > 20) {
      this.addWarning({
        code: 'HIGH_COMPLEXITY',
        message: `Workflow has ${this.nodes.length} nodes. Consider breaking it into sub-workflows.`,
      });
    }

    // Check for long chains (more than 10 nodes in sequence)
    const triggers = this.nodes.filter(n => n.type === 'trigger');
    for (const trigger of triggers) {
      let depth = 0;
      let current = trigger.id;
      const visited = new Set<string>();

      while (current && depth < 100) {
        if (visited.has(current)) break;
        visited.add(current);
        
        const outgoing = this.connections.filter(c => c.sourceId === current);
        if (outgoing.length === 0) break;
        
        current = outgoing[0].targetId;
        depth++;
      }

      if (depth > 10) {
        this.addWarning({
          code: 'LONG_CHAIN',
          message: `Workflow has a chain of ${depth} nodes. Consider using parallel execution.`,
        });
      }
    }
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private getSchemaKey(node: FlowNode): string | null {
    if (node.type === 'trigger') {
      const triggerType = node.config?.triggerType || 'manual';
      return `trigger/${triggerType}`;
    }
    if (node.type === 'ai-agent') return 'ai/agent';
    if (node.type === 'ai-memory') return 'ai/memory';
    if (node.type === 'ai-tool') return 'ai/tool';
    if (node.type === 'condition') return 'logic/condition';
    return null;
  }

  private addError(error: Omit<ValidationError, 'severity'>): void {
    this.errors.push({ ...error, severity: 'error' });
  }

  private addWarning(warning: Omit<ValidationWarning, 'severity'>): void {
    this.warnings.push({ ...warning, severity: 'warning' });
  }

  private generateSummary(): ValidationSummary {
    const triggers = this.nodes.filter(n => n.type === 'trigger');
    const actions = this.nodes.filter(n => n.type === 'action');
    const aiNodes = this.nodes.filter(n => 
      n.type === 'ai-agent' || n.type === 'ai-memory' || n.type === 'ai-tool'
    );
    const logicNodes = this.nodes.filter(n => 
      ['condition', 'router', 'loop', 'switch'].includes(n.type)
    );

    const configuredNodes = this.nodes.filter(n => {
      if (n.type === 'trigger') return !!n.triggerId || n.config?.triggerType === 'manual';
      if (n.type === 'action') return !!n.actionId;
      return n.status === 'configured' || n.status === 'complete';
    });

    const orphanCount = this.nodes.filter(n => {
      if (n.type === 'trigger') return false;
      return !this.connections.some(c => c.targetId === n.id);
    }).length;

    const missingCreds = this.errors.filter(e => 
      e.code === 'MISSING_CREDENTIAL' || e.code === 'INVALID_CREDENTIAL'
    ).length;

    return {
      totalNodes: this.nodes.length,
      configuredNodes: configuredNodes.length,
      triggerCount: triggers.length,
      actionCount: actions.length,
      aiNodeCount: aiNodes.length,
      logicNodeCount: logicNodes.length,
      orphanNodes: orphanCount,
      missingCredentials: missingCreds,
    };
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Validate a flow and return result
 */
export function validateFlow(
  nodes: FlowNode[],
  connections: Connection[]
): ValidationResult {
  const validator = new FlowValidator(nodes, connections);
  return validator.validate();
}

/**
 * Quick validation for UI feedback
 */
export function quickValidateFlow(
  nodes: FlowNode[],
  connections: Connection[]
): { hasErrors: boolean; errorCount: number; messages: string[] } {
  const validator = new FlowValidator(nodes, connections);
  return validator.quickValidate();
}

/**
 * Check if flow can be activated
 */
export function canActivateFlow(
  nodes: FlowNode[],
  connections: Connection[]
): { canActivate: boolean; reason?: string } {
  const result = validateFlow(nodes, connections);
  
  if (!result.canActivate) {
    const primaryError = result.errors[0];
    return {
      canActivate: false,
      reason: primaryError?.message || 'Flow has validation errors',
    };
  }
  
  return { canActivate: true };
}

/**
 * Get validation status for a specific node
 */
export function getNodeValidationStatus(
  node: FlowNode,
  allNodes: FlowNode[],
  connections: Connection[]
): { valid: boolean; errors: string[] } {
  const validator = new FlowValidator(allNodes, connections);
  const result = validator.validate();
  
  const nodeErrors = result.errors
    .filter(e => e.nodeId === node.id)
    .map(e => e.message);
  
  return {
    valid: nodeErrors.length === 0,
    errors: nodeErrors,
  };
}

export default FlowValidator;
