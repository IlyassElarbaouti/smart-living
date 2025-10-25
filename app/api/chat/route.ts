import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get or create profile
    let profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          firstName: user.user_metadata?.firstName || user.email?.split('@')[0],
          lastName: user.user_metadata?.lastName,
          avatar: user.user_metadata?.avatar_url,
        },
      });
    }

    const { content, role = 'USER' } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        profileId: profile.id,
        role: role,
        content: content.trim(),
      },
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: userMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// GET - Fetch chat history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ messages: [] });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch messages (both user's messages and assistant responses)
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { profileId: profile.id },
          { role: 'ASSISTANT' },
          { role: 'SYSTEM' },
        ],
      },
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.createdAt,
        sender: msg.profile ? {
          id: msg.profile.id,
          name: `${msg.profile.firstName || ''} ${msg.profile.lastName || ''}`.trim() || 'Guest',
          avatar: msg.profile.avatar || getDefaultAvatar(msg.profile.firstName),
          isOnline: true,
        } : {
          id: 'assistant',
          name: 'Concierge Support',
          avatar: '/logo.svg',
          isOnline: true,
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Helper function to get default avatar based on name
function getDefaultAvatar(name?: string | null): string {
  const firstChar = (name?.charAt(0) || 'G').toUpperCase();
  return `https://ui-avatars.com/api/?name=${firstChar}&background=random&size=100`;
}
