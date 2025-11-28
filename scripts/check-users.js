/**
 * Database Check Script
 * Checks the state of users in the database
 * 
 * Usage: node scripts/check-users.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Count total users
    const count = await usersCollection.countDocuments();
    console.log(`📊 Total users in database: ${count}\n`);

    if (count === 0) {
      console.log('ℹ️  No users found in database');
      process.exit(0);
    }

    // Get all users
    const users = await usersCollection.find({}).toArray();

    console.log('👥 User Details:\n');
    console.log('═'.repeat(80));

    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Has Password: ${!!user.password ? '✅' : '❌'}`);
      console.log(`   Has Security Question: ${!!user.securityQuestion && user.securityQuestion !== '' ? '✅' : '❌'}`);
      console.log(`   Security Question: ${user.securityQuestion || 'Not set'}`);
      console.log(`   Has Security Answer: ${!!user.securityAnswer && user.securityAnswer !== '' ? '✅' : '❌'}`);
      console.log(`   Created: ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown'}`);
      console.log(`   Last Activity: ${user.lastActivity ? new Date(user.lastActivity).toLocaleString() : 'Unknown'}`);
    });

    console.log('\n' + '═'.repeat(80));

    // Check for users without security questions
    const usersWithoutSecurity = users.filter(u => !u.securityQuestion || u.securityQuestion === '');
    
    if (usersWithoutSecurity.length > 0) {
      console.log(`\n⚠️  Warning: ${usersWithoutSecurity.length} user(s) without security questions:`);
      usersWithoutSecurity.forEach(u => {
        console.log(`   - ${u.email}`);
      });
      console.log('\n💡 These users will not be able to use the forgot password feature.');
      console.log('💡 Consider running: node scripts/cleanup-users.js to reset the database.\n');
    } else {
      console.log('\n✅ All users have security questions set!\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking users:', error);
    process.exit(1);
  }
}

// Run check
checkUsers();
