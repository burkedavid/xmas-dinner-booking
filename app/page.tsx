'use client';

import Link from 'next/link';
import Snowfall from '@/components/Snowfall';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <Snowfall />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Christmas Icons */}
          <div className="text-6xl mb-6">
            🎄 🎅 🎁
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: 'var(--christmas-red)' }}>
            Christmas Dinner
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold mb-8" style={{ color: 'var(--christmas-green)' }}>
            Booking System
          </h2>

          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 leading-relaxed">
            Join us for a magical Christmas celebration! Book your festive feast today and enjoy
            a delicious three-course meal with your loved ones.
          </p>

          {/* CTA Button */}
          <Link
            href="/booking"
            className="btn-christmas inline-block px-12 py-4 text-xl font-bold rounded-full hover:scale-105 transition-transform duration-300"
          >
            🎄 Order Your Christmas Dinner
          </Link>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="card-christmas p-6">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--christmas-green)' }}>
                Delicious Menu
              </h3>
              <p className="text-gray-600">
                Choose from our selection of festive starters, traditional mains, and decadent desserts
              </p>
            </div>

            <div className="card-christmas p-6">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--christmas-green)' }}>
                Group Bookings
              </h3>
              <p className="text-gray-600">
                Book for multiple people in one go - perfect for families and friends
              </p>
            </div>

            <div className="card-christmas p-6">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--christmas-green)' }}>
                Easy Payment
              </h3>
              <p className="text-gray-600">
                Secure deposit payment via Monzo with just a £10 deposit per person
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-16 card-christmas p-8">
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--christmas-red)' }}>
              🎅 How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--christmas-gold)' }}>
                  1
                </div>
                <p className="text-gray-700">
                  Enter your contact details
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--christmas-gold)' }}>
                  2
                </div>
                <p className="text-gray-700">
                  Choose meals for each guest
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--christmas-gold)' }}>
                  3
                </div>
                <p className="text-gray-700">
                  Review your booking
                </p>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--christmas-gold)' }}>
                  4
                </div>
                <p className="text-gray-700">
                  Pay deposit via Monzo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600">
        <p>🎄 Merry Christmas! 🎄</p>
      </footer>
    </div>
  );
}
