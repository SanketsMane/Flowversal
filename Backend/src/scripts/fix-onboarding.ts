
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { connectMongoDB } from '../core/database/mongodb';
import { UserModel } from '../modules/users/models/User.model';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function fixOnboarding() {
  try {
    console.log('Connecting to MongoDB...');
    await connectMongoDB();

    console.log('Finding users with neonUserId...');
    const users = await UserModel.find({ 
      neonUserId: { $exists: true, $ne: null },
      onboardingCompleted: false 
    });

    console.log(`Found ${users.length} users with neonUserId and onboardingCompleted: false.`);

    for (const user of users) {
      console.log(`Updating user ${user._id} (${user.neonUserId})...`);
      user.onboardingCompleted = true;
      await user.save();
      console.log(`User ${user._id} updated.`);
    }

    // Also update any user created in the last 24 hours to be safe
    const recentUsers = await UserModel.find({
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      onboardingCompleted: false
    });

    console.log(`Found ${recentUsers.length} recent users with onboardingCompleted: false.`);
    for (const user of recentUsers) {
        if (!user.neonUserId) { // Avoid double updating
            console.log(`Updating recent user ${user._id}...`);
            user.onboardingCompleted = true;
            await user.save();
            console.log(`User ${user._id} updated.`);
        }
    }

    console.log('Onboarding status fix completed.');

  } catch (error) {
    console.error('Error fixing onboarding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

fixOnboarding();
