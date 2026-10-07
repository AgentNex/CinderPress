-- ==============================================================================
-- CINDERPRESS MIGRATION 0002: EDITORIAL CONTENT SEED
-- ==============================================================================

-- 1. PUBLICATION SEED
INSERT OR IGNORE INTO publications (
    id, name, slug, description, locale, timezone, theme_config, social_links, seo_defaults
) VALUES (
    'pub_cinderpress_main',
    'CinderPress Review',
    'cinderpress',
    'An independent journal of systems architecture, interface craftsmanship, and edge engineering.',
    'en',
    'America/New_York',
    '{"accentColor": "#F48120", "readingWidth": 720, "fontSerif": false}',
    '{"x": "https://x.com/cinderpress", "github": "https://github.com/cinderpress"}',
    '{"defaultTitle": "CinderPress Review — Independent Systems & Editorial Publishing", "defaultDescription": "A calm, precise journal on software engineering, edge databases, and interface craft."}'
);

-- 2. AUTHORS SEED
INSERT OR IGNORE INTO authors (
    id, publication_id, auth_user_id, display_name, slug, bio, website, role
) VALUES 
(
    'auth_elena_vance',
    'pub_cinderpress_main',
    'usr_system_editor',
    'Elena Vance',
    'elena-vance',
    'Editor-in-Chief. Writing on systems architecture, digital ergonomics, and publishing craftsmanship.',
    'https://elenavance.dev',
    'owner'
),
(
    'auth_marcus_thorne',
    'pub_cinderpress_main',
    'usr_system_author1',
    'Marcus Thorne',
    'marcus-thorne',
    'Staff Engineer and essayist investigating edge infrastructure and database distributed semantics.',
    'https://marcusthorne.io',
    'editor'
),
(
    'auth_maya_lin',
    'pub_cinderpress_main',
    'usr_system_author2',
    'Dr. Maya Lin',
    'maya-lin',
    'Researcher in human-computer typography, cognitive load, and document preservation.',
    'https://mayalin.design',
    'author'
);

-- 3. CATEGORIES SEED
INSERT OR IGNORE INTO categories (id, publication_id, name, slug, description) VALUES
('cat_architecture', 'pub_cinderpress_main', 'Architecture', 'architecture', 'System design, distributed state, and clean engineering boundaries.'),
('cat_edge', 'pub_cinderpress_main', 'Edge Computing', 'edge-computing', 'Workers, global latency reduction, and edge data persistence.'),
('cat_typography', 'pub_cinderpress_main', 'Typography & UX', 'typography-ux', 'Prose readability, typographic rhythm, and tactile interfaces.'),
('cat_deep_systems', 'pub_cinderpress_main', 'Deep Systems', 'deep-systems', 'Low-level performance, database internals, and network physics.'),
('cat_cultural_signals', 'pub_cinderpress_main', 'Cultural Signals', 'cultural-signals', 'Essays on modern software craftsmanship and technological longevity.');

-- 4. TAGS SEED
INSERT OR IGNORE INTO tags (id, publication_id, name, slug) VALUES
('tag_cloudflare', 'pub_cinderpress_main', 'Cloudflare', 'cloudflare'),
('tag_d1', 'pub_cinderpress_main', 'D1', 'd1'),
('tag_performance', 'pub_cinderpress_main', 'Performance', 'performance'),
('tag_design_systems', 'pub_cinderpress_main', 'Design Systems', 'design-systems'),
('tag_editorial', 'pub_cinderpress_main', 'Editorial', 'editorial'),
('tag_typography', 'pub_cinderpress_main', 'Typography', 'typography');

-- 5. MEDIA SEED (Cloudinary references)
INSERT OR IGNORE INTO media (
    id, publication_id, owner_auth_user_id, cloudinary_public_id, secure_url, format, width, height, alt_text, caption
) VALUES
(
    'med_cover_fast_software',
    'pub_cinderpress_main',
    'usr_system_editor',
    'cinderpress/samples/architectural-geometric-terminal',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    'jpg', 1600, 900,
    'Clean industrial circuits and semiconductor geometry',
    'Hardware abstraction layers reduced to crystalline simplicity.'
),
(
    'med_cover_industrial_design',
    'pub_cinderpress_main',
    'pub_cinderpress_main',
    'cinderpress/samples/industrial-layout-grid',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1600&q=80',
    'jpg', 1600, 900,
    'Architectural blueprints and drafting tools arranged geometrically',
    'The physical artifacts that guided early computational drafting.'
),
(
    'med_cover_edge_databases',
    'pub_cinderpress_main',
    'usr_system_author1',
    'cinderpress/samples/fiber-network-global',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    'jpg', 1600, 900,
    'Satellite view of global connectivity grids',
    'Low-latency data topologies across planetary edge nodes.'
),
(
    'med_cover_typography_physics',
    'pub_cinderpress_main',
    'usr_system_author2',
    'cinderpress/samples/movable-type-lead',
    'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1600&q=80',
    'jpg', 1600, 900,
    'Vintage lead moveable type letterpress sorts',
    'Sub-millimeter metrics of lead typography influencing contemporary web reading.'
),
(
    'med_cover_boundaries',
    'pub_cinderpress_main',
    'usr_system_editor',
    'cinderpress/samples/concrete-structure-shadows',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    'jpg', 1600, 900,
    'Monolithic architectural planes meeting at crisp angles',
    'Clean boundaries in physical and digital structures.'
);

-- 6. POSTS SEED
INSERT OR IGNORE INTO posts (
    id, publication_id, author_id, title, slug, dek, excerpt,
    content_json, content_html, cover_media_id, status, visibility,
    published_at, reading_time_minutes, canonical_url, seo_title, seo_description
) VALUES
(
    'post_001_fast_software',
    'pub_cinderpress_main',
    'auth_elena_vance',
    'Why the Fastest Software is Often the Least Complicated',
    'why-the-fastest-software-is-often-the-least-complicated',
    'Performance is not an optimization pass performed at the finish line. It is the consequence of choosing fewer abstractions.',
    'In modern computing, speed has become synonymous with elaborate caching layers and asynchronous choreography. But the fastest systems in production are rarely those with the most sophisticated architectures—they are the ones that simply do less work.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"In modern software engineering, speed has become synonymous with elaborate caching layers, distributed message brokers, and complex asynchronous choreography. Yet, when profiling production systems under real load, an uncomfortable truth repeatedly presents itself: the fastest systems are rarely those with the most sophisticated architectures. They are simply the systems that refuse to do unnecessary work."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The Illusion of Free Abstraction"}]},{"type":"paragraph","content":[{"type":"text","text":"Every layer of abstraction promises leverage at the expense of invisible friction. We wrap database queries in three tiers of ORMs, translate relational tuples into object graphs, serialize them to JSON, deserialize them in a worker thread, and pass them across an RPC boundary—only to reconstruct the original query parameters on the other side."}]},{"type":"paragraph","content":[{"type":"text","text":"When CinderPress was designed, we took the opposite stance: let the relational engine do relational work, let Cloudflare edge workers route with zero-hop cold starts, and let Cloudinary handle media transcoding at the CDN periphery. By strictly bounding responsibilities, our execution path becomes linear, legible, and blindingly fast."}]}]}',
    '<p>In modern software engineering, speed has become synonymous with elaborate caching layers, distributed message brokers, and complex asynchronous choreography. Yet, when profiling production systems under real load, an uncomfortable truth repeatedly presents itself: the fastest systems are rarely those with the most sophisticated architectures. They are simply the systems that refuse to do unnecessary work.</p><h2>The Illusion of Free Abstraction</h2><p>Every layer of abstraction promises leverage at the expense of invisible friction. We wrap database queries in three tiers of ORMs, translate relational tuples into object graphs, serialize them to JSON, deserialize them in a worker thread, and pass them across an RPC boundary—only to reconstruct the original query parameters on the other side.</p><p>When CinderPress was designed, we took the opposite stance: let the relational engine do relational work, let Cloudflare edge workers route with zero-hop cold starts, and let Cloudinary handle media transcoding at the CDN periphery. By strictly bounding responsibilities, our execution path becomes linear, legible, and blindingly fast.</p>',
    'med_cover_fast_software',
    'published',
    'public',
    '2026-09-28T14:30:00Z',
    5,
    'https://cinderpress.com/stories/why-the-fastest-software-is-often-the-least-complicated',
    'Why the Fastest Software is Often the Least Complicated — CinderPress Review',
    'Performance is not an optimization pass. It is the consequence of choosing fewer abstractions.'
),
(
    'post_002_industrial_design',
    'pub_cinderpress_main',
    'auth_maya_lin',
    'The Quiet Return of Industrial Interface Design',
    'the-quiet-return-of-industrial-interface-design',
    'After a decade of ethereal glassmorphism and pastel SaaS gradients, tools built for serious work are embracing high-contrast tactile utility.',
    'Software used to feel like physical instruments—precise, unyielding, and legible in high glare. Today, a new wave of editorial and developer tools is discarding blurry gradients in favor of hairline borders and deep ink.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"For nearly a decade, user interface design was dominated by ethereal translucency, neon glow effects, and pastel gradients that seemed engineered to photograph well on social media rather than withstand eight hours of continuous human focus. But a noticeable counter-revolution has taken root."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Instruments vs Toys"}]},{"type":"paragraph","content":[{"type":"text","text":"Professional tools—from oscilloscopes and CNC controllers to typesetting consoles—share a common aesthetic grammar: high contrast, strict geometric grids, immediate tactile response, and zero decorative noise that competes with primary data."}]},{"type":"paragraph","content":[{"type":"text","text":"CinderPress embodies this shift. The UI uses warm paper tones, deep carbon ink, and disciplined industrial amber accents. It respects the reader’s eye and the author’s cognition."}]}]}',
    '<p>For nearly a decade, user interface design was dominated by ethereal translucency, neon glow effects, and pastel gradients that seemed engineered to photograph well on social media rather than withstand eight hours of continuous human focus. But a noticeable counter-revolution has taken root.</p><h2>Instruments vs Toys</h2><p>Professional tools—from oscilloscopes and CNC controllers to typesetting consoles—share a common aesthetic grammar: high contrast, strict geometric grids, immediate tactile response, and zero decorative noise that competes with primary data.</p><p>CinderPress embodies this shift. The UI uses warm paper tones, deep carbon ink, and disciplined industrial amber accents. It respects the reader’s eye and the author’s cognition.</p>',
    'med_cover_industrial_design',
    'published',
    'public',
    '2026-09-30T10:15:00Z',
    6,
    'https://cinderpress.com/stories/the-quiet-return-of-industrial-interface-design',
    'The Quiet Return of Industrial Interface Design — CinderPress Review',
    'Why serious productivity tools are trading gradient blobs for hairline precision and typography.'
),
(
    'post_003_edge_databases',
    'pub_cinderpress_main',
    'auth_marcus_thorne',
    'Inside the New Generation of Edge-Native Databases',
    'inside-the-new-generation-of-edge-native-databases',
    'How SQLite running at the planetary perimeter with Cloudflare D1 fundamentally rewrites the physics of data replication.',
    'Moving compute to the edge was the easy part; the challenge has always been the speed of light to the primary database. D1 solves this with distributed read replicas and transactional coordination.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"For twenty years, web architecture followed a predictable geography: your application servers lived in Virginia or Frankfurt, huddled within single-digit milliseconds of a centralized relational database. When users from Tokyo or Melbourne requested a page, they paid the unavoidable tax of round-trip fiber optics across oceans."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"The Edge-State Conundrum"}]},{"type":"paragraph","content":[{"type":"text","text":"Cloudflare Workers changed compute distribution by running JavaScript isolates in hundreds of points of presence worldwide. However, if every Worker had to query a database in us-east-1, the edge was merely a smart proxy. Cloudflare D1 shifts this equation by bringing SQLite directly into the edge fabric."}]}]}',
    '<p>For twenty years, web architecture followed a predictable geography: your application servers lived in Virginia or Frankfurt, huddled within single-digit milliseconds of a centralized relational database. When users from Tokyo or Melbourne requested a page, they paid the unavoidable tax of round-trip fiber optics across oceans.</p><h2>The Edge-State Conundrum</h2><p>Cloudflare Workers changed compute distribution by running JavaScript isolates in hundreds of points of presence worldwide. However, if every Worker had to query a database in us-east-1, the edge was merely a smart proxy. Cloudflare D1 shifts this equation by bringing SQLite directly into the edge fabric.</p>',
    'med_cover_edge_databases',
    'published',
    'public',
    '2026-10-02T08:00:00Z',
    7,
    'https://cinderpress.com/stories/inside-the-new-generation-of-edge-native-databases',
    'Inside the New Generation of Edge-Native Databases — CinderPress Review',
    'How SQLite at the planetary edge transforms publishing performance.'
),
(
    'post_004_typography_physics',
    'pub_cinderpress_main',
    'auth_maya_lin',
    'Reading Measure and the Physics of Longform Typography',
    'reading-measure-and-the-physics-of-longform-typography',
    'The optical mechanics of saccadic jumps, optimal character measures, and why 700px remains the golden threshold for sustained comprehension.',
    'When a line of text exceeds 80 characters, the human ocular saccade struggles to return accurately to the next line. We examine the empirical science of reading measures.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"When the printing press standardized typographic layout in sixteenth-century Europe, Aldus Manutius and his contemporaries did not choose page margins arbitrarily. They observed that the human eye moves across a line of text in rapid jumps called saccades, followed by brief cognitive fixations."}]},{"type":"paragraph","content":[{"type":"text","text":"If a measure is too wide—exceeding 75 to 80 characters—the return sweep of the eye frequently loses its anchor, causing re-reading fatigue. In digital reading, this threshold translates to roughly 680 to 720 pixels at standard reading distances."}]}]}',
    '<p>When the printing press standardized typographic layout in sixteenth-century Europe, Aldus Manutius and his contemporaries did not choose page margins arbitrarily. They observed that the human eye moves across a line of text in rapid jumps called saccades, followed by brief cognitive fixations.</p><p>If a measure is too wide—exceeding 75 to 80 characters—the return sweep of the eye frequently loses its anchor, causing re-reading fatigue. In digital reading, this threshold translates to roughly 680 to 720 pixels at standard reading distances.</p>',
    'med_cover_typography_physics',
    'published',
    'public',
    '2026-10-03T16:45:00Z',
    4,
    'https://cinderpress.com/stories/reading-measure-and-the-physics-of-longform-typography',
    'Reading Measure and the Physics of Longform Typography — CinderPress Review',
    'The optical mechanics of character counts, line spacing, and eye fatigue.'
),
(
    'post_005_boundaries',
    'pub_cinderpress_main',
    'auth_elena_vance',
    'Architectural Boundaries: Decoupling Media, Identity, and State',
    'architectural-boundaries-decoupling-media-identity-and-state',
    'Why coupling authentication to your application database or treating your CMS like a binary file server degrades long-term resilience.',
    'Monolithic architectures often blur the lines between identity verification, relational metadata, and binary media assets. Separating these three concerns creates an untouchable triad of reliability.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"In the early days of CMS architectures, a single database table would frequently contain user passwords, session tokens, article copy, and even base64-encoded image payloads. Over time, this coupling created nightmares for scaling, security auditing, and continuous deployment."}]},{"type":"paragraph","content":[{"type":"text","text":"In CinderPress, the triad is strictly decoupled: InsForge handles cryptographically sound identity and sessions; Cloudflare D1 houses pure relational metadata and relational graphs; Cloudinary manages planetary media transcoding, adaptive formats, and delivery. None can compromise or bottleneck the other."}]}]}',
    '<p>In the early days of CMS architectures, a single database table would frequently contain user passwords, session tokens, article copy, and even base64-encoded image payloads. Over time, this coupling created nightmares for scaling, security auditing, and continuous deployment.</p><p>In CinderPress, the triad is strictly decoupled: InsForge handles cryptographically sound identity and sessions; Cloudflare D1 houses pure relational metadata and relational graphs; Cloudinary manages planetary media transcoding, adaptive formats, and delivery. None can compromise or bottleneck the other.</p>',
    'med_cover_boundaries',
    'published',
    'public',
    '2026-10-04T12:00:00Z',
    5,
    'https://cinderpress.com/stories/architectural-boundaries-decoupling-media-identity-and-state',
    'Architectural Boundaries: Decoupling Media, Identity, and State — CinderPress Review',
    'The principles of clean decoupling between identity, relational state, and media.'
),
(
    'post_006_infinite_canvas',
    'pub_cinderpress_main',
    'auth_maya_lin',
    'The Fallacy of the Infinite Canvas',
    'the-fallacy-of-the-infinite-canvas',
    'Why unconstrained spatial canvases often paralyze editorial writing compared to deliberate, structured modular containers.',
    'Whiteboards and spatial canvases are wonderful for brainstorming, but finished literature requires the discipline of boundaries, hierarchical sections, and finite bounds.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The recent trend in productivity software has celebrated the infinite canvas—a boundless zoomable plane where thoughts can float freely in two dimensions. While invaluable for wireframing, the infinite canvas actively hinders linear narrative generation."}]},{"type":"paragraph","content":[{"type":"text","text":"Writing is fundamentally a sequential art. An author needs constraint: a beginning, a structured middle, and an arrival. By providing a distraction-free editorial canvas with strict hierarchy, CinderPress frees the mind from spatial navigation to focus entirely on argumentation."}]}]}',
    '<p>The recent trend in productivity software has celebrated the infinite canvas—a boundless zoomable plane where thoughts can float freely in two dimensions. While invaluable for wireframing, the infinite canvas actively hinders linear narrative generation.</p><p>Writing is fundamentally a sequential art. An author needs constraint: a beginning, a structured middle, and an arrival. By providing a distraction-free editorial canvas with strict hierarchy, CinderPress frees the mind from spatial navigation to focus entirely on argumentation.</p>',
    'med_cover_fast_software',
    'published',
    'public',
    '2026-10-05T09:30:00Z',
    4,
    'https://cinderpress.com/stories/the-fallacy-of-the-infinite-canvas',
    'The Fallacy of the Infinite Canvas — CinderPress Review',
    'Why structured editorial constraints elevate longform writing.'
),
(
    'post_007_offline_workflows',
    'pub_cinderpress_main',
    'auth_marcus_thorne',
    'Designing Offline-Tolerant Publishing Workflows',
    'designing-offline-tolerant-publishing-workflows',
    'Building editorial editors that never lose a keystroke regardless of network latency, flaky hotel Wi-Fi, or transient server hiccups.',
    'Autosave failure is the cardinal sin of content management systems. A look at optimistic local buffering, monotonic clocks, and idempotency keys.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Few technical failures cause more immediate distress to an author than watching a red notification banner declare that their last thirty minutes of prose failed to save to the server. The culprit is almost always naive request-response models that assume steady network availability."}]},{"type":"paragraph","content":[{"type":"text","text":"A resilient CMS must treat network disconnection as a routine state, not an exceptional catastrophe. By incorporating optimistic in-memory revisions, debounced local synchronization, and idempotent backend endpoints, CinderPress guarantees zero lost keystrokes."}]}]}',
    '<p>Few technical failures cause more immediate distress to an author than watching a red notification banner declare that their last thirty minutes of prose failed to save to the server. The culprit is almost always naive request-response models that assume steady network availability.</p><p>A resilient CMS must treat network disconnection as a routine state, not an exceptional catastrophe. By incorporating optimistic in-memory revisions, debounced local synchronization, and idempotent backend endpoints, CinderPress guarantees zero lost keystrokes.</p>',
    'med_cover_edge_databases',
    'published',
    'public',
    '2026-10-05T18:00:00Z',
    6,
    'https://cinderpress.com/stories/designing-offline-tolerant-publishing-workflows',
    'Designing Offline-Tolerant Publishing Workflows — CinderPress Review',
    'How CinderPress achieves unbreakable draft resilience and idempotency.'
),
(
    'post_008_refactoring_loom',
    'pub_cinderpress_main',
    'auth_elena_vance',
    'Refactoring the Editorial Loom',
    'refactoring-the-editorial-loom',
    'Notes on rebuilding our publication workflow from the ground up on modern edge primitives.',
    'A candid internal draft tracing the evolution from legacy publishing software to an edge-native publishing engine.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is an active draft outlining our transition roadmap. More details will be added as benchmarks finalize."}]}]}',
    '<p>This is an active draft outlining our transition roadmap. More details will be added as benchmarks finalize.</p>',
    'med_cover_boundaries',
    'draft',
    'private',
    NULL,
    3,
    'https://cinderpress.com/stories/refactoring-the-editorial-loom',
    'Refactoring the Editorial Loom [DRAFT]',
    'Internal draft on migration to edge primitives.'
);

-- 7. POST CATEGORIES JUNCTION SEED
INSERT OR IGNORE INTO post_categories (post_id, category_id) VALUES
('post_001_fast_software', 'cat_architecture'),
('post_001_fast_software', 'cat_deep_systems'),
('post_002_industrial_design', 'cat_typography'),
('post_002_industrial_design', 'cat_cultural_signals'),
('post_003_edge_databases', 'cat_edge'),
('post_003_edge_databases', 'cat_deep_systems'),
('post_004_typography_physics', 'cat_typography'),
('post_005_boundaries', 'cat_architecture'),
('post_005_boundaries', 'cat_edge'),
('post_006_infinite_canvas', 'cat_cultural_signals'),
('post_007_offline_workflows', 'cat_architecture'),
('post_007_offline_workflows', 'cat_edge'),
('post_008_refactoring_loom', 'cat_architecture');

-- 8. POST TAGS JUNCTION SEED
INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES
('post_001_fast_software', 'tag_performance'),
('post_001_fast_software', 'tag_editorial'),
('post_002_industrial_design', 'tag_design_systems'),
('post_002_industrial_design', 'tag_typography'),
('post_003_edge_databases', 'tag_cloudflare'),
('post_003_edge_databases', 'tag_d1'),
('post_003_edge_databases', 'tag_performance'),
('post_004_typography_physics', 'tag_typography'),
('post_004_typography_physics', 'tag_design_systems'),
('post_005_boundaries', 'tag_cloudflare'),
('post_005_boundaries', 'tag_editorial'),
('post_006_infinite_canvas', 'tag_editorial'),
('post_007_offline_workflows', 'tag_performance'),
('post_008_refactoring_loom', 'tag_editorial');

-- 9. COMMENTS SEED
INSERT OR IGNORE INTO comments (id, post_id, author_name, author_email, body, status, created_at) VALUES
(
    'comm_001',
    'post_001_fast_software',
    'Julian K.',
    'julian@example.com',
    'Spot on regarding the illusion of free abstraction. We eliminated two middleman microservices last quarter and our P99 latency dropped by 70%.',
    'approved',
    '2026-09-29T11:20:00Z'
),
(
    'comm_002',
    'post_001_fast_software',
    'Sarah Jenkins',
    'sarah@techresearch.org',
    'How do you handle schema evolution across multiple edge replicas when zero-hop cold starts are prioritized?',
    'approved',
    '2026-09-29T14:45:00Z'
),
(
    'comm_003',
    'post_002_industrial_design',
    'Alex Rivera',
    'alex@designstudios.co',
    'The return of hairline borders and restrained orange accents brings back the clarity of classic Dieter Rams instruments. Great piece.',
    'approved',
    '2026-10-01T09:12:00Z'
),
(
    'comm_004',
    'post_003_edge_databases',
    'Anonymous Visitor',
    'visitor@anonymous.net',
    'This looks interesting. Waiting for more comparative benchmarks on concurrent writes under high contention.',
    'pending',
    '2026-10-04T19:30:00Z'
);

-- 10. REVISIONS SEED
INSERT OR IGNORE INTO post_revisions (id, post_id, author_id, title, dek, excerpt, content_json, created_at) VALUES
(
    'rev_001_init',
    'post_001_fast_software',
    'auth_elena_vance',
    'Why the Fastest Software is the Simplest',
    'Performance is not an afterthought.',
    'Initial draft of the software speed essay.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Initial working draft."}]}]}',
    '2026-09-27T10:00:00Z'
),
(
    'rev_002_published',
    'post_001_fast_software',
    'auth_elena_vance',
    'Why the Fastest Software is Often the Least Complicated',
    'Performance is not an optimization pass performed at the finish line. It is the consequence of choosing fewer abstractions.',
    'In modern computing, speed has become synonymous with elaborate caching layers...',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Published revision content."}]}]}',
    '2026-09-28T14:30:00Z'
);

-- 11. AUDIT EVENTS SEED
INSERT OR IGNORE INTO audit_events (id, actor_auth_user_id, action, entity_type, entity_id, metadata_json, created_at) VALUES
('aud_001', 'usr_system_editor', 'publication_created', 'publication', 'pub_cinderpress_main', '{"name": "CinderPress Review"}', '2026-09-25T08:00:00Z'),
('aud_002', 'usr_system_editor', 'post_published', 'post', 'post_001_fast_software', '{"slug": "why-the-fastest-software-is-often-the-least-complicated"}', '2026-09-28T14:30:00Z'),
('aud_003', 'usr_system_author2', 'post_published', 'post', 'post_002_industrial_design', '{"slug": "the-quiet-return-of-industrial-interface-design"}', '2026-09-30T10:15:00Z');

-- 12. POPULATE FTS5 SEARCH INDEX
INSERT INTO posts_fts (id, title, dek, excerpt, body_plain)
SELECT 
    id,
    title,
    COALESCE(dek, ''),
    COALESCE(excerpt, ''),
    title || ' ' || COALESCE(dek, '') || ' ' || COALESCE(excerpt, '')
FROM posts
WHERE status = 'published';
