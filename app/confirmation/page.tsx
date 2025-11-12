'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Snowfall from '@/components/Snowfall';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BookingWithDetails } from '@/lib/types';
import { PartyPopper, TreePine, Ticket, CreditCard, ClipboardList, AlertCircle, Printer, Home, Salad, UtensilsCrossed, Cake, User, CheckCircle, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

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

  // Trigger confetti animation when booking loads successfully
  useEffect(() => {
    if (booking) {
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#C41E3A', '#165B33', '#FFD700'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [booking]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-2xl">
          <TreePine className="w-8 h-8 text-green-600 animate-pulse" />
          Loading booking details...
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-effect card-christmas p-8 text-center max-w-md">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-red-100">
              <AlertCircle className="w-16 h-16 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find a booking with this reference.
          </p>
          <Link href="/" className="btn-christmas inline-flex items-center gap-2 px-8 py-3 rounded-lg font-bold">
            <Home className="w-5 h-5" />
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

      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-6 fade-in">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-gradient-to-br from-green-100 to-green-200">
                <CheckCircle className="w-10 h-10 text-green-700" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 drop-shadow-md">
              Booking Confirmed!
            </h1>
            <p className="text-sm md:text-base text-gray-600 mb-3">Your Christmas dinner is reserved</p>
            {/* Inline Reference */}
            <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <Ticket className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">Ref:</span>
              <span className="text-base font-bold font-mono text-green-700">{booking.booking_reference}</span>
            </div>
          </div>

          {/* Celebration Image */}
          <div className="mb-4 fade-in">
            <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-lg border-2 border-green-200 opacity-95">
              <Image
                src="/photos/c.jpg"
                alt="Christmas Celebration"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Payment Information */}
          <div className="glass-effect card-christmas p-4 mb-4 shadow-xl slide-in" style={{ borderColor: 'var(--christmas-red)', borderWidth: '3px', animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2" style={{ borderColor: 'var(--christmas-green)' }}>
              <CreditCard className="w-5 h-5 text-red-700" />
              <h2 className="text-xl font-bold" style={{ color: 'var(--christmas-red)' }}>
                Complete Your Payment
              </h2>
            </div>
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
              className="btn-christmas flex items-center justify-center gap-3 text-center py-6 rounded-lg font-bold text-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <ExternalLink className="w-7 h-7" />
              Pay Deposit via Monzo
            </a>

            <div className="flex items-center justify-center gap-2 mt-4">
              <p className="text-sm text-gray-600">Payment Status:</p>
              {booking.payment_status === 'paid' ? (
                <span className="inline-flex items-center gap-1 badge-success">
                  <CheckCircle className="w-4 h-4" />
                  PAID
                </span>
              ) : (
                <span className="badge-pending">
                  PENDING
                </span>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="glass-effect card-christmas p-4 mb-4 shadow-xl slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2" style={{ borderColor: 'var(--christmas-green)' }}>
              <ClipboardList className="w-5 h-5 text-green-700" />
              <h2 className="text-xl font-bold" style={{ color: 'var(--christmas-red)' }}>
                Booking Details
              </h2>
            </div>

            {/* Guest Details */}
            <h3 className="font-bold text-base mb-3">Guests & Meals:</h3>
            <div className="space-y-5">
              {booking.guests && booking.guests.map((guest, idx) => {
                const orders = guest.orders || [];
                const starterOrder = orders.find(o => o.menu_item.type === 'starter');
                const mainOrder = orders.find(o => o.menu_item.type === 'main');
                const dessertOrder = orders.find(o => o.menu_item.type === 'dessert');

                return (
                  <div key={guest.id} className="p-6 border-2 border-gray-300 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-200">
                      <div className={`p-2 rounded-full ${idx === 0 ? 'bg-gradient-to-br from-red-100 to-red-200' : 'bg-gradient-to-br from-green-100 to-green-200'}`}>
                        <User className={`w-5 h-5 ${idx === 0 ? 'text-red-700' : 'text-green-700'}`} />
                      </div>
                      <h4 className="font-bold text-xl" style={{ color: 'var(--christmas-red)' }}>
                        {guest.guest_name}
                      </h4>
                    </div>
                    {guest.dietary_requirements && (
                      <p className="text-sm text-gray-600 mb-3 italic">
                        Dietary Requirements: {guest.dietary_requirements}
                      </p>
                    )}
                    <div className="space-y-3">
                      {starterOrder && (
                        <div className="pb-3 border-b border-gray-200">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <Salad className="w-4 h-4 text-green-600" />
                              <span className="font-bold text-sm" style={{ color: 'var(--christmas-green)' }}>Starter</span>
                            </div>
                            {starterOrder.menu_item.surcharge > 0 && (
                              <span className="badge-surcharge text-xs">+{formatCurrency(starterOrder.menu_item.surcharge)}</span>
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
                            <div className="flex items-center gap-2">
                              <UtensilsCrossed className="w-4 h-4 text-red-600" />
                              <span className="font-bold text-sm" style={{ color: 'var(--christmas-green)' }}>Main</span>
                            </div>
                            {mainOrder.menu_item.surcharge > 0 && (
                              <span className="badge-surcharge text-xs">+{formatCurrency(mainOrder.menu_item.surcharge)}</span>
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
                            <div className="flex items-center gap-2">
                              <Cake className="w-4 h-4 text-yellow-600" />
                              <span className="font-bold text-sm" style={{ color: 'var(--christmas-green)' }}>Dessert</span>
                            </div>
                            {dessertOrder.menu_item.surcharge > 0 && (
                              <span className="badge-surcharge text-xs">+{formatCurrency(dessertOrder.menu_item.surcharge)}</span>
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
          <div className="glass-effect card-christmas p-4 mb-4 slide-in" style={{ background: 'linear-gradient(135deg, #FFF9E6 0%, #FFFEF0 100%)', animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-lg">Important Information</h3>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>Please complete your payment as soon as possible to secure your booking</li>
              <li>Full payment will be required on the day</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-green-600 text-white py-5 rounded-lg font-bold text-lg shadow-lg hover:bg-green-700 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Confirmation
            </button>
            <Link
              href="/"
              className="flex-1 bg-gray-300 text-gray-700 py-5 rounded-lg font-bold text-lg text-center shadow-lg hover:bg-gray-400 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return Home
            </Link>
          </div>

          {/* Thank You Message */}
          <div className="text-center mt-8 fade-in">
            <div className="flex items-center justify-center gap-3">
              <TreePine className="w-8 h-8 text-green-600" />
              <p className="text-2xl font-bold" style={{ color: 'var(--christmas-red)' }}>
                Thank you for your booking!
              </p>
              <TreePine className="w-8 h-8 text-green-600" />
            </div>
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
