
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Import all models (adjust paths as needed)
import '../modules/ai/models/ModelScore.model';
import '../modules/ai/services/ai/agent-state.service'; // imports AgentStateModel
import '../modules/auth/models/mfa.model';
import '../modules/projects/models/Board.model';
import '../modules/projects/models/Project.model';
import '../modules/projects/models/SetupConfig.model';
import '../modules/projects/models/Template.model';
import '../modules/tasks/models/Counter.model';
import '../modules/tasks/models/Task.model';
import '../modules/users/models/User.model';
import '../modules/workflows/models/Workflow.model';
import '../modules/workflows/models/WorkflowExecution.model';

async function run() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  console.log('Connecting to MongoDB Memory Server...');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  try {
    console.log('Loading models...');
    // Accessing models triggers compilation if not already done
    // But imports above should have done it.
    // We can iterate mongoose.modelNames() to verify.
    console.log('Models loaded:', mongoose.modelNames());
    
    // Explicitly sync indexes to force error if any
    for (const modelName of mongoose.modelNames()) {
      console.log(`Syncing indexes for ${modelName}...`);
      await mongoose.model(modelName).syncIndexes();
      console.log(`Indexes synced for ${modelName}.`);
    }

    console.log('All indexes synced successfully. No duplicate errors.');
  } catch (error) {
    console.error('ERROR DETECTED:');
    console.error(error);
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
  }
}

run();
