'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { CinderLogo } from '@/components/brand/CinderMark';
import { ArrowRight, AlertCircle, Loader2, Mail } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const { signIn, signInWithOAuth, error: authContextError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;

    try {
      setLoading(true);
      setError(null);
      const res = await signIn(email, password);
      if (res.success) {
        router.push('/studio');
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cinder-paper flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <Link href="/" className="inline-block">
          <CinderLogo markSize={36} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-cinder-ink">
          Sign In to Studio
        </h1>
        <p className="text-xs text-cinder-muted">
          Authenticated with InsForge Identity Layer
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-cinder-paper-soft py-8 px-6 shadow-sm border border-cinder-border rounded-2xl sm:px-10 space-y-6">
          {(error || authContextError) && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-cinder-error rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error || authContextError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-cinder-muted mb-1 font-semibold">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@cinderpress.com"
                className="w-full px-3 py-2 text-sm rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange focus:ring-1 focus:ring-cinder-orange"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-cinder-muted mb-1 font-semibold">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange focus:ring-1 focus:ring-cinder-orange"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cinder-ink text-white text-xs font-semibold uppercase tracking-wider hover:bg-cinder-charcoal transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cinder-orange" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Enter Studio</span>
                  <ArrowRight className="w-4 h-4 text-cinder-orange" />
                </>
              )}
            </button>
          </form>

          {/* Social OAuth Providers */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cinder-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-mono">
              <span className="bg-cinder-paper-soft px-2 text-cinder-muted">Or OAuth</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => signInWithOAuth('github')}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-cinder-border rounded-lg bg-white text-xs font-medium text-cinder-ink hover:bg-cinder-bone transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </button>

            <button
              type="button"
              onClick={() => signInWithOAuth('google')}
              className="flex items-center justify-center gap-2 py-2 px-3 border border-cinder-border rounded-lg bg-white text-xs font-medium text-cinder-ink hover:bg-cinder-bone transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Google</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-cinder-muted">
              Don&apos;t have an author account?{' '}
              <Link href="/auth/sign-up" className="text-cinder-orange font-semibold hover:underline">
                Register as Contributor
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
