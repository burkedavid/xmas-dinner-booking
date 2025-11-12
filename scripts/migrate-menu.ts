import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function migrateMenu() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🎄 Migrating menu items to new Christmas menu...\n');

    // Add new columns if they don't exist
    console.log('Adding new columns to menu_items table...');
    await pool.query(`
      ALTER TABLE menu_items
      ADD COLUMN IF NOT EXISTS surcharge DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS subcategory VARCHAR(50);
    `);
    console.log('✅ Columns added');

    // Delete all existing bookings first (will cascade to guests and guest_orders)
    console.log('\nClearing existing bookings...');
    await pool.query('DELETE FROM bookings');
    console.log('✅ Existing bookings cleared');

    // Delete all existing menu items
    console.log('\nClearing old menu items...');
    await pool.query('DELETE FROM menu_items');
    console.log('✅ Old menu items cleared');

    // Insert new menu items
    console.log('\nInserting new Christmas menu...');
    await pool.query(`
      INSERT INTO menu_items (name, type, description, surcharge, subcategory, available) VALUES
      -- Starters
      ('Crispy Satay Chicken', 'starter', 'Napa Salad, Hot Honey', 0.00, NULL, true),
      ('Brie & Chestnut Arancini', 'starter', 'Cranberry Jam, Caramelised Onions, Parmesan', 0.00, NULL, true),
      ('Strangford Lough Steamed Mussels', 'starter', 'Thai Coconut Broth, Crusty Bread', 0.00, NULL, true),
      ('Lobster, Prawn & Clam Seafood Stew', 'starter', 'Pickled Fennel', 0.00, NULL, true),
      ('Smoked Salmon & Crab Terrine', 'starter', 'Celeriac Remoulade, Sourdough Toast', 0.00, NULL, true),
      ('Pan Seared Scallops', 'starter', 'Black Pudding Crumb, Brioche Crouton, Mushroom Duxelle, Truffle Cream', 5.00, NULL, true),

      -- Mains (Regular options)
      ('Turkey & Ham Roulade', 'main', 'Chipolatas, Mash, Duck Fat Roasties, Honey Roast Veg, Cranberry Gel, Turkey Gravy', 0.00, 'regular', true),
      ('Roast Cod', 'main', 'Champagne & Tarragon Beurre Blanc, Parsnip Puree, Crab & Prawn Bon Bon, Winter Greens', 0.00, 'regular', true),
      ('Pan Fried Seabass', 'main', 'Saffron Potato, Creamed Leeks, Confit Cherry Tomato, Crispy Sage', 0.00, 'regular', true),
      ('Chestnut Crusted Salmon', 'main', 'Fennel, Dill & Mascarpone Risotto, Crispy Kale', 0.00, 'regular', true),

      -- Mains (Steaks - clearly organized with surcharges)
      ('8oz Flat Iron', 'main', 'Triple cooked chips, rocket & parmesan salad, peppercorn sauce', 0.00, 'steak', true),
      ('12oz Ribeye', 'main', 'Triple cooked chips, rocket & parmesan salad, peppercorn sauce', 8.00, 'steak', true),
      ('10oz Salt Aged Sirloin', 'main', 'Triple cooked chips, rocket & parmesan salad, peppercorn sauce', 8.00, 'steak', true),
      ('8oz Fillet', 'main', 'Triple cooked chips, rocket & parmesan salad, peppercorn sauce', 10.00, 'steak', true),

      -- Desserts
      ('Christmas Pudding', 'dessert', 'Brandy Cream, Redcurrant Compote', 0.00, NULL, true),
      ('Dark Chocolate & Hazelnut Tart', 'dessert', 'Raspberry Popcorn, Marshmallow', 0.00, NULL, true),
      ('Lemon Posset', 'dessert', 'Blackberry Sauce, Palmier', 0.00, NULL, true),
      ('Sticky Toffee Pudding', 'dessert', 'Salted Caramel Sauce, Honeycomb Ice Cream', 0.00, NULL, true),
      ('Cashel Blue & Camembert', 'dessert', 'Crackers, Fig Chutney', 0.00, NULL, true);
    `);

    console.log('✅ New Christmas menu inserted');

    // Verify the results
    const result = await pool.query('SELECT COUNT(*) FROM menu_items');
    console.log(`\n✅ Total menu items: ${result.rows[0].count}`);

    console.log('\n🎅 Menu migration completed successfully!\n');
  } catch (error) {
    console.error('❌ Error migrating menu:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateMenu();
