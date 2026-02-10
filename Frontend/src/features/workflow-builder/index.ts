/**
 * Workflow Builder Feature - Main Export
 * Phase 1 Refactor
 * Phase 4 Part 1 - Drag & Drop System
 * Phase 4 Part 2 - Workflow Execution Engine
 * Phase 4 Part 3 - Variable System
 * 
 * This file serves as the main entry point for the workflow builder feature.
 * It exports all public APIs, types, hooks, stores, and components.
 */
// ========== TYPES ==========
export type {
  // Workflow Types
  WorkflowData,
  Container,
  FormElement,
  Variable,
  NotificationState,
  LeftPanelView,
  SelectedItem,
  // Trigger Types
  Trigger,
  TriggerTemplate,
  TriggerLogic,
  // Node Types
  WorkflowNode,
  NodeTemplate,
  ConditionalNode,
  NodeCategory,
  // Tool Types
  AddedTool,
  ToolTemplate,
  // Form Types
  FormField,
  FormFieldType,
  FieldValidation,
  // Drag & Drop Types (Phase 4 Part 1)
  DragItemType,
  DragItem,
  FormFieldDragItem,
  WorkflowStepDragItem,
  TriggerDragItem,
  NodeDragItem,
  ToolDragItem,
  DropResult,
  DragPreviewData,
  CanvasPosition,
  // Execution Types (Phase 4 Part 2)
  ExecutionStatus,
  ExecutionStepStatus,
  LogLevel,
  ExecutionLog,
  ExecutionStepResult,
  ExecutionContext,
  ExecutionConfig,
  ExecutionState,
  ExecutionControls,
  StepExecutor,
  ExecutionMetrics,
  // Variable Types (Phase 4 Part 3)
  VariableType,
  VariableScope,
  VariableDefinition,
  VariableReference,
  VariableContext,
  VariableTransformation,
  VariableSuggestion,
  ExpressionResult,
  VariableCategory,
  VariableGroup,
  VariablePickerConfig,
  VariableInsertEvent,
} from './types';
// ========== STORES ==========
export { 
  useWorkflowStore,
  useSelectionStore,
  useUIStore,
  useExecutionStore,
  useExecution,
  useVariableStore,
  useVariables,
} from './store';
// ========== HOOKS ==========
export {
  useWorkflow,
  useSelection,
} from './hooks';
// ========== REGISTRIES ==========
export {
  TriggerRegistry,
  NodeRegistry,
  ToolRegistry,
  initializeAllRegistries,
} from './registries';
export type {
  TriggerDefinition,
  NodeDefinition,
  ToolDefinition,
} from './registries';
// ========== COMPONENTS (Phase 2, 3, 4) ==========
export * from './components';
// ========== DRAG & DROP CONTEXT (Phase 4 Part 1) ==========
export {
  DndContextProvider,
  useDndContext,
} from './context/DndContext';
// ========== UTILITIES ==========
export * from './utils/dnd.utils';
// Variable Utilities (Phase 4 Part 3)
export * from './utils/variable.parser';
export * from './utils/variable.resolver';
export * from './utils/variable.transformations';
// ========== EXECUTION ENGINE (Phase 4 Part 2) ==========
export { ExecutionEngine } from './engine/ExecutionEngine';
// ========== MAIN COMPONENT ==========
// New modular WorkflowBuilder component (replaces WorkflowBuilderV2/WorkflowBuilderMerged)
export { WorkflowBuilder } from './WorkflowBuilder';
export { default } from './WorkflowBuilder';
/**
 * Feature Initialization
 * Call this once at app startup to initialize all registries
 */
export function initializeWorkflowBuilder() {
  // Registries are auto-initialized on import
}