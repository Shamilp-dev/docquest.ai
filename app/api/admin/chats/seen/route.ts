import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import Chat from '@/lib/models/chat';
import dbConnect from '@/lib/mongoose';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    console.log('Marking messages as seen for chat:', chatId);

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Mark all user messages as seen
    let markedCount = 0;
    chat.messages.forEach((msg: any) => {
      if (msg.sender === 'user' && msg.status !== 'seen') {
        msg.status = 'seen';
        markedCount++;
      }
    });

    // Reset unread count
    chat.unreadCount = 0;

    await chat.save();

    console.log('Marked', markedCount, 'messages as seen');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error marking messages as seen:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark as seen' },
      { status: error.message === 'Admin access required' ? 403 : 500 }
    );
  }
}
