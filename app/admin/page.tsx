'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Snowfall from '@/components/Snowfall';
import { Lock, TreePine, Home, AlertCircle, LogIn } from 'lucide-react';

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
        <div className="glass-effect card-christmas p-8 shadow-xl fade-in">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-red-100 to-red-200">
                <Lock className="w-12 h-12 text-red-700" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 drop-shadow-md">
              Admin Login
            </h1>
            <p className="text-gray-600">
              Enter your admin password to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="label-modern">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-christmas w-full py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                'Logging in...'
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-800 inline-flex items-center gap-1">
              <Home className="w-4 h-4" />
              Back to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
