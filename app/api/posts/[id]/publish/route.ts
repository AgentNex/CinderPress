import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, Post } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const post = await queryOne<Post>('SELECT * FROM posts WHERE id = ?', [id]);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (!post.title || !post.title.trim()) {
      return NextResponse.json({ error: 'Cannot publish a story without a title' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const publishedAt = post.published_at || now;

    await execute(
      "UPDATE posts SET status = 'published', published_at = ?, updated_at = ? WHERE id = ?",
      [publishedAt, now, id]
    );

    // Sync FTS5 search index
    await execute('DELETE FROM posts_fts WHERE id = ?', [id]);
    const plainText = `${post.title} ${post.dek || ''} ${post.excerpt || ''}`;
    await execute(
      'INSERT INTO posts_fts (id, title, dek, excerpt, body_plain) VALUES (?, ?, ?, ?, ?)',
      [id, post.title, post.dek || '', post.excerpt || '', plainText]
    );

    await trackEvent({
      name: 'post_published',
      entityType: 'post',
      entityId: id,
      metadata: { title: post.title, slug: post.slug },
    });

    const updated = await queryOne<Post>('SELECT * FROM posts WHERE id = ?', [id]);
    return NextResponse.json({ post: updated, success: true });
  } catch (err: any) {
    console.error('Publish error:', err);
    return NextResponse.json({ error: err.message || 'Publishing failed' }, { status: 500 });
  }
}
