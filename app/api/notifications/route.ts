import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import Chat from '@/lib/models/chat';
import dbConnect from '@/lib/mongoose';

export async function GET() {
  try {
    const user = await requireAuth();
    await dbConnect();

    console.log('Fetching notifications for user:', user.id);

    // Get user's chat
    const chat = await Chat.findOne({ userId: user.id }).lean();

    if (!chat) {
      return NextResponse.json({
        success: true,
        hasUnread: false,
        unreadCount: 0,
        lastAdminMessage: null
      });
    }

    // Count unread admin messages
    const unreadAdminMessages = chat.messages.filter(
      (msg: any) => msg.sender === 'admin' && msg.status !== 'seen'
    );

    const hasUnread = unreadAdminMessages.length > 0;
    const lastAdminMessage = unreadAdminMessages.length > 0 
      ? unreadAdminMessages[unreadAdminMessages.length - 1]
      : null;

    console.log('User notifications:', {
      userId: user.id,
      hasUnread,
      unreadCount: unreadAdminMessages.length
    });

    // Return all unread messages for the dropdown
    const messages = unreadAdminMessages.map((msg: any) => ({
      text: msg.text,
      timestamp: msg.timestamp,
      id: msg.id
    }));

    return NextResponse.json({
      success: true,
      hasUnread,
      unreadCount: unreadAdminMessages.length,
      messages,
      lastAdminMessage: lastAdminMessage ? {
        text: lastAdminMessage.text,
        timestamp: lastAdminMessage.timestamp
      } : null
    });
  } catch (error: any) {
    console.error('Error fetching user notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
