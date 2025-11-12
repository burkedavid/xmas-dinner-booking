'use client';

import Link from 'next/link';
import Image from 'next/image';
import Snowfall from '@/components/Snowfall';
import { TreePine, Gift, Sparkles, UtensilsCrossed, Users, CreditCard, CheckCircle2, ArrowRight, Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Snowfall />

      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-green-50 to-yellow-50 opacity-50 z-0" />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-8 fade-in">
            {/* Minimal Icon */}
            <div className="flex justify-center mb-4">
              <Gift className="w-12 h-12 text-red-600" />
            </div>

            {/* Compact Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent">
              Christmas Dinner Booking
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Join us for a magical Christmas celebration! Book your festive feast and enjoy a delicious three-course meal.
            </p>

            {/* CTA Button */}
            <Link
              href="/booking"
              className="btn-christmas inline-flex items-center gap-2 px-8 py-3 text-base font-bold rounded-lg hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Order Your Christmas Dinner
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Quick Info */}
            <p className="mt-4 text-sm text-gray-600 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              £10 deposit per person • Full payment on the night
            </p>
          </div>

          {/* Venue Information */}
          <div className="glass-effect card-christmas p-6 mb-8 slide-in">
            <div className="flex items-center justify-center gap-2 mb-6">
              <MapPin className="w-6 h-6 text-red-600" />
              <h3 className="text-2xl font-bold text-red-700">
                Event Details
              </h3>
            </div>

            {/* Featured Image */}
            <div className="mb-6 max-w-3xl mx-auto">
              <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg border-2 border-red-200">
                <Image
                  src="/photos/a.jpg"
                  alt="Christmas Dinner Event"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Date & Time */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-600">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-green-700">Date</h4>
                </div>
                <p className="text-2xl font-bold text-gray-800">20th December</p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="p-2 rounded-lg bg-green-600">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-green-700">Time</h4>
                </div>
                <p className="text-2xl font-bold text-gray-800">3:00 PM</p>
              </div>

              {/* Venue */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-red-600">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-red-700">Venue</h4>
                </div>
                <p className="text-lg font-bold text-gray-800 mb-2">Millars Grill & Seafood</p>
                <p className="text-gray-700 mb-4">
                  1D Lanyon Quay<br />
                  Belfast<br />
                  BT1 3LG
                </p>
                <a
                  href="https://www.millarsgrillandseafood.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="glass-effect card-christmas p-6 slide-in">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-red-600" />
              <h3 className="text-2xl font-bold text-red-700">
                How It Works
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: 1, text: 'Enter your contact details', icon: Users },
                { step: 2, text: 'Choose meals for each guest', icon: UtensilsCrossed },
                { step: 3, text: 'Review your booking', icon: CheckCircle2 },
                { step: 4, text: 'Pay deposit via Monzo', icon: CreditCard },
              ].map(({ step, text, icon: Icon }) => (
                <div key={step} className="text-center group">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                      {step}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-white p-2 rounded-full shadow-md">
                        <Icon className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 font-medium mt-6">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 text-center relative z-10">
        <div className="flex items-center justify-center gap-3 text-gray-600">
          <TreePine className="w-6 h-6 text-green-600" />
          <p className="text-lg font-medium">Merry Christmas!</p>
          <TreePine className="w-6 h-6 text-green-600" />
        </div>
      </footer>
    </div>
  );
}
