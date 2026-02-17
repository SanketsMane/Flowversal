
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { connectMongoDB } from '../core/database/mongodb';
import { UserModel } from '../modules/users/models/User.model';
import { decryptField } from '../shared/utils/encryption.util';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


import fs from 'fs';

async function inspectUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await connectMongoDB();

    console.log('Fetching all users...');
    const users = await UserModel.find({}).sort({ createdAt: -1 });

    console.log(`Found ${users.length} users.`);
    
    const userDump = users.map(user => {
      let email = 'decryption-failed';
      try {
        email = decryptField(user.email);
      } catch (e) {
        email = `failed: ${user.email.substring(0, 10)}...`;
      }
      return {
        id: user._id.toString(),
        email: email,
        supabaseId: user.supabaseId,
        neonUserId: user.neonUserId,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    });

    const dumpPath = path.resolve(__dirname, '../../users_dump.json');
    fs.writeFileSync(dumpPath, JSON.stringify(userDump, null, 2));
    console.log(`User dump written to ${dumpPath}`);

  } catch (error) {
    console.error('Error inspecting users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

inspectUsers();
