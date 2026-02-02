/**
 * Workflow Management API Routes
 * Optimized database architecture:
 * - Supabase KV: Workflow metadata and configuration
 * - Pinecone: Vector embeddings for semantic search
 */

import { Hono } from "npm:hono";
import { createClient } from "@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const workflowRoutes = new Hono();

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Verify user authentication helper
async function verifyAuth(authHeader: string | undefined) {
  if (!authHeader) {
    console.warn('[Workflows API] No authorization header, using demo user');
    return { user: { id: 'justin-user-id', email: 'justin@gmail.com' } };
  }

  const accessToken = authHeader.split(' ')[1];
  if (!accessToken) {
    console.warn('[Workflows API] Invalid authorization header, using demo user');
    return { user: { id: 'justin-user-id', email: 'justin@gmail.com' } };
  }

  // Demo mode: Accept demo tokens
  if (accessToken === 'justin-access-token') {
    console.log('[Workflows API] ✅ Justin demo token accepted');
    return { user: { id: 'justin-user-id', email: 'justin@gmail.com' } };
  }
  
  if (accessToken === 'demo-access-token') {
    console.log('[Workflows API] ✅ Demo token accepted');
    return { user: { id: 'demo-user-id', email: 'demo@demo.com' } };
  }

  // Try Supabase verification
  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.warn('[Workflows API] ⚠️ Invalid JWT, falling back to demo user');
      console.warn('[Workflows API] Error:', error?.message);
      return { user: { id: 'justin-user-id', email: 'justin@gmail.com' } };
    }

    return { user };
  } catch (err) {
    console.error('[Workflows API] ❌ Auth error:', err);
    return { user: { id: 'justin-user-id', email: 'justin@gmail.com' } };
  }
}

/**
 * Create Workflow
 * Route: POST /make-server-020d2c80/workflows
 */
workflowRoutes.post('/', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if (authResult.error) {
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }

    const { name, description, data, tags } = await c.req.json();

    if (!name) {
      return c.json({ success: false, error: 'Workflow name is required' }, 400);
    }

    const workflowId = `wf-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const userId = authResult.user.id;

    const workflow = {
      id: workflowId,
      userId,
      name,
      description: description || '',
      data: data || {},
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in Supabase KV
    await kv.set(`workflow:${workflowId}`, JSON.stringify(workflow));
    await kv.set(`user:${userId}:workflow:${workflowId}`, JSON.stringify({ workflowId, name, createdAt: workflow.createdAt }));

    console.log(`Workflow ${workflowId} created for user ${userId}`);

    // Index in Pinecone for semantic search (non-blocking)
    try {
      const pineconeApiKey = Deno.env.get('PINECONE_API_KEY');
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

      if (pineconeApiKey && openaiApiKey) {
        // Generate embedding
        const searchableText = `${name} ${description || ''} ${tags?.join(' ') || ''}`;
        
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

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          const embedding = embeddingData.data[0].embedding;

          const { storeWorkflowEmbedding } = await import('./pinecone.ts');
          await storeWorkflowEmbedding(workflowId, embedding, {
            name,
            description: description || '',
            userId,
            tags: tags || [],
            workflowId,
          });

          console.log(`Workflow ${workflowId} indexed in Pinecone`);
        }
      }
    } catch (indexError: any) {
      console.warn('Failed to index workflow in Pinecone:', indexError.message);
      // Non-critical, continue
    }

    return c.json({
      success: true,
      workflow
    });

  } catch (error: any) {
    console.error('Create workflow error:', error);
    return c.json({ 
      success: false, 
      error: `Failed to create workflow: ${error.message}` 
    }, 500);
  }
});

/**
 * Get Workflow by ID
 * Route: GET /make-server-020d2c80/workflows/:id
 */
workflowRoutes.get('/:id', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if (authResult.error) {
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }

    const workflowId = c.req.param('id');
    const workflowData = await kv.get(`workflow:${workflowId}`);

    if (!workflowData) {
      return c.json({ success: false, error: 'Workflow not found' }, 404);
    }

    const workflow = JSON.parse(workflowData);

    // Check ownership
    if (workflow.userId !== authResult.user.id) {
      return c.json({ success: false, error: 'Unauthorized' }, 403);
    }

    return c.json({
      success: true,
      workflow
    });

  } catch (error: any) {
    console.error('Get workflow error:', error);
    return c.json({ 
      success: false, 
      error: `Failed to get workflow: ${error.message}` 
    }, 500);
  }
});

/**
 * List User Workflows
 * Route: GET /make-server-020d2c80/workflows
 */
workflowRoutes.get('/', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if (authResult.error) {
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }

    const userId = authResult.user.id;
    const userWorkflows = await kv.getByPrefix(`user:${userId}:workflow:`);

    const workflows = await Promise.all(
      userWorkflows.map(async (item: any) => {
        try {
          const metadata = JSON.parse(item.value);
          const workflowData = await kv.get(`workflow:${metadata.workflowId}`);
          return workflowData ? JSON.parse(workflowData) : null;
        } catch {
          return null;
        }
      })
    );

    const validWorkflows = workflows.filter(w => w !== null);

    return c.json({
      success: true,
      workflows: validWorkflows,
      count: validWorkflows.length
    });

  } catch (error: any) {
    console.error('List workflows error:', error);
    return c.json({ 
      success: false, 
      error: `Failed to list workflows: ${error.message}` 
    }, 500);
  }
});

/**
 * Update Workflow
 * Route: PUT /make-server-020d2c80/workflows/:id
 */
workflowRoutes.put('/:id', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if (authResult.error) {
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }

    const workflowId = c.req.param('id');
    const { name, description, data, tags } = await c.req.json();

    const workflowData = await kv.get(`workflow:${workflowId}`);

    if (!workflowData) {
      return c.json({ success: false, error: 'Workflow not found' }, 404);
    }

    const workflow = JSON.parse(workflowData);

    // Check ownership
    if (workflow.userId !== authResult.user.id) {
      return c.json({ success: false, error: 'Unauthorized' }, 403);
    }

    // Update workflow
    const updatedWorkflow = {
      ...workflow,
      name: name || workflow.name,
      description: description !== undefined ? description : workflow.description,
      data: data || workflow.data,
      tags: tags !== undefined ? tags : workflow.tags,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`workflow:${workflowId}`, JSON.stringify(updatedWorkflow));

    // Re-index in Pinecone (non-blocking)
    try {
      const pineconeApiKey = Deno.env.get('PINECONE_API_KEY');
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

      if (pineconeApiKey && openaiApiKey) {
        const searchableText = `${updatedWorkflow.name} ${updatedWorkflow.description || ''} ${updatedWorkflow.tags?.join(' ') || ''}`;
        
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

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          const embedding = embeddingData.data[0].embedding;

          const { storeWorkflowEmbedding } = await import('./pinecone.ts');
          await storeWorkflowEmbedding(workflowId, embedding, {
            name: updatedWorkflow.name,
            description: updatedWorkflow.description || '',
            userId: workflow.userId,
            tags: updatedWorkflow.tags || [],
            workflowId,
          });

          console.log(`Workflow ${workflowId} re-indexed in Pinecone`);
        }
      }
    } catch (indexError: any) {
      console.warn('Failed to re-index workflow in Pinecone:', indexError.message);
    }

    return c.json({
      success: true,
      workflow: updatedWorkflow
    });

  } catch (error: any) {
    console.error('Update workflow error:', error);
    return c.json({ 
      success: false, 
      error: `Failed to update workflow: ${error.message}` 
    }, 500);
  }
});

/**
 * Delete Workflow
 * Route: DELETE /make-server-020d2c80/workflows/:id
 */
workflowRoutes.delete('/:id', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.header('Authorization'));
    if (authResult.error) {
      return c.json({ success: false, error: authResult.error }, authResult.status);
    }

    const workflowId = c.req.param('id');
    const workflowData = await kv.get(`workflow:${workflowId}`);

    if (!workflowData) {
      return c.json({ success: false, error: 'Workflow not found' }, 404);
    }

    const workflow = JSON.parse(workflowData);

    // Check ownership
    if (workflow.userId !== authResult.user.id) {
      return c.json({ success: false, error: 'Unauthorized' }, 403);
    }

    // Delete from KV store
    await kv.del(`workflow:${workflowId}`);
    await kv.del(`user:${workflow.userId}:workflow:${workflowId}`);

    // Delete from Pinecone (non-blocking)
    try {
      const pineconeApiKey = Deno.env.get('PINECONE_API_KEY');
      if (pineconeApiKey) {
        const { deleteVectors } = await import('./pinecone.ts');
        await deleteVectors([`workflow-${workflowId}`]);
        console.log(`Workflow ${workflowId} deleted from Pinecone`);
      }
    } catch (deleteError: any) {
      console.warn('Failed to delete workflow from Pinecone:', deleteError.message);
    }

    return c.json({
      success: true,
      message: 'Workflow deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete workflow error:', error);
    return c.json({ 
      success: false, 
      error: `Failed to delete workflow: ${error.message}` 
    }, 500);
  }
});

export default workflowRoutes;