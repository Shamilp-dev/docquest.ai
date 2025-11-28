import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  owner: string;           // user id
  title: string;
  content?: string;        // extracted text or summary
  originalName?: string;   // uploaded file name
  fileUrl?: string;        // URL/path to uploaded file
  createdAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    owner: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    originalName: {
      type: String,
    },
    fileUrl: {
      type: String,
    }
  },
  { timestamps: true }
);

export default mongoose.models.Document ||
  mongoose.model<IDocument>('Document', DocumentSchema);
