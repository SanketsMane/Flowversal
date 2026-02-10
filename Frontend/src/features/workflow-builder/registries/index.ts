/**
 * Centralized Registry Exports
 * Phase 1 Refactor - Registry System
 */
export { TriggerRegistry, initializeTriggerRegistry } from './triggerRegistry';
export { NodeRegistry, initializeNodeRegistry } from './nodeRegistry';
export { ToolRegistry, initializeToolRegistry } from './toolRegistry';
export type { TriggerDefinition } from './triggerRegistry';
export type { NodeDefinition } from './nodeRegistry';
export type { ToolDefinition } from './toolRegistry';
/**
 * Initialize all registries
 * Call this once at app startup
 */
export function initializeAllRegistries() {
  // Registries are auto-initialized on module load
  // This function is here for explicit initialization if needed
}
