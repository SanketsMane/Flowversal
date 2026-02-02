/**
 * Centralized Type Exports
 * Phase 1 Refactor - Type System
 * Phase 4 Part 1 - Drag & Drop System
 * Phase 4 Part 2 - Workflow Execution Engine
 * Phase 4 Part 3 - Variable System
 */

// Workflow Types
export type {
  WorkflowMetadata,
  Container,
  FormElement,
  Variable,
  NotificationState,
  LeftPanelView,
  SelectedItem,
} from './workflow.types';

// Trigger Types
export type {
  Trigger,
  TriggerTemplate,
  TriggerLogic,
} from './trigger.types';

// Node Types
export type {
  WorkflowNode,
  NodeTemplate,
  ConditionalNode,
  NodeCategory,
} from './node.types';

// Tool Types
export type {
  AddedTool,
  ToolTemplate,
} from './tool.types';

// Form Types
export type {
  FormField,
  FormFieldType,
  FieldValidation,
} from './form.types';

// Drag & Drop Types (Phase 4 Part 1)
export type {
  DragItemType,
  DragItem,
  FormFieldDragItem,
  WorkflowStepDragItem,
  TriggerDragItem,
  NodeDragItem,
  ToolDragItem,
  SidebarTriggerDragItem,
  SidebarNodeDragItem,
  SidebarToolDragItem,
  DropResult,
  DragPreviewData,
  CanvasPosition,
  CanvasDropResult,
} from './dnd.types';

// Execution Types (Phase 4 Part 2)
export type {
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
} from './execution.types';

// Variable Types (Phase 4 Part 3)
export type {
  VariableType,
  VariableScope,
  VariableDefinition,
  VariableReference,
  VariableContext,
  VariableTransformation,
  VariableSuggestion,
  ExpressionResult,
  VariableValidation,
  VariableCategory,
  VariableGroup,
  VariablePickerConfig,
  VariableInsertEvent,
} from './variable.types';

// Condition Types (Conditional Logic)
export type {
  ConditionDataType,
  ConditionOperator,
  LogicalOperator,
  Condition,
  ConditionGroup,
  ConditionalBranch,
  SwitchCase,
  IfNodeConfig,
  SwitchNodeConfig,
  OperatorDefinition,
} from './condition.types';

export { OPERATORS, DATA_TYPES } from './condition.types';