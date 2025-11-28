import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import Chat from '@/lib/models/chat';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const { chatId, message } = await req.json();

    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'Chat ID and message are required' },
        { status: 400 }
      );
    }

    console.log('Admin replying to chat:', chatId, 'Message:', message);

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    const newMessage = {
      id: `msg_${Date.now()}`,
      text: message,
      sender: 'admin',
      timestamp: new Date(),
      status: 'sent'
    };

    // Add admin's message to the chat
    chat.messages.push(newMessage);

    // Mark all user messages as delivered
    chat.messages.forEach((msg: any) => {
      if (msg.sender === 'user' && msg.status === 'sent') {
        msg.status = 'delivered';
      }
    });

    // Reset unread count since admin is responding
    chat.unreadCount = 0;
    chat.lastMessageAt = new Date();

    await chat.save();

    console.log('Admin reply sent successfully. Total messages:', chat.messages.length);

    return NextResponse.json({
      success: true,
      message: newMessage
    });
  } catch (error: any) {
    console.error('Error sending admin reply:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send reply' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
