/**
 * LangChain AI Agent API Routes
 * Provides intelligent AI capabilities for Flowversal
 */

import { Hono } from "npm:hono";
import { createClient } from "@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const langchainRoutes = new Hono();

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Verify user authentication helper
async function verifyAuth(authHeader: string | undefined) {
  if (!authHeader) {
    console.warn('[Langchain API] No authorization header, using demo user');
    return { user: { id: 'justin-user-id', email: 'justin@gmail.com' } };
  }

  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    console.warn('[Langchain API] Invalid authorization header, using demo user');
    return { user: { id: 'justin-user-id', email: 'justin@gmail.com' } };
  }

  // Demo mode: Accept demo tokens
  if (accessToken === 'justin-access-token') {
    console.log('[Langchain API] ✅ Justin demo token accepted');
    return { user: { id: 'justin-user-id', email: 'justin@gmail.com' } };
  }
  
  if (accessToken === 'demo-access-token') {
    console.log('[Langchain API] ✅ Demo token accepted');
    return { user: { id: 'demo-user-id', email: 'demo@demo.com' } };
  }

  // Try Supabase verification
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.warn('[Langchain API] ⚠️ Invalid JWT, falling back to demo user');
      console.warn('[Langchain API] Error:', error?.message);
      return { user: { id: 'justin-user-id', email: 'justin@gmail.com' } };
    }

    return { user };
  } catch (err) {
    console.error('[Langchain API] ❌ Auth error:', err);
    return { user: { id: 'justin-user-id', email: 'justin@gmail.com' } };
  }
}

/**
 * Chat Completion Endpoint
 * Route: POST /make-server-020d2c80/langchain/chat
 * 
 * Handles AI chat interactions with model selection
 */
langchainRoutes.post('/chat', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if (authResult.error) {
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }

    const { message, model = 'gpt-4', conversationId, context } = await c.req.json();

    if (!message) {
      return c.json({ success: false, error: 'Message is required' }, 400);
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return c.json({ 
        success: false, 
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
      }, 500);
    }

    // Store conversation history
    let conversationHistory: any[] = [];
    if (conversationId) {
      const historyData = await kv.get(`conversation:${conversationId}`);
      conversationHistory = historyData ? JSON.parse(historyData) : [];
    }

    // Add user message to history
    conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: context || 'You are Flowversal AI, a helpful assistant for workflow automation and AI agent creation. You help users build workflows, understand automation, and solve complex tasks.'
      },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: model === 'ChatGPT Model' ? 'gpt-4' : 
               model === 'Gemini Model' ? 'gpt-3.5-turbo' : 
               model === 'Deepseek Model' ? 'gpt-3.5-turbo' : 
               'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return c.json({ 
        success: false, 
        error: error.error?.message || 'Failed to get AI response' 
      }, 500);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return c.json({ success: false, error: 'No response from AI' }, 500);
    }

    // Add AI response to history
    conversationHistory.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    });

    // Save conversation history
    const newConversationId = conversationId || `conv-${Date.now()}`;
    await kv.set(`conversation:${newConversationId}`, JSON.stringify(conversationHistory));

    return c.json({
      success: true,
      response: aiResponse,
      conversationId: newConversationId,
      model: data.model,
      usage: data.usage
    });

  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return c.json({ 
      success: false, 
      error: `Internal server error: ${error.message}` 
    }, 500);
  }
});

/**
 * Workflow Generation Endpoint
 * Route: POST /make-server-020d2c80/langchain/generate-workflow
 * 
 * Generates workflow configurations from natural language descriptions
 */
langchainRoutes.post('/generate-workflow', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if (authResult.error) {
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }

    const { description, model = 'gpt-4' } = await c.req.json();

    if (!description) {
      return c.json({ success: false, error: 'Workflow description is required' }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return c.json({ 
        success: false, 
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' 
      }, 500);
    }

    // System prompt for workflow generation
    const systemPrompt = `You are a workflow automation expert. Generate a detailed workflow configuration based on the user's description.

Return a JSON object with the following structure:
{
  "name": "Workflow Name",
  "description": "Brief description",
  "trigger": {
    "type": "manual|webhook|schedule|form",
    "config": {}
  },
  "nodes": [
    {
      "type": "action|condition|ai-agent|api-call|data-transform",
      "label": "Node Label",
      "config": {},
      "position": { "x": number, "y": number }
    }
  ],
  "connections": [
    { "from": "node-id", "to": "node-id" }
  ]
}

Available node types:
- action: Execute an action (send email, create record, etc.)
- condition: If/else logic
- ai-agent: AI-powered decision making
- api-call: HTTP request to external API
- data-transform: Transform or format data
- form: Collect user input
- loop: Iterate over data
- delay: Wait for a specified time

Be creative and practical. Include proper connections and positioning.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: model === 'ChatGPT Model' ? 'gpt-4' : 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: description }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return c.json({ 
        success: false, 
        error: error.error?.message || 'Failed to generate workflow' 
      }, 500);
    }

    const data = await response.json();
    const workflowConfig = JSON.parse(data.choices[0]?.message?.content || '{}');

    return c.json({
      success: true,
      workflow: workflowConfig,
      model: data.model,
      usage: data.usage
    });

  } catch (error: any) {
    console.error('Generate workflow endpoint error:', error);
    return c.json({ 
      success: false, 
      error: `Internal server error: ${error.message}` 
    }, 500);
  }
});

/**
 * AI Agent Execution Endpoint
 * Route: POST /make-server-020d2c80/langchain/execute-agent
 * 
 * Executes an AI agent with specific tools and tasks
 */
langchainRoutes.post('/execute-agent', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if (authResult.error) {
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }

    const { task, tools = [], context, model = 'gpt-4' } = await c.req.json();

    if (!task) {
      return c.json({ success: false, error: 'Task is required' }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return c.json({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      }, 500);
    }

    // System prompt for AI agent
    const systemPrompt = `You are an AI agent capable of reasoning, planning, and using tools to accomplish tasks.

Available tools: ${tools.join(', ')}

For each task:
1. Analyze the task
2. Break it down into steps
3. Determine which tools to use
4. Execute the plan
5. Return the results

Return a JSON object with:
{
  "reasoning": "Your thought process",
  "steps": ["Step 1", "Step 2", ...],
  "toolsUsed": ["tool1", "tool2"],
  "result": "Final result or answer"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: model === 'ChatGPT Model' ? 'gpt-4' : 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Task: ${task}\nContext: ${context || 'None'}` }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return c.json({ 
        success: false, 
        error: error.error?.message || 'Failed to execute agent' 
      }, 500);
    }

    const data = await response.json();
    const agentResult = JSON.parse(data.choices[0]?.message?.content || '{}');

    return c.json({
      success: true,
      result: agentResult,
      model: data.model,
      usage: data.usage
    });

  } catch (error: any) {
    console.error('Execute agent endpoint error:', error);
    return c.json({ 
      success: false, 
      error: `Internal server error: ${error.message}` 
    }, 500);
  }
});

/**
 * RAG Search Endpoint
 * Route: POST /make-server-020d2c80/langchain/rag-search
 * 
 * Performs Retrieval-Augmented Generation for intelligent search using Pinecone
 */
langchainRoutes.post('/rag-search', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if (authResult.error) {
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }

    const { query, collection = 'workflows', limit = 5, userId } = await c.req.json();

    if (!query) {
      return c.json({ success: false, error: 'Search query is required' }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return c.json({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      }, 500);
    }

    const pineconeApiKey = Deno.env.get('PINECONE_API_KEY');

    // Generate embedding for the query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query
      })
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.json();
      console.error('OpenAI embedding error:', error);
      return c.json({ 
        success: false, 
        error: error.error?.message || 'Failed to generate embedding' 
      }, 500);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    let results = [];
    let usedPinecone = false;

    // Try Pinecone first for vector similarity search
    if (pineconeApiKey) {
      try {
        const { searchSimilarWorkflows } = await import('./pinecone.ts');
        const pineconeResults = await searchSimilarWorkflows(
          queryEmbedding,
          limit,
          userId
        );

        // Fetch full workflow data from KV store for each result
        results = await Promise.all(
          pineconeResults.map(async (match: any) => {
            try {
              const workflowData = await kv.get(`workflow:${match.metadata.workflowId || match.id}`);
              if (workflowData) {
                const workflow = JSON.parse(workflowData);
                return {
                  ...workflow,
                  relevanceScore: match.score,
                  matchedBy: 'semantic-search'
                };
              }
              return null;
            } catch {
              return null;
            }
          })
        );

        results = results.filter((r: any) => r !== null);
        usedPinecone = true;
        console.log(`Pinecone RAG search returned ${results.length} results`);

      } catch (pineconeError: any) {
        console.warn('Pinecone search failed, falling back to text search:', pineconeError.message);
      }
    }

    // Fallback to text-based search if Pinecone not available or failed
    if (!usedPinecone || results.length === 0) {
      console.log('Using fallback text-based search');
      const allWorkflows = await kv.getByPrefix('workflow:');
      
      results = allWorkflows
        .map((item: any) => {
          try {
            const workflow = JSON.parse(item.value);
            const searchText = `${workflow.name} ${workflow.description || ''}`.toLowerCase();
            const relevance = searchText.includes(query.toLowerCase()) ? 0.8 : 0;
            return relevance > 0 ? { ...workflow, relevanceScore: relevance, matchedBy: 'text-search' } : null;
          } catch {
            return null;
          }
        })
        .filter((item: any) => item !== null)
        .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);
    }

    return c.json({
      success: true,
      results,
      query,
      count: results.length,
      searchMethod: usedPinecone ? 'semantic-search' : 'text-search'
    });

  } catch (error: any) {
    console.error('RAG search endpoint error:', error);
    return c.json({ 
      success: false, 
      error: `Internal server error during RAG search: ${error.message}` 
    }, 500);
  }
});

/**
 * Index Workflow Endpoint
 * Route: POST /make-server-020d2c80/langchain/index-workflow
 * 
 * Indexes a workflow into Pinecone for semantic search
 */
langchainRoutes.post('/index-workflow', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if (authResult.error) {
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }

    const { workflowId, name, description, tags } = await c.req.json();

    if (!workflowId || !name) {
      return c.json({ success: false, error: 'workflowId and name are required' }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const pineconeApiKey = Deno.env.get('PINECONE_API_KEY');

    if (!openaiApiKey) {
      return c.json({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      }, 500);
    }

    if (!pineconeApiKey) {
      return c.json({ 
        success: false, 
        error: 'Pinecone API key not configured. Workflow saved but not indexed for semantic search.' 
      }, 200);
    }

    // Create searchable text from workflow
    const searchableText = `${name} ${description || ''} ${tags?.join(' ') || ''}`;

    // Generate embedding
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: searchableText
      })
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.json();
      console.error('OpenAI embedding error:', error);
      return c.json({ 
        success: false, 
        error: error.error?.message || 'Failed to generate embedding' 
      }, 500);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // Store in Pinecone
    const { storeWorkflowEmbedding } = await import('./pinecone.ts');
    await storeWorkflowEmbedding(workflowId, embedding, {
      name,
      description: description || '',
      userId: authResult.user.id,
      tags: tags || [],
      workflowId,
    });

    console.log(`Workflow ${workflowId} indexed successfully`);

    return c.json({
      success: true,
      workflowId,
      message: 'Workflow indexed for semantic search'
    });

  } catch (error: any) {
    console.error('Index workflow endpoint error:', error);
    return c.json({ 
      success: false, 
      error: `Internal server error while indexing workflow: ${error.message}` 
    }, 500);
  }
});

/**
 * Semantic Analysis Endpoint
 * Route: POST /make-server-020d2c80/langchain/analyze
 * 
 * Analyzes text for sentiment, entities, intent, etc.
 */
langchainRoutes.post('/analyze', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if (authResult.error) {
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }

    const { text, analysisType = 'all' } = await c.req.json();

    if (!text) {
      return c.json({ success: false, error: 'Text is required' }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return c.json({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      }, 500);
    }

    const systemPrompt = `Analyze the following text and return a JSON object with:
{
  "sentiment": "positive|negative|neutral",
  "sentimentScore": number (-1 to 1),
  "intent": "The main intent or purpose",
  "entities": ["entity1", "entity2"],
  "keywords": ["keyword1", "keyword2"],
  "summary": "Brief summary",
  "actionItems": ["action1", "action2"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return c.json({ 
        success: false, 
        error: error.error?.message || 'Failed to analyze text' 
      }, 500);
    }

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0]?.message?.content || '{}');

    return c.json({
      success: true,
      analysis,
      model: data.model,
      usage: data.usage
    });

  } catch (error: any) {
    console.error('Analyze endpoint error:', error);
    return c.json({ 
      success: false, 
      error: `Internal server error: ${error.message}` 
    }, 500);
  }
});

export default langchainRoutes;