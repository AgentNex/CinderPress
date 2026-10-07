'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudioHeader } from '@/components/navigation/StudioHeader';
import { Post, Comment, MediaAsset } from '@/lib/db';
import {
  FileText,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare,
  PlusCircle,
  ExternalLink,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function StudioDashboard() {
  const [stats, setStats] = useState({
    drafts: 0,
    published: 0,
    mediaCount: 0,
    pendingComments: 0,
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recentComments, setRecentComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [postsRes, mediaRes, commentsRes] = await Promise.all([
          fetch('/api/posts?status=all&limit=8'),
          fetch('/api/media'),
          fetch('/api/comments?limit=5'),
        ]);

        if (postsRes.ok) {
          const d = await postsRes.json();
          const allPosts: Post[] = d.posts || [];
          setRecentPosts(allPosts.slice(0, 5));
          setStats((prev) => ({
            ...prev,
            drafts: allPosts.filter((p) => p.status === 'draft').length,
            published: allPosts.filter((p) => p.status === 'published').length,
          }));
        }

        if (mediaRes.ok) {
          const m = await mediaRes.json();
          setStats((prev) => ({
            ...prev,
            mediaCount: (m.assets || []).length,
          }));
        }

        if (commentsRes.ok) {
          const c = await commentsRes.json();
          const allComms: Comment[] = c.comments || [];
          setRecentComments(allComms.slice(0, 4));
          setStats((prev) => ({
            ...prev,
            pendingComments: allComms.filter((comm) => comm.status === 'pending').length,
          }));
        }
      } catch (err) {
        console.warn('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-cinder-paper">
      <StudioHeader
        title="Overview"
        description="Your publication metrics and dispatches at a glance."
      />

      <div className="p-8 space-y-10 max-w-7xl">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-xl border border-cinder-border bg-cinder-paper-soft space-y-3">
            <div className="flex items-center justify-between text-cinder-muted">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Active Drafts</span>
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-cinder-ink font-mono">
              {stats.drafts}
            </div>
            <p className="text-[11px] text-cinder-muted">Unpublished working revisions</p>
          </div>

          <div className="p-6 rounded-xl border border-cinder-border bg-cinder-paper-soft space-y-3">
            <div className="flex items-center justify-between text-cinder-muted">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Published Stories</span>
              <CheckCircle2 className="w-4 h-4 text-cinder-success" />
            </div>
            <div className="text-3xl font-extrabold text-cinder-ink font-mono">
              {stats.published}
            </div>
            <p className="text-[11px] text-cinder-muted">Live across global edge cache</p>
          </div>

          <div className="p-6 rounded-xl border border-cinder-border bg-cinder-paper-soft space-y-3">
            <div className="flex items-center justify-between text-cinder-muted">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Media Library</span>
              <ImageIcon className="w-4 h-4 text-cinder-orange" />
            </div>
            <div className="text-3xl font-extrabold text-cinder-ink font-mono">
              {stats.mediaCount}
            </div>
            <p className="text-[11px] text-cinder-muted">Cloudinary CDN assets tracked</p>
          </div>

          <div className="p-6 rounded-xl border border-cinder-border bg-cinder-paper-soft space-y-3">
            <div className="flex items-center justify-between text-cinder-muted">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Pending Feedback</span>
              <MessageSquare className="w-4 h-4 text-cinder-orange" />
            </div>
            <div className="text-3xl font-extrabold text-cinder-ink font-mono">
              {stats.pendingComments}
            </div>
            <p className="text-[11px] text-cinder-muted">Awaiting moderator review</p>
          </div>
        </div>

        {/* Two-Column Grid: Recent Stories & Reader Conversations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Stories (Cols 1-8) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-cinder-ink">
                Recent Dispatches
              </h3>
              <Link
                href="/studio/posts"
                className="text-xs font-mono uppercase tracking-wider text-cinder-orange hover:underline font-semibold"
              >
                View All Stories →
              </Link>
            </div>

            <div className="border border-cinder-border rounded-xl bg-cinder-paper-soft overflow-hidden divide-y divide-cinder-border">
              {loading ? (
                <div className="p-8 text-center text-xs font-mono text-cinder-muted">
                  Loading stories from D1...
                </div>
              ) : recentPosts.length === 0 ? (
                <div className="p-8 text-center text-xs text-cinder-muted">
                  No stories created yet. Start your first draft!
                </div>
              ) : (
                recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-cinder-bone/50 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            post.status === 'published'
                              ? 'bg-green-100 text-cinder-success border border-green-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {post.status}
                        </span>
                        <span className="text-xs font-mono text-cinder-muted">
                          {post.reading_time_minutes}m read
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-cinder-ink truncate">
                        <Link href={`/studio/posts/${post.id}`} className="hover:text-cinder-orange">
                          {post.title}
                        </Link>
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/studio/posts/${post.id}`}
                        className="px-3 py-1.5 rounded-lg border border-cinder-border bg-white text-xs font-medium text-cinder-ink hover:bg-cinder-bone transition-colors"
                      >
                        Edit
                      </Link>
                      {post.status === 'published' && (
                        <Link
                          href={`/stories/${post.slug}`}
                          target="_blank"
                          className="p-1.5 text-cinder-muted hover:text-cinder-ink rounded-lg"
                          title="Open live story"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reader Feedback / Moderation (Cols 9-12) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-cinder-ink">
                Reader Submissions
              </h3>
              <Link
                href="/studio/comments"
                className="text-xs font-mono uppercase tracking-wider text-cinder-orange hover:underline font-semibold"
              >
                Moderate →
              </Link>
            </div>

            <div className="border border-cinder-border rounded-xl bg-cinder-paper-soft overflow-hidden divide-y divide-cinder-border">
              {loading ? (
                <div className="p-8 text-center text-xs font-mono text-cinder-muted">
                  Loading conversations...
                </div>
              ) : recentComments.length === 0 ? (
                <div className="p-8 text-center text-xs text-cinder-muted">
                  No reader comments submitted yet.
                </div>
              ) : (
                recentComments.map((comm) => (
                  <div key={comm.id} className="p-4 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-cinder-ink">{comm.author_name}</span>
                      <span className="text-[10px] font-mono text-cinder-muted">
                        {new Date(comm.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-cinder-muted line-clamp-2 leading-relaxed">
                      &quot;{comm.body}&quot;
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
