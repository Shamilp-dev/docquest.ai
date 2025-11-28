import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import Chat from '@/lib/models/chat';
import User from '@/lib/models/user';
import dbConnect from '@/lib/mongoose';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();

    console.log('Fetching notifications for admin...');

    // Get all chats with unread messages
    const chats = await Chat.find({ unreadCount: { $gt: 0 } })
      .sort({ lastMessageAt: -1 })
      .lean();

    console.log('Found', chats.length, 'chats with unread messages');

    // Enrich with user info and filter out admin chats
    const notifications = await Promise.all(
      chats.map(async (chat) => {
        const user = await User.findById(chat.userId).lean();
        
        // Skip if user not found or is admin
        if (!user || user.role === 'admin') {
          return null;
        }

        // Get the last unread user message
        const unreadMessages = chat.messages.filter(
          (msg: any) => msg.sender === 'user' && msg.status !== 'seen'
        );

        if (unreadMessages.length === 0) {
          return null;
        }

        const lastUnreadMessage = unreadMessages[unreadMessages.length - 1];

        return {
          chatId: chat._id.toString(),
          userId: chat.userId.toString(),
          username: user.username,
          userEmail: user.email,
          isOnline: user.isOnline || false,
          unreadCount: unreadMessages.length,
          lastMessage: {
            text: lastUnreadMessage.text,
            timestamp: lastUnreadMessage.timestamp
          }
        };
      })
    );

    // Filter out nulls
    const validNotifications = notifications.filter(n => n !== null);

    const totalUnread = validNotifications.reduce(
      (sum, notif) => sum + (notif?.unreadCount || 0), 
      0
    );

    console.log('Returning', validNotifications.length, 'notifications with', totalUnread, 'total unread');

    return NextResponse.json({
      success: true,
      notifications: validNotifications,
      totalUnread
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
