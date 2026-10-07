'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CinderLogo } from '@/components/brand/CinderMark';
import { useAuth } from '@/lib/auth/context';
import { Search, PenLine, Menu, X, ArrowUpRight } from 'lucide-react';

export function SiteHeader() {
  const pathname = usePathname();
  const { user, author, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Stories', href: '/stories' },
    { label: 'Architecture', href: '/category/architecture' },
    { label: 'Edge Computing', href: '/category/edge-computing' },
    { label: 'Typography & UX', href: '/category/typography-ux' },
    { label: 'Search', href: '/search' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cinder-border bg-cinder-paper/95 backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Lockup */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center group">
            <CinderLogo markSize={28} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 ${
                    active
                      ? 'text-cinder-orange font-semibold border-b-2 border-cinder-orange'
                      : 'text-cinder-muted hover:text-cinder-ink'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            aria-label="Search articles"
            className="p-2 text-cinder-muted hover:text-cinder-ink hover:bg-cinder-bone rounded-lg transition-colors"
          >
            <Search className="w-4 h-4" />
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/studio"
                className="hidden sm:inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold px-3 py-1.5 rounded-lg bg-cinder-paper-soft border border-cinder-border text-cinder-ink hover:bg-cinder-bone hover:border-cinder-muted transition-colors"
              >
                <PenLine className="w-3.5 h-3.5 text-cinder-orange" />
                <span>Studio</span>
              </Link>
              <div className="relative group">
                <Link
                  href="/studio"
                  className="w-8 h-8 rounded-full bg-cinder-ink text-white text-xs font-mono font-medium flex items-center justify-center border border-cinder-border"
                >
                  {author?.display_name ? author.display_name[0].toUpperCase() : user.email[0].toUpperCase()}
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/sign-in"
                className="text-xs font-medium text-cinder-muted hover:text-cinder-ink px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="text-xs font-medium bg-cinder-ink text-white hover:bg-cinder-charcoal px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Write</span>
                <ArrowUpRight className="w-3 h-3 text-cinder-orange" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-cinder-muted hover:text-cinder-ink rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-cinder-border bg-cinder-paper px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium py-2 text-cinder-ink hover:text-cinder-orange border-b border-cinder-border/40"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <Link
                href="/studio"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-cinder-ink text-white text-sm font-medium"
              >
                <PenLine className="w-4 h-4 text-cinder-orange" />
                <span>Open CMS Studio</span>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium border border-cinder-border rounded-lg text-cinder-ink"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium bg-cinder-orange text-white rounded-lg"
                >
                  Join / Write
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
