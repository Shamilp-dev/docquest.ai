// scripts/list-users.js
// This script lists all users and shows their roles

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function listUsers() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in .env.local');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

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
      lastActivity: Date,
      createdAt: Date,
      updatedAt: Date
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Get all users
    const users = await User.find({}).select('email username role isOnline createdAt').sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log('No users found in the database.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`Found ${users.length} user(s):\n`);
    console.log('═══════════════════════════════════════════════════════════════════');

    users.forEach((user, index) => {
      const roleEmoji = user.role === 'admin' ? '👑' : '👤';
      const statusEmoji = user.isOnline ? '🟢' : '⚪';
      
      console.log(`${index + 1}. ${roleEmoji} ${user.username}`);
      console.log(`   Email:  ${user.email}`);
      console.log(`   Role:   ${user.role || 'user'}`);
      console.log(`   Status: ${statusEmoji} ${user.isOnline ? 'Online' : 'Offline'}`);
      console.log(`   Joined: ${user.createdAt ? user.createdAt.toLocaleDateString() : 'Unknown'}`);
      console.log('───────────────────────────────────────────────────────────────────');
    });

    // Summary
    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role !== 'admin').length;
    const onlineCount = users.filter(u => u.isOnline).length;

    console.log(`\n📊 Summary:`);
    console.log(`   Total Users:  ${users.length}`);
    console.log(`   👑 Admins:     ${adminCount}`);
    console.log(`   👤 Users:      ${userCount}`);
    console.log(`   🟢 Online:     ${onlineCount}`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

listUsers();
