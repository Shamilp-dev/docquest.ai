// lib/models/analytics.ts
import { MongoClient } from 'mongodb';

export interface SearchQuery {
  query: string;
  timestamp: Date;
  responseTime: number;
  userId: string;
}

export interface Analytics {
  totalPages: number;
  embeddingsGenerated: number;
  avgResponseTime: number;
  topSearches: Array<{ query: string; count: number }>;
  documentCount: number;
}

export async function trackSearchQuery(
  client: MongoClient,
  query: string,
  responseTime: number,
  userId: string
): Promise<void> {
  const db = client.db("knowledgehub");
  
  await db.collection("search_queries").insertOne({
    query: query.toLowerCase().trim(),
    timestamp: new Date(),
    responseTime,
    userId,
  });
}

export async function getAnalytics(client: MongoClient, userId: string): Promise<Analytics> {
  const db = client.db("knowledgehub");
  
  // Get user's documents only
  const docsWithPages = await db.collection("documents")
    .find({ 
      userId: userId,
      deleted: { $ne: true } 
    })
    .toArray();
  
  const documentCount = docsWithPages.length;
  
  // Total pages from user's documents
  const totalPages = docsWithPages.reduce((sum, doc) => {
    return sum + (doc.pages || Math.ceil((doc.extractedText?.length || 0) / 3000));
  }, 0);
  
  // Total embeddings generated for user's documents
  const embeddingsGenerated = await db.collection("documents")
    .countDocuments({ 
      userId: userId,
      embedding: { $exists: true } 
    });
  
  // Average response time from user's last 100 queries
  const recentQueries = await db.collection("search_queries")
    .find({ userId: userId })
    .sort({ timestamp: -1 })
    .limit(100)
    .toArray();
  
  const avgResponseTime = recentQueries.length > 0
    ? recentQueries.reduce((sum, q) => sum + q.responseTime, 0) / recentQueries.length
    : 0;
  
  // Top 5 searches for user
  const topSearchesAgg = await db.collection("search_queries")
    .aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$query",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])
    .toArray();
  
  const topSearches = topSearchesAgg.map(item => ({
    query: item._id,
    count: item.count
  }));
  
  return {
    documentCount,
    totalPages,
    embeddingsGenerated,
    avgResponseTime: Math.round(avgResponseTime * 100) / 100,
    topSearches
  };
}
