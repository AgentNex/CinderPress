import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, Tag } from '@/lib/db';

export async function GET() {
  try {
    const tags = await query<Tag & { post_count: number }>(`
      SELECT t.*, COUNT(pt.post_id) as post_count
      FROM tags t
      LEFT JOIN post_tags pt ON t.id = pt.tag_id
      LEFT JOIN posts p ON pt.post_id = p.id AND p.status = 'published' AND p.deleted_at IS NULL
      GROUP BY t.id
      ORDER BY post_count DESC, t.name ASC
    `);

    return NextResponse.json({ tags });
  } catch (err: any) {
    console.error('Error fetching tags:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    const pub = await queryOne<{ id: string }>('SELECT id FROM publications LIMIT 1');
    const pubId = pub?.id || 'pub_cinderpress_main';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await execute(
      'INSERT OR IGNORE INTO tags (id, publication_id, name, slug, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, pubId, name.trim(), slug, now]
    );

    const tag = await queryOne<Tag>('SELECT * FROM tags WHERE slug = ?', [slug]);
    return NextResponse.json({ tag }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating tag:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
