'use client';

import React, { useState } from 'react';
import { Share2, Check, Link as LinkIcon } from 'lucide-react';

interface ShareBarProps {
  title: string;
  slug: string;
}

export function ShareBar({ title, slug }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/stories/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleTwitterShare = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/stories/${slug}`;
    const text = `"${title}" in CinderPress Review:`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="py-4 my-8 border-y border-cinder-border flex items-center justify-between text-xs text-cinder-muted">
      <div className="flex items-center gap-2">
        <Share2 className="w-4 h-4 text-cinder-orange" />
        <span className="font-mono uppercase tracking-wider">Share Story</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cinder-border bg-cinder-paper-soft hover:bg-cinder-bone text-cinder-ink transition-colors font-medium"
          aria-label="Copy article link"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-cinder-success" />
              <span className="text-cinder-success">Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-3.5 h-3.5 text-cinder-muted" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        <button
          onClick={handleTwitterShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cinder-border bg-cinder-paper-soft hover:bg-cinder-bone text-cinder-ink transition-colors font-medium"
          aria-label="Share on X / Twitter"
        >
          <svg className="w-3.5 h-3.5 fill-current text-cinder-muted" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Post to X</span>
        </button>
      </div>
    </div>
  );
}
