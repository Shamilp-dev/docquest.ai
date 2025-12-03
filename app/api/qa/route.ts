import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { generateEmbedding } from "../utils/generateEmbedding";
import { expandQuery, extractKeywords } from "../utils/queryProcessor";
import { trackSearchQuery } from "@/lib/models/analytics";
import { Document as MongoDocument } from "mongodb";
import { SearchResultDocument } from "@/types/DocumentTypes";
import Groq from "groq-sdk";
import { requireAuth } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Initialize Groq client for LLM
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// OPTIMIZATION: Simple in-memory cache for frequent queries
const queryCache = new Map<string, { answer: string; timestamp: number; results: SearchResultDocument[] }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * OPTIMIZATION: Extract only relevant portions of text based on keywords
 * This significantly reduces context size and improves response time
 */
function extractRelevantContext(text: string, keywords: string[], maxLength: number = 1500): string {
  if (!text || keywords.length === 0) return text.substring(0, maxLength);
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const scoredSentences: { text: string; score: number; index: number }[] = [];
  
  sentences.forEach((sentence, index) => {
    const lowerSentence = sentence.toLowerCase();
    let score = 0;
    
    // Score each sentence based on keyword matches
    keywords.forEach(keyword => {
      if (lowerSentence.includes(keyword.toLowerCase())) {
        score += 10; // High score for keyword match
        
        // Extra points if keyword is near the start of sentence (likely more relevant)
        const position = lowerSentence.indexOf(keyword.toLowerCase());
        if (position < 50) score += 5;
      }
    });
    
    scoredSentences.push({ text: sentence.trim(), score, index });
  });
  
  // Sort by score (highest first), then by position (earlier first)
  scoredSentences.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index;
  });
  
  // Take top sentences until we reach max length
  let result = "";
  let sentencesAdded = 0;
  const maxSentences = 15; // Limit number of sentences
  
  for (const item of scoredSentences) {
    if (sentencesAdded >= maxSentences || result.length + item.text.length > maxLength) {
      break;
    }
    if (item.score > 0) { // Only include sentences with keyword matches
      result += item.text + ". ";
      sentencesAdded++;
    }
  }
  
  // If no relevant sentences found, return beginning of text
  if (result.length < 100) {
    return text.substring(0, maxLength);
  }
  
  return result.trim();
}

/**
 * NEW: Detect if query requires calculations
 */
function requiresCalculation(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const calcKeywords = [
    'profit', 'loss', 'calculate', 'total', 'sum', 'difference', 'subtract',
    'add', 'multiply', 'divide', 'percentage', 'ratio', 'average', 'mean',
    'revenue minus', 'expenses from', 'how much', 'what is the'
  ];
  
  return calcKeywords.some(keyword => lowerQuery.includes(keyword));
}

/**
 * OPTIMIZATION: Detect query type to optimize response
 */
function detectQueryType(query: string): 'specific' | 'summary' | 'list' | 'calculation' {
  const lowerQuery = query.toLowerCase();
  
  // NEW: Calculation queries
  if (requiresCalculation(query)) {
    return 'calculation';
  }
  
  // Specific information queries (who, what specific thing, which one)
  if (lowerQuery.match(/\b(who|whose|which person|what is the name|prepared by|created by|author)\b/)) {
    return 'specific';
  }
  
  // List queries (show all, list, what are)
  if (lowerQuery.match(/\b(list|show all|what are|give me all|enumerate)\b/)) {
    return 'list';
  }
  
  // Default to summary
  return 'summary';
}

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized - Please log in"
      }, { status: 401 });
    }

    const { query, topK = 3, useExpansion = true } = await req.json();

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Check if Groq is configured
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not set in environment variables");
      return NextResponse.json({
        error: "AI service not configured. Please contact administrator.",
        details: "GROQ_API_KEY environment variable is missing"
      }, { status: 503 });
    }

    // Verify Groq client initialization
    if (!groq) {
      console.error("Groq client failed to initialize");
      return NextResponse.json({
        error: "AI service initialization failed. Please contact administrator.",
        details: "Groq SDK failed to initialize"
      }, { status: 503 });
    }

    // OPTIMIZATION: Check cache first
    const cacheKey = `${user.id}:${query.toLowerCase()}`;
    const cached = queryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log("Cache hit for query:", query);
      return NextResponse.json({
        answer: cached.answer,
        results: cached.results,
        responseTime: (Date.now() - startTime) / 1000,
        cached: true
      });
    }

    const clientDB = (await clientPromise)!;
    const db = clientDB.db("knowledgehub");

    // Detect query type for targeted processing
    const queryType = detectQueryType(query);
    console.log("Query type detected:", queryType);

    // Skip expansion for specific queries to save time
    let searchQuery = query;
    if (useExpansion && queryType !== 'specific') {
      try {
        searchQuery = await expandQuery(query);
      } catch (expansionError) {
        console.error("Query expansion failed, using original query:", expansionError);
        searchQuery = query;
      }
    } else {
      console.log("Skipping expansion for specific query type");
    }

    console.log("Generating embedding for query:", searchQuery);
    const embedding = await generateEmbedding(searchQuery);

    // Extract keywords for context filtering
    const keywords = extractKeywords(query);
    console.log("Extracted keywords:", keywords);

    // Parallel search with Promise.all
    let vectorDocs: MongoDocument[] = [];
    let keywordDocs: MongoDocument[] = [];

    const [vectorResult, keywordResult] = await Promise.all([
      // Vector search
      db.collection("documents")
        .aggregate([
          {
            $match: {
              userId: user.id,
              deleted: { $ne: true },
              embedding: { $exists: true },
            },
          },
          {
            $vectorSearch: {
              index: "vector_index",
              path: "embedding",
              queryVector: embedding,
              numCandidates: 50,
              limit: topK * 2,
            },
          },
          {
            $project: {
              filename: 1,
              extractedText: 1,
              type: 1,
              _id: 1,
              score: { $meta: "searchScore" },
            },
          },
        ])
        .toArray()
        .catch(err => {
          console.error("Vector search failed:", err);
          return [];
        }),
      
      // Keyword search (only if keywords exist)
      keywords.length > 0 
        ? db.collection("documents")
            .find({
              userId: user.id,
              deleted: { $ne: true },
              $or: [
                { extractedText: { $regex: keywords.join('|'), $options: 'i' } },
                { filename: { $regex: keywords.join('|'), $options: 'i' } },
              ],
            })
            .limit(topK)
            .toArray()
            .catch(err => {
              console.error("Keyword search failed:", err);
              return [];
            })
        : Promise.resolve([])
    ]);

    vectorDocs = vectorResult;
    keywordDocs = keywordResult;
    
    console.log(`Vector search: ${vectorDocs.length}, Keyword search: ${keywordDocs.length}`);

    // Merge and deduplicate results
    const docMap = new Map<string, MongoDocument>();
    
    vectorDocs.forEach((doc, index) => {
      const id = doc._id.toString();
      if (!docMap.has(id)) {
        doc.score = (doc.score || 0) + (10 - index) * 0.1;
        docMap.set(id, doc);
      }
    });
    
    keywordDocs.forEach((doc, index) => {
      const id = doc._id.toString();
      if (docMap.has(id)) {
        const existing = docMap.get(id)!;
        existing.score = (existing.score || 0) + (5 - index) * 0.05;
      } else {
        doc.score = (5 - index) * 0.05;
        docMap.set(id, doc);
      }
    });

    const docs = Array.from(docMap.values())
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, topK);

    if (docs.length === 0) {
      const responseTime = (Date.now() - startTime) / 1000;
      await trackSearchQuery(clientDB, query, responseTime, user.id);

      return NextResponse.json({
        answer: "I couldn't find any relevant documents in your knowledge base that match your query.",
        results: [],
        suggestion: "Try uploading documents related to your query or rephrase your question with different terms.",
        responseTime
      });
    }

    const serializedDocs: SearchResultDocument[] = docs.map((doc) => ({
      _id: doc._id?.toString() ?? "",
      filename: typeof doc.filename === "string" ? doc.filename : undefined,
      extractedText: typeof doc.extractedText === "string" ? doc.extractedText : undefined,
      type: typeof doc.type === "string" ? doc.type : undefined,
      score: typeof doc.score === "number" ? doc.score : undefined,
    }));

    // Smart context extraction based on query type and keywords
    let context = "";
    const maxContextPerDoc = queryType === 'specific' ? 1500 : 3000;
    
    for (const doc of serializedDocs) {
      const docHeader = `=== ${doc.filename || "Unknown"} ===\n`;
      const docContent = doc.extractedText || "";
      
      const relevantContent = extractRelevantContext(docContent, keywords, maxContextPerDoc);
      const docContext = docHeader + relevantContent + "\n\n";
      
      context += docContext;
      
      if (context.length > 8000) break;
    }

    console.log("Context length:", context.length);

    // NEW: Enhanced system prompt with calculation capabilities
    const systemPrompt = queryType === 'calculation'
      ? `You are a highly intelligent financial and data analysis assistant with strong mathematical capabilities.

CALCULATION RULES:
- Extract all relevant numbers from the documents
- Perform accurate calculations (addition, subtraction, multiplication, division, percentages)
- Show your work: explain which numbers you used and how you calculated
- Format numbers clearly with currency symbols or units when appropriate
- If data is missing, clearly state what's needed

ANSWER FORMAT:
**Answer:** [Clear final result with units/currency]

**Calculation:**
- Found: [list the numbers and their sources]
- Formula: [show the calculation]
- Result: [final answer]

**Source:** *[document name]*

Be precise and accurate. Always double-check your math.`
      
      : queryType === 'specific'
        ? `You are a precise information extraction assistant. Answer with ONLY the specific information requested.

CRITICAL RULES:
- Be extremely concise and direct
- Answer in 1-2 sentences maximum for specific queries
- Use **bold** for the key answer
- No unnecessary details or summaries

**[Answer]** from *[document]*`
        
        : `You are a knowledgeable assistant providing clear, structured answers.

FORMATTING RULES:
- Use **bold** for key information
- Use bullet points for lists
- Be concise but complete

**Summary:** [1-2 sentence overview]

**Key Points:**
• Point with **emphasis**

**Source:** *[document name]*`;

    const userPrompt = queryType === 'calculation'
      ? `QUESTION: ${query}\n\nDOCUMENTS:\n${context}\n\nExtract relevant numbers, perform the calculation, and provide a clear answer with your working.`
      : queryType === 'specific'
        ? `QUESTION: ${query}\n\nDOCUMENTS:\n${context}\n\nAnswer directly and concisely.`
        : `QUESTION: ${query}\n\nDOCUMENTS:\n${context}\n\nProvide a clear, well-structured answer.`;

    const maxTokens = queryType === 'calculation' ? 500 : (queryType === 'specific' ? 150 : 400);

    // Use Groq with Llama-3.3-70b for better reasoning and calculations
    let llm;
    try {
      llm = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: queryType === 'calculation' ? 0.1 : 0.3, // Very low for calculations
        max_tokens: maxTokens,
      });
    } catch (groqError: any) {
      console.error("Groq API call failed:", groqError);
      return NextResponse.json({
        error: "AI service is unavailable. Please try again later.",
        details: groqError.message || "Groq API call failed",
        statusCode: groqError.status || 503
      }, { status: 503 });
    }

    const answer = llm.choices[0]?.message?.content ?? "I was unable to generate an answer.";

    const responseTime = (Date.now() - startTime) / 1000;
    
    // Cache the result
    queryCache.set(cacheKey, {
      answer,
      timestamp: Date.now(),
      results: serializedDocs
    });

    // Clean old cache entries
    if (queryCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of queryCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          queryCache.delete(key);
        }
      }
    }

    await trackSearchQuery(clientDB, query, responseTime, user.id);

    console.log(`Query processed in ${responseTime.toFixed(2)}s (${queryType} type) with Groq`);

    return NextResponse.json({
      answer,
      results: serializedDocs,
      responseTime,
      queryType,
      llmProvider: "groq",
      debug: {
        vectorResults: vectorDocs.length,
        keywordResults: keywordDocs.length,
        finalResults: docs.length,
        contextLength: context.length,
        cached: false
      }
    });
  } catch (error) {
    console.error("QA route error:", error);
    return NextResponse.json(
      {
        error: "Failed to process your query",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
