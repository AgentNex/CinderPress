'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PostWithRelations } from '@/lib/db';
import { SiteHeader } from '@/components/navigation/SiteHeader';
import { SiteFooter } from '@/components/navigation/SiteFooter';
import { StoryCard } from '@/components/editorial/StoryCard';
import { Search as SearchIcon, Loader2, Sparkles, X } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setSearched(true);
      }
    } catch (err) {
      console.warn('Search query error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      executeSearch(val);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cinder-paper">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Search Hero Box */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-cinder-orange font-semibold">
            Full-Text Index • FTS5 Powered
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-cinder-ink">
            Search CinderPress Review
          </h1>
          <p className="text-sm text-cinder-muted max-w-lg mx-auto leading-relaxed">
            Instant lexical query across headlines, subtitles, editorial excerpts, and full essay bodies.
          </p>

          {/* Search Input Bar */}
          <div className="pt-4 relative max-w-2xl mx-auto">
            <SearchIcon className="w-5 h-5 text-cinder-muted absolute left-4 top-4" />
            <input
              type="text"
              autoFocus
              placeholder="Search by topic, architecture, author, or keyword..."
              value={query}
              onChange={handleInputChange}
              className="w-full pl-12 pr-12 py-3.5 text-base rounded-xl border border-cinder-border bg-cinder-paper-soft text-cinder-ink shadow-sm outline-none focus:border-cinder-orange focus:ring-1 focus:ring-cinder-orange font-sans placeholder:text-cinder-muted/60"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setSearched(false);
                }}
                className="absolute right-4 top-4 text-cinder-muted hover:text-cinder-ink"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results Area */}
        <div className="space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-cinder-orange mx-auto" />
              <p className="text-xs font-mono text-cinder-muted">Executing FTS5 full-text scan...</p>
            </div>
          ) : searched && results.length === 0 ? (
            <div className="py-20 text-center max-w-md mx-auto space-y-2 bg-cinder-paper-soft rounded-2xl border border-cinder-border p-8">
              <h3 className="text-base font-bold text-cinder-ink">
                No stories matched that search.
              </h3>
              <p className="text-xs text-cinder-muted">
                Try searching for broader keywords like &quot;architecture&quot;, &quot;edge&quot;, &quot;typography&quot;, or &quot;databases&quot;.
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-cinder-border pb-3 text-xs font-mono text-cinder-muted">
                <span>Found {results.length} matching {results.length === 1 ? 'dispatch' : 'dispatches'}</span>
                <span>Sorted by publication recency</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.map((post) => (
                  <StoryCard key={post.id} post={post} variant="standard" />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
