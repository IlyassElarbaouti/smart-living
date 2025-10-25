import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const venueName = searchParams.get('venue');
    const venueId = searchParams.get('venueId');

    // Build where clause based on provided parameters
    const whereClause: Prisma.MenuItemWhereInput = {
      isAvailable: true,
    };

    if (venueId) {
      whereClause.venueId = venueId;
    } else if (venueName) {
      whereClause.venue = {
        name: {
          contains: venueName,
          mode: 'insensitive',
        },
      };
    }

    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        venue: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}
