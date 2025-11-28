// app/api/utils/generateEmbedding.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "Discovery KnowledgeHub",
  },
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await client.embeddings.create({
    model: process.env.EMBEDDING_MODEL || "cohere/embed-english-v3",
    input: text,
  });

  return response.data[0].embedding;
}
