// @ts-nocheck
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "@supabase/supabase-js";
import * as kv from "./kv_store.tsx";
import subscriptionRoutes from "./subscription.ts";
import langchainRoutes from "./langchain.ts";

const app = new Hono();

// Initialize Supabase client with service role key
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-020d2c80/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint
app.post("/make-server-020d2c80/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password) {
      return c.json(
        { success: false, error: "Email and password are required" },
        400
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json(
        { success: false, error: "Invalid email format" },
        400
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return c.json(
        { success: false, error: "Password must be at least 6 characters long" },
        400
      );
    }

    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name: name || email.split('@')[0],
        created_at: new Date().toISOString(),
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      // In production, set this to false and configure email templates in Supabase.
      email_confirm: true,
    });

    if (error) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error.message.includes('already registered')) {
        return c.json(
          { success: false, error: "An account with this email already exists" },
          400
        );
      }
      
      return c.json(
        { success: false, error: error.message || "Failed to create account" },
        500
      );
    }

    if (!data.user) {
      return c.json(
        { success: false, error: "Failed to create user" },
        500
      );
    }

    console.log('User created successfully:', data.user.id);

    return c.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
      },
    });
  } catch (error: any) {
    console.error('Signup endpoint error:', error);
    return c.json(
      { success: false, error: "Internal server error during signup" },
      500
    );
  }
});

// Update user profile endpoint
app.post("/make-server-020d2c80/auth/update-profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json(
        { success: false, error: "Unauthorized" },
        401
      );
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      return c.json(
        { success: false, error: "Unauthorized" },
        401
      );
    }

    const body = await c.req.json();
    const { name, avatar_url } = body;

    // Update user metadata
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          name: name || user.user_metadata?.name,
          avatar_url: avatar_url !== undefined ? avatar_url : user.user_metadata?.avatar_url,
          updated_at: new Date().toISOString(),
        },
      }
    );

    if (error) {
      console.error('Profile update error:', error);
      return c.json(
        { success: false, error: error.message || "Failed to update profile" },
        500
      );
    }

    console.log('User profile updated successfully:', user.id);

    return c.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
        avatar_url: data.user.user_metadata?.avatar_url,
      },
    });
  } catch (error: any) {
    console.error('Update profile endpoint error:', error);
    return c.json(
      { success: false, error: "Internal server error during profile update" },
      500
    );
  }
});

// Add subscription routes
app.route("/make-server-020d2c80/subscription", subscriptionRoutes);

// Add LangChain AI routes
app.route("/make-server-020d2c80/langchain", langchainRoutes);

// Add workflow management routes
import workflowRoutes from "./workflows.ts";
app.route("/make-server-020d2c80/workflows", workflowRoutes);

// Add projects, boards, and tasks routes
import projectRoutes from "./projects.ts";
app.route("/make-server-020d2c80/projects", projectRoutes);

// Add seed data utility
import seedRoutes from "./seed-data.ts";
app.route("/make-server-020d2c80/seed", seedRoutes);

Deno.serve(app.fetch);