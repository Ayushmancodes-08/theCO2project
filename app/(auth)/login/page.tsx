'use client';

import { useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
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
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Invalid email or password');
        } else {
          router.push('/dashboard');
        }
      } catch {
        setError('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [email, password, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Leaf className="w-10 h-10 text-emerald-500 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-3xl font-display font-black text-slate-900">
            Welcome Back
          </h1>
          <p className="text-slate-500 mt-2">
            Log in to continue your carbon reduction journey
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
              placeholder="Enter your password"
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-emerald-600 font-bold hover:text-emerald-700">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
