'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Snowfall from '@/components/Snowfall';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const authToken = localStorage.getItem('admin_token');
    if (authToken) {
      router.push('/admin/bookings');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin_token', password);
        router.push('/admin/bookings');
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <Snowfall />

      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="card-christmas p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--christmas-red)' }}>
              🎄 Admin Login
            </h1>
            <p className="text-gray-600">
              Enter your admin password to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-christmas w-full py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-800">
              ← Back to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
