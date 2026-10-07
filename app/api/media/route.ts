import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute, MediaAsset } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q');

    let sql = 'SELECT * FROM media WHERE 1=1';
    const params: any[] = [];

    if (search) {
      sql += ' AND (alt_text LIKE ? OR caption LIKE ? OR cloudinary_public_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC LIMIT 50';

    const assets = await query<MediaAsset>(sql, params);
    return NextResponse.json({ assets });
  } catch (err: any) {
    console.error('Error fetching media:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cloudinary_public_id,
      secure_url,
      format,
      width,
      height,
      bytes,
      alt_text,
      caption,
      credit,
      owner_auth_user_id,
    } = body;

    if (!cloudinary_public_id || !secure_url) {
      return NextResponse.json(
        { error: 'Missing required cloudinary_public_id or secure_url' },
        { status: 400 }
      );
    }

    const id = `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const pub = await queryOne<{ id: string }>('SELECT id FROM publications LIMIT 1');
    const pubId = pub?.id || 'pub_cinderpress_main';
    const owner = owner_auth_user_id || 'usr_editorial_team';

    await execute(
      `INSERT INTO media (
        id, publication_id, owner_auth_user_id, cloudinary_public_id,
        secure_url, format, width, height, bytes, alt_text, caption, credit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        pubId,
        owner,
        cloudinary_public_id,
        secure_url,
        format || 'jpg',
        width || 1200,
        height || 800,
        bytes || 0,
        alt_text || '',
        caption || '',
        credit || '',
      ]
    );

    const asset = await queryOne<MediaAsset>('SELECT * FROM media WHERE id = ?', [id]);

    await trackEvent({
      name: 'media_upload',
      actorAuthUserId: owner,
      entityType: 'media',
      entityId: id,
      metadata: { public_id: cloudinary_public_id },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating media record:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
