import React from 'react';
import Link from 'next/link';
import { PostWithRelations } from '@/lib/db';
import { MediaFigure } from './MediaFigure';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

interface StoryCardProps {
  post: PostWithRelations;
  variant?: 'featured' | 'standard' | 'compact';
  priorityImage?: boolean;
}

export function StoryCard({ post, variant = 'standard', priorityImage = false }: StoryCardProps) {
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Draft';

  const category = post.categories?.[0];
  const coverUrl = post.cover_media?.secure_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';

  if (variant === 'featured') {
    return (
      <article className="group relative border border-cinder-border bg-cinder-paper-soft rounded-2xl overflow-hidden p-6 lg:p-8 transition-all hover:border-cinder-muted hover:shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              {category && (
                <Link
                  href={`/category/${category.slug}`}
                  className="text-xs font-mono uppercase tracking-wider font-semibold px-2.5 py-1 rounded bg-cinder-bone text-cinder-ink border border-cinder-border hover:border-cinder-orange hover:text-cinder-orange transition-colors"
                >
                  {category.name}
                </Link>
              )}
              <span className="text-xs font-mono text-cinder-muted flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{post.reading_time_minutes} min read</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-cinder-ink leading-tight group-hover:text-cinder-orange transition-colors">
              <Link href={`/stories/${post.slug}`}>
                {post.title}
              </Link>
            </h2>

            {post.dek && (
              <p className="text-base sm:text-lg text-cinder-muted leading-relaxed line-clamp-3">
                {post.dek}
              </p>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-cinder-border/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cinder-ink text-white text-xs font-mono flex items-center justify-center">
                  {post.author?.display_name ? post.author.display_name[0] : 'C'}
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-cinder-ink block">
                    {post.author?.display_name || 'Editorial Board'}
                  </span>
                  <span className="text-cinder-muted font-mono">{publishedDate}</span>
                </div>
              </div>

              <Link
                href={`/stories/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider font-semibold text-cinder-orange hover:text-cinder-orange-deep"
              >
                <span>Read Story</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Link href={`/stories/${post.slug}`} tabIndex={-1}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-cinder-border bg-cinder-bone">
                <img
                  src={coverUrl}
                  alt={post.title}
                  loading={priorityImage ? 'eager' : 'lazy'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'compact') {
    return (
      <article className="group py-4 border-b border-cinder-border/80 flex items-start justify-between gap-4 last:border-b-0">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs font-mono text-cinder-muted">
            {category && <span className="text-cinder-orange font-medium">{category.name}</span>}
            <span>•</span>
            <span>{post.reading_time_minutes}m</span>
          </div>
          <h3 className="text-base font-semibold text-cinder-ink group-hover:text-cinder-orange transition-colors truncate">
            <Link href={`/stories/${post.slug}`}>{post.title}</Link>
          </h3>
          <p className="text-xs text-cinder-muted truncate">{post.excerpt}</p>
        </div>
        <div className="w-16 h-16 rounded-lg overflow-hidden border border-cinder-border flex-shrink-0 bg-cinder-bone">
          <img src={coverUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>
      </article>
    );
  }

  // Standard Variant
  return (
    <article className="group flex flex-col border border-cinder-border bg-cinder-paper-soft rounded-xl overflow-hidden transition-all hover:border-cinder-muted hover:shadow-card">
      <Link href={`/stories/${post.slug}`} tabIndex={-1}>
        <div className="relative aspect-[16/10] overflow-hidden bg-cinder-bone border-b border-cinder-border">
          <img
            src={coverUrl}
            alt={post.title}
            loading={priorityImage ? 'eager' : 'lazy'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            {category ? (
              <Link
                href={`/category/${category.slug}`}
                className="text-cinder-orange font-semibold hover:underline"
              >
                {category.name}
              </Link>
            ) : (
              <span className="text-cinder-muted">Journal</span>
            )}
            <span className="text-cinder-muted flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{post.reading_time_minutes}m</span>
            </span>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-cinder-ink group-hover:text-cinder-orange transition-colors leading-snug">
            <Link href={`/stories/${post.slug}`}>{post.title}</Link>
          </h3>

          {post.dek ? (
            <p className="text-sm text-cinder-muted line-clamp-2 leading-relaxed">
              {post.dek}
            </p>
          ) : post.excerpt ? (
            <p className="text-sm text-cinder-muted line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          ) : null}
        </div>

        <div className="pt-3 border-t border-cinder-border/60 flex items-center justify-between text-xs text-cinder-muted">
          <span className="font-medium text-cinder-ink">
            {post.author?.display_name || 'Editorial'}
          </span>
          <span className="font-mono">{publishedDate}</span>
        </div>
      </div>
    </article>
  );
}
