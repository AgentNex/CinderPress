'use client';

import React, { useState, useEffect } from 'react';
import { StudioHeader } from '@/components/navigation/StudioHeader';
import { Tag } from '@/lib/db';
import { Tag as TagIcon, Plus, AlertCircle, Loader2 } from 'lucide-react';

export default function StudioTagsPage() {
  const [tags, setTags] = useState<(Tag & { post_count?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTags = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tags');
      if (res.ok) {
        const d = await res.json();
        setTags(d.tags || []);
      }
    } catch (err) {
      console.warn('Error loading tags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create tag');
      }

      setName('');
      loadTags();
    } catch (err: any) {
      setError(err.message || 'Error creating tag');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-cinder-paper">
      <StudioHeader
        title="Tags & Keywords"
        description="Index stories across cross-cutting topics and technologies."
      />

      <div className="p-8 max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create Tag Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-cinder-border bg-cinder-paper-soft space-y-4">
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-cinder-orange" />
            <h3 className="text-base font-bold text-cinder-ink">Add New Tag</h3>
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-50 border border-red-200 text-cinder-error rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-cinder-muted mb-1">
                Tag Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. edge-runtime"
                className="w-full px-3 py-2 text-sm rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cinder-orange text-white text-xs font-semibold uppercase tracking-wider hover:bg-cinder-orange-deep transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Create Tag</span>
            </button>
          </form>
        </div>

        {/* Tags Listing */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-mono uppercase tracking-wider text-cinder-muted font-semibold">
            All Tags ({tags.length})
          </h3>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-cinder-muted">
              Loading tags from D1...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 p-6 rounded-2xl border border-cinder-border bg-cinder-paper-soft">
              {tags.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cinder-border bg-white text-xs font-mono"
                >
                  <span className="font-semibold text-cinder-ink">#{t.name}</span>
                  <span className="text-[10px] text-cinder-muted font-normal">({t.post_count || 0})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
