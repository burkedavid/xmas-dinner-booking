'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Snowfall from '@/components/Snowfall';
import { formatCurrency } from '@/lib/utils';
import type { MenuItem, BookingFormData } from '@/lib/types';
import { ClipboardList, Coins, CheckCircle, Salad, UtensilsCrossed, Cake, ArrowLeft, AlertCircle, User } from 'lucide-react';

type MenuItems = {
  starter: MenuItem[];
  main: MenuItem[];
  dessert: MenuItem[];
};

export default function ReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItems | null>(null);
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);

  useEffect(() => {
    // Get booking data from sessionStorage
    const storedData = sessionStorage.getItem('pending_booking');
    if (!storedData) {
      router.push('/booking');
      return;
    }

    try {
      const data = JSON.parse(storedData);
      setBookingData(data);
    } catch (error) {
      console.error('Failed to parse booking data:', error);
      router.push('/booking');
    }
  }, [router]);

  useEffect(() => {
    async function loadMenu() {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error('Failed to load menu:', error);
      }
    }
    loadMenu();
  }, []);

  const handleConfirmBooking = async () => {
    if (!bookingData) return;

    setLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok) {
        sessionStorage.removeItem('pending_booking');
        router.push(`/confirmation?ref=${result.booking.booking_reference}`);
      } else {
        alert(result.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!bookingData || !menuItems) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading... 🎄</div>
      </div>
    );
  }

  // Calculate totals
  const depositPerPerson = 10.00;
  const baseDeposit = bookingData.guests.length * depositPerPerson;

  // Collect surcharge items with details
  const surchargeItems: Array<{ name: string; amount: number }> = [];
  let totalSurcharges = 0;

  bookingData.guests.forEach(guest => {
    if (guest.orders.starter) {
      const item = menuItems.starter.find(i => i.id === guest.orders.starter);
      if (item && Number(item.surcharge) > 0) {
        surchargeItems.push({ name: item.name, amount: Number(item.surcharge) });
        totalSurcharges += Number(item.surcharge);
      }
    }
    if (guest.orders.main) {
      const item = menuItems.main.find(i => i.id === guest.orders.main);
      if (item && Number(item.surcharge) > 0) {
        surchargeItems.push({ name: item.name, amount: Number(item.surcharge) });
        totalSurcharges += Number(item.surcharge);
      }
    }
    if (guest.orders.dessert) {
      const item = menuItems.dessert.find(i => i.id === guest.orders.dessert);
      if (item && Number(item.surcharge) > 0) {
        surchargeItems.push({ name: item.name, amount: Number(item.surcharge) });
        totalSurcharges += Number(item.surcharge);
      }
    }
  });

  const subtotal = baseDeposit + totalSurcharges;
  const tip = subtotal * 0.10;
  const total = subtotal + tip;

  return (
    <div className="min-h-screen relative">
      <Snowfall />

      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 fade-in">
            <div className="flex items-center justify-center gap-2 mb-3">
              <ClipboardList className="w-6 h-6 text-red-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-red-700">
                Review Your Order
              </h1>
            </div>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
              Please review your booking details before confirming
            </p>
          </div>

          {/* Guest Orders */}
          <div className="glass-effect card-christmas p-4 mb-4 shadow-xl slide-in">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2" style={{ borderColor: 'var(--christmas-green)' }}>
              <ClipboardList className="w-5 h-5 text-red-700" />
              <h2 className="text-xl font-bold" style={{ color: 'var(--christmas-red)' }}>
                Your Orders
              </h2>
            </div>
            <div className="space-y-5">
              {bookingData.guests.map((guest, idx) => {
                const starterItem = guest.orders.starter
                  ? menuItems.starter.find(i => i.id === guest.orders.starter)
                  : null;
                const mainItem = guest.orders.main
                  ? menuItems.main.find(i => i.id === guest.orders.main)
                  : null;
                const dessertItem = guest.orders.dessert
                  ? menuItems.dessert.find(i => i.id === guest.orders.dessert)
                  : null;

                return (
                  <div key={idx} className="p-6 border-2 border-gray-300 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-200">
                      <div className={`p-2 rounded-full ${idx === 0 ? 'bg-gradient-to-br from-red-100 to-red-200' : 'bg-gradient-to-br from-green-100 to-green-200'}`}>
                        <User className={`w-5 h-5 ${idx === 0 ? 'text-red-700' : 'text-green-700'}`} />
                      </div>
                      <h3 className="font-bold text-xl" style={{ color: 'var(--christmas-red)' }}>
                        {guest.guest_name}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="pb-3 border-b border-gray-200">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <Salad className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-sm" style={{ color: 'var(--christmas-green)' }}>Starter</span>
                          </div>
                          {starterItem && starterItem.surcharge > 0 && (
                            <span className="badge-surcharge text-xs">+{formatCurrency(starterItem.surcharge)}</span>
                          )}
                        </div>
                        <p className="font-medium">{starterItem?.name}</p>
                        {starterItem?.description && (
                          <p className="text-sm text-gray-600 mt-1">{starterItem.description}</p>
                        )}
                      </div>
                      <div className="pb-3 border-b border-gray-200">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <UtensilsCrossed className="w-4 h-4 text-red-600" />
                            <span className="font-bold text-sm" style={{ color: 'var(--christmas-green)' }}>Main</span>
                          </div>
                          {mainItem && mainItem.surcharge > 0 && (
                            <span className="badge-surcharge text-xs">+{formatCurrency(mainItem.surcharge)}</span>
                          )}
                        </div>
                        <p className="font-medium">{mainItem?.name}</p>
                        {mainItem?.description && (
                          <p className="text-sm text-gray-600 mt-1">{mainItem.description}</p>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <Cake className="w-4 h-4 text-yellow-600" />
                            <span className="font-bold text-sm" style={{ color: 'var(--christmas-green)' }}>Dessert</span>
                          </div>
                          {dessertItem && dessertItem.surcharge > 0 && (
                            <span className="badge-surcharge text-xs">+{formatCurrency(dessertItem.surcharge)}</span>
                          )}
                        </div>
                        <p className="font-medium">{dessertItem?.name}</p>
                        {dessertItem?.description && (
                          <p className="text-sm text-gray-600 mt-1">{dessertItem.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="glass-effect card-christmas p-4 mb-4 shadow-xl slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2" style={{ borderColor: 'var(--christmas-green)' }}>
              <Coins className="w-5 h-5 text-green-700" />
              <h2 className="text-xl font-bold" style={{ color: 'var(--christmas-red)' }}>
                Payment Summary
              </h2>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-xl p-6 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-base">Deposit (£{depositPerPerson} × {bookingData.guests.length} guest{bookingData.guests.length !== 1 ? 's' : ''}):</span>
                <span className="font-bold text-lg">{formatCurrency(baseDeposit)}</span>
              </div>
              {surchargeItems.length > 0 && (
                <div className="mb-3">
                  <div className="font-medium text-base mb-2">Surcharges:</div>
                  <div className="ml-4 space-y-1">
                    {surchargeItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-bold text-red-600">+{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-1 border-t border-gray-300">
                      <span className="font-medium">Total Surcharges:</span>
                      <span className="font-bold text-red-600">+{formatCurrency(totalSurcharges)}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-base">10% tip:</span>
                <span className="font-bold text-lg">{formatCurrency(tip)}</span>
              </div>
              <div className="border-t-2 border-green-700 my-4"></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-2xl">Total to Pay:</span>
                <span className="font-bold text-3xl" style={{ color: 'var(--christmas-red)' }}>
                  {formatCurrency(total)}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">
                Full amount due on the night
              </p>
            </div>
          </div>

          {/* Important Info */}
          <div className="glass-effect card-christmas p-4 mb-4 slide-in" style={{ background: 'linear-gradient(135deg, #FFF9E6 0%, #FFFEF0 100%)', animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-lg">Important Information</h3>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>You will be redirected to Monzo to complete your payment</li>
              <li>Your booking is not confirmed until payment is received</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGoBack}
              className="flex-1 bg-gray-300 text-gray-700 py-5 rounded-lg font-bold text-lg hover:bg-gray-400 shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={loading}
              className="flex-1 btn-christmas py-6 rounded-lg font-bold text-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <CheckCircle className="w-7 h-7" />
                  Confirm & Pay Deposit
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
