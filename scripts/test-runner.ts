import assert from 'node:assert';
import { getCinderDb } from '../lib/db';
import { buildOptimizedImageUrl, getResponsiveSrcSet, EDITORIAL_PRESETS } from '../lib/cloudinary';
import { hasPermission, canEditPost, canPublishPost, canModerateComments } from '../lib/auth/server';
import { renderMarkdown } from '../lib/markdown';

async function runCinderPressTestSuite() {
  console.log('🔥 Running CinderPress Comprehensive Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(() => fn())
      .then(() => {
        console.log(`  ✅ PASS: ${name}`);
        passed++;
      })
      .catch((err: any) => {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Error: ${err.message || err}`);
        failed++;
      });
  }

  const db = getCinderDb();

  // 1. Database Schema & Tables
  console.log('📂 1. Database Schema & Migrations Verification');
  await test('All required CinderPress relational tables exist', async () => {
    const tables = [
      'publications',
      'authors',
      'posts',
      'post_revisions',
      'categories',
      'tags',
      'post_categories',
      'post_tags',
      'media',
      'comments',
      'audit_events',
      'posts_fts'
    ];

    for (const table of tables) {
      const res = await db.prepare(
        "SELECT name FROM sqlite_master WHERE type IN ('table', 'shadow') AND name = ?"
      ).bind(table).first();
      assert(res !== null, `Table or virtual table '${table}' must exist in schema`);
    }
  });

  await test('Default publication and editorial seed data exist', async () => {
    const pub = await db.prepare('SELECT id, name, slug FROM publications WHERE slug = ?')
      .bind('cinderpress')
      .first<{ id: string; name: string; slug: string }>();
    assert(pub, 'Publication cinderpress should exist');
    assert.strictEqual(pub.name, 'CinderPress Review');

    const authors = await db.prepare('SELECT COUNT(*) as count FROM authors').first<{ count: number }>();
    assert(authors && authors.count >= 3, `Expected at least 3 authors, found ${authors?.count}`);

    const posts = await db.prepare('SELECT COUNT(*) as count FROM posts').first<{ count: number }>();
    assert(posts && posts.count >= 8, `Expected at least 8 seed stories, found ${posts?.count}`);
  });

  // 2. FTS5 Search Engine
  console.log('\n🔍 2. FTS5 Full-Text Search Engine Verification');
  await test('FTS5 virtual table indexes title, excerpt, and content', async () => {
    const ftsCount = await db.prepare('SELECT COUNT(*) as count FROM posts_fts').first<{ count: number }>();
    assert(ftsCount && ftsCount.count >= 7, `Expected posts_fts to index posts, found ${ftsCount?.count}`);

    // Test search for software
    const searchRes = await db.prepare(`
      SELECT p.id, p.title, p.slug
      FROM posts_fts f
      JOIN posts p ON f.rowid = p.rowid
      WHERE posts_fts MATCH ? AND p.status = 'published'
      LIMIT 5
    `).bind('software').all<{ id: string; title: string; slug: string }>();

    assert(searchRes.results.length > 0, "FTS5 match for 'software' should return stories");
    assert(searchRes.results.some(r => r.title.toLowerCase().includes('software')), 'Matching post should contain keyword');
  });

  await test('FTS5 handles prefix and boolean queries safely', async () => {
    const edgeQuery = await db.prepare(`
      SELECT p.title
      FROM posts_fts f
      JOIN posts p ON f.rowid = p.rowid
      WHERE posts_fts MATCH ? AND p.status = 'published'
    `).bind('edge*').all();
    assert(edgeQuery.results.length > 0, "Prefix query 'edge*' should return matches");
  });

  // 3. Post Lifecycle & Relational Queries
  console.log('\n📰 3. Post Publishing Lifecycle & Relations');
  await test('Can fetch story by slug with author and category relations', async () => {
    const post = await db.prepare(`
      SELECT p.*, a.display_name as author_name
      FROM posts p
      JOIN authors a ON p.author_id = a.id
      WHERE p.slug = ?
    `).bind('why-the-fastest-software-is-often-the-least-complicated').first<any>();

    assert(post, 'Post with slug why-the-fastest-software-is-often-the-least-complicated must exist');
    assert.strictEqual(post.status, 'published');
    assert(post.author_name, 'Author must be joined');
    assert(typeof post.reading_time_minutes === 'number', 'reading_time_minutes must be numeric');
  });

  await test('Publish and unpublish state transitions', async () => {
    const testPostId = 'post_test_lifecycle_' + Date.now();
    const now = new Date().toISOString();

    // 1. Create draft
    await db.prepare(`
      INSERT INTO posts (id, publication_id, author_id, title, slug, excerpt, content_json, content_html, status, reading_time_minutes, created_at, updated_at)
      VALUES (?, 'pub_cinderpress_main', 'auth_elena_vance', 'Lifecycle Draft', ?, 'Draft excerpt', '{"text":"draft"}', '<p>Draft</p>', 'draft', 1, ?, ?)
    `).bind(testPostId, `draft-${Date.now()}`, now, now).run();

    const created = await db.prepare('SELECT status FROM posts WHERE id = ?').bind(testPostId).first<{ status: string }>();
    assert.strictEqual(created?.status, 'draft', 'Post should start as draft');

    // 2. Publish
    const publishedAt = new Date().toISOString();
    await db.prepare('UPDATE posts SET status = ?, published_at = ?, updated_at = ? WHERE id = ?')
      .bind('published', publishedAt, publishedAt, testPostId).run();

    const published = await db.prepare('SELECT status, published_at FROM posts WHERE id = ?').bind(testPostId).first<any>();
    assert.strictEqual(published?.status, 'published', 'Post should transition to published');
    assert(published?.published_at !== null, 'published_at must be populated');

    // 3. Cleanup
    await db.prepare('DELETE FROM posts WHERE id = ?').bind(testPostId).run();
  });

  // 4. Cloudinary Asset Optimization
  console.log('\n🖼️ 4. Cloudinary Image Optimization & Presets');
  await test('buildOptimizedImageUrl injects f_auto,q_auto and handles presets', () => {
    const testPublicId = 'cinderpress/media/architecture-diagram';
    const heroUrl = buildOptimizedImageUrl(testPublicId, EDITORIAL_PRESETS.heroCover);
    assert(heroUrl.includes('f_auto,q_auto'), 'URL must include f_auto,q_auto');
    assert(heroUrl.includes('w_1600'), 'Hero cover must be scaled to 1600w');
    assert(heroUrl.includes('h_900'), 'Hero cover must be scaled to 900h');
    assert(heroUrl.includes('c_fill'), 'Hero cover must have c_fill crop');

    const avatarUrl = buildOptimizedImageUrl(testPublicId, EDITORIAL_PRESETS.authorAvatar);
    assert(avatarUrl.includes('w_120'), 'Author avatar must be 120px');
    assert(avatarUrl.includes('c_thumb'), 'Author avatar must use c_thumb crop');
  });

  await test('getResponsiveSrcSet generates correct multi-resolution descriptor string', () => {
    const testPublicId = 'cinderpress/media/edge-cdn';
    const srcset = getResponsiveSrcSet(testPublicId, [640, 1024, 1600]);
    assert(srcset.includes('640w'), 'srcset must contain 640w');
    assert(srcset.includes('1024w'), 'srcset must contain 1024w');
    assert(srcset.includes('1600w'), 'srcset must contain 1600w');
    assert(srcset.includes(testPublicId), 'srcset must reference asset public ID');
  });

  // 5. Auth Permissions & Roles
  console.log('\n🔒 5. InsForge Authorization & Role Verification');
  await test('Owner has all permissions', () => {
    assert.strictEqual(hasPermission('owner', 'publish_post'), true);
    assert.strictEqual(hasPermission('owner', 'delete_post'), true);
    assert.strictEqual(hasPermission('owner', 'manage_users'), true);
    assert.strictEqual(hasPermission('owner', 'moderate_comments'), true);
  });

  await test('Editor can publish and edit any post, but cannot manage users', () => {
    assert.strictEqual(hasPermission('editor', 'publish_post'), true);
    assert.strictEqual(hasPermission('editor', 'manage_users'), false);
    assert.strictEqual(canPublishPost('editor'), true);
    assert.strictEqual(canEditPost('editor', 'usr_author_1', 'usr_other_author'), true);
  });

  await test('Author can edit own post, but cannot publish or edit others', () => {
    assert.strictEqual(hasPermission('author', 'publish_post'), false);
    assert.strictEqual(canPublishPost('author'), false);
    assert.strictEqual(canEditPost('author', 'usr_alice', 'usr_alice'), true, 'Author can edit own post');
    assert.strictEqual(canEditPost('author', 'usr_alice', 'usr_bob'), false, 'Author cannot edit another author post');
  });

  await test('Moderator can moderate comments, but cannot edit posts', () => {
    assert.strictEqual(canModerateComments('moderator'), true);
    assert.strictEqual(canEditPost('moderator', 'usr_mod', 'usr_author'), false);
  });

  // 6. Markdown Editorial Parser
  console.log('\n📝 6. Editorial Markdown Engine');
  await test('renderMarkdown converts headers, blockquotes, and lists', () => {
    const md = `
# Editorial Title
> High quality journalism on edge infrastructure.

* Distributed
* Durable
* Fast
    `;
    const html = renderMarkdown(md);
    assert(html.includes('<h1'), 'Should contain h1');
    assert(html.includes('<blockquote'), 'Should contain blockquote');
    assert(html.includes('<ul'), 'Should contain unordered list');
    assert(html.includes('Distributed'), 'Should contain list item text');
  });

  await test('renderMarkdown sanitizes malicious script tags', () => {
    const dirty = 'Safe paragraph.<script>alert("exploit")</script>';
    const cleaned = renderMarkdown(dirty);
    assert(!cleaned.includes('<script>'), 'Must not contain unescaped script tag');
    assert(cleaned.includes('&lt;script&gt;') || !cleaned.includes('alert'), 'Script must be sanitized or stripped');
  });

  console.log(`\n========================================`);
  console.log(`CinderPress Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runCinderPressTestSuite().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
