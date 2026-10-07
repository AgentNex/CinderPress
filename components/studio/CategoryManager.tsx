'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '@/lib/db';
import { FolderTree, Plus, Check, AlertCircle, Loader2 } from 'lucide-react';

export function CategoryManager() {
  const [categories, setCategories] = useState<(Category & { post_count?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      if (res.ok) {
        const d = await res.json();
        setCategories(d.categories || []);
      }
    } catch (err) {
      console.warn('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to create category');
      }

      setName('');
      setDescription('');
      loadCategories();
    } catch (err: any) {
      setError(err.message || 'Error creating category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Create Form */}
      <div className="lg:col-span-5 p-6 rounded-2xl border border-cinder-border bg-cinder-paper-soft space-y-4">
        <div className="flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-cinder-orange" />
          <h3 className="text-base font-bold text-cinder-ink">Add Category</h3>
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
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Consensus"
              className="w-full px-3 py-2 text-sm rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-cinder-muted mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope and editorial guidelines for this section..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cinder-orange text-white text-xs font-semibold uppercase tracking-wider hover:bg-cinder-orange-deep transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Create Category</span>
          </button>
        </form>
      </div>

      {/* Category List */}
      <div className="lg:col-span-7 space-y-4">
        <h3 className="text-sm font-mono uppercase tracking-wider text-cinder-muted font-semibold">
          Active Categories ({categories.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-cinder-muted">
            Loading categories...
          </div>
        ) : (
          <div className="divide-y divide-cinder-border border border-cinder-border rounded-xl bg-cinder-paper-soft overflow-hidden">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-cinder-ink text-sm">{cat.name}</span>
                    <span className="text-[11px] font-mono text-cinder-muted">/{cat.slug}</span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-cinder-muted line-clamp-1">{cat.description}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-cinder-bone text-cinder-ink border border-cinder-border">
                    {cat.post_count || 0} stories
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
