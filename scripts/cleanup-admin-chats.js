// scripts/cleanup-admin-chats.js
// This script removes any chat documents created by admin accounts

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function cleanupAdminChats() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in .env.local');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Define schemas
    const UserSchema = new mongoose.Schema({
      email: String,
      username: String,
      role: String,
    });

    const ChatSchema = new mongoose.Schema({
      userId: String,
      username: String,
      userEmail: String,
      messages: Array,
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);

    // Get all admin users
    const adminUsers = await User.find({ role: 'admin' }).lean();
    console.log(`Found ${adminUsers.length} admin user(s):\n`);
    
    adminUsers.forEach(admin => {
      console.log(`  - ${admin.username} (${admin.email})`);
    });
    console.log('');

    if (adminUsers.length === 0) {
      console.log('No admin users found. Nothing to clean up.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Get admin user IDs
    const adminUserIds = adminUsers.map(admin => admin._id.toString());

    // Find chats created by admins
    const adminChats = await Chat.find({
      userId: { $in: adminUserIds }
    });

    console.log(`Found ${adminChats.length} chat(s) created by admin users\n`);

    if (adminChats.length === 0) {
      console.log('✅ No admin chats to clean up. Database is clean!');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('Chats to be deleted:');
    adminChats.forEach(chat => {
      const admin = adminUsers.find(a => a._id.toString() === chat.userId);
      console.log(`  - Chat ID: ${chat._id}`);
      console.log(`    User: ${admin?.username || 'Unknown'} (${admin?.email || 'Unknown'})`);
      console.log(`    Messages: ${chat.messages?.length || 0}`);
      console.log('');
    });

    // Delete admin chats
    const result = await Chat.deleteMany({
      userId: { $in: adminUserIds }
    });

    console.log(`✅ Successfully deleted ${result.deletedCount} admin chat(s)\n`);
    console.log('Summary:');
    console.log(`  - Admin users: ${adminUsers.length}`);
    console.log(`  - Chats removed: ${result.deletedCount}`);
    console.log(`  - Database cleaned: ✓`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run cleanup
console.log('═══════════════════════════════════════════════════════════');
console.log('Admin Chat Cleanup Script');
console.log('═══════════════════════════════════════════════════════════\n');

cleanupAdminChats();
