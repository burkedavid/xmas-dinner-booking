import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, getPool } from '@/lib/db';
import { Booking, BookingFormData } from '@/lib/types';
import {
  generateBookingReference,
  generateMonzoLink,
  calculateTotalDeposit,
  isValidEmail,
  isValidPhone,
} from '@/lib/utils';

export async function POST(request: NextRequest) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const formData: BookingFormData = await request.json();

    // Validation
    if (!formData.organizer_name) {
      return NextResponse.json(
        { error: 'Organizer name is required' },
        { status: 400 }
      );
    }

    if (!formData.guests || formData.guests.length === 0) {
      return NextResponse.json(
        { error: 'At least one guest is required' },
        { status: 400 }
      );
    }

    // Validate that each guest has all meal selections
    for (const guest of formData.guests) {
      if (!guest.guest_name) {
        return NextResponse.json(
          { error: 'All guests must have a name' },
          { status: 400 }
        );
      }

      if (!guest.orders.starter || !guest.orders.main || !guest.orders.dessert) {
        return NextResponse.json(
          { error: `${guest.guest_name} must select a starter, main, and dessert` },
          { status: 400 }
        );
      }
    }

    // Begin transaction
    await client.query('BEGIN');

    // Calculate total amount with surcharges
    const depositPerPerson = 10.00;
    const baseDeposit = formData.guests.length * depositPerPerson;

    // Fetch all menu item IDs to get surcharges
    const allMenuItemIds = formData.guests.flatMap(g => [
      g.orders.starter,
      g.orders.main,
      g.orders.dessert
    ]);

    const menuItemsResult = await client.query(
      'SELECT id, surcharge FROM menu_items WHERE id = ANY($1)',
      [allMenuItemIds]
    );

    const menuItemsMap = new Map(
      menuItemsResult.rows.map(item => [item.id, Number(item.surcharge) || 0])
    );

    // Calculate total surcharges
    let totalSurcharges = 0;
    formData.guests.forEach(guest => {
      totalSurcharges += menuItemsMap.get(guest.orders.starter!) || 0;
      totalSurcharges += menuItemsMap.get(guest.orders.main!) || 0;
      totalSurcharges += menuItemsMap.get(guest.orders.dessert!) || 0;
    });

    // Calculate total with tip
    const subtotal = baseDeposit + totalSurcharges;
    const tip = subtotal * 0.10;
    const totalAmount = subtotal + tip;

    // Generate booking reference and payment link
    const bookingReference = generateBookingReference();
    const totalGuests = formData.guests.length;
    const monzoPaymentLink = generateMonzoLink(totalAmount);
    const bookingDate = new Date();

    // Create booking
    const bookingResult = await client.query<Booking>(
      `INSERT INTO bookings
        (booking_reference, organizer_name, organizer_email, organizer_phone,
         booking_date, total_guests, total_amount, monzo_payment_link, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        bookingReference,
        formData.organizer_name,
        formData.organizer_email,
        formData.organizer_phone,
        bookingDate,
        totalGuests,
        totalAmount,
        monzoPaymentLink,
        'pending',
      ]
    );

    const booking = bookingResult.rows[0];

    // Create guests and their orders
    for (const guestData of formData.guests) {
      // Create guest
      const guestResult = await client.query(
        `INSERT INTO guests (booking_id, guest_name, dietary_requirements)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [booking.id, guestData.guest_name, guestData.dietary_requirements || null]
      );

      const guestId = guestResult.rows[0].id;

      // Create orders for this guest
      const orders = [
        { menu_item_id: guestData.orders.starter, quantity: 1 },
        { menu_item_id: guestData.orders.main, quantity: 1 },
        { menu_item_id: guestData.orders.dessert, quantity: 1 },
      ];

      for (const order of orders) {
        await client.query(
          `INSERT INTO guest_orders (guest_id, menu_item_id, quantity)
           VALUES ($1, $2, $3)`,
          [guestId, order.menu_item_id, order.quantity]
        );
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        booking_reference: booking.booking_reference,
        total_amount: booking.total_amount,
        total_guests: booking.total_guests,
        monzo_payment_link: booking.monzo_payment_link,
      },
    }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (reference) {
      // Get specific booking by reference
      const booking = await queryOne<Booking>(
        'SELECT * FROM bookings WHERE booking_reference = $1',
        [reference]
      );

      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      // Get guests and their orders
      const guests = await query(
        `SELECT g.*,
          json_agg(
            json_build_object(
              'id', go.id,
              'menu_item_id', go.menu_item_id,
              'quantity', go.quantity,
              'menu_item', json_build_object(
                'id', mi.id,
                'name', mi.name,
                'type', mi.type,
                'description', mi.description,
                'price', mi.price,
                'surcharge', mi.surcharge
              )
            )
          ) as orders
         FROM guests g
         LEFT JOIN guest_orders go ON go.guest_id = g.id
         LEFT JOIN menu_items mi ON mi.id = go.menu_item_id
         WHERE g.booking_id = $1
         GROUP BY g.id
         ORDER BY g.id`,
        [booking.id]
      );

      return NextResponse.json({
        ...booking,
        guests,
      });
    }

    return NextResponse.json({ error: 'Reference parameter required' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}
