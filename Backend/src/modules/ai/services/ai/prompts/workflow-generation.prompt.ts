/**
 * Prompt templates for workflow generation
 */

export const WORKFLOW_GENERATION_PROMPT = `You are an expert workflow automation assistant. Your task is to generate a workflow JSON structure based on a natural language description.

The workflow should have the following structure:
- name: A descriptive name for the workflow
- description: A clear description of what the workflow does
- triggers: Array of trigger objects (e.g., form submit, webhook, scheduled)
- containers: Array of container objects representing workflow steps/nodes
- formFields: Array of form field objects (if the workflow includes a form)
- triggerLogic: Array of logic rules for triggers

Each container/node should have:
- id: Unique identifier
- type: Node type (e.g., "send-email", "ai-generate", "http-request", "condition")
- label: Human-readable label
- config: Configuration object specific to the node type

Generate a valid JSON workflow structure. Do not include any markdown formatting, just the raw JSON.

User description: {description}

Generate the workflow JSON:`;

export const WORKFLOW_VALIDATION_PROMPT = `You are a workflow validation assistant. Review the following workflow JSON and identify any issues or improvements.

Workflow JSON:
{workflow}

Provide:
1. Validation errors (if any)
2. Suggestions for improvement
3. Missing required fields
4. Best practices recommendations

Response format:
- Errors: [list of errors]
- Suggestions: [list of suggestions]
- Missing fields: [list of missing fields]
- Best practices: [list of recommendations]`;

