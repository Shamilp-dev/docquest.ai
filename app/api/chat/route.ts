import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import Chat from '@/lib/models/chat';
import dbConnect from '@/lib/mongoose';
import { ObjectId } from 'mongodb';

// Get user's chat
export async function GET() {
  try {
    const user = await requireAuth();
    await dbConnect();

    // Prevent admins from creating/accessing their own chat
    // Admins should only use the admin panel to view user chats
    const dbUser = await (await import('@/lib/models/user')).default.findById(user.id);
    if (dbUser && dbUser.role === 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admins cannot use the chat feature. Please use the Admin Panel to view user chats.' 
        },
        { status: 403 }
      );
    }

    console.log('Fetching chat for user:', user.id);

    let chat = await Chat.findOne({ userId: user.id });

    if (!chat) {
      console.log('No chat found, creating new chat for user:', user.id);
      // Create new chat for user
      chat = await Chat.create({
        userId: user.id,
        username: user.username,
        userEmail: user.email,
        messages: [],
        status: 'open'
      });
    }

    console.log('Returning chat with', chat.messages.length, 'messages');

    return NextResponse.json({
      success: true,
      chat
    });

  } catch (error: any) {
    console.error('Get chat error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get chat' },
      { status: 500 }
    );
  }
}

// Send message from user
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    await dbConnect();

    // Prevent admins from sending messages as users
    const dbUser = await (await import('@/lib/models/user')).default.findById(user.id);
    if (dbUser && dbUser.role === 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admins cannot send messages as users. Please use the Admin Panel.' 
        },
        { status: 403 }
      );
    }

    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    console.log('User sending message:', { userId: user.id, message });

    let chat = await Chat.findOne({ userId: user.id });

    if (!chat) {
      console.log('Creating new chat for user:', user.id);
      chat = await Chat.create({
        userId: user.id,
        username: user.username,
        userEmail: user.email,
        messages: [],
        status: 'open'
      });
    }

    const newMessage = {
      id: `msg_${Date.now()}`,
      text: message,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    chat.messages.push(newMessage);
    chat.lastMessageAt = new Date();
    chat.unreadCount = (chat.unreadCount || 0) + 1;
    await chat.save();

    console.log('Message saved successfully. Total messages:', chat.messages.length);

    return NextResponse.json({
      success: true,
      message: newMessage,
      chat
    });

  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
