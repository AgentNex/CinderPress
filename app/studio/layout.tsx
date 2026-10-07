'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { StudioSidebar } from '@/components/navigation/StudioSidebar';
import { CinderMark } from '@/components/brand/CinderMark';
import { Loader2, ShieldAlert, Lock, ArrowRight } from 'lucide-react';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // Unauthenticated access protection
      // router.push('/auth/sign-in');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cinder-paper flex flex-col items-center justify-center space-y-4">
        <CinderMark size={48} />
        <div className="flex items-center gap-2 text-xs font-mono text-cinder-muted">
          <Loader2 className="w-4 h-4 animate-spin text-cinder-orange" />
          <span>Validating InsForge session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cinder-paper flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-cinder-paper-soft border border-cinder-border rounded-2xl p-8 space-y-6 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-cinder-ink text-cinder-orange mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-cinder-ink">
              Authentication Required
            </h2>
            <p className="text-xs text-cinder-muted leading-relaxed">
              CinderPress Studio is a protected editorial workspace. An active InsForge session is required to write, edit, and publish stories.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/auth/sign-in"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cinder-ink text-white text-xs font-semibold uppercase tracking-wider hover:bg-cinder-charcoal transition-colors shadow-sm"
            >
              <span>Sign In to Continue</span>
              <ArrowRight className="w-4 h-4 text-cinder-orange" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-cinder-paper text-cinder-ink">
      <StudioSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {children}
      </div>
    </div>
  );
}
