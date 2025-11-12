'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Snowfall from '@/components/Snowfall';
import { formatCurrency } from '@/lib/utils';
import type { MenuItem, BookingFormData } from '@/lib/types';
import { TreePine, Salad, UtensilsCrossed, Cake, UserPlus, ArrowRight, Coins, Sparkles, X } from 'lucide-react';

type MenuItems = {
  starter: MenuItem[];
  main: MenuItem[];
  dessert: MenuItem[];
};

type GuestForm = {
  guest_name: string;
  orders: {
    starter?: number;
    main?: number;
    dessert?: number;
  };
};

export default function BookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItems | null>(null);
  const [guests, setGuests] = useState<GuestForm[]>([
    { guest_name: '', orders: {} },
  ]);

  // Load menu items
  useEffect(() => {
    async function loadMenu() {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error('Failed to load menu:', error);
        alert('Failed to load menu items. Please refresh the page.');
      }
    }
    loadMenu();
  }, []);

  // Calculate total deposit: (deposit per person * guests) + surcharges + 10% tip
  const depositPerPerson = 10.00;
  const calculateTotalDeposit = () => {
    const baseDepositTotal = guests.length * depositPerPerson;

    // Calculate surcharges from selected menu items
    let totalSurcharges = 0;
    guests.forEach(guest => {
      if (guest.orders.starter && menuItems) {
        const item = menuItems.starter.find(i => i.id === guest.orders.starter);
        if (item) totalSurcharges += Number(item.surcharge) || 0;
      }
      if (guest.orders.main && menuItems) {
        const item = menuItems.main.find(i => i.id === guest.orders.main);
        if (item) totalSurcharges += Number(item.surcharge) || 0;
      }
      if (guest.orders.dessert && menuItems) {
        const item = menuItems.dessert.find(i => i.id === guest.orders.dessert);
        if (item) totalSurcharges += Number(item.surcharge) || 0;
      }
    });

    const subtotal = baseDepositTotal + totalSurcharges;
    const tip = subtotal * 0.10; // 10% tip
    return subtotal + tip;
  };

  const totalDeposit = calculateTotalDeposit();

  const addGuest = () => {
    setGuests([...guests, { guest_name: '', orders: {} }]);
  };

  const removeGuest = (index: number) => {
    if (guests.length > 1) {
      const updatedGuests = guests.filter((_, i) => i !== index);
      setGuests(updatedGuests);
    }
  };

  const updateGuestField = (index: number, field: keyof GuestForm, value: any) => {
    const updatedGuests = [...guests];
    if (field === 'orders') {
      updatedGuests[index].orders = { ...updatedGuests[index].orders, ...value };
    } else {
      updatedGuests[index][field] = value;
    }
    setGuests(updatedGuests);
  };

  const validateAndSubmit = () => {
    // Validation
    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i];
      if (!guest.guest_name.trim()) {
        alert(i === 0 ? 'Please enter your name' : `Please enter a name for Guest ${i + 1}`);
        return;
      }
      if (!guest.orders.starter || !guest.orders.main || !guest.orders.dessert) {
        alert(`Please select all meals for ${guest.guest_name}`);
        return;
      }
    }

    // Use first guest's name as organizer name
    const organizerName = guests[0].guest_name;

    const bookingData: BookingFormData = {
      organizer_name: organizerName,
      organizer_email: 'noemail@booking.temp',
      organizer_phone: 'N/A',
      guests: guests.map(g => ({
        guest_name: g.guest_name,
        dietary_requirements: '',
        orders: {
          starter: g.orders.starter!,
          main: g.orders.main!,
          dessert: g.orders.dessert!,
        },
      })),
    };

    // Store booking data in sessionStorage and navigate to review page
    sessionStorage.setItem('pending_booking', JSON.stringify(bookingData));
    router.push('/review');
  };

  if (!menuItems) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading menu... 🎄</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Snowfall />

      <div className="container mx-auto px-3 py-3 relative z-10 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-4 fade-in">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 text-red-700">
            Book Your Christmas Dinner
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Choose your festive feast for yourself and your guests
          </p>
        </div>

        {/* Guests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 mb-4">
          {guests.map((guest, index) => (
            <div key={index} className="glass-effect card-christmas p-3 lg:p-4 shadow-lg slide-in hover:shadow-xl transition-shadow duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex justify-between items-center mb-3 pb-2 border-b-2" style={{ borderColor: 'var(--christmas-green)' }}>
                <h3 className="text-lg lg:text-xl font-bold" style={{ color: 'var(--christmas-red)' }}>
                  {index === 0 ? 'Your Order' : `Guest ${index + 1}`}
                </h3>
                {guests.length > 1 && index > 0 && (
                  <button
                    onClick={() => removeGuest(index)}
                    className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-bold transition-all hover:scale-105 text-sm border-2 border-red-300 hover:border-red-400"
                  >
                    <X className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>

              {/* Guest Name */}
              <div className="mb-6">
                <label className="label-modern text-sm">
                  {index === 0 ? 'Your Name *' : 'Guest Name *'}
                </label>
                <input
                  type="text"
                  value={guest.guest_name}
                  onChange={(e) => updateGuestField(index, 'guest_name', e.target.value)}
                  className="input-modern"
                  placeholder={index === 0 ? "Enter your name" : "Guest name"}
                />
              </div>

              {/* Divider */}
              <div className="border-t-2 border-gray-200 mb-4"></div>

              {/* Starter Selection */}
              <div className="mt-5 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Salad className="w-4 h-4 text-green-700" />
                  <label className="text-base lg:text-lg font-bold" style={{ color: 'var(--christmas-green)' }}>
                    Starter *
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {menuItems.starter.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => updateGuestField(index, 'orders', { starter: item.id })}
                      className={`menu-card ${guest.orders.starter === item.id ? 'menu-card-selected' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm lg:text-base">{item.name}</span>
                            {guest.orders.starter === item.id && (
                              <div className="ml-auto">
                                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs lg:text-sm text-gray-600 italic leading-snug">{item.description}</p>
                          )}
                          {item.surcharge > 0 && (
                            <span className="inline-flex items-center gap-1 badge-surcharge text-xs mt-1">
                              <Coins className="w-3 h-3" />
                              +{formatCurrency(item.surcharge)} surcharge
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Course Selection */}
              <div className="mt-5 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <UtensilsCrossed className="w-4 h-4 text-red-700" />
                  <label className="text-base lg:text-lg font-bold" style={{ color: 'var(--christmas-green)' }}>
                    Main Course *
                  </label>
                </div>

                {/* Regular Main Options */}
                <div className="grid grid-cols-1 gap-1 mb-3">
                  {menuItems.main.filter(item => item.subcategory === 'regular' || !item.subcategory).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => updateGuestField(index, 'orders', { main: item.id })}
                      className={`menu-card ${guest.orders.main === item.id ? 'menu-card-selected' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm lg:text-base">{item.name}</span>
                            {guest.orders.main === item.id && (
                              <div className="ml-auto">
                                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs lg:text-sm text-gray-600 italic leading-snug">{item.description}</p>
                          )}
                          {item.surcharge > 0 && (
                            <span className="inline-flex items-center gap-1 badge-surcharge text-xs mt-1">
                              <Coins className="w-3 h-3" />
                              +{formatCurrency(item.surcharge)} surcharge
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Steak Options */}
                <div className="border-t-2 border-gray-200 pt-3 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm font-bold" style={{ color: 'var(--christmas-green)' }}>
                      OR CHOOSE A PREMIUM STEAK:
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {menuItems.main.filter(item => item.subcategory === 'steak').map((item) => (
                      <div
                        key={item.id}
                        onClick={() => updateGuestField(index, 'orders', { main: item.id })}
                        className={`menu-card ${guest.orders.main === item.id ? 'menu-card-selected' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-base">{item.name}</span>
                              {guest.orders.main === item.id && (
                                <div className="ml-auto">
                                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            )}
                            {item.surcharge > 0 && (
                              <span className="inline-flex items-center gap-1 badge-surcharge text-xs">
                                <Coins className="w-3 h-3" />
                                +{formatCurrency(item.surcharge)} surcharge
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dessert Selection */}
              <div className="mt-5 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Cake className="w-4 h-4 text-yellow-700" />
                  <label className="text-base lg:text-lg font-bold" style={{ color: 'var(--christmas-green)' }}>
                    Dessert *
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {menuItems.dessert.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => updateGuestField(index, 'orders', { dessert: item.id })}
                      className={`menu-card ${guest.orders.dessert === item.id ? 'menu-card-selected' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm lg:text-base">{item.name}</span>
                            {guest.orders.dessert === item.id && (
                              <div className="ml-auto">
                                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs lg:text-sm text-gray-600 italic leading-snug">{item.description}</p>
                          )}
                          {item.surcharge > 0 && (
                            <span className="inline-flex items-center gap-1 badge-surcharge text-xs mt-1">
                              <Coins className="w-3 h-3" />
                              +{formatCurrency(item.surcharge)} surcharge
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Guest Button */}
        <div className="max-w-2xl mx-auto mb-6">
          <button
            onClick={addGuest}
            className="w-full py-4 border-2 border-dashed border-green-600 rounded-lg font-bold text-lg text-green-700 hover:bg-green-50 hover:border-solid hover:shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <UserPlus className="w-6 h-6" />
            Add Another Guest
          </button>
        </div>

        {/* Total and Submit */}
        <div className="max-w-2xl mx-auto">
          <div className="glass-effect card-christmas p-4 mb-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2" style={{ borderColor: 'var(--christmas-green)' }}>
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-100 to-green-200">
                <Coins className="w-6 h-6 text-green-700" />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--christmas-red)' }}>
                Payment Summary
              </h2>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-xl p-6 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium text-base">Deposit (£{depositPerPerson} × {guests.length} guest{guests.length !== 1 ? 's' : ''}):</span>
                <span className="font-bold text-lg">{formatCurrency(guests.length * depositPerPerson)}</span>
              </div>
              {(() => {
                let totalSurcharges = 0;
                guests.forEach(guest => {
                  if (guest.orders.starter && menuItems) {
                    const item = menuItems.starter.find(i => i.id === guest.orders.starter);
                    if (item) totalSurcharges += Number(item.surcharge) || 0;
                  }
                  if (guest.orders.main && menuItems) {
                    const item = menuItems.main.find(i => i.id === guest.orders.main);
                    if (item) totalSurcharges += Number(item.surcharge) || 0;
                  }
                  if (guest.orders.dessert && menuItems) {
                    const item = menuItems.dessert.find(i => i.id === guest.orders.dessert);
                    if (item) totalSurcharges += Number(item.surcharge) || 0;
                  }
                });
                return totalSurcharges > 0 ? (
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-base">Surcharges:</span>
                    <span className="font-bold text-lg text-red-600">+{formatCurrency(totalSurcharges)}</span>
                  </div>
                ) : null;
              })()}
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-base">10% tip:</span>
                <span className="font-bold text-lg">{formatCurrency((guests.length * depositPerPerson + (() => {
                  let totalSurcharges = 0;
                  guests.forEach(guest => {
                    if (guest.orders.starter && menuItems) {
                      const item = menuItems.starter.find(i => i.id === guest.orders.starter);
                      if (item) totalSurcharges += Number(item.surcharge) || 0;
                    }
                    if (guest.orders.main && menuItems) {
                      const item = menuItems.main.find(i => i.id === guest.orders.main);
                      if (item) totalSurcharges += Number(item.surcharge) || 0;
                    }
                    if (guest.orders.dessert && menuItems) {
                      const item = menuItems.dessert.find(i => i.id === guest.orders.dessert);
                      if (item) totalSurcharges += Number(item.surcharge) || 0;
                    }
                  });
                  return totalSurcharges;
                })()) * 0.10)}</span>
              </div>
              <div className="border-t-2 border-green-700 my-4"></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-2xl">Total to Pay:</span>
                <span className="font-bold text-3xl" style={{ color: 'var(--christmas-red)' }}>
                  {formatCurrency(totalDeposit)}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-3 text-center">
                Full amount due on the night
              </p>
            </div>
          </div>

          <button
            onClick={validateAndSubmit}
            className="btn-christmas w-full py-6 rounded-lg font-bold text-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <TreePine className="w-7 h-7" />
            Review Order
            <ArrowRight className="w-7 h-7" />
          </button>

          <p className="text-center text-base text-gray-600 mt-4">
            You'll review your order before payment
          </p>
        </div>
      </div>
    </div>
  );
}
