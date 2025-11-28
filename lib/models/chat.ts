import mongoose, { Schema, model, models } from 'mongoose';

const MessageSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent'
  }
});

const ChatSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    username: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    messages: [MessageSchema],
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
      index: true
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    },
    unreadCount: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true 
  }
);

// Indexes for better performance
ChatSchema.index({ userId: 1, status: 1 });
ChatSchema.index({ lastMessageAt: -1 });

export default models.Chat || model("Chat", ChatSchema);
