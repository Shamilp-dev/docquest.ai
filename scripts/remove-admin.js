// scripts/remove-admin.js
// This script removes admin role from a user (makes them a regular user)

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function removeAdmin(email) {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in .env.local');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Define User Schema
    const UserSchema = new mongoose.Schema({
      email: String,
      username: String,
      password: String,
      role: String,
      avatar: String,
      securityQuestion: String,
      securityAnswer: String,
      isOnline: Boolean,
      lastSeen: Date,
      lastActivity: Date
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    // Check if user is already a regular user
    if (user.role !== 'admin') {
      console.log(`⚠️  User is already a regular user (not an admin)`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Current Role: ${user.role || 'user'}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Update role to user
    user.role = 'user';
    await user.save();

    console.log(`✅ Successfully removed admin role:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   New Role: ${user.role}`);
    console.log(`\n⚠️  Note: User must log out and log in again for changes to take effect.`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/remove-admin.js <email>');
  console.log('Example: node scripts/remove-admin.js user@example.com');
  console.log('\nThis will change the user\'s role from "admin" to "user"');
  process.exit(1);
}

removeAdmin(email);
