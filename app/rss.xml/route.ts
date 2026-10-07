import { NextResponse } from 'next/server';
import { query, Post } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const posts = await query<Post>(`
    SELECT * FROM posts 
    WHERE status = 'published' AND deleted_at IS NULL 
    ORDER BY published_at DESC LIMIT 30
  `);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const itemsXml = posts
    .map(
      (p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${baseUrl}/stories/${p.slug}</link>
      <guid isPermaLink="true">${baseUrl}/stories/${p.slug}</guid>
      <description><![CDATA[${p.dek || p.excerpt || ''}]]></description>
      <pubDate>${p.published_at ? new Date(p.published_at).toUTCString() : ''}</pubDate>
    </item>`
    )
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>CinderPress Review</title>
    <link>${baseUrl}</link>
    <description>An independent journal of systems architecture and interface craftsmanship.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
