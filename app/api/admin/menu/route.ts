import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { MenuItem } from '@/lib/types';

// Middleware to check admin authentication
function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return false;
  }

  return true;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const menuItems = await query<MenuItem>(
      'SELECT * FROM menu_items ORDER BY type, name'
    );

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, type, description, price, available } = await request.json();

    if (!name || !type || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['starter', 'main', 'dessert'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid menu item type' },
        { status: 400 }
      );
    }

    const result = await query<MenuItem>(
      `INSERT INTO menu_items (name, type, description, price, available)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, type, description || null, price, available !== false]
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}
