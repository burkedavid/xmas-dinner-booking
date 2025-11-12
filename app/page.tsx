'use client';

import Link from 'next/link';
import Image from 'next/image';
import Snowfall from '@/components/Snowfall';
import { TreePine, ArrowRight, Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Snowfall />

      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-green-50 to-yellow-50 opacity-50 z-0" />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-6 fade-in">
            {/* Compact Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent">
              Christmas Dinner 2024
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              Join us for a festive three-course meal at Millars Grill & Seafood
            </p>

            {/* CTA Button */}
            <Link
              href="/booking"
              className="btn-christmas inline-flex items-center gap-2 px-8 py-4 text-lg font-bold rounded-lg hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Book Now
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Quick Info */}
            <p className="mt-4 text-sm text-gray-600">
              £10 deposit per person • Full payment on the night
            </p>
          </div>

          {/* Featured Image */}
          <div className="mb-6 slide-in">
            <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-xl">
              <Image
                src="/photos/a.jpg"
                alt="Christmas Dinner Event"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Date & Time */}
            <div className="glass-effect card-christmas p-6">
              <div className="flex items-start gap-4">
                <Calendar className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Date & Time</h3>
                  <p className="text-2xl font-bold text-red-600">20th December</p>
                  <p className="text-lg text-gray-700">3:00 PM</p>
                </div>
              </div>
            </div>

            {/* Venue */}
            <div className="glass-effect card-christmas p-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Venue</h3>
                  <p className="text-base font-bold text-gray-800">Millars Grill & Seafood</p>
                  <p className="text-sm text-gray-600 mb-2">
                    1D Lanyon Quay, Belfast, BT1 3LG
                  </p>
                  <a
                    href="https://www.millarsgrillandseafood.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Website
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="glass-effect card-christmas p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
              How to Book
            </h2>

            <div className="max-w-2xl mx-auto space-y-4">
              {[
                'Enter your contact details',
                'Choose meals for each guest',
                'Review your booking',
                'Pay £10 deposit per person via Monzo'
              ].map((text, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <p className="text-lg text-gray-700 pt-0.5">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center relative z-10">
        <p className="text-sm text-gray-600">Merry Christmas!</p>
      </footer>
    </div>
  );
}
