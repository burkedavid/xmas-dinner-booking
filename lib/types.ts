export interface MenuItem {
  id: number;
  name: string;
  type: 'starter' | 'main' | 'dessert';
  description: string | null;
  price: number;
  surcharge: number;
  subcategory: string | null;
  available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: number;
  booking_reference: string;
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
  booking_date: Date;
  total_guests: number;
  total_amount: number;
  payment_status: 'pending' | 'paid';
  monzo_payment_link: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Guest {
  id: number;
  booking_id: number;
  guest_name: string;
  dietary_requirements: string | null;
  created_at: Date;
}

export interface GuestOrder {
  id: number;
  guest_id: number;
  menu_item_id: number;
  quantity: number;
  created_at: Date;
}

export interface GuestWithOrders extends Guest {
  orders: Array<GuestOrder & { menu_item: MenuItem }>;
}

export interface BookingWithDetails extends Booking {
  guests: GuestWithOrders[];
}

export interface BookingFormData {
  organizer_name: string;
  organizer_email: string;
  organizer_phone: string;
  guests: Array<{
    guest_name: string;
    courseOption: '2-course' | '3-course';
    dietary_requirements?: string;
    orders: {
      starter?: number;
      main?: number;
      dessert?: number;
    };
  }>;
}
