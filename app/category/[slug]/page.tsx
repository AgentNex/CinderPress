import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { query, queryOne, Category, Post, Author, MediaAsset } from '@/lib/db';
import { SiteHeader } from '@/components/navigation/SiteHeader';
import { SiteFooter } from '@/components/navigation/SiteFooter';
import { StoryCard } from '@/components/editorial/StoryCard';
import { FolderTree, ArrowLeft } from 'lucide-react';

interface CategoryPageProps {
  params: { slug: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await queryOne<Category>(
    'SELECT * FROM categories WHERE slug = ?',
    [params.slug]
  );

  if (!category) {
    notFound();
  }

  const rawPosts = await query<Post>(`
    SELECT p.* FROM posts p
    JOIN post_categories pc ON p.id = pc.post_id
    WHERE pc.category_id = ? AND p.status = 'published' AND p.deleted_at IS NULL
    ORDER BY p.published_at DESC
  `, [category.id]);

  const posts = await Promise.all(
    rawPosts.map(async (p) => {
      const [author, cover_media] = await Promise.all([
        queryOne<Author>('SELECT * FROM authors WHERE id = ?', [p.author_id]),
        p.cover_media_id ? queryOne<MediaAsset>('SELECT * FROM media WHERE id = ?', [p.cover_media_id]) : Promise.resolve(null),
      ]);
      return { ...p, author: author || undefined, cover_media, categories: [category] };
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-cinder-paper">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Masthead */}
        <div className="border-b border-cinder-border pb-8 space-y-3">
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-cinder-muted hover:text-cinder-ink mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Sections</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cinder-orange font-semibold">
            <FolderTree className="w-4 h-4" />
            <span>Editorial Section</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-cinder-ink">
            {category.name}
          </h1>

          {category.description && (
            <p className="text-base text-cinder-muted max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}

          <div className="pt-2 text-xs font-mono text-cinder-muted">
            {posts.length} {posts.length === 1 ? 'Dispatch' : 'Dispatches'} in this section
          </div>
        </div>

        {/* Stories Grid */}
        {posts.length === 0 ? (
          <div className="py-20 text-center space-y-2 bg-cinder-paper-soft rounded-2xl border border-cinder-border">
            <p className="text-base font-semibold text-cinder-ink">No dispatches in this category yet.</p>
            <p className="text-xs text-cinder-muted">Stories published here will appear immediately.</p>
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
