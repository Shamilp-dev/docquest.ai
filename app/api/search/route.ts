import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { generateEmbedding } from "../utils/generateEmbedding";
import { enhanceSearchWithLLM } from "@/lib/groq-service";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { query, useLLM = true } = await req.json(); // Add optional LLM flag

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: "Empty query" }, { status: 400 });
    }

    const client = (await clientPromise)!; // non-null assertion

    const db = client.db("knowledgehub");
    const collection = db.collection("documents");

    // 1 — Generate embedding
    const queryEmbedding = await generateEmbedding(query);

    // 2 — Vector search to get relevant chunks
    const results = await collection
      .aggregate([
        {
          $vectorSearch: {
            queryVector: queryEmbedding,
            path: "embedding",
            numCandidates: 50
          }
        },
        { $limit: 5 } // Get top 5 most relevant chunks
      ])
      .toArray();

    // 3 — Enhance with LLM (if enabled and API key exists)
    if (useLLM && process.env.GROQ_API_KEY) {
      try {
        const enhanced = await enhanceSearchWithLLM({
          query,
          retrievedChunks: results,
        });

        return NextResponse.json({
          results: enhanced.chunks,
          llmAnswer: enhanced.answer,
          usedLLM: enhanced.usedLLM,
        });
      } catch (llmError) {
        console.error("LLM enhancement failed, returning raw results:", llmError);
        // Fallback to raw results if LLM fails
        return NextResponse.json({
          results,
          llmAnswer: null,
          usedLLM: false,
        });
      }
    }

    // 4 — Return raw results if LLM is disabled or unavailable
    return NextResponse.json({
      results,
      llmAnswer: null,
      usedLLM: false,
    });

  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed", details: String(error) },
      { status: 500 }
    );
  }
}
