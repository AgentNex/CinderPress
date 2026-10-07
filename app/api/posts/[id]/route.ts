import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, Post, PostWithRelations, Author, MediaAsset, Category, Tag, PostRevision } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';

function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Support lookup by either ID or slug
    const post = await queryOne<Post>(
      'SELECT * FROM posts WHERE (id = ? OR slug = ?) AND deleted_at IS NULL',
      [id, id]
    );

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const [author, cover_media, categories, tags, revisions] = await Promise.all([
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
      query<PostRevision>(
        'SELECT id, post_id, author_id, title, dek, excerpt, cover_media_id, created_at FROM post_revisions WHERE post_id = ? ORDER BY created_at DESC LIMIT 15',
        [post.id]
      ),
    ]);

    const enrichedPost: PostWithRelations & { revisions: PostRevision[] } = {
      ...post,
      author: author || undefined,
      cover_media,
      categories,
      tags,
      revisions,
    };

    return NextResponse.json({ post: enrichedPost });
  } catch (err: any) {
    console.error('Error fetching post:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const existing = await queryOne<Post>('SELECT * FROM posts WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const title = body.title !== undefined ? body.title : existing.title;
    const slug = body.slug !== undefined ? body.slug : existing.slug;
    const dek = body.dek !== undefined ? body.dek : existing.dek;
    const excerpt = body.excerpt !== undefined ? body.excerpt : existing.excerpt;
    const content_json = body.content_json !== undefined
      ? (typeof body.content_json === 'string' ? body.content_json : JSON.stringify(body.content_json))
      : existing.content_json;
    const content_html = body.content_html !== undefined ? body.content_html : existing.content_html;
    const cover_media_id = body.cover_media_id !== undefined ? body.cover_media_id : existing.cover_media_id;
    const status = body.status !== undefined ? body.status : existing.status;
    const visibility = body.visibility !== undefined ? body.visibility : existing.visibility;
    const author_id = body.author_id !== undefined ? body.author_id : existing.author_id;

    const readingTime = calculateReadingTime((excerpt || '') + ' ' + (title || ''));
    const now = new Date().toISOString();

    await execute(
      `UPDATE posts SET
        title = ?, slug = ?, dek = ?, excerpt = ?, content_json = ?,
        content_html = ?, cover_media_id = ?, status = ?, visibility = ?,
        author_id = ?, reading_time_minutes = ?, updated_at = ?
       WHERE id = ?`,
      [
        title, slug, dek, excerpt, content_json,
        content_html, cover_media_id, status, visibility,
        author_id, readingTime, now, id
      ]
    );

    // Record revision on content update
    const revId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await execute(
      `INSERT INTO post_revisions (id, post_id, author_id, title, dek, excerpt, content_json, cover_media_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [revId, id, author_id, title, dek, excerpt, content_json, cover_media_id, now]
    );

    // Update categories if provided
    if (Array.isArray(body.category_ids)) {
      await execute('DELETE FROM post_categories WHERE post_id = ?', [id]);
      for (const catId of body.category_ids) {
        await execute('INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)', [id, catId]);
      }
    }

    // Update tags if provided
    if (Array.isArray(body.tag_ids)) {
      await execute('DELETE FROM post_tags WHERE post_id = ?', [id]);
      for (const tagId of body.tag_ids) {
        await execute('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)', [id, tagId]);
      }
    }

    // Sync FTS index
    await execute('DELETE FROM posts_fts WHERE id = ?', [id]);
    if (status === 'published') {
      const plainText = `${title} ${dek || ''} ${excerpt || ''}`;
      await execute('INSERT INTO posts_fts (id, title, dek, excerpt, body_plain) VALUES (?, ?, ?, ?, ?)', [
        id, title, dek || '', excerpt || '', plainText
      ]);
    }

    await trackEvent({
      name: 'post_updated',
      entityType: 'post',
      entityId: id,
      metadata: { title, slug, status },
    });

    const updated = await queryOne<Post>('SELECT * FROM posts WHERE id = ?', [id]);
    return NextResponse.json({ post: updated });
  } catch (err: any) {
    console.error('Error updating post:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const now = new Date().toISOString();

    // Soft delete
    await execute('UPDATE posts SET deleted_at = ?, status = "archived" WHERE id = ?', [now, id]);
    await execute('DELETE FROM posts_fts WHERE id = ?', [id]);

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting post:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
