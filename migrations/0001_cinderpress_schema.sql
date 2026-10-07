-- ==============================================================================
-- CINDERPRESS MIGRATION 0001: RELATIONAL PUBLISHING CORE SCHEMA
-- Compatible with Cloudflare D1 and SQLite3
-- ==============================================================================

-- 1. PUBLICATIONS TABLE
CREATE TABLE IF NOT EXISTS publications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_media_id TEXT,
    favicon_media_id TEXT,
    default_cover_media_id TEXT,
    locale TEXT NOT NULL DEFAULT 'en',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    theme_config TEXT, -- JSON configuration for styling
    social_links TEXT, -- JSON map
    seo_defaults TEXT, -- JSON map
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 2. AUTHORS TABLE
CREATE TABLE IF NOT EXISTS authors (
    id TEXT PRIMARY KEY,
    publication_id TEXT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    auth_user_id TEXT NOT NULL, -- Links to InsForge auth identity
    display_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    bio TEXT,
    avatar_media_id TEXT,
    website TEXT,
    social_links TEXT, -- JSON map
    role TEXT NOT NULL DEFAULT 'author', -- 'owner', 'editor', 'author', 'moderator'
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_authors_pub ON authors(publication_id);
CREATE INDEX IF NOT EXISTS idx_authors_auth_user ON authors(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);

-- 3. MEDIA ASSETS TABLE (Cloudinary references)
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    publication_id TEXT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    owner_auth_user_id TEXT NOT NULL,
    cloudinary_public_id TEXT NOT NULL,
    cloudinary_asset_id TEXT,
    resource_type TEXT NOT NULL DEFAULT 'image',
    secure_url TEXT NOT NULL,
    format TEXT,
    width INTEGER,
    height INTEGER,
    duration INTEGER,
    bytes INTEGER,
    alt_text TEXT,
    caption TEXT,
    credit TEXT,
    folder TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_media_pub ON media(publication_id);
CREATE INDEX IF NOT EXISTS idx_media_cld_id ON media(cloudinary_public_id);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    publication_id TEXT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE(publication_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_categories_pub ON categories(publication_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 5. TAGS TABLE
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    publication_id TEXT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE(publication_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_tags_pub ON tags(publication_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- 6. POSTS TABLE
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    publication_id TEXT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    dek TEXT,
    excerpt TEXT,
    content_json TEXT NOT NULL,
    content_html TEXT,
    cover_media_id TEXT REFERENCES media(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'archived'
    visibility TEXT NOT NULL DEFAULT 'public', -- 'public', 'private'
    published_at TEXT,
    scheduled_at TEXT,
    reading_time_minutes INTEGER NOT NULL DEFAULT 1,
    canonical_url TEXT,
    seo_title TEXT,
    seo_description TEXT,
    og_title TEXT,
    og_description TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    deleted_at TEXT,
    UNIQUE(publication_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_posts_pub_status ON posts(publication_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);

-- 7. POST REVISIONS TABLE
CREATE TABLE IF NOT EXISTS post_revisions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES authors(id),
    title TEXT NOT NULL,
    dek TEXT,
    excerpt TEXT,
    content_json TEXT NOT NULL,
    cover_media_id TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_revisions_post ON post_revisions(post_id);

-- 8. POST-CATEGORY JUNCTION TABLE
CREATE TABLE IF NOT EXISTS post_categories (
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY(post_id, category_id)
);
CREATE INDEX IF NOT EXISTS idx_post_cat_cat ON post_categories(category_id);

-- 9. POST-TAG JUNCTION TABLE
CREATE TABLE IF NOT EXISTS post_tags (
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY(post_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_post_tag_tag ON post_tags(tag_id);

-- 10. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'spam'
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_comments_post_status ON comments(post_id, status);

-- 11. AUDIT EVENTS TABLE
CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    actor_auth_user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events(created_at);

-- 12. FULL-TEXT SEARCH VIRTUAL TABLE
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
    id UNINDEXED,
    title,
    dek,
    excerpt,
    body_plain,
    tokenize = 'porter unicode61'
);
