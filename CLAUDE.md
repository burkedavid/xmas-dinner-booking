# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-ready Christmas dinner booking system built with Next.js 14 (App Router), TypeScript, PostgreSQL (Neon), and Tailwind CSS. Features a 4-step booking flow, admin panel, menu management, and Monzo payment integration.

## Essential Development Commands

```bash
# Development
npm run dev              # Start development server on localhost:3000
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run ESLint

# Database
npm run init-db         # Initialize database (creates tables and seed data)
```

## Critical Architecture Patterns

### Database Connection (Singleton Pattern)

**Location:** [lib/db.ts](lib/db.ts)

The database uses a singleton connection pool pattern to prevent connection exhaustion:

```typescript
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}
```

**Helper Functions:**
- `query<T>(sql, params)` - Execute query, return all rows
- `queryOne<T>(sql, params)` - Return single row or null

**Critical Rule:** Always use `getPool()` rather than creating new Pool instances. This prevents connection leaks.

### Transaction Pattern for Bookings

**Location:** [app/api/bookings/route.ts](app/api/bookings/route.ts)

All booking creations use database transactions to ensure data consistency:

```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');

  // 1. Insert booking
  const booking = await client.query('INSERT INTO bookings...');

  // 2. For each guest:
  //    - Insert guest record
  //    - Insert 3 guest_orders (starter, main, dessert)

  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

**Why this matters:** Without transactions, a failure mid-booking would create orphaned data. Always use transactions when creating bookings or other multi-table operations.

### Booking Reference Generation

**Location:** [lib/utils.ts](lib/utils.ts:4-9)

```typescript
function generateBookingReference(): string {
  const prefix = 'XM';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
// Example output: "XM-LAB8C9D-X7K2"
```

Format ensures uniqueness through timestamp + random suffix, with Christmas-themed "XM" prefix.

### Multi-Step Booking Flow Architecture

**Location:** [app/booking/page.tsx](app/booking/page.tsx)

The booking page is a client component (`'use client'`) with local state management:

```typescript
const [step, setStep] = useState(1);        // Current step (1-4)
const [guests, setGuests] = useState([]);   // Guest form data
const [currentGuestIndex, setCurrentGuestIndex] = useState(0);
```

**Flow:**
1. **Step 1:** Organizer details (name, email, phone) - validates format
2. **Step 2:** Number of guests (1-20) - initializes guest array
3. **Step 3:** Guest meals - loops through each guest with validation
4. **Step 4:** Review and submit - creates booking via POST /api/bookings

**Important:** Step 3 validation ensures all guests have complete meal selections (starter + main + dessert) before allowing submission.

### Admin Authentication Pattern

**Location:** [app/api/admin/auth/route.ts](app/api/admin/auth/route.ts)

**Current Implementation (MVP):**
- Simple password comparison (plain text)
- Password stored in `ADMIN_PASSWORD` environment variable
- Token = password itself, stored in localStorage
- All admin API routes check: `Authorization: Bearer <password>`

**Security Note:** This is an MVP implementation. For production:
1. Hash passwords with bcrypt
2. Use JWT tokens with expiration
3. Implement proper session management
4. Add CSRF protection

**Admin Route Protection Pattern:**
```typescript
const authHeader = request.headers.get('authorization');
if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Monzo Payment Integration

**Location:** [lib/utils.ts](lib/utils.ts:14-20)

```typescript
function generateMonzoLink(amount: number): string {
  const baseUrl = process.env.MONZO_BASE_URL;  // https://monzo.me/davidburke45
  const hash = process.env.MONZO_HASH;          // UFLFPl
  return `${baseUrl}/${amount.toFixed(2)}?h=${hash}`;
}
```

**Configuration:**
- `DEPOSIT_AMOUNT=10.00` - Amount per guest
- Total deposit = number of guests × deposit amount
- Link format: `https://monzo.me/username/20.00?h=HASH`

**Important:** The hash parameter may be amount-specific. Test with different amounts before production deployment.

## Type System Architecture

**Location:** [lib/types.ts](lib/types.ts)

Key interfaces:
- `MenuItem` - Menu item with type enum ('starter' | 'main' | 'dessert')
- `Booking` - Booking record with payment status enum ('pending' | 'paid')
- `Guest` - Guest with dietary requirements
- `GuestOrder` - Links guests to menu items
- `BookingWithDetails` - Nested structure with guests and orders
- `BookingFormData` - Request payload for POST /api/bookings

**Pattern:** Use extended interfaces for API responses:
```typescript
export interface GuestWithOrders extends Guest {
  orders: Array<GuestOrder & { menu_item: MenuItem }>;
}
```

## Database Schema

**Location:** [database/schema.sql](database/schema.sql)

**Tables:**
1. `menu_items` - Menu with type (starter/main/dessert) and availability
2. `bookings` - Booking header with organizer details and payment status
3. `guests` - Guest records linked to bookings (CASCADE delete)
4. `guest_orders` - Many-to-many linking guests and menu items

**Indexes Created:**
- `bookings.booking_reference` - For quick confirmation lookups
- `bookings.payment_status` - For admin filtering
- `guests.booking_id` - For guest queries
- `menu_items.type` - For grouped menu retrieval

**Relationship:**
```
bookings (1) → (N) guests (1) → (N) guest_orders (N) → (1) menu_items
```

## API Route Structure

### Public Routes
- `GET /api/menu` - Fetch available menu items grouped by type
- `POST /api/bookings` - Create booking (returns booking reference)
- `GET /api/bookings?reference=XM-...` - Fetch booking details

### Admin Routes (Require Authorization Header)
- `POST /api/admin/auth` - Validate admin password
- `GET /api/admin/bookings?payment_status=all|pending|paid` - List bookings
- `PUT /api/admin/bookings/:id` - Update payment status
- `GET /api/admin/menu` - Get all menu items (including unavailable)
- `POST /api/admin/menu` - Create menu item
- `PUT /api/admin/menu/:id` - Update menu item
- `DELETE /api/admin/menu/:id` - Delete menu item

## Utility Functions Reference

**Location:** [lib/utils.ts](lib/utils.ts)

Critical utilities:
- `generateBookingReference()` - Creates unique XM-prefixed references
- `generateMonzoLink(amount)` - Generates payment link
- `calculateTotalDeposit(guests)` - Computes total (guests × deposit)
- `isValidEmail(email)` - Email regex validation
- `isValidPhone(phone)` - UK phone format validation
- `formatCurrency(amount)` - GBP formatting (£10.00)
- `formatDate(date)` - British date format (DD Month YYYY, HH:MM)

## Environment Variables

**Required Variables (.env.local):**
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
ADMIN_PASSWORD=your_secure_password
MONZO_BASE_URL=https://monzo.me/username
MONZO_HASH=unique_hash
DEPOSIT_AMOUNT=10.00
```

**Security Critical:** Never commit `.env.local` to version control. Always change `ADMIN_PASSWORD` before deployment.

## Component Architecture

### Snowfall Component

**Location:** [components/Snowfall.tsx](components/Snowfall.tsx)

Client-side component that creates 50 animated snowflake elements with randomized properties. Uses CSS animations and fixed positioning with `pointer-events: none`.

### Page Components

All pages under `app/` use Next.js 14 App Router conventions:
- Server components by default
- Client components marked with `'use client'`
- API routes in `app/api/*/route.ts`

**Client Components:**
- [app/booking/page.tsx](app/booking/page.tsx) - Multi-step form requires useState
- [app/admin/bookings/page.tsx](app/admin/bookings/page.tsx) - Interactive dashboard
- [app/admin/menu/page.tsx](app/admin/menu/page.tsx) - Menu CRUD operations

## Testing the Application

### Customer Flow Test
1. Visit `http://localhost:3000`
2. Click "Order Your Christmas Dinner"
3. Complete 4-step booking flow
4. Verify booking appears at `/confirmation?ref=XM-...`
5. Check Monzo link has correct amount

### Admin Flow Test
1. Visit `http://localhost:3000/admin`
2. Login with admin password
3. Navigate to `/admin/bookings`
4. Verify booking appears in dashboard
5. Update payment status to "paid"
6. Navigate to `/admin/menu`
7. Add/edit/delete menu items

## Common Development Tasks

### Adding a New Menu Item Category
1. Update type enum in [lib/types.ts](lib/types.ts:4): `type: 'starter' | 'main' | 'dessert' | 'beverage'`
2. Update database CHECK constraint in [database/schema.sql](database/schema.sql:7)
3. Update menu grouping in [app/booking/page.tsx](app/booking/page.tsx)
4. Update admin menu display in [app/admin/menu/page.tsx](app/admin/menu/page.tsx)

### Modifying Booking Validation
1. Update validation in [app/api/bookings/route.ts](app/api/bookings/route.ts:19-63)
2. Update client-side validation in [app/booking/page.tsx](app/booking/page.tsx:59-99)
3. Update TypeScript interfaces in [lib/types.ts](lib/types.ts) if adding fields

### Changing Payment Provider
1. Update `generateMonzoLink()` function in [lib/utils.ts](lib/utils.ts:14-20)
2. Update environment variables in `.env.local`
3. Update confirmation page payment button in [app/confirmation/page.tsx](app/confirmation/page.tsx)

## Known Issues

### Tailwind CSS v4 Compatibility
The project uses Tailwind CSS v3 (not v4) due to native module issues on Windows/WSL. If upgrading to v4, test thoroughly on target deployment platform.

### Node.js Version Requirement
Next.js 16 requires Node.js 20+. If using Node 18, consider downgrading to Next.js 14:
```bash
npm install next@14 react@18 react-dom@18
```

## Deployment Checklist

Before deploying to production:
- [ ] Change `ADMIN_PASSWORD` to a secure value
- [ ] Test Monzo payment links with multiple amounts
- [ ] Run `npm run init-db` on production database
- [ ] Verify all environment variables in Vercel/deployment platform
- [ ] Test full booking flow on production URL
- [ ] Test admin authentication and authorization
- [ ] Verify mobile responsiveness
- [ ] Check SSL/TLS connection to database

## Code Style Notes

- Use TypeScript for all new files
- Prefer Next.js App Router patterns (Server Components by default)
- Use `'use client'` only when necessary (hooks, event handlers, local state)
- Always type API responses with interfaces from [lib/types.ts](lib/types.ts)
- Use helper functions from [lib/utils.ts](lib/utils.ts) for validation and formatting
- Follow transaction pattern for multi-table database operations
- Use singleton `getPool()` for all database connections
