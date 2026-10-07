import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, Post, Author, MediaAsset, Category } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    let posts: Post[] = [];

    try {
      // 1. Try SQLite FTS5 Full-Text Search
      const sanitizedFtsQuery = q.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
      if (sanitizedFtsQuery) {
        posts = await query<Post>(
          `SELECT p.* FROM posts p
           JOIN posts_fts f ON p.id = f.id
           WHERE posts_fts MATCH ? AND p.status = 'published' AND p.deleted_at IS NULL
           ORDER BY p.published_at DESC LIMIT 25`,
          [`${sanitizedFtsQuery}*`]
        );
      }
    } catch (ftsError) {
      console.warn('[CinderPress Search] FTS match fallback:', ftsError);
    }

    // 2. If FTS returned 0 results or had syntax quirks, fallback to LIKE search
    if (posts.length === 0) {
      const term = `%${q}%`;
      posts = await query<Post>(
        `SELECT p.* FROM posts p
         WHERE p.status = 'published' AND p.deleted_at IS NULL
           AND (p.title LIKE ? OR p.dek LIKE ? OR p.excerpt LIKE ?)
         ORDER BY p.published_at DESC LIMIT 25`,
        [term, term, term]
      );
    }

    // Enrich results
    const results = await Promise.all(
      posts.map(async (p) => {
        const [author, cover_media, categories] = await Promise.all([
          queryOne<Author>('SELECT * FROM authors WHERE id = ?', [p.author_id]),
          p.cover_media_id ? queryOne<MediaAsset>('SELECT * FROM media WHERE id = ?', [p.cover_media_id]) : Promise.resolve(null),
          query<Category>(
            'SELECT c.* FROM categories c JOIN post_categories pc ON c.id = pc.category_id WHERE pc.post_id = ?',
            [p.id]
          ),
        ]);

        return {
          ...p,
          author: author || undefined,
          cover_media,
          categories,
        };
      })
    );

    await trackEvent({
      name: 'search',
      metadata: { query: q, count: results.length },
    });

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error('Search error:', err);
    return NextResponse.json({ error: err.message || 'Search failed' }, { status: 500 });
  }
}
