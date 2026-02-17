/**
 * Database Index Migration Script
 * Author: Sanket
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
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // ===== USER INDEXES =====
    console.log('Creating user indexes...');
    try {
      await UserModel.collection.createIndex(
        { email: 1 },
        { unique: true, name: 'email_unique' }
      );
    } catch (e: any) {
      if (e.code !== 85 && e.codeName !== 'IndexOptionsConflict') throw e;
    }

    try {
      await UserModel.collection.createIndex(
        { neonUserId: 1 },
        { unique: true, sparse: true, name: 'neon_user_id_unique' }
      );
    } catch (e: any) {
      if (e.code !== 85 && e.codeName !== 'IndexOptionsConflict') throw e;
    }

    // ===== WORKFLOW INDEXES =====
    console.log('Creating workflow indexes...');
    await WorkflowModel.collection.createIndex({ userId: 1 }, { name: 'user_workflows' });
    await WorkflowModel.collection.createIndex({ createdAt: -1 }, { name: 'workflows_by_date' });

    // ===== PROJECT INDEXES =====
    console.log('Creating project indexes...');
    await ProjectModel.collection.createIndex({ userId: 1 }, { name: 'user_projects' });
    await ProjectModel.collection.createIndex({ 'members.userId': 1 }, { name: 'project_members' });

    // ===== TASK INDEXES =====
    console.log('Creating task indexes...');
    await TaskModel.collection.createIndex({ projectId: 1, boardId: 1 }, { name: 'board_tasks' });
    await TaskModel.collection.createIndex({ assignedTo: 1 }, { name: 'assigned_tasks' });
    await TaskModel.collection.createIndex({ createdAt: -1 }, { name: 'tasks_by_date' });

    console.log('✅ All indexes created successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error creating indexes:', error.message);
    process.exit(1);
  }
}

createIndexes();