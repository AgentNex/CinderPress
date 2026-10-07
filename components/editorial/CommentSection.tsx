'use client';

import React, { useState, useEffect } from 'react';
import { Comment } from '@/lib/db';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    async function loadComments() {
      try {
        setLoading(true);
        const res = await fetch(`/api/comments?postId=${encodeURIComponent(postId)}&status=approved`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch (err) {
        console.warn('Failed to load comments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !body.trim() || submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          author_name: authorName.trim(),
          author_email: authorEmail.trim() || null,
          body: body.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit comment');
      }

      const data = await res.json();
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
      }

      setBody('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Error submitting comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 pt-12 border-t border-cinder-border">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-5 h-5 text-cinder-orange" />
        <h3 className="text-xl font-bold tracking-tight text-cinder-ink">
          Reader Conversation ({comments.length})
        </h3>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="mb-12 p-6 rounded-xl border border-cinder-border bg-cinder-paper-soft space-y-4">
        <h4 className="text-sm font-semibold text-cinder-ink">Contribute a Perspective</h4>
        
        {error && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-cinder-error rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 text-xs bg-green-50 border border-green-200 text-cinder-success rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Your thought has been recorded and posted.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="author-name" className="block text-xs font-mono uppercase text-cinder-muted mb-1">
              Your Name *
            </label>
            <input
              id="author-name"
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Robin Ward"
              className="w-full px-3 py-2 text-sm rounded-lg border border-cinder-border bg-white text-cinder-ink focus:border-cinder-orange focus:ring-1 focus:ring-cinder-orange outline-none"
            />
          </div>
          <div>
            <label htmlFor="author-email" className="block text-xs font-mono uppercase text-cinder-muted mb-1">
              Email (optional, private)
            </label>
            <input
              id="author-email"
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="e.g. robin@example.com"
              className="w-full px-3 py-2 text-sm rounded-lg border border-cinder-border bg-white text-cinder-ink focus:border-cinder-orange focus:ring-1 focus:ring-cinder-orange outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="comment-body" className="block text-xs font-mono uppercase text-cinder-muted mb-1">
            Comment *
          </label>
          <textarea
            id="comment-body"
            required
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your perspective on this essay..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-cinder-border bg-white text-cinder-ink focus:border-cinder-orange focus:ring-1 focus:ring-cinder-orange outline-none resize-y"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !authorName.trim() || !body.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cinder-orange text-white text-xs font-semibold uppercase tracking-wider hover:bg-cinder-orange-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span>Submitting...</span>
            ) : (
              <>
                <span>Post Comment</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="py-8 text-center text-xs font-mono text-cinder-muted animate-pulse">
          Loading discussion...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-sm text-cinder-muted bg-cinder-paper-soft rounded-xl border border-cinder-border">
          No thoughts shared yet. Be the first to start the conversation.
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comm) => (
            <div
              key={comm.id}
              className="p-5 rounded-xl border border-cinder-border bg-cinder-paper-soft space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-cinder-ink">{comm.author_name}</span>
                <span className="font-mono text-cinder-muted">
                  {new Date(comm.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-sm text-cinder-ink/90 leading-relaxed whitespace-pre-line">
                {comm.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
