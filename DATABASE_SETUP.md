# Database Setup Guide

This guide will help you set up the Prisma database schema with Supabase.

## Prerequisites

- Supabase account and project
- Node.js installed
- tsx package for running TypeScript files

## Step 1: Install Dependencies

```bash
npm install
npm install -D tsx
```

## Step 2: Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings > Database
   - Copy the "Connection String" (URI format)
   - Navigate to Settings > API
   - Copy the "Project URL" and "anon public" key

3. Update your `.env` file:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Step 3: Generate Prisma Client

```bash
npm run db:generate
```

This will create the Prisma client in `lib/generated/prisma`.

## Step 4: Push Schema to Database

```bash
npm run db:push
```

This will create all the tables in your Supabase database.

## Step 5: Seed the Database

```bash
npm run db:seed
```

This will populate your database with:
- 1 property (Smart Living Hotel)
- 5 service categories (For You, Restaurants, Shops, Transport, Explore)
- 6 venues (Bella Italia, Tokyo Kitchen, The Burger Lab, Fresh Market, Corner Grocery, The Elah Lounge)
- 10 menu items (all the food items from your hardcoded data)
- 50 rooms (across 5 floors)

## Step 6: View Your Data (Optional)

```bash
npm run db:studio
```

This opens Prisma Studio in your browser where you can view and edit your data.

## Database Schema Overview

### Core Tables:
- **profiles** - User profiles (extends Supabase auth)
- **properties** - Hotel/property information
- **rooms** - Room inventory with pricing and availability
- **reservations** - Guest bookings

### Service Tables:
- **venues** - Restaurants, shops, services
- **menu_items** - Food, products, services offered
- **orders** & **order_items** - Guest purchases

### Communication Tables:
- **notifications** - Push notifications
- **chat_messages** - AI/staff chat history
- **service_categories** - Tab categories

## Using Prisma in Your Code

```typescript
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// Example: Get all menu items for a venue
const menuItems = await prisma.menuItem.findMany({
  where: {
    venue: {
      name: "Bella Italia"
    }
  },
  include: {
    venue: true
  }
});
```

## Troubleshooting

### "Cannot find module '../lib/generated/prisma'"
Run `npm run db:generate` to generate the Prisma client.

### "Error: connect ECONNREFUSED"
Check your `DATABASE_URL` in `.env` is correct.

### Migration conflicts
If you need to reset the database:
```bash
npm run db:push -- --force-reset
npm run db:seed
```

## Next Steps

1. Create API routes to fetch data from the database
2. Replace hardcoded data in components with database queries
3. Implement authentication with Supabase
4. Add server actions for creating orders, reservations, etc.
