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

    const now = new Date().toISOString();

    await execute(
      "UPDATE posts SET status = 'draft', updated_at = ? WHERE id = ?",
      [now, id]
    );

    // Remove from FTS5 public search index
    await execute('DELETE FROM posts_fts WHERE id = ?', [id]);

    await trackEvent({
      name: 'post_updated',
      entityType: 'post',
      entityId: id,
      metadata: { action: 'unpublish', title: post.title },
    });

    const updated = await queryOne<Post>('SELECT * FROM posts WHERE id = ?', [id]);
    return NextResponse.json({ post: updated, success: true });
  } catch (err: any) {
    console.error('Unpublish error:', err);
    return NextResponse.json({ error: err.message || 'Unpublishing failed' }, { status: 500 });
  }
}
