import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import Chat from '@/lib/models/chat';
import User from '@/lib/models/user';
import dbConnect from '@/lib/mongoose';

export async function GET(req: NextRequest) {
  try {
    // Require admin authentication
    const admin = await requireAdmin();
    await dbConnect();

    console.log('Admin fetching all chats...');

    // Get all chats sorted by last message
    const chats = await Chat.find({})
      .sort({ lastMessageAt: -1 })
      .lean();

    console.log('Found', chats.length, 'total chats');

    // Get user information for each chat and filter out admin chats
    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        const user = await User.findById(chat.userId).lean();
        
        // Skip this chat if:
        // 1. User not found
        // 2. User is an admin (don't show admin's own chats)
        // 3. Chat belongs to the current admin
        if (!user || user.role === 'admin' || chat.userId.toString() === admin.id) {
          return null;
        }
        
        // Count unread messages (from user, not seen by admin)
        const unreadCount = chat.messages.filter(
          (msg: any) => msg.sender === 'user' && msg.status !== 'seen'
        ).length;

        const lastMessage = chat.messages[chat.messages.length - 1];

        console.log('Chat for user:', user?.username, 'Messages:', chat.messages.length, 'Unread:', unreadCount);

        return {
          _id: chat._id.toString(),
          userId: chat.userId.toString(),
          username: user.username,
          userEmail: user.email || '',
          isOnline: user.isOnline || false,
          lastSeen: user.lastSeen || null,
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          unreadCount,
          lastMessage
        };
      })
    );

    // Filter out null values (admin chats)
    const userChatsOnly = enrichedChats.filter(chat => chat !== null);

    console.log('Returning', userChatsOnly.length, 'user chats (filtered out admin chats)');

    return NextResponse.json({
      success: true,
      chats: userChatsOnly
    });
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chats' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
