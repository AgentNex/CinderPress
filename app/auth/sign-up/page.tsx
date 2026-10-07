'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { insforge } from '@/lib/auth/client';
import { CinderLogo } from '@/components/brand/CinderMark';
import { ArrowRight, AlertCircle, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verification code state
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || loading) return;

    try {
      setLoading(true);
      setError(null);
      const res = await signUp(email, password, name);
      if (res.requireVerification) {
        setNeedsVerification(true);
      } else if (res.success) {
        router.push('/studio');
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verifying) return;

    try {
      setVerifying(true);
      setError(null);
      const res = await insforge.auth.verifyEmail({
        email,
        otp: verificationCode.trim(),
      });

      if (res.error) {
        setError(res.error.message || 'Verification code invalid');
      } else {
        router.push('/studio');
      }
    } catch (err: any) {
      setError(err.message || 'Verification error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-cinder-paper flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <Link href="/" className="inline-block">
          <CinderLogo markSize={36} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-cinder-ink">
          {needsVerification ? 'Verify Email Address' : 'Join as Contributor'}
        </h1>
        <p className="text-xs text-cinder-muted">
          Author and publish stories in CinderPress Review
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-cinder-paper-soft py-8 px-6 shadow-sm border border-cinder-border rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-cinder-error rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {needsVerification ? (
            /* Email Code Verification View */
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                A 6-digit confirmation code was sent to <strong>{email}</strong> by the InsForge identity service. Please enter it below.
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-cinder-muted mb-1 font-semibold">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-widest font-mono text-lg px-3 py-2 rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange focus:ring-1 focus:ring-cinder-orange"
                />
              </div>

              <button
                type="submit"
                disabled={verifying || !verificationCode}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cinder-orange text-white text-xs font-semibold uppercase tracking-wider hover:bg-cinder-orange-deep transition-colors disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Enter Studio</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Sign Up View */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-cinder-muted mb-1 font-semibold">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Vance"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange focus:ring-1 focus:ring-cinder-orange"
                />
              </div>

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
                  placeholder="name@cinderpress.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange focus:ring-1 focus:ring-cinder-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-cinder-muted mb-1 font-semibold">
                  Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange focus:ring-1 focus:ring-cinder-orange"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !name || !email || !password}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cinder-orange text-white text-xs font-semibold uppercase tracking-wider hover:bg-cinder-orange-deep transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Register Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <p className="text-xs text-cinder-muted">
              Already have an account?{' '}
              <Link href="/auth/sign-in" className="text-cinder-orange font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
