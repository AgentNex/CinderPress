'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudioHeader } from '@/components/navigation/StudioHeader';
import { PostWithRelations } from '@/lib/db';
import { PlusCircle, ExternalLink, Edit, Trash2, Clock, CheckCircle2, FileText, Search } from 'lucide-react';

export default function StudioPostsPage() {
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [search, setSearch] = useState('');

  const loadPosts = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/posts?status=all&limit=50' : `/api/posts?status=${filter}&limit=50`;
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        setPosts(d.posts || []);
      }
    } catch (err) {
      console.warn('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.warn('Delete error:', err);
    }
  };

  const filteredPosts = posts.filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="flex-1 flex flex-col bg-cinder-paper">
      <StudioHeader
        title="Stories Management"
        description="Write, revise, and publish editorial articles."
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(['all', 'published', 'draft'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
                  filter === tab
                    ? 'bg-cinder-ink text-white font-semibold'
                    : 'text-cinder-muted hover:bg-cinder-bone hover:text-cinder-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-cinder-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search stories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange"
            />
          </div>
        </div>

        {/* Stories Table */}
        <div className="border border-cinder-border rounded-xl bg-cinder-paper-soft overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs font-mono text-cinder-muted">
              Loading stories from D1...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <FileText className="w-8 h-8 text-cinder-muted mx-auto" />
              <p className="text-sm font-semibold text-cinder-ink">Your publication is still a blank page.</p>
              <Link
                href="/studio/posts/new"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cinder-orange hover:underline"
              >
                Create your first story →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cinder-bone border-b border-cinder-border text-cinder-muted font-mono uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cinder-border">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-cinder-bone/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-cinder-ink">
                        <Link href={`/studio/posts/${post.id}`} className="hover:text-cinder-orange">
                          {post.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            post.status === 'published'
                              ? 'bg-green-100 text-cinder-success border border-green-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cinder-muted">
                        {post.categories?.[0]?.name || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cinder-muted">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Link
                          href={`/studio/posts/${post.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-cinder-border bg-white text-cinder-ink hover:bg-cinder-bone font-medium"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>

                        {post.status === 'published' && (
                          <Link
                            href={`/stories/${post.slug}`}
                            target="_blank"
                            className="inline-flex items-center p-1 text-cinder-muted hover:text-cinder-ink"
                            title="View Public Story"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="inline-flex items-center p-1 text-cinder-muted hover:text-cinder-error"
                          title="Delete Story"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
