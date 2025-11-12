import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Booking } from '@/lib/types';

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
    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get('payment_status');

    let sql = `
      SELECT b.*,
        json_agg(
          json_build_object(
            'id', g.id,
            'guest_name', g.guest_name,
            'dietary_requirements', g.dietary_requirements,
            'orders', (
              SELECT json_agg(
                json_build_object(
                  'id', go.id,
                  'menu_item', json_build_object(
                    'id', mi.id,
                    'name', mi.name,
                    'type', mi.type,
                    'description', mi.description,
                    'surcharge', mi.surcharge
                  )
                )
              )
              FROM guest_orders go
              JOIN menu_items mi ON mi.id = go.menu_item_id
              WHERE go.guest_id = g.id
            )
          )
        ) as guests
      FROM bookings b
      LEFT JOIN guests g ON g.booking_id = b.id
    `;

    const params: any[] = [];

    if (paymentStatus && paymentStatus !== 'all') {
      sql += ' WHERE b.payment_status = $1';
      params.push(paymentStatus);
    }

    sql += ' GROUP BY b.id ORDER BY b.created_at DESC';

    const bookings = await query(sql, params);

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
