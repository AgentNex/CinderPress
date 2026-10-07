'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface StudioHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function StudioHeader({ title, description, action }: StudioHeaderProps) {
  return (
    <header className="border-b border-cinder-border bg-cinder-paper px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-cinder-muted uppercase tracking-wider mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-cinder-orange" />
          <span>CinderPress Studio</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-cinder-ink">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-cinder-muted mt-0.5">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {action ? (
          action
        ) : (
          <Link
            href="/studio/posts/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cinder-orange text-white text-xs font-semibold uppercase tracking-wider hover:bg-cinder-orange-deep transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Story</span>
          </Link>
        )}
      </div>
    </header>
  );
}
