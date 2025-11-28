# GridFS Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                 │
│                                                                      │
│  1. Upload File (FormData)                                          │
│     ↓                                                                │
└─────┼────────────────────────────────────────────────────────────────┘
      │
      ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    VERCEL SERVERLESS FUNCTION                        │
│                   (app/api/upload/route.ts)                          │
│                                                                      │
│  2. Receive File Buffer                                             │
│  3. Extract Text (PDF/DOCX/Image OCR)                               │
│  4. Generate AI Embedding                                           │
│     ↓                                                                │
│  5. Upload to GridFS ──────────┐                                    │
│  6. Save Metadata to DB ───────┼──→                                 │
└────────────────────────────────┼────────────────────────────────────┘
                                  │
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      MONGODB ATLAS                                   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  knowledgehub.documents (Metadata)                            │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ {                                                        │  │  │
│  │  │   _id: ObjectId("..."),                                 │  │  │
│  │  │   filename: "report.pdf",                               │  │  │
│  │  │   gridfsId: "507f1f...",  ←──┐ Reference                │  │  │
│  │  │   extractedText: "...",       │                         │  │  │
│  │  │   embedding: [...],           │                         │  │  │
│  │  │   userId: "user123"           │                         │  │  │
│  │  │ }                              │                         │  │  │
│  │  └────────────────────────────────┼─────────────────────┐  │  │  │
│  └───────────────────────────────────┼─────────────────────┘  │  │
│                                       │                         │  │
│  ┌───────────────────────────────────┼─────────────────────┐  │  │
│  │  uploads.files (GridFS Metadata)  ↓                      │  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │  │
│  │  │ {                                                    │  │  │  │
│  │  │   _id: ObjectId("507f1f..."),                       │  │  │  │
│  │  │   filename: "report.pdf",                           │  │  │  │
│  │  │   length: 2048576,                                  │  │  │  │
│  │  │   chunkSize: 261120,                                │  │  │  │
│  │  │   contentType: "application/pdf",                   │  │  │  │
│  │  │   metadata: { userId: "user123" }                   │  │  │  │
│  │  │ }                                                    │  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │  │
│  └───────────────────────────────────────────────────────┘  │  │
│                                                               │  │
│  ┌───────────────────────────────────────────────────────┐  │  │
│  │  uploads.chunks (GridFS File Data)                     │  │  │
│  │  ┌────────────────────────────────────────────────┐    │  │  │
│  │  │ Chunk 0: { files_id: "507f...", n: 0, data: ... }│    │  │  │
│  │  │ Chunk 1: { files_id: "507f...", n: 1, data: ... }│    │  │  │
│  │  │ Chunk 2: { files_id: "507f...", n: 2, data: ... }│    │  │  │
│  │  │ ... (255KB each)                                  │    │  │  │
│  │  └────────────────────────────────────────────────┘    │  │  │
│  └───────────────────────────────────────────────────────┘  │  │
└─────────────────────────────────────────────────────────────────────┘


DOWNLOAD FLOW:
═══════════════

User clicks download
       ↓
GET /api/documents/[id]/download
       ↓
1. Verify authentication
2. Get document metadata (find gridfsId)
3. Stream from GridFS using gridfsId
       ↓
Browser receives file stream


DELETE FLOW:
════════════

Soft Delete (Default):
  DELETE /api/documents/[id]
       ↓
  Set deleted: true in documents collection
  (File remains in GridFS)

Permanent Delete:
  DELETE /api/documents/[id]?permanent=true
       ↓
  1. Delete from documents collection
  2. Delete from uploads.files
  3. Delete from uploads.chunks
  (Complete removal)


KEY BENEFITS:
═════════════

┌──────────────────────────────────────────────────────────────┐
│  ✅ No Filesystem                                             │
│     - Works on Vercel serverless                             │
│     - No /var/task/uploads errors                            │
│                                                               │
│  ✅ Scalable Storage                                          │
│     - MongoDB handles large files                            │
│     - Automatic chunking                                     │
│                                                               │
│  ✅ Geographic Distribution                                   │
│     - MongoDB Atlas replication                              │
│     - Low latency worldwide                                  │
│                                                               │
│  ✅ Built-in Backup                                           │
│     - MongoDB Atlas point-in-time recovery                   │
│     - No manual backup needed                                │
└──────────────────────────────────────────────────────────────┘
```

## File Size Handling

```
Small File (< 255KB):
━━━━━━━━━━━━━━━━━━━
uploads.chunks: 1 chunk

Medium File (1MB):
━━━━━━━━━━━━━━━━━━━
uploads.chunks: 4 chunks (255KB each)

Large File (10MB):
━━━━━━━━━━━━━━━━━━━
uploads.chunks: 40 chunks (255KB each)
```

## Security Flow

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ↓
┌──────────────────┐
│  requireAuth()   │  ← Check JWT token
└──────┬───────────┘
       │
       ↓ Valid?
       │
   ┌───┴───┐
   │  YES  │
   └───┬───┘
       │
       ↓
┌──────────────────────┐
│  Check Ownership:    │  ← Verify user owns document
│  document.userId ==  │
│  user.id             │
└──────┬───────────────┘
       │
       ↓ Matches?
       │
   ┌───┴───┐
   │  YES  │
   └───┬───┘
       │
       ↓
┌──────────────────────┐
│  Allow Operation     │
└──────────────────────┘
```

## Environment Variables Flow

```
.env.local (Local)              Vercel Dashboard
─────────────────────           ────────────────────
MONGODB_URI=...                 MONGODB_URI=...
OPENAI_API_KEY=...      →      OPENAI_API_KEY=...
NEXTAUTH_SECRET=...             NEXTAUTH_SECRET=...
NEXTAUTH_URL=localhost          NEXTAUTH_URL=production-url

                ↓                       ↓
          
        Local Dev Server        Vercel Serverless Function
            (npm run dev)           (Automatic Deployment)
```

## Migration Path

```
OLD SYSTEM:                    NEW SYSTEM:
───────────                    ───────────

┌─────────────┐               ┌─────────────┐
│   Upload    │               │   Upload    │
└─────┬───────┘               └─────┬───────┘
      │                             │
      ↓                             ↓
┌─────────────┐               ┌─────────────────┐
│ File System │ ❌ Fails      │  MongoDB GridFS │ ✅ Works
│ /uploads/   │  on Vercel    │  uploads.files  │  on Vercel
└─────────────┘               └─────────────────┘
```
