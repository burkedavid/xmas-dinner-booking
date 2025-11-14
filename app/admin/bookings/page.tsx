'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Snowfall from '@/components/Snowfall';
import { formatCurrency } from '@/lib/utils';
import { TreePine, ClipboardList, Menu, LogOut, BarChart3, Trash2, CheckCircle, XCircle, Download } from 'lucide-react';

interface Booking {
  id: number;
  booking_reference: string;
  organizer_name: string;
  total_guests: number;
  total_amount: number;
  payment_status: 'pending' | 'paid';
  guests: Array<{
    id: number;
    guest_name: string;
    orders: Array<{
      menu_item: {
        name: string;
        type: string;
        surcharge: number;
      };
    }>;
  }>;
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }
    setAuthToken(token);
  }, [router]);

  useEffect(() => {
    if (!authToken) return;

    async function loadBookings() {
      try {
        const response = await fetch('/api/admin/bookings', {
          headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        } else if (response.status === 401) {
          localStorage.removeItem('admin_token');
          router.push('/admin');
        }
      } catch (error) {
        console.error('Failed to load bookings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [authToken, router]);

  const handleTogglePayment = async (bookingId: number, currentStatus: 'pending' | 'paid') => {
    if (!authToken) return;

    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ payment_status: newStatus }),
      });

      if (response.ok) {
        setBookings(bookings.map(b =>
          b.id === bookingId ? { ...b, payment_status: newStatus } : b
        ));
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleDeleteBooking = async (bookingId: number, bookingRef: string) => {
    if (!authToken) return;

    if (!confirm(`Delete booking ${bookingRef}?`)) return;

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      if (response.ok) {
        setBookings(bookings.filter(b => b.id !== bookingId));
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin');
  };

  const exportGuestOrdersToExcel = () => {
    // Create CSV content
    const headers = ['Booking Reference', 'Guest Name', 'Starter', 'Main', 'Dessert', 'Deposit', 'Payment Status'];
    const rows = guestRows.map(row => [
      row.bookingRef,
      row.guestName,
      row.starter,
      row.main,
      row.dessert,
      row.deposit.toFixed(2),
      row.paymentStatus.toUpperCase()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `guest-orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportDishSummaryToExcel = () => {
    // Create CSV content
    const headers = ['Course', 'Dish Name', 'Count'];
    const rows = [
      ...dishesByType.starter.sort((a, b) => b[1].count - a[1].count).map(([dish, info]) => ['Starter', dish, info.count]),
      ...dishesByType.main.sort((a, b) => b[1].count - a[1].count).map(([dish, info]) => ['Main', dish, info.count]),
      ...dishesByType.dessert.sort((a, b) => b[1].count - a[1].count).map(([dish, info]) => ['Dessert', dish, info.count])
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dish-summary-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Flatten bookings to show each guest as a row
  const guestRows = bookings.flatMap(booking =>
    booking.guests.map((guest, guestIndex) => {
      const starter = guest.orders.find(o => o.menu_item.type === 'starter');
      const main = guest.orders.find(o => o.menu_item.type === 'main');
      const dessert = guest.orders.find(o => o.menu_item.type === 'dessert');

      // Calculate individual deposit for this guest
      const baseDeposit = 10.00;
      const starterSurcharge = Number(starter?.menu_item.surcharge || 0);
      const mainSurcharge = Number(main?.menu_item.surcharge || 0);
      const dessertSurcharge = Number(dessert?.menu_item.surcharge || 0);
      const individualSubtotal = baseDeposit + starterSurcharge + mainSurcharge + dessertSurcharge;
      const individualTip = individualSubtotal * 0.10;
      const individualDeposit = individualSubtotal + individualTip;

      return {
        bookingId: booking.id,
        bookingRef: booking.booking_reference,
        guestName: guest.guest_name,
        starter: starter?.menu_item.name || '-',
        main: main?.menu_item.name || '-',
        dessert: dessert?.menu_item.name || '-',
        deposit: individualDeposit,
        totalAmount: Number(booking.total_amount),
        paymentStatus: booking.payment_status,
        isFirstGuest: guestIndex === 0,
        totalGuests: booking.total_guests,
      };
    })
  );

  const stats = {
    total: bookings.length,
    paid: bookings.filter(b => b.payment_status === 'paid').length,
    totalRevenue: bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + Number(b.total_amount), 0),
  };

  // Calculate dish summary
  const dishSummary: Map<string, { count: number; type: string }> = new Map();
  bookings.forEach(booking => {
    booking.guests.forEach(guest => {
      guest.orders.forEach(order => {
        const dishName = order.menu_item.name;
        const dishType = order.menu_item.type;
        if (dishSummary.has(dishName)) {
          dishSummary.get(dishName)!.count++;
        } else {
          dishSummary.set(dishName, { count: 1, type: dishType });
        }
      });
    });
  });

  // Group dishes by type
  const dishesByType = {
    starter: Array.from(dishSummary.entries()).filter(([_, info]) => info.type === 'starter'),
    main: Array.from(dishSummary.entries()).filter(([_, info]) => info.type === 'main'),
    dessert: Array.from(dishSummary.entries()).filter(([_, info]) => info.type === 'dessert'),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading... 🎄</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Snowfall />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 fade-in">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ClipboardList className="w-6 h-6 text-red-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 drop-shadow-md">
                  Bookings
                </h1>
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {stats.total} bookings • {stats.paid} paid • {formatCurrency(stats.totalRevenue)} revenue
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="/admin/menu"
                className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition hover:scale-105 inline-flex items-center gap-2"
              >
                <Menu className="w-4 h-4" />
                Menu
              </a>
              <button
                onClick={handleLogout}
                className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-gray-400 transition hover:scale-105 inline-flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Dish Summary */}
          {bookings.length > 0 && (
            <div className="glass-effect card-christmas p-6 mb-6 slide-in">
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2" style={{ borderColor: 'var(--christmas-green)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-200">
                    <BarChart3 className="w-6 h-6 text-green-700" />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--christmas-red)' }}>
                    Dish Summary
                  </h2>
                </div>
                <button
                  onClick={exportDishSummaryToExcel}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition hover:scale-105 inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export to Excel
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Starters */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--christmas-green)' }}>
                    🥗 Starters
                  </h3>
                  <div className="space-y-2">
                    {dishesByType.starter.sort((a, b) => b[1].count - a[1].count).map(([dish, info]) => (
                      <div key={dish} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm flex-1">{dish}</span>
                        <span className="font-bold text-base px-3 py-1 bg-green-100 text-green-800 rounded-full">
                          {info.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mains */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--christmas-green)' }}>
                    🍗 Mains
                  </h3>
                  <div className="space-y-2">
                    {dishesByType.main.sort((a, b) => b[1].count - a[1].count).map(([dish, info]) => (
                      <div key={dish} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm flex-1">{dish}</span>
                        <span className="font-bold text-base px-3 py-1 bg-green-100 text-green-800 rounded-full">
                          {info.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desserts */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: 'var(--christmas-green)' }}>
                    🍰 Desserts
                  </h3>
                  <div className="space-y-2">
                    {dishesByType.dessert.sort((a, b) => b[1].count - a[1].count).map(([dish, info]) => (
                      <div key={dish} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm flex-1">{dish}</span>
                        <span className="font-bold text-base px-3 py-1 bg-green-100 text-green-800 rounded-full">
                          {info.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="card-christmas p-6 overflow-x-auto">
            {guestRows.length === 0 ? (
              <div className="text-center py-12 text-gray-600">No bookings yet</div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--christmas-red)' }}>
                    Guest Orders
                  </h2>
                  <button
                    onClick={exportGuestOrdersToExcel}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition hover:scale-105 inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export to Excel
                  </button>
                </div>
              </>
            )}
            {guestRows.length > 0 && (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="pb-3 pr-4 font-bold">Booking</th>
                    <th className="pb-3 pr-4 font-bold">Guest Name</th>
                    <th className="pb-3 pr-4 font-bold">Starter</th>
                    <th className="pb-3 pr-4 font-bold">Main</th>
                    <th className="pb-3 pr-4 font-bold">Dessert</th>
                    <th className="pb-3 pr-4 font-bold text-right">Deposit</th>
                    <th className="pb-3 pr-4 font-bold text-center">Status</th>
                    <th className="pb-3 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {guestRows.map((row, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 pr-4">
                        {row.isFirstGuest && (
                          <div className="flex flex-col">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded mb-1">
                              {row.bookingRef}
                            </span>
                            {row.totalGuests > 1 && (
                              <span className="text-xs text-gray-600">
                                {row.totalGuests} guests
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-medium">{row.guestName}</td>
                      <td className="py-3 pr-4">{row.starter}</td>
                      <td className="py-3 pr-4">{row.main}</td>
                      <td className="py-3 pr-4">{row.dessert}</td>
                      <td className="py-3 pr-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold">{formatCurrency(row.deposit)}</span>
                          {row.isFirstGuest && row.totalGuests > 1 && (
                            <span className="text-xs text-gray-600">
                              (Total: {formatCurrency(row.totalAmount)})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            row.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {row.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleTogglePayment(row.bookingId, row.paymentStatus)}
                            className={`px-3 py-1 rounded text-xs font-bold text-white inline-flex items-center gap-1 transition hover:scale-105 ${
                              row.paymentStatus === 'paid'
                                ? 'bg-orange-600 hover:bg-orange-700'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {row.paymentStatus === 'paid' ? (
                              <>
                                <XCircle className="w-3 h-3" />
                                Unpaid
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Paid
                              </>
                            )}
                          </button>
                          {row.isFirstGuest && (
                            <button
                              onClick={() => handleDeleteBooking(row.bookingId, row.bookingRef)}
                              className="px-3 py-1 rounded text-xs font-bold bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-1 transition hover:scale-105 border-2 border-red-800 shadow-sm hover:shadow-md"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
