# Chat Implementation - Action Execution & Workflow Integration

## Overview
The chat component now supports action execution and workflow builder integration, inspired by Bhindi agent architecture but using our LangChain/LangGraph stack.

## Architecture

### Services (Reusable)

#### 1. ChatService (`services/chat.service.ts`)
- **Purpose**: Centralized API communication for chat
- **Features**:
  - Send messages with tool support
  - Get available tools
  - Execute tools
  - Generate workflows
- **Usage**: Singleton pattern for efficiency

#### 2. ActionExecutorService (`services/action-executor.service.ts`)
- **Purpose**: Parse and execute actions from chat messages
- **Features**:
  - Intent parsing (tool, workflow, node, query)
  - Action execution
  - Tool parameter extraction
  - Workflow-to-node conversion
- **Usage**: Singleton pattern, reusable across components

### Flow

```
User Message
    ↓
ActionExecutorService.parseActionIntent()
    ↓
ActionExecutorService.executeAction()
    ↓
ChatService.sendMessage() → Backend /ai/chat
    ↓
Backend: LangChainAgentService (if tools provided)
    ↓
ModelFactory → vLLM → OpenRouter → Ollama
    ↓
MCP Server → Tool Execution
    ↓
Response with tool results
    ↓
Chat Component displays result
```

## Features Implemented

### 1. Action Execution
- **Tool Actions**: Automatically executes tools when user mentions them
- **Workflow Actions**: Generates workflows from natural language
- **Node Actions**: Links to workflow builder nodes (ready for implementation)

### 2. Workflow Builder Integration
- **Open in Builder**: Chat can open generated workflows in workflow builder
- **Node Creation**: Converts workflow data to workflow builder node format
- **Event System**: Uses custom events to communicate with App.tsx

### 3. Tool Calling
- **Automatic Detection**: Detects when tools should be used
- **Parameter Extraction**: Extracts parameters from natural language
- **Execution Feedback**: Shows which tools were used

### 4. Error Handling
- **Graceful Fallbacks**: Falls back to demo mode on errors
- **User Feedback**: Shows error messages in chat
- **Toast Notifications**: Notifies user of tool usage

## API Endpoints

### Backend (`/api/v1/ai/chat`)
```typescript
POST /api/v1/ai/chat
Body: {
  messages: Array<{role, content}>,
  tools?: string[],
  mode?: 'agent' | 'plan' | 'debug' | 'ask',
  modelType?: 'vllm' | 'remote' | 'local',
  remoteModel?: 'gpt4' | 'claude' | 'gemini',
  conversationId?: string,
  temperature?: number,
  maxTokens?: number
}
Response: {
  success: true,
  data: {
    response: string,
    conversationId: string,
    toolsUsed: string[],
    model: string
  }
}
```

### Tool Execution (`/api/v1/ai/mcp/execute`)
```typescript
POST /api/v1/ai/mcp/execute
Body: {
  tool: string,
  arguments: Record<string, any>,
  sessionId: string
}
```

## Usage Examples

### Tool Execution
```
User: "Search the web for latest AI news"
→ ActionExecutor detects 'websearch' tool
→ Executes tool
→ Gets AI response with search results
```

### Workflow Generation
```
User: "Create a workflow for email automation"
→ ActionExecutor detects workflow intent
→ Generates workflow via ChatService
→ Displays workflow with "Open in Builder" button
→ Clicking opens workflow in workflow builder
```

## Code Reusability

### Services
- **ChatService**: Used by Chat component, can be used by other components
- **ActionExecutorService**: Reusable action parsing and execution logic

### Patterns
- **Singleton Pattern**: Services use singleton for efficiency
- **Service Layer**: Separation of concerns (UI vs business logic)
- **Event-Driven**: Custom events for cross-component communication

## Integration Points

### Workflow Builder
- Chat dispatches `openWorkflowBuilder` event
- App.tsx listens and opens workflow builder
- Workflow data passed via event detail

### Node Registry
- ActionExecutor can create nodes via NodeRegistry
- Workflow data converted to node format
- Ready for direct node addition to workflows

## Next Steps

1. **Enhanced Parameter Extraction**: Use NLP for better parameter extraction
2. **Node Direct Addition**: Add nodes directly to workflow builder from chat
3. **Action History**: Track action history for better context
4. **Streaming Responses**: Add streaming for real-time feedback
5. **Multi-step Actions**: Support complex multi-step action sequences
