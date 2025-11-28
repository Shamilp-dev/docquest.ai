import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import Chat from '@/lib/models/chat';
import dbConnect from '@/lib/mongoose';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    console.log('User marking admin messages as seen for chat:', chatId);

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Verify chat belongs to this user
    if (chat.userId.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Mark all admin messages as seen
    let markedCount = 0;
    chat.messages.forEach((msg: any) => {
      if (msg.sender === 'admin' && msg.status !== 'seen') {
        msg.status = 'seen';
        markedCount++;
      }
    });

    await chat.save();

    console.log('Marked', markedCount, 'admin messages as seen');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error marking messages as seen:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark as seen' },
      { status: 500 }
    );
  }
}
