import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { MenuItem } from '@/lib/types';

export async function GET() {
  try {
    const menuItems = await query<MenuItem>(
      'SELECT * FROM menu_items WHERE available = true ORDER BY type, name'
    );

    // Group by type
    const groupedMenu = {
      starter: menuItems.filter(item => item.type === 'starter'),
      main: menuItems.filter(item => item.type === 'main'),
      dessert: menuItems.filter(item => item.type === 'dessert'),
    };

    return NextResponse.json(groupedMenu);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}
