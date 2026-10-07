import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { query, queryOne, Post, Author, MediaAsset, Category, Tag } from '@/lib/db';
import { SiteHeader } from '@/components/navigation/SiteHeader';
import { SiteFooter } from '@/components/navigation/SiteFooter';
import { MediaFigure } from '@/components/editorial/MediaFigure';
import { ShareBar } from '@/components/editorial/ShareBar';
import { CommentSection } from '@/components/editorial/CommentSection';
import { StoryCard } from '@/components/editorial/StoryCard';
import { Clock, Calendar, ArrowLeft, Tag as TagIcon } from 'lucide-react';

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const post = await queryOne<Post>(
    "SELECT * FROM posts WHERE slug = ? AND status = 'published' AND deleted_at IS NULL",
    [params.slug]
  );

  if (!post) {
    return { title: 'Story Not Found' };
  }

  const cover = post.cover_media_id
    ? await queryOne<MediaAsset>('SELECT secure_url FROM media WHERE id = ?', [post.cover_media_id])
    : null;

  return {
    title: post.seo_title || `${post.title} — CinderPress Review`,
    description: post.seo_description || post.dek || post.excerpt || '',
    openGraph: {
      title: post.og_title || post.title,
      description: post.og_description || post.dek || post.excerpt || '',
      type: 'article',
      publishedTime: post.published_at || undefined,
      images: cover?.secure_url ? [{ url: cover.secure_url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.dek || post.excerpt || '',
      images: cover?.secure_url ? [cover.secure_url] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const post = await queryOne<Post>(
    "SELECT * FROM posts WHERE slug = ? AND status = 'published' AND deleted_at IS NULL",
    [params.slug]
  );

  if (!post) {
    notFound();
  }

  const [author, cover_media, categories, tags, relatedPostsRaw] = await Promise.all([
    queryOne<Author>('SELECT * FROM authors WHERE id = ?', [post.author_id]),
    post.cover_media_id ? queryOne<MediaAsset>('SELECT * FROM media WHERE id = ?', [post.cover_media_id]) : Promise.resolve(null),
    query<Category>(
      'SELECT c.* FROM categories c JOIN post_categories pc ON c.id = pc.category_id WHERE pc.post_id = ?',
      [post.id]
    ),
    query<Tag>(
      'SELECT t.* FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?',
      [post.id]
    ),
    query<Post>(
      "SELECT * FROM posts WHERE id != ? AND status = 'published' AND deleted_at IS NULL ORDER BY published_at DESC LIMIT 3",
      [post.id]
    ),
  ]);

  const relatedPosts = await Promise.all(
    relatedPostsRaw.map(async (p) => {
      const [auth, cover] = await Promise.all([
        queryOne<Author>('SELECT * FROM authors WHERE id = ?', [p.author_id]),
        p.cover_media_id ? queryOne<MediaAsset>('SELECT * FROM media WHERE id = ?', [p.cover_media_id]) : Promise.resolve(null),
      ]);
      return { ...p, author: auth || undefined, cover_media: cover };
    })
  );

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.dek || post.excerpt,
    datePublished: post.published_at,
    author: {
      '@type': 'Person',
      name: author?.display_name || 'CinderPress Editorial',
    },
    image: cover_media?.secure_url || undefined,
  };

  return (
    <div className="min-h-screen flex flex-col bg-cinder-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SiteHeader />

      <main className="flex-1 py-10 lg:py-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center gap-2 text-xs font-mono text-cinder-muted mb-8">
            <Link href="/stories" className="hover:text-cinder-ink flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Stories</span>
            </Link>
            {categories[0] && (
              <>
                <span>/</span>
                <Link
                  href={`/category/${categories[0].slug}`}
                  className="text-cinder-orange font-semibold hover:underline"
                >
                  {categories[0].name}
                </Link>
              </>
            )}
          </div>

          {/* Article Header */}
          <header className="space-y-6 pb-8 border-b border-cinder-border">
            <h1 className="text-3xl sm:text-5xl lg:text-[42px] font-extrabold tracking-tight text-cinder-ink leading-[1.18]">
              {post.title}
            </h1>

            {post.dek && (
              <p className="text-lg sm:text-xl text-cinder-muted leading-relaxed font-sans font-normal">
                {post.dek}
              </p>
            )}

            {/* Author Byline Bar */}
            <div className="flex items-center justify-between pt-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cinder-ink text-white font-mono flex items-center justify-center font-semibold">
                  {author?.display_name ? author.display_name[0] : 'C'}
                </div>
                <div>
                  <Link
                    href={`/author/${author?.slug || 'editorial'}`}
                    className="font-bold text-cinder-ink hover:text-cinder-orange transition-colors block text-sm"
                  >
                    {author?.display_name || 'Editorial Board'}
                  </Link>
                  <span className="text-cinder-muted text-xs">{author?.role || 'Author'}</span>
                </div>
              </div>

              <div className="text-right text-xs font-mono text-cinder-muted space-y-0.5">
                <div>{formattedDate}</div>
                <div className="flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3 text-cinder-orange" />
                  <span>{post.reading_time_minutes} min read</span>
                </div>
              </div>
            </div>
          </header>

          {/* Cover Media Figure */}
          {cover_media && (
            <MediaFigure
              src={cover_media.secure_url}
              alt={cover_media.alt_text || post.title}
              caption={cover_media.caption}
              credit={cover_media.credit}
              width={1600}
              height={900}
              priority={true}
            />
          )}

          {/* Article Longform Prose Body */}
          <div
            className="cinder-prose max-w-reading mx-auto pt-6"
            dangerouslySetInnerHTML={{ __html: post.content_html || `<p>${post.excerpt || ''}</p>` }}
          />

          {/* Tag Taxonomy Pills */}
          {tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-cinder-border flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-cinder-muted flex items-center gap-1">
                <TagIcon className="w-3.5 h-3.5 text-cinder-orange" />
                <span>Tags:</span>
              </span>
              {tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/tag/${t.slug}`}
                  className="px-2.5 py-1 rounded text-xs font-mono bg-cinder-bone text-cinder-ink hover:border-cinder-orange hover:text-cinder-orange border border-cinder-border transition-colors"
                >
                  #{t.name}
                </Link>
              ))}
            </div>
          )}

          {/* Share & Feedback Controls */}
          <ShareBar title={post.title} slug={post.slug} />

          {/* Reader Discussion Section */}
          <CommentSection postId={post.id} />
        </article>

        {/* Related Stories Strip */}
        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-12 border-t border-cinder-border space-y-8">
            <h3 className="text-xl font-bold tracking-tight text-cinder-ink">
              Related Dispatches
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((rel) => (
                <StoryCard key={rel.id} post={rel} variant="standard" />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
