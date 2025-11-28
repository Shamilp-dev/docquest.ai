/**
 * Database Cleanup Script
 * Run this if you need to reset your users collection for testing
 * 
 * Usage: node scripts/cleanup-users.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanupUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Count existing users
    const count = await usersCollection.countDocuments();
    console.log(`📊 Found ${count} users in database`);

    if (count === 0) {
      console.log('✅ No users to clean up');
      process.exit(0);
    }

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will delete ALL users from the database!');
    console.log('⚠️  Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n');

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Delete all users
    const result = await usersCollection.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} users`);

    console.log('\n✨ Database cleanup completed!');
    console.log('You can now test signup with the new required security questions.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupUsers();
