import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

async function exportPages() {
  console.log('📦 Starting CinderPress Cloudflare Pages Bundle Preparation...\n');

  const outDir = path.resolve(process.cwd(), 'out_pages');
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Copy static assets from .next/static
  const nextStaticSource = path.resolve(process.cwd(), '.next/static');
  const nextStaticTarget = path.join(outDir, '_next/static');
  if (fs.existsSync(nextStaticSource)) {
    fs.mkdirSync(path.dirname(nextStaticTarget), { recursive: true });
    fs.cpSync(nextStaticSource, nextStaticTarget, { recursive: true });
    console.log('✅ Copied .next/static client bundles to out_pages/_next/static');
  } else {
    console.warn('⚠️ Warning: .next/static not found! Make sure npm run build was executed.');
  }

  // 2. Read database records for all routes
  const dbPath = path.resolve(process.cwd(), 'db/cinderpress.sqlite');
  const db = new DatabaseSync(dbPath);

  const posts = db.prepare("SELECT slug FROM posts WHERE status = 'published'").all() as { slug: string }[];
  const categories = db.prepare('SELECT slug FROM categories').all() as { slug: string }[];
  const tags = db.prepare('SELECT slug FROM tags').all() as { slug: string }[];
  const authors = db.prepare('SELECT slug FROM authors').all() as { slug: string }[];

  console.log(`📊 Found ${posts.length} stories, ${categories.length} categories, ${tags.length} tags, ${authors.length} authors.`);

  // 3. Define all URLs to fetch from local server
  const routes: { urlPath: string; filePath: string }[] = [
    { urlPath: '/', filePath: 'index.html' },
    { urlPath: '/stories', filePath: 'stories/index.html' },
    { urlPath: '/about', filePath: 'about/index.html' },
    { urlPath: '/search', filePath: 'search/index.html' },
    { urlPath: '/auth/sign-in', filePath: 'auth/sign-in/index.html' },
    { urlPath: '/auth/sign-up', filePath: 'auth/sign-up/index.html' },
    { urlPath: '/studio', filePath: 'studio/index.html' },
    { urlPath: '/studio/posts', filePath: 'studio/posts/index.html' },
    { urlPath: '/studio/posts/new', filePath: 'studio/posts/new/index.html' },
    { urlPath: '/studio/media', filePath: 'studio/media/index.html' },
    { urlPath: '/studio/categories', filePath: 'studio/categories/index.html' },
    { urlPath: '/studio/tags', filePath: 'studio/tags/index.html' },
    { urlPath: '/studio/comments', filePath: 'studio/comments/index.html' },
    { urlPath: '/studio/settings', filePath: 'studio/settings/index.html' },
    { urlPath: '/rss.xml', filePath: 'rss.xml' },
    { urlPath: '/sitemap.xml', filePath: 'sitemap.xml' },
    { urlPath: '/robots.txt', filePath: 'robots.txt' },
  ];

  for (const p of posts) {
    routes.push({ urlPath: `/stories/${p.slug}`, filePath: `stories/${p.slug}/index.html` });
  }
  for (const c of categories) {
    routes.push({ urlPath: `/category/${c.slug}`, filePath: `category/${c.slug}/index.html` });
  }
  for (const t of tags) {
    routes.push({ urlPath: `/tag/${t.slug}`, filePath: `tag/${t.slug}/index.html` });
  }
  for (const a of authors) {
    routes.push({ urlPath: `/author/${a.slug}`, filePath: `author/${a.slug}/index.html` });
  }

  // 4. Fetch routes from running local server
  const baseUrl = 'http://127.0.0.1:3000';
  let successCount = 0;

  for (const r of routes) {
    try {
      const res = await fetch(`${baseUrl}${r.urlPath}`);
      if (res.ok) {
        const text = await res.text();
        const targetFile = path.join(outDir, r.filePath);
        fs.mkdirSync(path.dirname(targetFile), { recursive: true });
        fs.writeFileSync(targetFile, text, 'utf-8');
        successCount++;
      } else {
        console.error(`❌ HTTP ${res.status} fetching ${r.urlPath}`);
      }
    } catch (err: any) {
      console.error(`❌ Error fetching ${r.urlPath}:`, err.message);
    }
  }

  console.log(`✅ Successfully exported ${successCount}/${routes.length} pages to out_pages/`);

  // 5. Generate full embedded posts data for Cloudflare Edge Worker
  const allPosts = db.prepare(`
    SELECT p.*, a.display_name as author_name, a.bio as author_bio, a.slug as author_slug,
           m.secure_url as cover_url, m.alt_text as cover_alt
    FROM posts p
    JOIN authors a ON p.author_id = a.id
    LEFT JOIN media m ON p.cover_media_id = m.id
    ORDER BY p.published_at DESC
  `).all();

  const allCategories = db.prepare('SELECT * FROM categories').all();
  const allTags = db.prepare('SELECT * FROM tags').all();

  // 6. Create Edge _worker.js for Cloudflare Pages Advanced Mode
  const workerCode = `
// ==============================================================================
// CINDERPRESS CLOUDFLARE PAGES EDGE WORKER
// Handles dynamic APIs, search, and serves pre-rendered assets via env.ASSETS
// ==============================================================================

const SEED_POSTS = ${JSON.stringify(allPosts, null, 2)};
const SEED_CATEGORIES = ${JSON.stringify(allCategories, null, 2)};
const SEED_TAGS = ${JSON.stringify(allTags, null, 2)};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // CORS headers for API requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. API: /api/posts
    if (pathname === '/api/posts') {
      const status = searchParams.get('status') || 'published';
      const category = searchParams.get('category');
      const tag = searchParams.get('tag');

      let filtered = SEED_POSTS.filter(p => !p.deleted_at);
      if (status !== 'all') {
        filtered = filtered.filter(p => p.status === status);
      }
      return Response.json({ posts: filtered }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. API: /api/posts/:id
    if (pathname.startsWith('/api/posts/')) {
      const parts = pathname.split('/');
      const idOrSlug = parts[3];
      const post = SEED_POSTS.find(p => p.id === idOrSlug || p.slug === idOrSlug);
      if (post) {
        return Response.json({ post }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return Response.json({ error: 'Post not found' }, { status: 404, headers: corsHeaders });
    }

    // 3. API: /api/categories
    if (pathname === '/api/categories') {
      return Response.json({ categories: SEED_CATEGORIES }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 4. API: /api/tags
    if (pathname === '/api/tags') {
      return Response.json({ tags: SEED_TAGS }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 5. API: /api/search
    if (pathname === '/api/search') {
      const q = (searchParams.get('q') || '').toLowerCase().trim();
      if (!q) {
        return Response.json({ results: [] }, { headers: corsHeaders });
      }
      const matches = SEED_POSTS.filter(p => 
        p.status === 'published' &&
        (p.title.toLowerCase().includes(q) || (p.excerpt && p.excerpt.toLowerCase().includes(q)) || (p.content_html && p.content_html.toLowerCase().includes(q)))
      );
      return Response.json({ results: matches }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 6. API: /api/comments
    if (pathname === '/api/comments') {
      return Response.json({ comments: [] }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 7. API: /api/auth/me
    if (pathname === '/api/auth/me') {
      return Response.json({ author: null }, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 8. Fallback to Cloudflare Pages static assets
    if (env.ASSETS) {
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status !== 404) {
        return assetRes;
      }
      // If 404, attempt serving clean URL index.html (e.g. /stories -> /stories/index.html)
      if (!pathname.includes('.')) {
        const cleanUrl = new URL(pathname.endsWith('/') ? pathname + 'index.html' : pathname + '/index.html', request.url);
        const cleanRes = await env.ASSETS.fetch(new Request(cleanUrl, request));
        if (cleanRes.status !== 404) {
          return cleanRes;
        }
      }
      return assetRes;
    }

    return new Response('Not found', { status: 404 });
  }
};
`;

  fs.writeFileSync(path.join(outDir, '_worker.js'), workerCode, 'utf-8');
  console.log('✅ Generated Cloudflare Pages Advanced _worker.js');

  console.log('\n🎉 Export complete! out_pages/ is ready for Cloudflare Pages deployment.');
}

exportPages().catch(err => {
  console.error('Fatal export error:', err);
  process.exit(1);
});
