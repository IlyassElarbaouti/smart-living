import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { OrderStatus } from '@prisma/client';

// Generate a unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { venueId, items, deliveryAddress, specialInstructions } = body;

    // Validate request
    if (!venueId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      );
    }

    // Get or create user profile
    let profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          firstName: user.user_metadata?.firstName || user.email?.split('@')[0],
          lastName: user.user_metadata?.lastName,
          phone: user.user_metadata?.phone || user.phone,
          avatar: user.user_metadata?.avatar_url,
        },
      });
    }

    // Fetch menu items to get current prices
    const menuItemIds = items.map((item: { menuItemId: string }) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        isAvailable: true,
      },
    });

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json(
        { error: 'Some items are not available' },
        { status: 400 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map((item: { menuItemId: string; quantity: number; notes?: string }) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) throw new Error('Menu item not found');
      
      const price = typeof menuItem.price === 'string' 
        ? parseFloat(menuItem.price) 
        : Number(menuItem.price);
      
      totalAmount += price * item.quantity;
      
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes,
      };
    });

    // Create order with items
    const order = await prisma.order.create({
      data: {
        profileId: profile.id,
        venueId,
        orderNumber: generateOrderNumber(),
        totalAmount,
        deliveryAddress,
        specialInstructions,
        status: 'PENDING',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        venue: true,
      },
    });

    // Create a notification for the order
    await prisma.notification.create({
      data: {
        profileId: profile.id,
        title: 'Order Placed',
        message: `Your order #${order.orderNumber} has been placed successfully.`,
        type: 'ORDER',
        link: `/orders/${order.id}`,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Get or create user profile
    let profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          firstName: user.user_metadata?.firstName || user.email?.split('@')[0],
          lastName: user.user_metadata?.lastName,
          phone: user.user_metadata?.phone || user.phone,
          avatar: user.user_metadata?.avatar_url,
        },
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        profileId: profile.id,
        ...(status && { status: status as OrderStatus }),
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        venue: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
