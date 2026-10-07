'use client';

// ==============================================================================
// CINDERPRESS CLIENT AUTHENTICATION CONTEXT (INSFORGE AUTH)
// ==============================================================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { insforge } from './client';
import { Author } from '@/lib/db/types';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  author: Author | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; requireVerification?: boolean; error?: string }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  author: null,
  loading: true,
  error: null,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signInWithOAuth: async () => {},
  signOut: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthorProfile = useCallback(async (authUser: AuthUser) => {
    try {
      const res = await fetch(`/api/auth/me?userId=${encodeURIComponent(authUser.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.author) {
          setAuthor(data.author);
        }
      }
    } catch (err) {
      console.warn('[CinderPress Auth] Failed to load author profile:', err);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await insforge.auth.getCurrentUser();
      if (res.data?.user) {
        const u: AuthUser = {
          id: res.data.user.id,
          email: res.data.user.email,
          name: res.data.user.profile?.name,
          avatar_url: res.data.user.profile?.avatar_url,
          emailVerified: res.data.user.emailVerified,
        };
        setUser(u);
        await fetchAuthorProfile(u);
      } else {
        setUser(null);
        setAuthor(null);
      }
    } catch (err: any) {
      console.error('[CinderPress Auth] Session check error:', err);
      setError(err?.message || 'Failed to check session');
      setUser(null);
      setAuthor(null);
    } finally {
      setLoading(false);
    }
  }, [fetchAuthorProfile]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const res = await insforge.auth.signInWithPassword({ email, password });
      if (res.error) {
        const msg = res.error.message || 'Invalid email or password';
        setError(msg);
        return { success: false, error: msg };
      }
      if (res.data?.user) {
        const u: AuthUser = {
          id: res.data.user.id,
          email: res.data.user.email,
          name: res.data.user.profile?.name,
          avatar_url: res.data.user.profile?.avatar_url,
          emailVerified: res.data.user.emailVerified,
        };
        setUser(u);
        await fetchAuthorProfile(u);
        return { success: true };
      }
      return { success: false, error: 'Sign in failed' };
    } catch (err: any) {
      const msg = err?.message || 'An unexpected error occurred during sign in';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setError(null);
      const res = await insforge.auth.signUp({
        email,
        password,
        name,
        redirectTo: `${window.location.origin}/auth/sign-in`,
      });
      if (res.error) {
        const msg = res.error.message || 'Registration failed';
        setError(msg);
        return { success: false, error: msg };
      }
      if (res.data?.requireEmailVerification) {
        return { success: true, requireVerification: true };
      }
      if (res.data?.user) {
        const u: AuthUser = {
          id: res.data.user.id,
          email: res.data.user.email,
          name: res.data.user.profile?.name,
          avatar_url: res.data.user.profile?.avatar_url,
          emailVerified: res.data.user.emailVerified,
        };
        setUser(u);
        await fetchAuthorProfile(u);
        return { success: true };
      }
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    try {
      setError(null);
      await insforge.auth.signInWithOAuth(provider, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
    } catch (err: any) {
      setError(err?.message || 'OAuth error');
    }
  };

  const signOut = async () => {
    try {
      await insforge.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setAuthor(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        author,
        loading,
        error,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
