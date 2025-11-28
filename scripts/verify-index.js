#!/usr/bin/env node
/**
 * MongoDB Vector Index Verification Script
 * This script helps you verify your vector index configuration
 * 
 * Run with: node scripts/verify-index.js
 */

console.log("🔍 MongoDB Vector Index Verification Guide\n");
console.log("=" .repeat(70));

console.log("\n📋 STEP 1: Access MongoDB Atlas");
console.log("-".repeat(70));
console.log("1. Go to: https://cloud.mongodb.com");
console.log("2. Login with your credentials");
console.log("3. Select your cluster (knowledgeHub)");
console.log("4. Click on 'Search' tab (not 'Browse Collections')");

console.log("\n🔎 STEP 2: Find Your Vector Index");
console.log("-".repeat(70));
console.log("1. Look for index named: 'vector_index'");
console.log("2. Database should be: 'knowledgehub'");
console.log("3. Collection should be: 'documents'");
console.log("4. Click on the index name to view details");

console.log("\n⚙️  STEP 3: Check Index Configuration");
console.log("-".repeat(70));
console.log("Your index configuration should look EXACTLY like this:\n");

const correctConfig = {
  "fields": [
    {
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine",
      "type": "vector"
    }
  ]
};

console.log(JSON.stringify(correctConfig, null, 2));

console.log("\n❌ WRONG Configuration (1024 dimensions):");
console.log("-".repeat(70));

const wrongConfig = {
  "fields": [
    {
      "path": "embedding",
      "numDimensions": 1024,  // ❌ WRONG!
      "similarity": "cosine",
      "type": "vector"
    }
  ]
};

console.log(JSON.stringify(wrongConfig, null, 2));

console.log("\n🛠️  STEP 4: Fix Index if Wrong");
console.log("-".repeat(70));
console.log("If your index shows 1024 dimensions:");
console.log("1. Click the trash icon to delete the index");
console.log("2. Click 'Create Index'");
console.log("3. Choose 'JSON Editor'");
console.log("4. Paste the CORRECT configuration (1536 dimensions)");
console.log("5. Name it: 'vector_index'");
console.log("6. Click 'Create Search Index'");
console.log("7. Wait 2-3 minutes for it to build");

console.log("\n🔄 STEP 5: Re-upload Your Documents");
console.log("-".repeat(70));
console.log("⚠️  CRITICAL: After fixing the index, you MUST re-upload all documents!");
console.log("");
console.log("Why? Old documents have embeddings with wrong dimensions (1024).");
console.log("They won't work with the new 1536-dimension index.");
console.log("");
console.log("How to re-upload:");
console.log("1. Go to your app's document list");
console.log("2. Delete all existing documents");
console.log("3. Upload them again (fresh embeddings will be generated)");

console.log("\n✅ STEP 6: Verify It's Working");
console.log("-".repeat(70));
console.log("1. Upload a test document with text: 'Product X has highest revenue'");
console.log("2. Search for: 'Which product has the most profit?'");
console.log("3. You should get the document back (profit ≈ revenue)");
console.log("4. If it works, your semantic search is configured correctly! 🎉");

console.log("\n📊 Current Environment Configuration");
console.log("-".repeat(70));

// Try to read and display current config
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const embeddingModel = envContent.match(/EMBEDDING_MODEL=(.+)/)?.[1];
    const vectorDims = envContent.match(/VECTOR_DIMENSIONS=(.+)/)?.[1];
    
    console.log(`Embedding Model: ${embeddingModel || 'Not found'}`);
    console.log(`Vector Dimensions: ${vectorDims || 'Not found'}`);
    
    if (vectorDims === '1536') {
      console.log("✅ Your .env.local has correct dimensions (1536)");
    } else if (vectorDims === '1024') {
      console.log("⚠️  Your .env.local shows 1024 - update to 1536");
    }
  } else {
    console.log("⚠️  Could not find .env.local file");
  }
} catch (error) {
  console.log("⚠️  Could not read environment configuration");
}

console.log("\n🎯 Quick Checklist");
console.log("-".repeat(70));
console.log("□ Vector index exists in MongoDB Atlas");
console.log("□ Index is named 'vector_index'");
console.log("□ Index has 1536 dimensions (not 1024)");
console.log("□ Index is on 'documents' collection");
console.log("□ Index status is 'Active' (not 'Building')");
console.log("□ All documents deleted and re-uploaded");
console.log("□ Test query returns semantic matches");

console.log("\n💡 Pro Tips");
console.log("-".repeat(70));
console.log("• Index building takes 2-3 minutes after creation");
console.log("• Don't upload documents while index is building");
console.log("• Check index status: should show 'Active'");
console.log("• If queries fail, check MongoDB Atlas logs");
console.log("• Test with simple exact-match queries first");

console.log("\n" + "=" .repeat(70));
console.log("Need more help? Check these files:");
console.log("• SEMANTIC_SEARCH_SETUP.md");
console.log("• SEMANTIC_SEARCH_IMPLEMENTATION.md");
console.log("• RAG_SETUP.md");
console.log("=" .repeat(70) + "\n");
