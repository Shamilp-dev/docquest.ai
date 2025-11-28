import { MongoClient } from 'mongodb';

const uri: string = process.env.MONGODB_URI || '';

if (!uri) {
  console.warn('MONGODB_URI is not set. MongoDB features will be disabled.');
}

const options = {
  tls: true,
  tlsAllowInvalidCertificates: false,
  retryWrites: true,
  w: 'majority' as const,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

// Additional helper function for RAG pipeline
export async function connectToDB() {
  if (!clientPromise) {
    throw new Error('MongoDB client is not initialized. Please set MONGODB_URI in your environment variables.');
  }
  const client = await clientPromise;
  return { db: client.db("knowledgehub") };
}
