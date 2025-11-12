# 🎄 Christmas Dinner Booking System

A beautiful, mobile-first Christmas dinner ordering website built with Next.js 14, TypeScript, Tailwind CSS, and PostgreSQL (Neon). Features a festive design with snowfall animation, multi-step booking flow, and Monzo payment integration.

## ✨ Features

### Customer-Facing
- **Festive Homepage** - Beautiful Christmas-themed landing page with snowfall animation
- **Multi-Step Booking Flow**:
  - Step 1: Enter organizer contact details
  - Step 2: Specify number of guests
  - Step 3: Select meals for each guest (starter, main, dessert)
  - Step 4: Review booking and confirm
- **Menu Selection** - Choose from pre-loaded festive menu items
- **Dietary Requirements** - Optional field for each guest
- **Payment Integration** - Automatic Monzo payment link generation
- **Booking Confirmation** - Print-friendly confirmation page with all details
- **Mobile-First Design** - Responsive layout optimized for all devices

### Admin Panel
- **Secure Authentication** - Password-protected admin access
- **Bookings Dashboard**:
  - View all bookings with filtering (All/Pending/Paid)
  - Expandable rows showing full guest details and orders
  - Update payment status manually
  - Real-time statistics (total bookings, revenue, guests)
- **Menu Management**:
  - Add, edit, and delete menu items
  - Set prices and availability
  - Manage items by category (starters, mains, desserts)

### Design Features
- **Christmas Color Scheme** - Reds, greens, and golds
- **Snowfall Animation** - Festive falling snowflakes
- **Custom Styling** - Christmas-themed buttons and cards
- **Smooth Transitions** - Professional animations throughout

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon)
- **Deployment**: Vercel-ready
- **Database Client**: node-postgres (pg)

## 📋 Prerequisites

- Node.js 18+ (Note: Project uses Next.js 16 which requires Node 20+, but works with Node 18)
- npm or yarn
- Neon PostgreSQL database account
- Monzo account for payment links

## 🚀 Getting Started

### 1. Clone the Repository

```bash
cd xmas-dinner-booking
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

The `.env.local` file has been pre-configured with your database connection. Verify the settings:

```env
# Database
DATABASE_URL=postgresql://neondb_owner:npg_KHFZ76neJGxP@ep-twilight-dream-ablt9bm9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Admin Authentication
ADMIN_PASSWORD=admin123

# Monzo Payment Configuration
MONZO_BASE_URL=https://monzo.me/davidburke45
MONZO_HASH=UFLFPl
DEPOSIT_AMOUNT=10.00
```

**IMPORTANT**: For production, change the `ADMIN_PASSWORD` to something secure!

### 4. Initialize Database

Run the database initialization script to create tables and seed sample menu items:

```bash
npm run init-db
```

This will:
- Create all required database tables
- Add indexes for performance
- Insert 15 sample menu items (starters, mains, and desserts)

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
xmas-dinner-booking/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── auth/route.ts          # Admin authentication
│   │   │   ├── bookings/
│   │   │   │   ├── route.ts           # List all bookings
│   │   │   │   └── [id]/route.ts      # Update booking payment status
│   │   │   └── menu/
│   │   │       ├── route.ts           # List/create menu items
│   │   │       └── [id]/route.ts      # Update/delete menu items
│   │   ├── bookings/route.ts          # Create and get bookings
│   │   └── menu/route.ts              # Get customer menu
│   ├── admin/
│   │   ├── page.tsx                   # Admin login
│   │   ├── bookings/page.tsx          # Admin bookings dashboard
│   │   └── menu/page.tsx              # Admin menu management
│   ├── booking/page.tsx               # Multi-step booking flow
│   ├── confirmation/page.tsx          # Booking confirmation
│   ├── page.tsx                       # Homepage
│   ├── layout.tsx                     # Root layout
│   └── globals.css                    # Global styles
├── components/
│   └── Snowfall.tsx                   # Snowfall animation component
├── database/
│   └── schema.sql                     # Database schema
├── lib/
│   ├── db.ts                          # Database connection
│   ├── types.ts                       # TypeScript types
│   └── utils.ts                       # Utility functions
├── scripts/
│   └── init-db.ts                     # Database initialization
└── README.md
```

## 🎯 Usage

### Customer Booking Flow

1. **Homepage** (`/`)
   - Click "Order Your Christmas Dinner" button

2. **Step 1: Your Details** (`/booking`)
   - Enter organizer name, email, and phone

3. **Step 2: Number of Guests**
   - Specify how many people (1-20)
   - View total deposit amount

4. **Step 3: Guest Meals**
   - For each guest:
     - Enter guest name
     - Add dietary requirements (optional)
     - Select starter, main, and dessert

5. **Step 4: Review**
   - Review all guest orders
   - Confirm and submit booking

6. **Confirmation** (`/confirmation?ref=XM-...`)
   - View booking reference
   - Click Monzo payment link
   - Print confirmation page

### Admin Panel

1. **Login** (`/admin`)
   - Enter admin password (default: `admin123`)

2. **Bookings Dashboard** (`/admin/bookings`)
   - View all bookings
   - Filter by payment status
   - Expand booking to see full details
   - Mark bookings as paid/pending

3. **Menu Management** (`/admin/menu`)
   - Add new menu items
   - Edit existing items
   - Delete items
   - Toggle availability

## 💳 Monzo Payment Integration

The system automatically generates Monzo payment links based on:
- Number of guests × deposit amount per person
- Format: `https://monzo.me/davidburke45/[AMOUNT]?h=UFLFPl`

Example for 2 guests (£10 each):
```
https://monzo.me/davidburke45/20.00?h=UFLFPl
```

## 🗄️ Database Schema

### Tables

1. **menu_items**
   - id, name, type, description, price, available
   - Types: starter, main, dessert

2. **bookings**
   - id, booking_reference, organizer details
   - total_guests, total_amount, payment_status
   - monzo_payment_link

3. **guests**
   - id, booking_id, guest_name, dietary_requirements

4. **guest_orders**
   - id, guest_id, menu_item_id, quantity

## 🚢 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `DATABASE_URL`
   - `ADMIN_PASSWORD`
   - `MONZO_BASE_URL`
   - `MONZO_HASH`
   - `DEPOSIT_AMOUNT`
4. Deploy!

### 3. Initialize Production Database

After deployment, run the database initialization:

```bash
npm run init-db
```

Or connect to your Neon database directly and run the SQL from `database/schema.sql`.

## 🔒 Security Notes

1. **Admin Password**
   - Change the default password in `.env.local` before deployment
   - Use a strong, unique password

2. **Database Connection**
   - Connection string includes SSL/TLS encryption
   - Credentials should never be committed to version control

3. **Admin Authentication**
   - Simple password-based auth for MVP
   - Consider implementing JWT tokens for production

## 🎨 Customization

### Change Colors

Edit `app/globals.css`:

```css
:root {
  --christmas-red: #C41E3A;      /* Main red color */
  --christmas-green: #165B33;    /* Main green color */
  --christmas-gold: #FFD700;     /* Accent gold */
}
```

### Update Menu Items

Use the admin panel at `/admin/menu` or modify `database/schema.sql`.

### Change Deposit Amount

Update `.env.local`:

```env
DEPOSIT_AMOUNT=15.00  # Change to desired amount
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test database connection
psql "postgresql://neondb_owner:npg_KHFZ76neJGxP@ep-twilight-dream-ablt9bm9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
```

### Node Version Warning

If you see Node engine warnings, the app will still work but consider upgrading to Node 20+:

```bash
nvm install 20
nvm use 20
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run init-db` - Initialize database

## 🎯 Features Roadmap

Potential future enhancements:

- [ ] Email confirmation system
- [ ] SMS notifications
- [ ] Webhook integration for automatic payment verification
- [ ] PDF invoice generation
- [ ] Calendar integration
- [ ] Multiple time slot selection
- [ ] Table management
- [ ] Customer accounts and booking history

## 📄 License

This project is open source and available for personal and commercial use.

## 🎄 Support

For issues or questions:
1. Check this README
2. Review the code comments
3. Open an issue on GitHub

---

**Merry Christmas! 🎅🎄**

Made with ❤️ using Next.js, TypeScript, and lots of festive cheer!
