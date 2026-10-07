'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshSession } = useAuth();

  useEffect(() => {
    async function handleCallback() {
      try {
        await refreshSession();
        router.push('/studio');
      } catch (err) {
        console.error('Callback error:', err);
        router.push('/auth/sign-in');
      }
    }
    handleCallback();
  }, [refreshSession, router]);

  return (
    <div className="min-h-screen bg-cinder-paper flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-cinder-orange" />
      <p className="text-xs font-mono text-cinder-muted">
        Finalizing authentication with InsForge...
      </p>
    </div>
  );
}
