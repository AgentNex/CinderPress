import { NextResponse } from 'next/server';
import { query, Post, Category } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const [posts, categories] = await Promise.all([
    query<Post>("SELECT slug, updated_at, published_at FROM posts WHERE status = 'published' AND deleted_at IS NULL"),
    query<Category>('SELECT slug FROM categories'),
  ]);

  const postUrls = posts
    .map(
      (p) => `
  <url>
    <loc>${baseUrl}/stories/${p.slug}</loc>
    <lastmod>${new Date(p.updated_at || p.published_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('');

  const categoryUrls = categories
    .map(
      (c) => `
  <url>
    <loc>${baseUrl}/category/${c.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/stories</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <priority>0.5</priority>
  </url>
  ${postUrls}
  ${categoryUrls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
