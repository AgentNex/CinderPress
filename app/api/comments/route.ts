import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, Comment } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const status = searchParams.get('status');

    let sql = 'SELECT * FROM comments WHERE 1=1';
    const params: any[] = [];

    if (postId) {
      sql += ' AND post_id = ?';
      params.push(postId);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const comments = await query<Comment>(sql, params);
    return NextResponse.json({ comments });
  } catch (err: any) {
    console.error('Error fetching comments:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { post_id, author_name, author_email, body: commentBody } = body;

    if (!post_id || !author_name || !commentBody) {
      return NextResponse.json(
        { error: 'Missing required comment fields: name, message, post_id' },
        { status: 400 }
      );
    }

    const id = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO comments (id, post_id, author_name, author_email, body, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'approved', ?, ?)`,
      [id, post_id, author_name.trim(), author_email ? author_email.trim() : null, commentBody.trim(), now, now]
    );

    await trackEvent({
      name: 'comment_submitted',
      entityType: 'comment',
      entityId: id,
      metadata: { post_id, author_name },
    });

    const newComment = await queryOne<Comment>('SELECT * FROM comments WHERE id = ?', [id]);
    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating comment:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const now = new Date().toISOString();
    await execute('UPDATE comments SET status = ?, updated_at = ? WHERE id = ?', [status, now, id]);

    await trackEvent({
      name: 'comment_moderated',
      entityType: 'comment',
      entityId: id,
      metadata: { status },
    });

    const updated = await queryOne<Comment>('SELECT * FROM comments WHERE id = ?', [id]);
    return NextResponse.json({ comment: updated });
  } catch (err: any) {
    console.error('Error moderating comment:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
