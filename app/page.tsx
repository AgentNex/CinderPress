import React from 'react';
import Link from 'next/link';
import { query, queryOne, Post, Author, MediaAsset, Category } from '@/lib/db';
import { SiteHeader } from '@/components/navigation/SiteHeader';
import { SiteFooter } from '@/components/navigation/SiteFooter';
import { StoryCard } from '@/components/editorial/StoryCard';
import { ArrowRight, BookOpen, Sparkles, Layers, Cpu } from 'lucide-react';

export const revalidate = 60; // 60s ISR cache on Cloudflare edge

async function getHomePageData() {
  // Fetch published stories
  const posts = await query<Post>(`
    SELECT * FROM posts 
    WHERE status = 'published' AND deleted_at IS NULL 
    ORDER BY published_at DESC LIMIT 10
  `);

  const enrichedPosts = await Promise.all(
    posts.map(async (p) => {
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

  const categories = await query<Category & { count: number }>(`
    SELECT c.*, COUNT(pc.post_id) as count
    FROM categories c
    JOIN post_categories pc ON c.id = pc.category_id
    JOIN posts p ON pc.post_id = p.id AND p.status = 'published'
    GROUP BY c.id
    ORDER BY count DESC LIMIT 6
  `);

  const authors = await query<Author>('SELECT * FROM authors LIMIT 3');

  return {
    featuredPost: enrichedPosts[0] || null,
    secondaryPosts: enrichedPosts.slice(1, 3),
    recentPosts: enrichedPosts.slice(3, 9),
    categories,
    authors,
  };
}

export default async function HomePage() {
  const { featuredPost, secondaryPosts, recentPosts, categories, authors } = await getHomePageData();

  return (
    <div className="min-h-screen flex flex-col bg-cinder-paper">
      <SiteHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-16">
        {/* Editorial Masthead Banner */}
        <section className="border-b border-cinder-border pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-cinder-orange font-semibold block">
              Issue No. 42 • Planetary Systems
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-cinder-ink leading-tight">
              A calm journal on systems architecture and tactile design.
            </h1>
          </div>
          <p className="text-sm text-cinder-muted max-w-xs font-sans leading-relaxed">
            Published at the Cloudflare edge. Engineered with D1 relational persistence, Cloudinary media CDN, and InsForge identity.
          </p>
        </section>

        {/* Lead Feature + Secondary Column */}
        {featuredPost && (
          <section className="space-y-8">
            <StoryCard post={featuredPost} variant="featured" priorityImage={true} />

            {secondaryPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {secondaryPosts.map((post) => (
                  <StoryCard key={post.id} post={post} variant="standard" />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Categories Horizontal Strip */}
        <section className="py-6 border-y border-cinder-border bg-cinder-paper-soft -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto pb-2 sm:pb-0">
            <span className="text-xs font-mono uppercase tracking-widest text-cinder-muted font-semibold flex-shrink-0">
              Taxonomies:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cinder-paper border border-cinder-border text-cinder-ink hover:border-cinder-orange hover:text-cinder-orange transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-cinder-muted">({cat.count})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Stories Grid */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-cinder-border pb-4">
            <h2 className="text-2xl font-bold tracking-tight text-cinder-ink flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cinder-orange" />
              <span>Recent Dispatches</span>
            </h2>
            <Link
              href="/stories"
              className="text-xs font-mono uppercase tracking-wider font-semibold text-cinder-orange hover:text-cinder-orange-deep flex items-center gap-1"
            >
              <span>View All Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <StoryCard key={post.id} post={post} variant="standard" />
            ))}
          </div>
        </section>

        {/* Authors / Contributors Spotlight */}
        <section className="border border-cinder-border rounded-2xl bg-cinder-paper-soft p-8 lg:p-10 space-y-6">
          <div className="max-w-xl space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-cinder-ink">
              Editorial Board & Contributors
            </h2>
            <p className="text-sm text-cinder-muted">
              Voices dedicated to technical clarity, reproducible benchmarks, and editorial depth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            {authors.map((auth) => (
              <Link
                key={auth.id}
                href={`/author/${auth.slug}`}
                className="group p-5 rounded-xl border border-cinder-border bg-cinder-paper hover:border-cinder-orange transition-all space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cinder-ink text-white font-mono text-sm flex items-center justify-center">
                    {auth.display_name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-cinder-ink group-hover:text-cinder-orange transition-colors">
                      {auth.display_name}
                    </h3>
                    <span className="text-[11px] font-mono uppercase text-cinder-orange">
                      {auth.role}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-cinder-muted line-clamp-2 leading-relaxed">
                  {auth.bio || 'Staff contributor at CinderPress Review.'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
