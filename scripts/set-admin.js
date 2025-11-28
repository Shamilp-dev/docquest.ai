// scripts/set-admin.js
// This script makes a user an admin by their email address

const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function setAdmin(email) {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in .env.local');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Define User Schema (copy from your model)
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

    // Update role to admin
    user.role = 'admin';
    await user.save();

    console.log(`✅ Successfully set user as admin:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Role: ${user.role}`);

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
  console.log('Usage: node scripts/set-admin.js <email>');
  console.log('Example: node scripts/set-admin.js user@example.com');
  process.exit(1);
}

setAdmin(email);
