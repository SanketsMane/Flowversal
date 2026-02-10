import { ExecutionContext } from '../types/workflow-execution.types';
export class UtilityNodeExecutor {
  async executeDelayNode(node: any, _context: ExecutionContext): Promise<any> {
    const delayMs = node.config?.delay || 1000;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return { delayed: delayMs };
  }
  async executeLogNode(node: any, context: ExecutionContext): Promise<any> {
    const message = node.config?.message || 'No message';
    return { logged: message };
  }
  async executeSetVariableNode(node: any, context: ExecutionContext): Promise<any> {
    const variableName = node.config?.variableName;
    const value = node.config?.value;
    if (variableName) {
      context.variables[variableName] = value;
    }
    return { variableSet: variableName, value: value };
  }
}
