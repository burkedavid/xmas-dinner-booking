import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function clearBookings() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🎄 Clearing all bookings from database...\n');

    // Delete all bookings (this will cascade delete guests and guest_orders)
    const result = await pool.query('DELETE FROM bookings');

    console.log(`✅ Deleted ${result.rowCount} booking(s)`);
    console.log('✅ All related guests and orders have been removed');
    console.log('\n🎅 Database bookings cleared successfully!\n');
  } catch (error) {
    console.error('❌ Error clearing bookings:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

clearBookings();
