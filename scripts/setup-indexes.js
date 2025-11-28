#!/usr/bin/env node

/**
 * MongoDB Index Setup Script
 * 
 * This script creates the necessary indexes for optimal performance.
 * Run this once after deploying to MongoDB Atlas.
 * 
 * Usage: node scripts/setup-indexes.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function setupIndexes() {
  console.log('🔧 Setting up MongoDB indexes...\n');
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('knowledgehub');
    
    // Documents collection indexes
    console.log('📄 Setting up indexes for documents collection...');
    const documentsCollection = db.collection('documents');
    
    await documentsCollection.createIndex(
      { userId: 1, deleted: 1 },
      { name: 'userId_deleted_idx' }
    );
    console.log('  ✅ Created index: userId + deleted');
    
    await documentsCollection.createIndex(
      { userId: 1, createdAt: -1 },
      { name: 'userId_createdAt_idx' }
    );
    console.log('  ✅ Created index: userId + createdAt');
    
    await documentsCollection.createIndex(
      { filename: 'text', extractedText: 'text' },
      { name: 'text_search_idx', weights: { filename: 10, extractedText: 1 } }
    );
    console.log('  ✅ Created text search index\n');
    
    // Users collection indexes
    console.log('👤 Setting up indexes for users collection...');
    const usersCollection = db.collection('users');
    
    await usersCollection.createIndex(
      { email: 1 },
      { unique: true, name: 'email_unique_idx' }
    );
    console.log('  ✅ Created unique index: email');
    
    await usersCollection.createIndex(
      { username: 1 },
      { unique: true, name: 'username_unique_idx' }
    );
    console.log('  ✅ Created unique index: username\n');
    
    // Analytics collection indexes
    console.log('📊 Setting up indexes for analytics collection...');
    const analyticsCollection = db.collection('analytics');
    
    await analyticsCollection.createIndex(
      { userId: 1, timestamp: -1 },
      { name: 'userId_timestamp_idx' }
    );
    console.log('  ✅ Created index: userId + timestamp');
    
    await analyticsCollection.createIndex(
      { type: 1, timestamp: -1 },
      { name: 'type_timestamp_idx' }
    );
    console.log('  ✅ Created index: type + timestamp\n');
    
    // Vector search index info (must be created manually in Atlas UI)
    console.log('🔍 Vector Search Index:');
    console.log('  ⚠️  This must be created manually in MongoDB Atlas UI:');
    console.log('  1. Go to Atlas → Database → Search');
    console.log('  2. Create Search Index');
    console.log('  3. Use JSON Editor with this configuration:');
    console.log(`
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "dimensions": 1024,
        "similarity": "cosine",
        "type": "knnVector"
      }
    }
  }
}
    `);
    console.log('  4. Name it: vector_index\n');
    
    console.log('✅ All indexes created successfully!\n');
    
    // List all indexes for verification
    console.log('📋 Current indexes:');
    const collections = ['documents', 'users', 'analytics'];
    
    for (const collName of collections) {
      console.log(`\n  ${collName}:`);
      const indexes = await db.collection(collName).listIndexes().toArray();
      indexes.forEach(index => {
        console.log(`    - ${index.name}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error setting up indexes:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n✅ Disconnected from MongoDB');
    }
  }
}

// Run the setup
setupIndexes()
  .then(() => {
    console.log('\n🎉 Index setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  });
