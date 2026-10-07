import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { query, queryOne, Tag, Post, Author, MediaAsset } from '@/lib/db';
import { SiteHeader } from '@/components/navigation/SiteHeader';
import { SiteFooter } from '@/components/navigation/SiteFooter';
import { StoryCard } from '@/components/editorial/StoryCard';
import { Tag as TagIcon, ArrowLeft } from 'lucide-react';

interface TagPageProps {
  params: { slug: string };
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = await queryOne<Tag>('SELECT * FROM tags WHERE slug = ?', [params.slug]);

  if (!tag) {
    notFound();
  }

  const rawPosts = await query<Post>(`
    SELECT p.* FROM posts p
    JOIN post_tags pt ON p.id = pt.post_id
    WHERE pt.tag_id = ? AND p.status = 'published' AND p.deleted_at IS NULL
    ORDER BY p.published_at DESC
  `, [tag.id]);

  const posts = await Promise.all(
    rawPosts.map(async (p) => {
      const [author, cover_media] = await Promise.all([
        queryOne<Author>('SELECT * FROM authors WHERE id = ?', [p.author_id]),
        p.cover_media_id ? queryOne<MediaAsset>('SELECT * FROM media WHERE id = ?', [p.cover_media_id]) : Promise.resolve(null),
      ]);
      return { ...p, author: author || undefined, cover_media, tags: [tag] };
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-cinder-paper">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <div className="border-b border-cinder-border pb-8 space-y-3">
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-cinder-muted hover:text-cinder-ink mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Stories</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cinder-orange font-semibold">
            <TagIcon className="w-4 h-4" />
            <span>Tag Archive</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-cinder-ink">
            #{tag.name}
          </h1>

          <div className="text-xs font-mono text-cinder-muted">
            {posts.length} {posts.length === 1 ? 'Dispatch' : 'Dispatches'} tagged
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="py-20 text-center space-y-2 bg-cinder-paper-soft rounded-2xl border border-cinder-border">
            <p className="text-base font-semibold text-cinder-ink">No dispatches found under this tag.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <StoryCard key={post.id} post={post} variant="standard" />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
