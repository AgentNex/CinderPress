import React from 'react';
import Link from 'next/link';
import { query, queryOne, Post, Author, MediaAsset, Category } from '@/lib/db';
import { SiteHeader } from '@/components/navigation/SiteHeader';
import { SiteFooter } from '@/components/navigation/SiteFooter';
import { StoryCard } from '@/components/editorial/StoryCard';
import { BookOpen, Filter } from 'lucide-react';

export const revalidate = 60;

export default async function StoriesPage() {
  const rawPosts = await query<Post>(`
    SELECT * FROM posts 
    WHERE status = 'published' AND deleted_at IS NULL 
    ORDER BY published_at DESC LIMIT 50
  `);

  const posts = await Promise.all(
    rawPosts.map(async (p) => {
      const [author, cover_media, categories] = await Promise.all([
        queryOne<Author>('SELECT * FROM authors WHERE id = ?', [p.author_id]),
        p.cover_media_id ? queryOne<MediaAsset>('SELECT * FROM media WHERE id = ?', [p.cover_media_id]) : Promise.resolve(null),
        query<Category>(
          'SELECT c.* FROM categories c JOIN post_categories pc ON c.id = pc.category_id WHERE pc.post_id = ?',
          [p.id]
        ),
      ]);
      return { ...p, author: author || undefined, cover_media, categories };
    })
  );

  const categories = await query<Category>('SELECT * FROM categories ORDER BY name ASC');

  return (
    <div className="min-h-screen flex flex-col bg-cinder-paper">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Header */}
        <div className="border-b border-cinder-border pb-8 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cinder-orange font-semibold">
            <BookOpen className="w-4 h-4" />
            <span>Full Archive</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-cinder-ink">
            Editorial Dispatches & Essays
          </h1>
          <p className="text-sm sm:text-base text-cinder-muted max-w-2xl leading-relaxed">
            The complete catalog of essays, architectural breakdowns, and research articles published in CinderPress Review.
          </p>

          {/* Category Filter Pills */}
          <div className="pt-4 flex items-center gap-2 flex-wrap">
            <Link
              href="/stories"
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cinder-ink text-white"
            >
              All Stories ({posts.length})
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cinder-paper-soft border border-cinder-border text-cinder-muted hover:border-cinder-orange hover:text-cinder-orange transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <StoryCard key={post.id} post={post} variant="standard" />
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
