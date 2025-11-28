# GridFS File Upload System

This project uses MongoDB GridFS for file storage instead of the local filesystem, making it compatible with serverless platforms like Vercel.

## How It Works

1. **Upload**: Files are uploaded directly to MongoDB Atlas using GridFS
2. **Storage**: Files are stored in MongoDB's `uploads` bucket (GridFS collection)
3. **Download**: Files are retrieved from GridFS and streamed to the user
4. **Delete**: Files are removed from both the documents collection and GridFS

## API Routes

### Upload File
- **Endpoint**: `POST /api/upload`
- **Body**: FormData with `file` field
- **Returns**: Document metadata with `gridfsId`

### Download File
- **Endpoint**: `GET /api/documents/[id]/download`
- **Returns**: File stream with proper headers

### Delete File
- **Endpoint**: `DELETE /api/documents/[id]`
- **Soft Delete**: Marks document as deleted (default)
- **Permanent Delete**: `DELETE /api/documents/[id]?permanent=true`
  - Removes from both documents collection and GridFS

## Database Schema

### documents collection
```javascript
{
  _id: ObjectId,
  filename: string,
  gridfsId: string,        // Reference to GridFS file
  size: number,
  type: string,
  extractedText: string,
  embedding: number[],
  userId: string,
  owner: string,
  createdAt: Date,
  updatedAt: Date,
  deleted: boolean,
  pages: number,
  summary: string,
  tags: string[]
}
```

### uploads.files (GridFS metadata)
```javascript
{
  _id: ObjectId,
  filename: string,
  contentType: string,
  length: number,
  uploadDate: Date,
  metadata: {
    userId: string,
    username: string,
    uploadedAt: Date
  }
}
```

### uploads.chunks (GridFS data)
GridFS automatically splits files into 255KB chunks

## Benefits

✅ **Serverless Compatible**: No filesystem required
✅ **Scalable**: MongoDB handles large files efficiently
✅ **Reliable**: Files are stored with redundancy
✅ **Secure**: Access control through authentication
✅ **Efficient**: Streaming support for large files

## Environment Variables Required

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/knowledgehub?retryWrites=true&w=majority
```

## File Size Limits

- Maximum file size: 50MB (configurable in route.ts)
- GridFS chunk size: 255KB (default)
- Supported formats: PDF, DOCX, TXT, JPG, PNG, WEBP

## Migration from Filesystem

If you have existing files in the `uploads/` folder:

1. Upload files through the new API endpoint
2. The old files in `uploads/` can be safely deleted
3. All new uploads will go to GridFS automatically
