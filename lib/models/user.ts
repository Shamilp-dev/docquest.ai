import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [40, 'Username must not exceed 40 characters'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    avatar: {
      type: String,
      default: ""
    },
    securityQuestion: {
      type: String,
      default: ""
    },
    securityAnswer: {
      type: String,
      default: ""
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  { 
    timestamps: true,
    strict: true
  }
);

// Add indexes for better query performance
// Note: email already has unique index, no need for additional index
UserSchema.index({ role: 1 });
UserSchema.index({ isOnline: 1 });

export default models.User || model("User", UserSchema);
