/**
 * Database Index Migration Script
 * Author: Sanket (AI Assistant)
 * Purpose: Create indexes for improved query performance
 * 
 * Run with: npx ts-node src/scripts/create-indexes.ts
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ProjectModel } from '../modules/projects/models/Project.model';
import { TaskModel } from '../modules/tasks/models/Task.model';
import { UserModel } from '../modules/users/models/User.model';
import { WorkflowModel } from '../modules/workflows/models/Workflow.model';

// Load environment variables
dotenv.config();

async function createIndexes() {
  try {
    // Connect to MongoDB using .env configuration
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }
    
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Creating indexes...\n');

    // ===== USER INDEXES =====
    console.log('👤 Creating User indexes...');
    
    try {
      await UserModel.collection.createIndex(
        { email: 1 },
        { unique: true, name: 'email_unique' }
      );
      console.log('  ✓ email_unique (unique)');
    } catch (e: any) {
      if (e.code === 85 || e.codeName === 'IndexOptionsConflict') {
        console.log('  ℹ️  email_unique already exists');
      } else {
        throw e;
      }
    }

    try {
      await UserModel.collection.createIndex(
        { supabaseId: 1 },
        { unique: true, sparse: true, name: 'supabase_id_unique' }
      );
      console.log('  ✓ supabase_id_unique (unique, sparse)');
    } catch (e: any) {
      if (e.code === 85 || e.codeName === 'IndexOptionsConflict') {
        console.log('  ℹ️  supabase_id_unique already exists');
      } else {
        throw e;
      }
    }

    // ===== WORKFLOW INDEXES =====
    console.log('\n⚙️  Creating Workflow indexes...');
    
    await WorkflowModel.collection.createIndex(
      { userId: 1 },
      { name: 'user_workflows' }
    );
    console.log('  ✓ user_workflows');

    await WorkflowModel.collection.createIndex(
      { createdAt: -1 },
      { name: 'workflows_by_date' }
    );
    console.log('  ✓ workflows_by_date');

    await WorkflowModel.collection.createIndex(
      { userId: 1, createdAt: -1 },
      { name: 'user_workflows_by_date' }
    );
    console.log('  ✓ user_workflows_by_date (compound)');

    await WorkflowModel.collection.createIndex(
      { userId: 1, status: 1 },
      { name: 'user_workflows_by_status' }
    );
    console.log('  ✓ user_workflows_by_status (compound)');

    // ===== PROJECT INDEXES =====
    console.log('\n📁 Creating Project indexes...');
    
    await ProjectModel.collection.createIndex(
      { userId: 1 },
      { name: 'user_projects' }
    );
    console.log('  ✓ user_projects');

    await ProjectModel.collection.createIndex(
      { 'members.userId': 1 },
      { name: 'project_members' }
    );
    console.log('  ✓ project_members');

    await ProjectModel.collection.createIndex(
      { createdAt: -1 },
      { name: 'projects_by_date' }
    );
    console.log('  ✓ projects_by_date');

    // ===== TASK INDEXES =====
    console.log('\n✅ Creating Task indexes...');
    
    await TaskModel.collection.createIndex(
      { projectId: 1, boardId: 1 },
      { name: 'board_tasks' }
    );
    console.log('  ✓ board_tasks (compound)');

    await TaskModel.collection.createIndex(
      { assignedTo: 1 },
      { name: 'assigned_tasks' }
    );
    console.log('  ✓ assigned_tasks');

    await TaskModel.collection.createIndex(
      { createdAt: -1 },
      { name: 'tasks_by_date' }
    );
    console.log('  ✓ tasks_by_date');

    await TaskModel.collection.createIndex(
      { status: 1 },
      { name: 'tasks_by_status' }
    );
    console.log('  ✓ tasks_by_status');

    await TaskModel.collection.createIndex(
      { priority: 1 },
      { name: 'tasks_by_priority' }
    );
    console.log('  ✓ tasks_by_priority');

    // ===== VERIFY INDEXES =====
    console.log('\n🔍 Verifying indexes...\n');
    
    const userIndexes = await UserModel.collection.getIndexes();
    console.log(`👤 User indexes: ${Object.keys(userIndexes).length}`);
    
    const workflowIndexes = await WorkflowModel.collection.getIndexes();
    console.log(`⚙️  Workflow indexes: ${Object.keys(workflowIndexes).length}`);
    
    const projectIndexes = await ProjectModel.collection.getIndexes();
    console.log(`📁 Project indexes: ${Object.keys(projectIndexes).length}`);
    
    const taskIndexes = await TaskModel.collection.getIndexes();
    console.log(`✅ Task indexes: ${Object.keys(taskIndexes).length}`);

    console.log('\n✅ All indexes created successfully!\n');

    // Disconnect
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error creating indexes:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the migration
createIndexes();
