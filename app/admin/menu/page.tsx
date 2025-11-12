'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Snowfall from '@/components/Snowfall';
import { formatCurrency } from '@/lib/utils';
import type { MenuItem } from '@/lib/types';
import { Menu as MenuIcon, ClipboardList, LogOut, Plus, Save, X, Edit2, Trash2, TreePine, Salad, UtensilsCrossed, Cake } from 'lucide-react';

export default function AdminMenuPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'starter' as 'starter' | 'main' | 'dessert',
    description: '',
    price: '',
    available: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }
    setAuthToken(token);
  }, [router]);

  useEffect(() => {
    if (!authToken) return;
    loadMenuItems();
  }, [authToken]);

  const loadMenuItems = async () => {
    if (!authToken) return;

    try {
      const response = await fetch('/api/admin/menu', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      } else if (response.status === 401) {
        localStorage.removeItem('admin_token');
        router.push('/admin');
      }
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setAdding(true);
    setEditing(null);
    setFormData({
      name: '',
      type: 'starter',
      description: '',
      price: '',
      available: true,
    });
  };

  const handleEdit = (item: MenuItem) => {
    setEditing(item.id);
    setAdding(false);
    setFormData({
      name: item.name,
      type: item.type,
      description: item.description || '',
      price: item.price.toString(),
      available: item.available,
    });
  };

  const handleCancel = () => {
    setEditing(null);
    setAdding(false);
    setFormData({
      name: '',
      type: 'starter',
      description: '',
      price: '',
      available: true,
    });
  };

  const handleSave = async () => {
    if (!authToken) return;

    if (!formData.name || !formData.price) {
      alert('Name and price are required');
      return;
    }

    try {
      const url = editing ? `/api/admin/menu/${editing}` : '/api/admin/menu';
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (response.ok) {
        await loadMenuItems();
        handleCancel();
      } else {
        alert('Failed to save menu item');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  const handleDelete = async (id: number) => {
    if (!authToken) return;
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await fetch(`/api/admin/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        await loadMenuItems();
      } else {
        alert('Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const groupedItems = {
    starter: menuItems.filter(i => i.type === 'starter'),
    main: menuItems.filter(i => i.type === 'main'),
    dessert: menuItems.filter(i => i.type === 'dessert'),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-2xl">
          <TreePine className="w-8 h-8 text-green-600 animate-pulse" />
          Loading menu...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Snowfall />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 fade-in">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MenuIcon className="w-10 h-10 text-green-600" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
                  Menu Management
                </h1>
              </div>
              <p className="text-gray-600 mt-1">Manage menu items and pricing</p>
            </div>
            <div className="flex gap-4">
              <a
                href="/admin/bookings"
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition hover:scale-105 inline-flex items-center gap-2"
              >
                <ClipboardList className="w-5 h-5" />
                View Bookings
              </a>
              <button
                onClick={() => {
                  localStorage.removeItem('admin_token');
                  router.push('/admin');
                }}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-400 transition hover:scale-105 inline-flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Add New Button */}
          {!adding && !editing && (
            <div className="mb-6">
              <button
                onClick={handleAdd}
                className="btn-christmas px-8 py-3 rounded-lg font-bold inline-flex items-center gap-2 hover:scale-105 transition"
              >
                <Plus className="w-5 h-5" />
                Add New Menu Item
              </button>
            </div>
          )}

          {/* Add/Edit Form */}
          {(adding || editing) && (
            <div className="glass-effect card-christmas p-6 mb-6 slide-in">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--christmas-green)' }}>
                {editing ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-modern">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="label-modern">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="input-modern"
                  >
                    <option value="starter">Starter</option>
                    <option value="main">Main</option>
                    <option value="dessert">Dessert</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label-modern">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-modern"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="label-modern">Price (£) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="label-modern">Available</label>
                  <select
                    value={formData.available.toString()}
                    onChange={(e) => setFormData({ ...formData, available: e.target.value === 'true' })}
                    className="input-modern"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400 transition hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-christmas flex-1 py-3 rounded-lg font-bold hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Menu Items by Category */}
          {(['starter', 'main', 'dessert'] as const).map((type, idx) => (
            <div key={type} className="glass-effect card-christmas p-6 mb-6 slide-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${
                  type === 'starter' ? 'from-green-100 to-green-200' :
                  type === 'main' ? 'from-red-100 to-red-200' :
                  'from-yellow-100 to-yellow-200'
                }`}>
                  {type === 'starter' && <Salad className="w-6 h-6 text-green-700" />}
                  {type === 'main' && <UtensilsCrossed className="w-6 h-6 text-red-700" />}
                  {type === 'dessert' && <Cake className="w-6 h-6 text-yellow-700" />}
                </div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--christmas-green)' }}>
                  {type === 'starter' && 'Starters'}
                  {type === 'main' && 'Main Courses'}
                  {type === 'dessert' && 'Desserts'}
                </h2>
              </div>

              {groupedItems[type].length === 0 ? (
                <p className="text-gray-600">No items in this category</p>
              ) : (
                <div className="space-y-3">
                  {groupedItems[type].map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-4 border-2 border-gray-300 rounded-lg hover:shadow-md transition">
                      <div className="flex-1">
                        <h4 className="font-bold">
                          {item.name}
                          {!item.available && (
                            <span className="ml-2 badge-unavailable">
                              UNAVAILABLE
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-lg font-bold mt-1" style={{ color: 'var(--christmas-green)' }}>
                          {formatCurrency(Number(item.price))}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition hover:scale-105 inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition hover:scale-105 inline-flex items-center gap-1 border-2 border-red-800 shadow-md hover:shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
