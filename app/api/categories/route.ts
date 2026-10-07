import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, Category } from '@/lib/db';

export async function GET() {
  try {
    const categories = await query<Category & { post_count: number }>(`
      SELECT c.*, COUNT(pc.post_id) as post_count
      FROM categories c
      LEFT JOIN post_categories pc ON c.id = pc.category_id
      LEFT JOIN posts p ON pc.post_id = p.id AND p.status = 'published' AND p.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    return NextResponse.json({ categories });
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const pub = await queryOne<{ id: string }>('SELECT id FROM publications LIMIT 1');
    const pubId = pub?.id || 'pub_cinderpress_main';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await execute(
      'INSERT INTO categories (id, publication_id, name, slug, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, pubId, name.trim(), slug, description || null, now, now]
    );

    const category = await queryOne<Category>('SELECT * FROM categories WHERE id = ?', [id]);
    return NextResponse.json({ category }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating category:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
