// app/api/utils/queryProcessor.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "KnowledgeHub",
  },
});

/**
 * Expands the user query to include synonyms and related terms
 * This helps capture more relevant documents
 */
export async function expandQuery(query: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct",
      messages: [
        {
          role: "system",
          content: `You are a query expansion assistant. Given a search query, expand it to include synonyms and related terms that would help find relevant documents. Keep it concise (2-3 sentences max).
          
Example:
Input: "highest profit"
Output: "highest profit revenue earnings income financial performance top-performing best revenue-generating"

Input: "customer complaints"
Output: "customer complaints feedback issues concerns problems customer service negative reviews"`
        },
        {
          role: "user",
          content: `Expand this search query: "${query}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const expandedQuery = response.choices[0]?.message?.content || query;
    console.log("Original query:", query);
    console.log("Expanded query:", expandedQuery);
    
    return expandedQuery;
  } catch (error) {
    console.error("Query expansion failed, using original query:", error);
    return query; // Fallback to original query if expansion fails
  }
}

/**
 * Extracts key concepts from the query
 */
export function extractKeywords(query: string): string[] {
  // Remove common stop words
  const stopWords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'what', 'which', 
    'who', 'when', 'where', 'how', 'can', 'could', 'would', 'should',
    'will', 'do', 'does', 'did', 'have', 'has', 'had', 'be', 'been',
    'am', 'or', 'and', 'but', 'if', 'then', 'than', 'for', 'with'
  ]);
  
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}
