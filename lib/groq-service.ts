import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export interface SearchContext {
  query: string;
  retrievedChunks: any[];
}

/**
 * Enhanced search with LLM reasoning and calculation capabilities
 * Falls back gracefully if LLM is unavailable
 */
export async function enhanceSearchWithLLM(
  context: SearchContext
): Promise<{ answer: string; usedLLM: boolean; chunks: any[] }> {
  const { query, retrievedChunks } = context;

  // If no API key or no chunks, return chunks as-is
  if (!process.env.GROQ_API_KEY || retrievedChunks.length === 0) {
    return {
      answer: "",
      usedLLM: false,
      chunks: retrievedChunks,
    };
  }

  try {
    // Prepare context from chunks
    const documentContext = retrievedChunks
      .map((chunk, idx) => {
        const text = chunk.text || chunk.content || "";
        const fileName = chunk.fileName || chunk.filename || "Unknown";
        return `[Document ${idx + 1}: ${fileName}]\n${text}`;
      })
      .join("\n\n---\n\n");

    // System prompt for financial analysis and calculations
    const systemPrompt = `You are a highly intelligent document analysis assistant with strong analytical and mathematical capabilities.

Your responsibilities:
1. Answer questions based on the provided document context
2. Perform calculations when needed (e.g., profit = revenue - expenses, percentages, averages)
3. Extract and analyze numerical data from documents
4. Provide clear, accurate answers with reasoning

Guidelines:
- If the answer exists directly in the documents, quote it
- If calculation is needed, extract relevant numbers and compute the result
- Show your reasoning for calculations
- If data is insufficient, clearly state what's missing
- Be precise with numbers and units
- Cite which document(s) you're using

Format your response as:
**Answer:** [Your clear, concise answer]
**Reasoning:** [Brief explanation of how you arrived at the answer, including any calculations]
**Source:** [Which document(s) you used]`;

    const userPrompt = `Question: ${query}

Available Documents:
${documentContext}

Please analyze the documents and answer the question. If calculation is required, perform it accurately.`;

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.3-70b-versatile", // Fast and capable Llama-3
      temperature: 0.3, // Lower temperature for accuracy
      max_tokens: 1024,
    });

    const answer = completion.choices[0]?.message?.content || "";

    return {
      answer,
      usedLLM: true,
      chunks: retrievedChunks,
    };
  } catch (error) {
    console.error("LLM enhancement error:", error);
    // Graceful fallback - return chunks without LLM processing
    return {
      answer: "",
      usedLLM: false,
      chunks: retrievedChunks,
    };
  }
}

/**
 * Simple health check for Groq service
 */
export async function checkGroqHealth(): Promise<boolean> {
  if (!process.env.GROQ_API_KEY) {
    return false;
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Hi" }],
      model: "llama-3.3-70b-versatile",
      max_tokens: 5,
    });
    return !!completion.choices[0]?.message?.content;
  } catch (error) {
    console.error("Groq health check failed:", error);
    return false;
  }
}
