-- Christmas Dinner Booking System Database Schema

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('starter', 'main', 'dessert')),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    surcharge DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    subcategory VARCHAR(50),
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
    organizer_name VARCHAR(255) NOT NULL,
    organizer_email VARCHAR(255) NOT NULL,
    organizer_phone VARCHAR(50) NOT NULL,
    booking_date TIMESTAMP NOT NULL,
    total_guests INTEGER NOT NULL CHECK (total_guests > 0),
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
    monzo_payment_link TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guests Table
CREATE TABLE IF NOT EXISTS guests (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    guest_name VARCHAR(255) NOT NULL,
    dietary_requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guest Orders Table
CREATE TABLE IF NOT EXISTS guest_orders (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(organizer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_guests_booking_id ON guests(booking_id);
CREATE INDEX IF NOT EXISTS idx_guest_orders_guest_id ON guest_orders(guest_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_type ON menu_items(type);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);

-- Insert Christmas menu items (3 Courses for £37 base price)
-- Surcharge represents additional cost on top of the £37 base
INSERT INTO menu_items (name, type, description, surcharge, subcategory, available) VALUES
-- Starters
('Roasted Butternut Squash Soup', 'starter', 'Creamy roasted butternut squash soup', 0.00, NULL, true),
('Classic Prawn Cocktail', 'starter', 'Classic prawn cocktail with Marie Rose sauce', 0.00, NULL, true),
('Homemade Chicken Liver Pâté', 'starter', 'Rich homemade chicken liver pâté', 0.00, NULL, true),
('Garlic Mushrooms', 'starter', 'Sautéed garlic mushrooms', 0.00, NULL, true),
('Smoked Mackerel Pâté', 'starter', 'Smoked mackerel pâté with crackers', 0.00, NULL, true),
('Pan Seared Scallops', 'starter', 'Pan seared scallops (+ £5 surcharge)', 5.00, NULL, true),

-- Mains (Regular options)
('Traditional Roast Turkey', 'main', 'Traditional roast turkey with all the trimmings', 0.00, 'regular', true),
('Roasted Cod Loin', 'main', 'Roasted cod loin with seasonal vegetables', 0.00, 'regular', true),
('Pan Seared Seabass', 'main', 'Pan seared seabass fillet', 0.00, 'regular', true),
('Pan Seared Salmon', 'main', 'Pan seared salmon fillet', 0.00, 'regular', true),

-- Mains (Steaks - clearly organized with surcharges)
('Flat Iron Steak', 'main', 'Tender flat iron steak cooked to your liking', 0.00, 'steak', true),
('Ribeye Steak', 'main', 'Premium ribeye steak (+ £8 surcharge)', 8.00, 'steak', true),
('Sirloin Steak', 'main', 'Classic sirloin steak (+ £8 surcharge)', 8.00, 'steak', true),
('Fillet Steak', 'main', 'Premium fillet steak (+ £10 surcharge)', 10.00, 'steak', true),

-- Desserts
('Traditional Christmas Pudding', 'dessert', 'Traditional Christmas pudding with brandy sauce', 0.00, NULL, true),
('Chocolate Tart', 'dessert', 'Rich chocolate tart', 0.00, NULL, true),
('Eton Mess', 'dessert', 'Classic Eton mess with meringue and cream', 0.00, NULL, true),
('Sticky Toffee Pudding', 'dessert', 'Sticky toffee pudding with toffee sauce', 0.00, NULL, true),
('Profiteroles', 'dessert', 'Chocolate profiteroles with cream filling', 0.00, NULL, true)
ON CONFLICT DO NOTHING;
