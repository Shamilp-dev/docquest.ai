import { MongoClient, GridFSBucket } from "mongodb";

const uri = process.env.MONGODB_URI!;
let client: MongoClient;
let bucket: GridFSBucket;

export async function getGridFS() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(); // uses default DB from conn string
    bucket = new GridFSBucket(db, { bucketName: "uploads" });
  }
  return { bucket, client };
}
