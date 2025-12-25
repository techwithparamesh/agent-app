/**
 * Workspace Flow Builder Components
 * Production-ready workflow automation system
 */

// Core Components
export { AppsPanel, appCatalog } from './AppsPanel';
export { WorkspaceCanvas } from './WorkspaceCanvas';
export { FlowNode, AddActionNode, AddConditionNode } from './FlowNode';
export { ConfigPanelV2 as ConfigPanel } from './ConfigPanelV2';

// Schema-Driven Architecture
export {
  NODE_SCHEMAS,
  getNodeSchema,
  getSchemasByCategory,
  validateNodeConfig,
  getVisibleFields,
  getDefaultConfig,
  webhookTriggerSchema,
  scheduleTriggerSchema,
  manualTriggerSchema,
  pollTriggerSchema,
  agentNodeSchema,
  memoryNodeSchema,
  toolNodeSchema,
  conditionNodeSchema,
  type NodeSchema,
  type JSONSchemaProperty,
} from './NodeSchemas';

// Schema Form Renderer
export { SchemaFormRenderer } from './SchemaFormRenderer';

// Expression Picker (Field Mapping)
export {
  ExpressionPicker,
  parseExpression,
  evaluateExpression,
  buildNodeOutputSchema,
  type ExpressionVariable,
  type NodeOutput,
} from './ExpressionPicker';

// Flow Validation
export {
  FlowValidator,
  validateFlow,
  quickValidateFlow,
  canActivateFlow,
  getNodeValidationStatus,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type ValidationSummary,
  type ErrorCode,
  type WarningCode,
} from './FlowValidator';

// AI Node Panel
export { AINodePanel } from './AINodePanel';

// N8n-Style Editor Components
export {
  StickyNote,
  StickyNoteLayer,
  type StickyNoteData,
  type StickyNoteColor,
} from './StickyNote';

export {
  CanvasMiniMap,
  type MiniMapNode,
  type MiniMapViewport,
} from './CanvasMiniMap';

export {
  ExpressionEditor,
  ExpressionBadge,
  type ExpressionVariable as ExpressionEditorVariable,
  type ExpressionContext,
} from './ExpressionEditor';

export {
  CredentialManager,
  type Credential,
  type CredentialTemplate,
  type CredentialField,
} from './CredentialManager';

export {
  DataPinningPanel,
  type PinnedData,
  type PinnedDataItem,
} from './DataPinningPanel';

export {
  TemplatesGallery,
  type WorkflowTemplate,
  type TemplateCategory,
  type TemplateNode,
  type TemplateConnection,
} from './TemplatesGallery';

// Types & Models
export { AI_MODELS, AI_MODELS_BY_PROVIDER } from './types';
export type { 
  FlowNode as FlowNodeData, 
  FlowNodeType,
  FlowNodeStatus,
  Connection, 
  WorkspaceFlow, 
  AppIntegration,
  AIModel 
} from './types';
