// app/api/utils/documentChunker.ts

export interface DocumentChunk {
  text: string;
  index: number;
  startChar: number;
  endChar: number;
}

/**
 * Splits a document into overlapping chunks for better retrieval.
 * Use this for long documents (>5000 characters) to improve search accuracy.
 */
export function chunkDocument(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunkText = text.substring(startIndex, endIndex);

    chunks.push({
      text: chunkText,
      index: chunkIndex,
      startChar: startIndex,
      endChar: endIndex,
    });

    // Move forward, accounting for overlap
    startIndex += chunkSize - overlap;
    chunkIndex++;
  }

  return chunks;
}

/**
 * Smart chunking that tries to break at sentence boundaries.
 * This preserves context better than simple character-based chunking.
 */
export function smartChunkDocument(
  text: string,
  targetSize: number = 1000,
  overlap: number = 200
): DocumentChunk[] {
  // Split into sentences (handles ., !, ?)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: DocumentChunk[] = [];
  
  let currentChunk = "";
  let currentStart = 0;
  let chunkIndex = 0;

  for (const sentence of sentences) {
    // If adding this sentence exceeds target size and we have content
    if (currentChunk.length + sentence.length > targetSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex,
        startChar: currentStart,
        endChar: currentStart + currentChunk.length,
      });

      // Create overlap by keeping last portion of text
      const overlapText = currentChunk.slice(-overlap);
      currentStart += currentChunk.length - overlap;
      currentChunk = overlapText + sentence;
      chunkIndex++;
    } else {
      currentChunk += sentence;
    }
  }

  // Add the last chunk if it has content
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      index: chunkIndex,
      startChar: currentStart,
      endChar: currentStart + currentChunk.length,
    });
  }

  return chunks;
}

/**
 * Determines if a document should be chunked based on its length
 */
export function shouldChunkDocument(text: string, threshold: number = 5000): boolean {
  return text.length > threshold;
}

/**
 * Processes a document - chunks it if needed, returns array of texts to embed
 */
export function processDocumentForEmbedding(
  text: string,
  useSmartChunking: boolean = true
): string[] {
  if (!shouldChunkDocument(text)) {
    return [text]; // Return as single item if no chunking needed
  }

  const chunks = useSmartChunking 
    ? smartChunkDocument(text)
    : chunkDocument(text);

  return chunks.map(chunk => chunk.text);
}
