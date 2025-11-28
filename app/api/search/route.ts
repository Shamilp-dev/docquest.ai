import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { generateEmbedding } from "../utils/generateEmbedding";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: "Empty query" }, { status: 400 });
    }

    const client = (await clientPromise)!; // non-null assertion

    const db = client.db("knowledgehub");
    const collection = db.collection("documents");

    // 1 — Generate embedding
    const queryEmbedding = await generateEmbedding(query);

    // 2 — Correct vector search pipeline
    const results = await collection
      .aggregate([
        {
          $vectorSearch: {
            queryVector: queryEmbedding,
            path: "embedding",
            numCandidates: 50
          }
        },
        { $limit: 5 } // ✅ correct placement
      ])
      .toArray();

    return NextResponse.json({ results });

  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed", details: String(error) },
      { status: 500 }
    );
  }
}
