import { NextResponse } from 'next/server';
import Chat from '@/lib/models/chat';
import dbConnect from '@/lib/mongoose';
import { requireAuth } from '@/lib/auth';

// Mark messages as seen
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { messageIds } = await req.json();

    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { success: false, error: 'Message IDs are required' },
        { status: 400 }
      );
    }

    const chat = await Chat.findOne({ userId: user.id });

    if (!chat) {
      return NextResponse.json(
        { success: false, error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Mark messages as seen
    let updated = false;
    chat.messages.forEach((msg: any) => {
      if (messageIds.includes(msg.id) && msg.sender === 'admin' && msg.status !== 'seen') {
        msg.status = 'seen';
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    return NextResponse.json({
      success: true
    });

  } catch (error: any) {
    console.error('Mark seen error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
