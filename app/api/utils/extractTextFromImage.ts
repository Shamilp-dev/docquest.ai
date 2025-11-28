// app/api/utils/extractTextFromImage.ts
import Tesseract from 'tesseract.js';

export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    console.log("Starting OCR extraction with Tesseract.js...");
    console.log("Buffer size:", buffer.length, "bytes");
    
    // Create worker for better performance and control
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
      errorHandler: (err) => {
        console.error('Tesseract error:', err);
      }
    });
    
    try {
      console.log("Worker initialized, starting recognition...");
      const { data: { text, confidence } } = await worker.recognize(buffer);
      
      console.log("OCR extraction completed");
      console.log("Confidence:", confidence);
      console.log("Extracted text length:", text.length);
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the image');
      }
      
      return text.trim();
    } finally {
      // Always terminate worker to free resources
      await worker.terminate();
    }
  } catch (error) {
    console.error("OCR extraction failed:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    throw new Error(`OCR failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}