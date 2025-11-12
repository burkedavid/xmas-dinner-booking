'use client';

import Link from 'next/link';
import Image from 'next/image';
import Snowfall from '@/components/Snowfall';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-100 via-green-50 to-yellow-100">
      {/* Falling Snow Effect */}
      <Snowfall />

      {/* Subtle Twinkling Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('/textures/twinkle.svg')] opacity-40 mix-blend-overlay animate-pulse-slow z-0" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Compact Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900 drop-shadow-md">
              Christmas Dinner 2025
            </h1>

            <p className="text-lg md:text-xl text-gray-800 max-w-2xl mx-auto mb-8">
              Celebrate the season with a festive three-course meal at{' '}
              <span className="font-semibold text-red-600">Millars Grill & Seafood</span>
            </p>

            <Link
              href="/booking"
              className="group relative inline-flex items-center justify-center gap-2.5 px-16 py-5 font-semibold transition-all duration-500 ease-out hover:gap-4 no-underline"
              style={{ 
                background: 'white',
                color: '#dc2626',
                borderRadius: '9999px',
                boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.15)',
                fontSize: '1.125rem',
                border: '2px solid #dc2626',
                transform: 'perspective(1px) translateZ(0)',
                backfaceVisibility: 'hidden',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 28px 0 rgba(220, 38, 38, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.textDecoration = 'none';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 20px 0 rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#dc2626';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              <span style={{ marginLeft: '0.5rem' }}>Book Your Table</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
            </Link>

            <p className="mt-4 text-sm text-gray-700">
              £11 deposit per person • Full payment on the night
            </p>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full h-80 rounded-xl overflow-hidden shadow-xl"
          >
            <Image
              src="/photos/a.jpg"
              alt="Christmas Dinner Event"
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Date & Time */}
            <div className="p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-md hover:shadow-xl transition-all">
              <h3 className="text-lg font-bold text-gray-900 mb-3">📅 Date & Time</h3>
              <p className="text-2xl font-bold text-red-700">20th December</p>
              <p className="text-lg text-gray-800">3:00 PM</p>
            </div>

            {/* Venue */}
            <div className="p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-md hover:shadow-xl transition-all">
              <h3 className="text-lg font-bold text-gray-900 mb-3">📍 Venue</h3>
              <p className="font-bold text-gray-800">Millars Grill & Seafood</p>
              <p className="text-sm text-gray-600 mb-2">
                1D Lanyon Quay, Belfast, BT1 3LG
              </p>
              <a
                href="https://www.millarsgrillandseafood.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-900 font-semibold transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Visit Website
              </a>
            </div>
          </motion.div>

          {/* How to Book Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-md hover:shadow-xl transition-all"
          >
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
              🎁 How to Book
            </h2>
            <div className="max-w-2xl mx-auto space-y-4 text-gray-700">
              {[
                '. Enter your contact details',
                '. Choose meals for each guest',
                '. Review your booking',
                '. Pay £10 deposit per person via Monzo',
              ].map((step, i) => (
                <p key={i} className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-red-600 text-white rounded-full text-sm font-bold">
                    {i + 1}
                  </span>
                  {step}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-700 bg-gradient-to-t from-green-100/60 to-transparent relative z-10">
        <p className="text-lg font-semibold text-red-700 animate-bounce">
          🎅 Merry Christmas & Happy Holidays! 🎁
        </p>
      </footer>

      {/* Custom Glow Animation */}
      <style jsx>{`
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 10px #ff0000, 0 0 20px #ff7b00, 0 0 40px #ffe600;
          }
          50% {
            text-shadow: 0 0 20px #00ff66, 0 0 30px #0099ff, 0 0 60px #ff0000;
          }
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
