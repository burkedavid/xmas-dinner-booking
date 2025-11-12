'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Snowfall from '@/components/Snowfall';
import { formatCurrency } from '@/lib/utils';
import type { MenuItem, BookingFormData } from '@/lib/types';

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

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ color: 'var(--christmas-red)' }}>
            🎄 Book Your Christmas Dinner
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your festive feast for yourself and your guests
          </p>
        </div>

        {/* Guests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {guests.map((guest, index) => (
            <div key={index} className="card-christmas p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6 pb-3 border-b-2" style={{ borderColor: 'var(--christmas-green)' }}>
                <h3 className="text-2xl font-bold" style={{ color: 'var(--christmas-red)' }}>
                  {index === 0 ? '🎅 Your Order' : `👤 Guest ${index + 1}`}
                </h3>
                {guests.length > 1 && index > 0 && (
                  <button
                    onClick={() => removeGuest(index)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-bold transition text-sm"
                  >
                    ✕ Remove
                  </button>
                )}
              </div>

              {/* Guest Name */}
              <div className="mb-6">
                <label className="block text-base font-bold mb-2" style={{ color: 'var(--christmas-green)' }}>
                  {index === 0 ? 'Your Name *' : 'Guest Name *'}
                </label>
                <input
                  type="text"
                  value={guest.guest_name}
                  onChange={(e) => updateGuestField(index, 'guest_name', e.target.value)}
                  className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none transition-all"
                  placeholder={index === 0 ? "Enter your name" : "Guest name"}
                />
              </div>

              {/* Starter Selection */}
              <div className="mb-6">
                <label className="block text-lg font-bold mb-3" style={{ color: 'var(--christmas-green)' }}>
                  🥗 Starter *
                </label>
                <div className="space-y-2">
                  {menuItems.starter.map((item) => (
                    <label
                      key={item.id}
                      className={`block p-3 border-2 rounded-lg cursor-pointer transition ${
                        guest.orders.starter === item.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name={`starter-${index}`}
                          checked={guest.orders.starter === item.id}
                          onChange={() => updateGuestField(index, 'orders', { starter: item.id })}
                          className="mt-1 mr-3 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-base">{item.name}</span>
                            {item.surcharge > 0 && (
                              <span className="ml-2 text-red-600 font-bold text-sm">+{formatCurrency(item.surcharge)}</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Main Course Selection */}
              <div className="mb-6">
                <label className="block text-lg font-bold mb-3" style={{ color: 'var(--christmas-green)' }}>
                  🍗 Main Course *
                </label>

                {/* Regular Main Options */}
                <div className="space-y-2 mb-4">
                  {menuItems.main.filter(item => item.subcategory === 'regular' || !item.subcategory).map((item) => (
                    <label
                      key={item.id}
                      className={`block p-3 border-2 rounded-lg cursor-pointer transition ${
                        guest.orders.main === item.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name={`main-${index}`}
                          checked={guest.orders.main === item.id}
                          onChange={() => updateGuestField(index, 'orders', { main: item.id })}
                          className="mt-1 mr-3 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-base">{item.name}</span>
                            {item.surcharge > 0 && (
                              <span className="ml-2 text-red-600 font-bold text-sm">+{formatCurrency(item.surcharge)}</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Steak Options */}
                <div className="border-t-2 border-gray-300 pt-3 mt-3">
                  <p className="text-sm font-bold mb-3" style={{ color: 'var(--christmas-green)' }}>
                    OR CHOOSE A STEAK:
                  </p>
                  <div className="space-y-2">
                    {menuItems.main.filter(item => item.subcategory === 'steak').map((item) => (
                      <label
                        key={item.id}
                        className={`block p-3 border-2 rounded-lg cursor-pointer transition ${
                          guest.orders.main === item.id
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-red-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start">
                          <input
                            type="radio"
                            name={`main-${index}`}
                            checked={guest.orders.main === item.id}
                            onChange={() => updateGuestField(index, 'orders', { main: item.id })}
                            className="mt-1 mr-3 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-base">{item.name}</span>
                              {item.surcharge > 0 && (
                                <span className="ml-2 text-red-600 font-bold text-sm">+{formatCurrency(item.surcharge)}</span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dessert Selection */}
              <div className="mb-6">
                <label className="block text-lg font-bold mb-3" style={{ color: 'var(--christmas-green)' }}>
                  🍰 Dessert *
                </label>
                <div className="space-y-2">
                  {menuItems.dessert.map((item) => (
                    <label
                      key={item.id}
                      className={`block p-3 border-2 rounded-lg cursor-pointer transition ${
                        guest.orders.dessert === item.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-red-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name={`dessert-${index}`}
                          checked={guest.orders.dessert === item.id}
                          onChange={() => updateGuestField(index, 'orders', { dessert: item.id })}
                          className="mt-1 mr-3 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-base">{item.name}</span>
                            {item.surcharge > 0 && (
                              <span className="ml-2 text-red-600 font-bold text-sm">+{formatCurrency(item.surcharge)}</span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Guest Button */}
        <div className="max-w-2xl mx-auto mb-8">
          <button
            onClick={addGuest}
            className="w-full py-4 border-2 border-dashed border-green-600 rounded-lg font-bold text-lg text-green-700 hover:bg-green-50 hover:border-solid hover:shadow-md transition-all"
          >
            ➕ Add Another Guest
          </button>
        </div>

        {/* Total and Submit */}
        <div className="max-w-2xl mx-auto">
          <div className="card-christmas p-8 mb-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 pb-3 border-b-2" style={{ color: 'var(--christmas-red)', borderColor: 'var(--christmas-green)' }}>
              💰 Payment Summary
            </h2>
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
                3 courses for £37 per person (full amount due on the night)
              </p>
            </div>
          </div>

          <button
            onClick={validateAndSubmit}
            className="btn-christmas w-full py-5 rounded-lg font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            🎄 Review Order →
          </button>

          <p className="text-center text-base text-gray-600 mt-4">
            You'll review your order before payment
          </p>
        </div>
      </div>
    </div>
  );
}
