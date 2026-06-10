'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Registration failed');
          return;
        }

        router.push('/login');
      } catch {
        setError('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [name, email, password, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Leaf className="w-10 h-10 text-emerald-500 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-3xl font-display font-black text-slate-900">
            Create Account
          </h1>
          <p className="text-slate-500 mt-2">
            Start tracking your carbon footprint today
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel rounded-2xl p-8 space-y-6"
          noValidate
        >
          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-bold text-slate-700 block">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full neumorph-inset px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800"
              placeholder="Your name"
              autoComplete="name"
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-bold text-slate-700 block">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full neumorph-inset px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-bold text-slate-700 block">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full neumorph-inset px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800"
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-600 font-bold hover:text-emerald-700">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
