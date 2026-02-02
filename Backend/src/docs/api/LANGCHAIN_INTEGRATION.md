# LangChain Integration Complete

## Overview

LangChain has been fully integrated into the Flowversal backend for workflow creation and execution. The integration supports AI nodes, triggers, tools, and complex workflow operations.

## Integration Points

### 1. Workflow Generation
- **Service**: `workflow-generator.service.ts`
- **Usage**: Uses LangChain to generate workflows from natural language descriptions
- **Endpoint**: `POST /api/v1/ai/generate`
- **Features**:
  - Natural language to workflow JSON conversion
  - Automatic node/trigger/container generation
  - Workflow validation

### 2. AI Node Execution
- **Service**: `ai-node-executor.ts`
- **Supported Node Types**:
  - `ai-chat`: Simple AI chat completion
  - `ai-agent`: AI agent with tool calling via MCP
  - `ai-generate`: Text generation
  - `ai-workflow-generator`: Generate sub-workflows

### 3. AI Agent with Tool Calling
- **Service**: `langchain-agent.service.ts`
- **Features**:
  - LangChain agents with MCP tool integration
  - Automatic tool selection and execution
  - Multi-step reasoning with tool usage
  - Fallback to simple completion if agent fails

### 4. Trigger Execution
- **Service**: `trigger-executor.ts`
- **Supported Trigger Types**:
  - `ai-condition`: AI-evaluated conditions using LangChain
  - `form-submit`: Form-based triggers
  - `webhook`: Webhook triggers
  - `scheduled`: Scheduled triggers

### 5. Conditional Nodes
- **Service**: `conditional-node-executor.ts`
- **Features**:
  - AI-powered condition evaluation
  - Simple JavaScript condition evaluation
  - Branch execution based on conditions
  - Context-aware variable resolution

### 6. LangChain Chains
- **Service**: `langchain-chains.service.ts`
- **Chain Types**:
  - **Sequential Chains**: Multi-step operations in sequence
  - **Conditional Chains**: If-else logic with AI evaluation
  - **Parallel Chains**: Concurrent operations
  - **Tool-Calling Chains**: Chains with MCP tool integration
  - **Workflow Chains**: Complex multi-step workflows

## Usage Examples

### AI Chat Node
```json
{
  "type": "ai-chat",
  "config": {
    "prompt": "Generate a summary of {{input.text}}",
    "modelType": "remote",
    "remoteModel": "claude",
    "temperature": 0.7
  }
}
```

### AI Agent Node with Tools
```json
{
  "type": "ai-agent",
  "config": {
    "prompt": "Search the web for information about {{input.topic}}",
    "useTools": true,
    "tools": ["websearch", "database"],
    "modelType": "remote",
    "remoteModel": "claude"
  }
}
```

### Conditional Node with AI
```json
{
  "type": "condition",
  "config": {
    "condition": "{{input.score}} > 80",
    "useAI": true,
    "trueAction": "ai:Generate success message",
    "falseAction": "ai:Generate improvement suggestions"
  }
}
```

### AI Condition Trigger
```json
{
  "type": "ai-condition",
  "config": {
    "condition": "The sentiment of {{input.text}} is positive",
    "modelType": "remote",
    "remoteModel": "claude"
  }
}
```

## Architecture

```
Workflow Execution
    ↓
Trigger Executor (LangChain for AI conditions)
    ↓
Container/Node Execution
    ↓
AI Node Executor
    ├── AI Chat (LangChain)
    ├── AI Agent (LangChain + MCP Tools)
    ├── AI Generate (LangChain)
    └── Conditional (LangChain or JS)
    ↓
LangChain Chains Service
    ├── Sequential Chains
    ├── Conditional Chains
    ├── Parallel Chains
    └── Tool-Calling Chains
```

## Key Features

1. **Context-Aware Execution**: All nodes can access workflow context, variables, and previous step results
2. **Variable Resolution**: Support for `{{variable}}` and `${variable}` syntax
3. **Tool Integration**: MCP tools are automatically available to AI agents
4. **Model Selection**: Support for local (Ollama) and remote (OpenRouter) models
5. **Fallback Mechanisms**: Graceful degradation if AI services fail
6. **Error Handling**: Comprehensive error handling with rollback support

## API Endpoints

- `POST /api/v1/ai/chat` - AI chat completion
- `POST /api/v1/ai/generate` - Generate workflow from description
- `POST /api/v1/workflows/:id/execute` - Execute workflow (with AI nodes)
- `POST /api/v1/ai/mcp/execute` - Execute MCP tools (used by AI agents)

## Configuration

All AI features can be configured via environment variables:
- `LOCAL_MODEL_ENABLED`: Enable local models (Ollama)
- `REMOTE_MODELS_ENABLED`: Enable remote models (OpenRouter)
- `DEFAULT_MODEL_TYPE`: Default model type (local/remote)
- `MODEL_SELECTION_STRATEGY`: smart/local-first/remote-first

## Next Steps

1. Install dependencies: `npm install`
2. Configure environment variables
3. Start the server: `npm run dev`
4. Test AI nodes in workflows

