// app/api/upload/route.ts - OPTIMIZED FOR VERCEL
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import fs from "fs";
import clientPromise from "@/lib/mongodb";
import { generateEmbedding } from "../utils/generateEmbedding";
import { extractTextFromImage } from "../utils/extractTextFromImage";
import { requireAuth } from "@/lib/auth";

// File size limit: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp'
];

// Maximum execution time (Vercel limit: 10s on Hobby, 15s on Pro)
const MAX_EXECUTION_TIME = 8000; // 8 seconds to be safe

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    // Get authenticated user
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized - Please log in"
      }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ 
        success: false,
        error: "No file uploaded" 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: `Invalid file type: ${file.type}. Supported: PDF, DOCX, TXT, JPG, PNG, WEBP`
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads folder if not exists
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, file.name);
    await writeFile(filePath, buffer);

    let extractedText = "";
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    // Check if we're approaching timeout
    const checkTimeout = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > MAX_EXECUTION_TIME) {
        throw new Error('Processing timeout - file may be too large or complex');
      }
    };

    // Extract by file type with timeout protection
    try {
      checkTimeout();
      
      if (fileExtension === "pdf") {
        const pdfParseModule = (await import("./pdfParseWrapper.cjs")) as {
          default: (data: Buffer) => Promise<{ text: string }>;
        };
        const pdfParse = pdfParseModule.default;

        if (!Buffer.isBuffer(buffer)) {
          throw new Error("Invalid buffer provided to pdf-parse");
        }

        if (buffer.length < 4 || buffer.toString("ascii", 0, 4) !== "%PDF") {
          throw new Error("File does not appear to be a valid PDF");
        }

        console.log("Parsing PDF buffer, size:", buffer.length);
        
        // Race between parsing and timeout
        const pdfPromise = pdfParse(buffer);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('PDF parsing timeout')), 7000);
        });
        
        const pdfData = await Promise.race([pdfPromise, timeoutPromise]);
        extractedText = pdfData.text;
        
      } else if (fileExtension === "docx") {
        checkTimeout();
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
        
      } else if (fileExtension === "txt") {
        extractedText = buffer.toString("utf8");
        
      } else if (["jpg", "jpeg", "png", "webp"].includes(fileExtension)) {
        console.log("Processing image with OCR...");
        checkTimeout();
        
        // OCR with strict timeout (most time-consuming operation)
        const ocrPromise = extractTextFromImage(buffer);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('OCR timeout - try a smaller image')), 7000);
        });
        
        extractedText = await Promise.race([ocrPromise, timeoutPromise]);
        console.log("OCR completed, extracted length:", extractedText.length);
        
      } else {
        return NextResponse.json({
          success: false,
          error: "Unsupported file type"
        }, { status: 400 });
      }
    } catch (extractError) {
      console.error("Text extraction error:", extractError);
      return NextResponse.json({
        success: false,
        error: `Text extraction failed: ${extractError instanceof Error ? extractError.message : 'Unknown error'}`,
        suggestion: "Try a smaller file or different format"
      }, { status: 500 });
    }

    // Ensure we have some text
    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "No text could be extracted from the file"
      }, { status: 400 });
    }

    // Check timeout before embedding
    checkTimeout();

    // Generate embedding and save to MongoDB
    try {
      if (!clientPromise) {
        throw new Error("MongoDB not configured");
      }

      const client = await clientPromise;
      const db = client.db("knowledgehub");

      // Generate embedding with timeout
      console.log("Generating embedding for:", file.name);
      
      const embeddingPromise = generateEmbedding(extractedText);
      const embeddingTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Embedding generation timeout')), 5000);
      });
      
      const embedding = await Promise.race([embeddingPromise, embeddingTimeout]);
      console.log("Embedding generated, dimensions:", embedding.length);

      // Calculate pages estimate
      const estimatedPages = Math.ceil(extractedText.length / 3000);

      const document = {
        filename: file.name,
        size: buffer.length,
        type: fileExtension,
        extractedText: extractedText,
        embedding: embedding,
        userId: user.id,
        owner: user.username,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
        pages: estimatedPages,
        summary: extractedText.substring(0, 200) + (extractedText.length > 200 ? "..." : ""),
        tags: [],
      };

      const result = await db.collection("documents").insertOne(document);
      console.log("Document saved to MongoDB with embedding:", result.insertedId);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Total processing time: ${processingTime}ms`);

      return NextResponse.json({
        success: true,
        message: "File uploaded & processed successfully",
        file: {
          id: result.insertedId.toString(),
          name: file.name,
          url: `/uploads/${file.name}`,
          type: fileExtension,
          size: buffer.length,
          pages: estimatedPages
        },
        processingTime,
        saved: true,
      });

    } catch (dbError) {
      console.error("MongoDB save error:", dbError);
      
      // Check if it's a timeout error
      if (dbError instanceof Error && dbError.message.includes('timeout')) {
        return NextResponse.json({
          success: false,
          error: "Processing timeout - file may be too large",
          suggestion: "Try uploading a smaller file or breaking it into parts"
        }, { status: 408 });
      }
      
      return NextResponse.json({
        success: false,
        error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
      }, { status: 500 });
    }

  } catch (error) {
    console.error("❌ UPLOAD ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's a timeout error
    if (errorMessage.includes('timeout')) {
      return NextResponse.json({
        success: false,
        error: "Upload processing timeout",
        details: "The file took too long to process. Try a smaller file.",
        suggestion: "Reduce file size or complexity"
      }, { status: 408 });
    }
    
    return NextResponse.json({
      success: false,
      error: "Upload failed",
      details: errorMessage
    }, { status: 500 });
  }
}

// Force dynamic rendering (no caching)
export const dynamic = 'force-dynamic';
export const maxDuration = 10; // Maximum duration in seconds (Vercel limit)
