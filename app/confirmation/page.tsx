'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Snowfall from '@/components/Snowfall';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BookingWithDetails } from '@/lib/types';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get('ref');
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingRef) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/bookings?reference=${bookingRef}`);
        const data = await response.json();

        if (response.ok) {
          setBooking(data);
        } else {
          console.error('Failed to load booking');
        }
      } catch (error) {
        console.error('Error loading booking:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [bookingRef]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading booking details... 🎄</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card-christmas p-8 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find a booking with this reference.
          </p>
          <Link href="/" className="btn-christmas inline-block px-8 py-3 rounded-lg font-bold">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Calculate surcharge breakdown
  const surchargeItems: Array<{ name: string; amount: number }> = [];
  let totalSurcharges = 0;
  const depositPerPerson = 10.00;
  const baseDeposit = booking.total_guests * depositPerPerson;

  booking.guests?.forEach(guest => {
    const orders = guest.orders || [];
    orders.forEach(order => {
      const surcharge = Number(order.menu_item?.surcharge) || 0;
      if (surcharge > 0) {
        surchargeItems.push({
          name: order.menu_item.name,
          amount: surcharge
        });
        totalSurcharges += surcharge;
      }
    });
  });

  const subtotal = baseDeposit + totalSurcharges;
  const tip = subtotal * 0.10;

  return (
    <div className="min-h-screen relative">
      <Snowfall />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-12">
            <div className="text-7xl mb-6">🎉</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ color: 'var(--christmas-red)' }}>
              Booking Confirmed!
            </h1>
            <p className="text-xl text-gray-600">
              Your Christmas dinner is reserved
            </p>
          </div>

          {/* Booking Reference */}
          <div className="card-christmas p-8 mb-8 text-center shadow-xl">
            <p className="text-base text-gray-600 mb-2">Booking Reference</p>
            <p className="text-4xl font-bold mb-3" style={{ color: 'var(--christmas-green)' }}>
              {booking.booking_reference}
            </p>
            <p className="text-base text-gray-600">
              Please keep this reference for your records
            </p>
          </div>

          {/* Payment Information */}
          <div className="card-christmas p-8 mb-8 shadow-xl" style={{ borderColor: 'var(--christmas-red)', borderWidth: '3px' }}>
            <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2" style={{ color: 'var(--christmas-red)', borderColor: 'var(--christmas-green)' }}>
              💳 Complete Your Payment
            </h2>
            <p className="text-base text-gray-700 mb-6">
              To secure your booking, please pay the deposit amount via Monzo:
            </p>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-xl p-6 mb-6 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-base">Deposit (£{depositPerPerson} × {booking.total_guests} guest{booking.total_guests !== 1 ? 's' : ''}):</span>
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
                <span className="font-bold text-2xl">Total Deposit Amount:</span>
                <span className="font-bold text-4xl" style={{ color: 'var(--christmas-red)' }}>
                  {formatCurrency(Number(booking.total_amount))}
                </span>
              </div>
            </div>

            <a
              href={booking.monzo_payment_link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-christmas block text-center py-5 rounded-lg font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              🔗 Pay Deposit via Monzo
            </a>

            <p className="text-sm text-gray-600 mt-4 text-center">
              Payment Status: <span className={booking.payment_status === 'paid' ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>
                {booking.payment_status === 'paid' ? '✅ PAID' : '⏳ PENDING'}
              </span>
            </p>
          </div>

          {/* Booking Details */}
          <div className="card-christmas p-8 mb-8 shadow-xl">
            <h2 className="text-3xl font-bold mb-6 pb-4 border-b-2" style={{ color: 'var(--christmas-red)', borderColor: 'var(--christmas-green)' }}>
              📋 Booking Details
            </h2>

            {/* Organizer Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold mb-2">Organizer:</h3>
              <p>{booking.organizer_name}</p>
              <p>{booking.organizer_email}</p>
              <p>{booking.organizer_phone}</p>
              <p className="text-sm text-gray-600 mt-2">
                Booked on: {formatDate(new Date(booking.booking_date))}
              </p>
            </div>

            {/* Guest Details */}
            <h3 className="font-bold text-xl mb-4">Guests & Meals:</h3>
            <div className="space-y-5">
              {booking.guests && booking.guests.map((guest, idx) => {
                const orders = guest.orders || [];
                const starterOrder = orders.find(o => o.menu_item.type === 'starter');
                const mainOrder = orders.find(o => o.menu_item.type === 'main');
                const dessertOrder = orders.find(o => o.menu_item.type === 'dessert');

                return (
                  <div key={guest.id} className="p-6 border-2 border-gray-300 rounded-lg bg-white shadow-md">
                    <h4 className="font-bold text-xl mb-5 pb-3 border-b border-gray-200" style={{ color: 'var(--christmas-red)' }}>
                      {idx === 0 ? '🎅 ' : '👤 '}{guest.guest_name}
                    </h4>
                    {guest.dietary_requirements && (
                      <p className="text-sm text-gray-600 mb-3">
                        Dietary Requirements: {guest.dietary_requirements}
                      </p>
                    )}
                    <div className="space-y-3">
                      {starterOrder && (
                        <div className="pb-3 border-b border-gray-200">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm" style={{ color: 'var(--christmas-green)' }}>🥗 Starter</span>
                            {starterOrder.menu_item.surcharge > 0 && (
                              <span className="text-red-600 font-bold text-sm">+{formatCurrency(starterOrder.menu_item.surcharge)}</span>
                            )}
                          </div>
                          <p className="font-medium">{starterOrder.menu_item.name}</p>
                          {starterOrder.menu_item.description && (
                            <p className="text-sm text-gray-600 mt-1">{starterOrder.menu_item.description}</p>
                          )}
                        </div>
                      )}
                      {mainOrder && (
                        <div className="pb-3 border-b border-gray-200">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm" style={{ color: 'var(--christmas-green)' }}>🍗 Main</span>
                            {mainOrder.menu_item.surcharge > 0 && (
                              <span className="text-red-600 font-bold text-sm">+{formatCurrency(mainOrder.menu_item.surcharge)}</span>
                            )}
                          </div>
                          <p className="font-medium">{mainOrder.menu_item.name}</p>
                          {mainOrder.menu_item.description && (
                            <p className="text-sm text-gray-600 mt-1">{mainOrder.menu_item.description}</p>
                          )}
                        </div>
                      )}
                      {dessertOrder && (
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm" style={{ color: 'var(--christmas-green)' }}>🍰 Dessert</span>
                            {dessertOrder.menu_item.surcharge > 0 && (
                              <span className="text-red-600 font-bold text-sm">+{formatCurrency(dessertOrder.menu_item.surcharge)}</span>
                            )}
                          </div>
                          <p className="font-medium">{dessertOrder.menu_item.name}</p>
                          {dessertOrder.menu_item.description && (
                            <p className="text-sm text-gray-600 mt-1">{dessertOrder.menu_item.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Important Information */}
          <div className="card-christmas p-6 mb-6" style={{ background: 'linear-gradient(135deg, #FFF9E6 0%, #FFFEF0 100%)' }}>
            <h3 className="font-bold text-lg mb-3">⚠️ Important Information</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Please complete your payment as soon as possible to secure your booking</li>
              <li>A confirmation email has been sent to {booking.organizer_email}</li>
              <li>Please arrive 15 minutes before your scheduled time</li>
              <li>If you need to make changes, please contact us with your booking reference</li>
              <li>Full payment will be required on the day</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-green-600 text-white py-5 rounded-lg font-bold text-lg shadow-lg hover:bg-green-700 hover:shadow-xl hover:scale-105 transition-all"
            >
              🖨️ Print Confirmation
            </button>
            <Link
              href="/"
              className="flex-1 bg-gray-300 text-gray-700 py-5 rounded-lg font-bold text-lg text-center shadow-lg hover:bg-gray-400 hover:shadow-xl hover:scale-105 transition-all"
            >
              🏠 Return Home
            </Link>
          </div>

          {/* Thank You Message */}
          <div className="text-center mt-8">
            <p className="text-2xl font-bold" style={{ color: 'var(--christmas-red)' }}>
              🎄 Thank you for your booking! 🎄
            </p>
            <p className="text-gray-600 mt-2">
              We look forward to serving you this Christmas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading... 🎄</div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
