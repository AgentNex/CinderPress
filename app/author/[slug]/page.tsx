import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { query, queryOne, Author, Post, MediaAsset, Category } from '@/lib/db';
import { SiteHeader } from '@/components/navigation/SiteHeader';
import { SiteFooter } from '@/components/navigation/SiteFooter';
import { StoryCard } from '@/components/editorial/StoryCard';
import { Globe, ArrowLeft, BookOpen } from 'lucide-react';

interface AuthorPageProps {
  params: { slug: string };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const author = await queryOne<Author>('SELECT * FROM authors WHERE slug = ?', [params.slug]);

  if (!author) {
    notFound();
  }

  const rawPosts = await query<Post>(`
    SELECT * FROM posts 
    WHERE author_id = ? AND status = 'published' AND deleted_at IS NULL
    ORDER BY published_at DESC
  `, [author.id]);

  const posts = await Promise.all(
    rawPosts.map(async (p) => {
      const [cover_media, categories] = await Promise.all([
        p.cover_media_id ? queryOne<MediaAsset>('SELECT * FROM media WHERE id = ?', [p.cover_media_id]) : Promise.resolve(null),
        query<Category>(
          'SELECT c.* FROM categories c JOIN post_categories pc ON c.id = pc.category_id WHERE pc.post_id = ?',
          [p.id]
        ),
      ]);
      return { ...p, author, cover_media, categories };
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-cinder-paper">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Contributor Card */}
        <div className="border border-cinder-border bg-cinder-paper-soft rounded-2xl p-8 sm:p-10 space-y-6">
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-cinder-muted hover:text-cinder-ink mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Stories</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-cinder-ink text-white font-mono text-2xl flex items-center justify-center font-bold flex-shrink-0">
              {author.display_name[0]}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-cinder-ink">
                  {author.display_name}
                </h1>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono uppercase tracking-wider bg-cinder-bone text-cinder-orange border border-cinder-border font-semibold">
                  {author.role}
                </span>
              </div>

              {author.bio && (
                <p className="text-sm sm:text-base text-cinder-muted max-w-2xl leading-relaxed">
                  {author.bio}
                </p>
              )}

              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-cinder-orange hover:underline pt-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{author.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stories by this author */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-cinder-ink flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cinder-orange" />
            <span>Authored Dispatches ({posts.length})</span>
          </h2>

          {posts.length === 0 ? (
            <div className="py-16 text-center text-sm text-cinder-muted bg-cinder-paper-soft rounded-xl border border-cinder-border">
              No published stories by this contributor yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <StoryCard key={post.id} post={post} variant="standard" />
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
