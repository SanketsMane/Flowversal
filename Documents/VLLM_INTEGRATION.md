# vLLM Integration - Automatic Fallback System

## Overview
The system now uses **vLLM (Flowversal AI Model)** as the primary model provider, with automatic fallback to OpenRouter and then Ollama. When vLLM API keys are configured, both **Chat** and **Workflow Builder** will automatically use vLLM for all agentic actions.

## Model Priority Chain

```
vLLM (Flowversal AI) → OpenRouter → Ollama (Local)
```

### How It Works

1. **Default Behavior**: All AI operations default to `'vllm'`
2. **Automatic Fallback**: If vLLM is not configured or fails, the system automatically falls back to:
   - OpenRouter (if configured)
   - Ollama (local, if available)

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# vLLM / Flowversal AI Model (Priority 1)
VLLM_ENABLED=true
VLLM_BASE_URL=http://your-vllm-server:8000/v1
VLLM_MODEL_NAME=your-model-name
VLLM_API_KEY=your-api-key

# Model Selection Strategy
DEFAULT_MODEL_TYPE=vllm
MODEL_SELECTION_STRATEGY=vllm-first
FALLBACK_TO_REMOTE=true
```

### When vLLM is Configured

✅ **Chat**: All chat messages use vLLM for responses  
✅ **Workflow Builder**: All AI nodes (AI Chat, AI Agent, Workflow Generator) use vLLM  
✅ **Tool Execution**: Agent tool calls use vLLM  
✅ **RAG**: Retrieval-augmented generation uses vLLM  

### When vLLM is NOT Configured

✅ **Automatic Fallback**: System automatically uses OpenRouter or Ollama  
✅ **No Code Changes**: Everything continues to work seamlessly  
✅ **Transparent**: Users don't notice the fallback  

## Updated Services

### 1. Chat Service (`chat.service.ts`)
- ✅ Updated `ChatRequest` interface to support `'vllm' | 'openrouter' | 'local'`
- ✅ Defaults to `'vllm'` for all chat operations
- ✅ Automatically falls back if vLLM unavailable

### 2. LangChain Service (`langchain.service.ts`)
- ✅ Updated `LangChainOptions` to support new model types
- ✅ Uses `ModelFactory.createModelWithFallback()` for automatic fallback
- ✅ Priority: vLLM → OpenRouter → Ollama

### 3. LangChain Agent Service (`langchain-agent.service.ts`)
- ✅ Updated `AgentConfig` interface
- ✅ Defaults to `'vllm'` for agent operations
- ✅ Tool calling works with vLLM

### 4. AI Node Executor (`ai-node-executor.ts`)
- ✅ Updated `AINodeConfig` interface
- ✅ All workflow builder AI nodes default to vLLM
- ✅ Supports: AI Chat, AI Agent, Workflow Generator, RAG Search

### 5. Workflow Generator Service (`workflow-generator.service.ts`)
- ✅ Updated `WorkflowGenerationRequest` interface
- ✅ Defaults to vLLM for workflow generation

### 6. RAG Service (`retrieval.service.ts`)
- ✅ Updated `retrieveAndGenerate` to support new model types
- ✅ Uses vLLM for answer generation

## Usage Examples

### Chat
```typescript
// Automatically uses vLLM if configured
const response = await chatService.sendMessage({
  message: "Hello",
  mode: 'agent',
  tools: ['websearch'],
  // model defaults to 'vllm'
});
```

### Workflow Builder - AI Node
```typescript
// AI Chat Node automatically uses vLLM
const config: AINodeConfig = {
  prompt: "Generate a summary",
  // modelType defaults to 'vllm'
  useTools: true,
  tools: ['database', 'websearch']
};
```

### Agent Execution
```typescript
// Agent automatically uses vLLM
const result = await langChainAgentService.createAgent(prompt, {
  // modelType defaults to 'vllm'
  tools: ['websearch', 'filesystem'],
  systemPrompt: 'You are a helpful assistant'
});
```

## Backward Compatibility

The system maintains backward compatibility:
- Old code using `'remote'` is automatically mapped to `'openrouter'`
- Existing workflows continue to work
- No breaking changes for existing configurations

## Testing

### Test vLLM Integration

1. **Add vLLM credentials** to `.env`
2. **Restart backend server**
3. **Send a chat message** - should use vLLM
4. **Create a workflow with AI node** - should use vLLM
5. **Execute workflow** - AI nodes should use vLLM

### Test Fallback

1. **Remove vLLM credentials** from `.env`
2. **Restart backend server**
3. **Send a chat message** - should automatically use OpenRouter/Ollama
4. **No errors** - system gracefully falls back

## Benefits

✅ **Unified Model Selection**: One configuration works for all AI operations  
✅ **Automatic Fallback**: No manual intervention needed  
✅ **Seamless Experience**: Users don't notice fallbacks  
✅ **Industry Standard**: Follows best practices for model routing  
✅ **Efficient**: Reuses model instances, no duplication  

## Next Steps

1. ✅ Add vLLM API keys to `.env`
2. ✅ Restart backend server
3. ✅ Test chat functionality
4. ✅ Test workflow builder AI nodes
5. ✅ Verify tool execution works

The system is now ready to use vLLM as soon as you add the API keys!
