import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, Author } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ author: null }, { status: 200 });
    }

    let author = await queryOne<Author>(
      'SELECT * FROM authors WHERE auth_user_id = ?',
      [userId]
    );

    // If author doesn't exist yet, automatically provision author profile
    if (!author) {
      const authorId = `auth_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const pub = await queryOne<{ id: string }>('SELECT id FROM publications LIMIT 1');
      const pubId = pub?.id || 'pub_cinderpress_main';
      const slug = `author-${userId.slice(-6)}`;

      await execute(
        `INSERT INTO authors (id, publication_id, auth_user_id, display_name, slug, role)
         VALUES (?, ?, ?, ?, ?, 'author')`,
        [authorId, pubId, userId, 'Editorial Contributor', slug]
      );

      author = await queryOne<Author>('SELECT * FROM authors WHERE id = ?', [authorId]);
    }

    return NextResponse.json({ author });
  } catch (err: any) {
    console.error('Error fetching author profile:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
