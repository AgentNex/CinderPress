import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, batch, Post, PostWithRelations, Author, MediaAsset, Category, Tag } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';

function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'published';
    const categorySlug = searchParams.get('category');
    const tagSlug = searchParams.get('tag');
    const authorSlug = searchParams.get('author');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let sql = `
      SELECT p.* FROM posts p
      WHERE p.deleted_at IS NULL
    `;
    const params: any[] = [];

    if (status !== 'all') {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (categorySlug) {
      sql += ' AND p.id IN (SELECT pc.post_id FROM post_categories pc JOIN categories c ON pc.category_id = c.id WHERE c.slug = ?)';
      params.push(categorySlug);
    }

    if (tagSlug) {
      sql += ' AND p.id IN (SELECT pt.post_id FROM post_tags pt JOIN tags t ON pt.tag_id = t.id WHERE t.slug = ?)';
      params.push(tagSlug);
    }

    if (authorSlug) {
      sql += ' AND p.author_id IN (SELECT a.id FROM authors a WHERE a.slug = ?)';
      params.push(authorSlug);
    }

    sql += ' ORDER BY COALESCE(p.published_at, p.created_at) DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rawPosts = await query<Post>(sql, params);

    // Enrich posts with relations
    const posts: PostWithRelations[] = await Promise.all(
      rawPosts.map(async (post) => {
        const [author, cover_media, categories, tags] = await Promise.all([
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
        ]);

        return {
          ...post,
          author: author || undefined,
          cover_media,
          categories,
          tags,
        };
      })
    );

    return NextResponse.json({ posts });
  } catch (err: any) {
    console.error('Error fetching posts:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      slug: customSlug,
      dek,
      excerpt,
      content_json,
      content_html,
      cover_media_id,
      category_ids = [],
      tag_ids = [],
      author_id,
      status = 'draft',
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const pub = await queryOne<{ id: string }>('SELECT id FROM publications LIMIT 1');
    const pubId = pub?.id || 'pub_cinderpress_main';

    // Find default author if not provided
    let finalAuthorId = author_id;
    if (!finalAuthorId) {
      const firstAuthor = await queryOne<Author>('SELECT id FROM authors LIMIT 1');
      finalAuthorId = firstAuthor?.id || 'auth_elena_vance';
    }

    const baseSlug = (customSlug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Ensure slug uniqueness
    let slug = baseSlug;
    const existing = await queryOne('SELECT id FROM posts WHERE slug = ?', [slug]);
    if (existing) {
      slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const readingTime = calculateReadingTime(excerpt || title || '');
    const now = new Date().toISOString();
    const publishedAt = status === 'published' ? now : null;

    const rawJson = typeof content_json === 'string' ? content_json : JSON.stringify(content_json || { type: 'doc', content: [] });
    const rawHtml = content_html || `<p>${excerpt || ''}</p>`;

    // Insert post
    await execute(
      `INSERT INTO posts (
        id, publication_id, author_id, title, slug, dek, excerpt,
        content_json, content_html, cover_media_id, status, visibility,
        published_at, reading_time_minutes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'public', ?, ?, ?, ?)`,
      [
        postId,
        pubId,
        finalAuthorId,
        title.trim(),
        slug,
        dek || null,
        excerpt || null,
        rawJson,
        rawHtml,
        cover_media_id || null,
        status,
        publishedAt,
        readingTime,
        now,
        now,
      ]
    );

    // Insert initial revision
    const revId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await execute(
      `INSERT INTO post_revisions (id, post_id, author_id, title, dek, excerpt, content_json, cover_media_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [revId, postId, finalAuthorId, title, dek || null, excerpt || null, rawJson, cover_media_id || null, now]
    );

    // Link categories
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      for (const catId of category_ids) {
        await execute('INSERT OR IGNORE INTO post_categories (post_id, category_id) VALUES (?, ?)', [postId, catId]);
      }
    }

    // Link tags
    if (Array.isArray(tag_ids) && tag_ids.length > 0) {
      for (const tagId of tag_ids) {
        await execute('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tagId]);
      }
    }

    // Index into FTS5 if published
    if (status === 'published') {
      const plainText = `${title} ${dek || ''} ${excerpt || ''}`;
      await execute('INSERT INTO posts_fts (id, title, dek, excerpt, body_plain) VALUES (?, ?, ?, ?, ?)', [
        postId,
        title,
        dek || '',
        excerpt || '',
        plainText,
      ]);
    }

    await trackEvent({
      name: status === 'published' ? 'post_published' : 'post_created',
      entityType: 'post',
      entityId: postId,
      metadata: { title, slug, status },
    });

    const newPost = await queryOne<Post>('SELECT * FROM posts WHERE id = ?', [postId]);
    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating post:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
