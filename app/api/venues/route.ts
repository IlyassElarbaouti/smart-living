import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VenueType } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');

    const venues = await prisma.venue.findMany({
      where: {
        isActive: true,
        ...(type && { type: type.toUpperCase() as VenueType }),
        ...(categoryId && { categoryId }),
      },
      include: {
        menuItems: {
          where: {
            isAvailable: true,
          },
          take: 10,
        },
        _count: {
          select: {
            menuItems: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    );
  }
}
