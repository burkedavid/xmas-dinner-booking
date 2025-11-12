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
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-red-700">
              Christmas Dinner 2025
            </h1>

            <p className="text-lg md:text-xl text-gray-800 max-w-2xl mx-auto mb-6">
              Celebrate the season with a festive three-course meal at{' '}
              <span className="font-semibold text-red-600">Millars Grill & Seafood</span>
            </p>

            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-red-600 via-green-600 to-red-600 text-white text-lg font-bold rounded-full shadow-xl hover:scale-110 hover:shadow-2xl transition-all duration-300"
            >
              Book Now
              <ArrowRight className="w-5 h-5" />
            </Link>

            <p className="mt-3 text-sm text-gray-700">
              £10 deposit per person • Full payment on the night
            </p>
          </motion.div>

          {/* Image with Festive Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full h-80 rounded-[2rem] overflow-hidden shadow-2xl border-[8px] border-green-600/30 bg-white/10 backdrop-blur-sm"
          >
            <div className="absolute inset-0 border-[6px] border-dashed border-red-400/70 rounded-[2rem] pointer-events-none" />
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
            <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-red-100 hover:scale-[1.02] transition-transform">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📅 Date & Time</h3>
              <p className="text-2xl font-bold text-red-700">20th December</p>
              <p className="text-lg text-gray-800">3:00 PM</p>
            </div>

            {/* Venue */}
            <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-green-100 hover:scale-[1.02] transition-transform">
              <h3 className="text-lg font-bold text-gray-900 mb-2">📍 Venue</h3>
              <p className="font-bold text-gray-800">Millars Grill & Seafood</p>
              <p className="text-sm text-gray-600 mb-2">
                1D Lanyon Quay, Belfast, BT1 3LG
              </p>
              <a
                href="https://www.millarsgrillandseafood.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-900 font-semibold"
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
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-red-100"
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
