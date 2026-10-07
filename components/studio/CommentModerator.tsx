'use client';

import React, { useState, useEffect } from 'react';
import { Comment } from '@/lib/db';
import { MessageSquare, Check, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function CommentModerator() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'spam'>('all');

  const loadComments = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/api/comments' : `/api/comments?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        setComments(d.comments || []);
      }
    } catch (err) {
      console.warn('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [filter]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus as any } : c))
        );
      }
    } catch (err) {
      console.warn('Moderation error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-cinder-border pb-3">
        {(['all', 'pending', 'approved', 'rejected', 'spam'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors ${
              filter === tab
                ? 'bg-cinder-ink text-white'
                : 'text-cinder-muted hover:bg-cinder-bone hover:text-cinder-ink'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-cinder-muted">
          Loading conversation submissions...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-16 text-center text-sm text-cinder-muted bg-cinder-paper-soft rounded-2xl border border-cinder-border">
          No comments in this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comm) => (
            <div
              key={comm.id}
              className="p-5 rounded-xl border border-cinder-border bg-cinder-paper-soft flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-cinder-ink">{comm.author_name}</span>
                  {comm.author_email && (
                    <span className="text-cinder-muted font-mono">{comm.author_email}</span>
                  )}
                  <span className="text-cinder-muted">•</span>
                  <span className="font-mono text-cinder-muted">
                    {new Date(comm.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      comm.status === 'approved'
                        ? 'bg-green-100 text-cinder-success border border-green-200'
                        : comm.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-red-100 text-cinder-error border border-red-200'
                    }`}
                  >
                    {comm.status}
                  </span>
                </div>

                <p className="text-sm text-cinder-ink/90 leading-relaxed whitespace-pre-line">
                  {comm.body}
                </p>
              </div>

              {/* Moderation Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-start">
                {comm.status !== 'approved' && (
                  <button
                    onClick={() => updateStatus(comm.id, 'approved')}
                    title="Approve"
                    className="p-1.5 rounded-lg border border-cinder-border bg-white text-cinder-success hover:bg-green-50 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {comm.status !== 'rejected' && (
                  <button
                    onClick={() => updateStatus(comm.id, 'rejected')}
                    title="Reject"
                    className="p-1.5 rounded-lg border border-cinder-border bg-white text-cinder-error hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {comm.status !== 'spam' && (
                  <button
                    onClick={() => updateStatus(comm.id, 'spam')}
                    title="Mark Spam"
                    className="p-1.5 rounded-lg border border-cinder-border bg-white text-cinder-muted hover:bg-cinder-bone transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
