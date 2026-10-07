# CinderPress 🔥

> **An independent, high-contrast editorial publishing CMS built for modern systems journalism.**

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-cinderpress.pages.dev-F38020?logo=cloudflare&logoColor=white)](https://cinderpress.pages.dev)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Cloudflare-D1_Relational-F38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![Auth](https://img.shields.io/badge/Identity-InsForge_BaaS-4F46E5)](https://insforge.dev)
[![Media](https://img.shields.io/badge/CDN-Cloudinary_f__auto-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![Tests](https://img.shields.io/badge/Tests-14%2F14_Passing-10B981)](#testing)

**Live Production URL:** [https://cinderpress.pages.dev](https://cinderpress.pages.dev)

---

## 🏛️ Architecture & Separation of Concerns

CinderPress enforces strict, disciplined architectural boundaries:

```
                                  ┌─────────────────────────────┐
                                  │   CLIENTS & READERS         │
                                  │  Web, Mobile, RSS Readers   │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
             ┌───────────────────────────────────────────────────────────────────────┐
             │                   NEXT.JS 14 APP ROUTER AT THE EDGE                   │
             │           Tailwind CSS 3.4 · Cloudflare Workers Edge Runtime          │
             └──────┬────────────────────────────┬────────────────────────────┬──────┘
                    │                            │                            │
                    ▼                            ▼                            ▼
      ┌───────────────────────────┐┌───────────────────────────┐┌───────────────────────────┐
      │   CLOUDFLARE D1 (SQLITE)  ││    CLOUDINARY CDN LAYER   ││     INSFORGE IDENTITY     │
      │ • Relational schema & FKs ││ • f_auto, q_auto delivery ││ • JWT sessions & users    │
      │ • FTS5 unicode61 search   ││ • Editorial aspect presets││ • RBAC: owner, editor,    │
      │ • Dual Node/D1 client     ││ • Signed uploads handler  ││   author, moderator       │
      │ • Post revisions & audit  ││ • Responsive multi-srcset ││ • OTP verification flow   │
      └───────────────────────────┘└───────────────────────────┘└───────────────────────────┘
```

1. **Edge Relational Engine (Cloudflare D1 & SQLite3)**
   - Schema defined in `migrations/0001_cinderpress_schema.sql` with full foreign keys, cascading deletes, and indexes.
   - High-performance SQLite **FTS5 full-text search** index with unicode61 tokenizer.
   - Dual-runtime client (`lib/db/index.ts`) auto-detecting Cloudflare Workers `env.DB` or local Node.js `node:sqlite` (`DatabaseSync`).
2. **Media Delivery CDN (Cloudinary)**
   - Dynamic asset URL optimization with automatic WebP/AVIF transcoding (`f_auto,q_auto`).
   - Editorial layout presets (`heroCover`, `storyCard`, `compactThumbnail`, `authorAvatar`, `inlineProse`).
   - Server-signed upload endpoint (`/api/sign-cloudinary-params`) keeping secrets securely server-side.
3. **Identity & Authorization (InsForge BaaS)**
   - Managed authentication backend with Email/Password + OTP verification and GitHub/Google OAuth.
   - Strict RBAC permissions model: `owner`, `editor`, `author`, `moderator`.

---

## 🎨 Visual Atmosphere & Design System

CinderPress rejects the generic SaaS template aesthetic (no neon cyan blobs, holographic glassmorphism, or AI gradients). Instead, it adopts a high-contrast industrial editorial style:

- **Warm Editorial Canvas**: Base background `#FAF8F3` (`cinder-paper`), card backgrounds `#F3F0E8` (`cinder-paper-soft`), hairline dividers `#D9D4CA` (`cinder-border`).
- **Deep Carbon Ink**: `#171717` (`cinder-ink`) for high-contrast headlines, `#383531` (`cinder-charcoal`) for longform prose reading.
- **Industrial Amber Accent**: `#F48120` (`cinder-orange`) and `#D86612` (`cinder-orange-dark`) for deliberate tactile focus.
- **Typographic Measure**: Rigid 680–720px reading measure (`max-w-reading`) with 1.75 line-height and proportional drop-caps.

See [`DESIGN.md`](./DESIGN.md) for full design system specifications.

---

## 🚀 Key Features

### Public Reading Experience
- **Front Page (`/`)**: Lead featured story with full bleed layout, three-column editorial shelf, and curated taxonomy sections.
- **Article Reader (`/stories/[slug]`)**: Reading progress bar, Cloudinary responsive figures, author card, and interactive discussion section.
- **Full-Text Search (`/search`)**: Instant keyword search backed by SQLite FTS5 index.
- **Taxonomy Archives**: Dedicated category views (`/category/[slug]`), tag feeds (`/tag/[slug]`), and author dossiers (`/author/[slug]`).
- **Syndication**: Auto-generated RSS 2.0 feed (`/rss.xml`), dynamic XML sitemap (`/sitemap.xml`), and robots directives (`/robots.txt`).

### Editorial Studio (CMS)
- **Studio Dashboard (`/studio`)**: Story counters, draft metrics, recent activity table, and quick actions.
- **Live Post Editor (`/studio/posts/new`, `/studio/posts/[id]`)**: Split-screen live preview, autosave indicators, taxonomy selector, Cloudinary asset picker, and revision snapshots.
- **Media Asset Library (`/studio/media`)**: Direct file uploader with Cloudinary signatures, image metadata display, and public ID copy actions.
- **Taxonomy Management**: Live category and tag managers with automatic slug sanitization.
- **Comment Moderation (`/studio/comments`)**: Queue with one-click approve, spam, and deletion controls.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+ (supports Node 22/24 native `node:sqlite`)
- npm or pnpm

### Installation
```bash
git clone https://github.com/AgentNex/CinderPress.git
cd CinderPress
npm install
```

### Environment Setup
Create a `.env.local` file:
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_PUBLICATION_NAME="CinderPress"

# InsForge BaaS Identity
NEXT_PUBLIC_INSFORGE_URL="https://q7hwjwtx.ap-southeast.insforge.app"
NEXT_PUBLIC_INSFORGE_ANON_KEY="anon_4c318c8b629d149fca35396623101b6db2d93f213ba6b3e591878f9c66e52e70"

# Cloudinary Media CDN
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="cinderpress-demo"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Run Locally
```bash
npm run dev
# Or build and start production server
npm run build
npm start
```
Visit [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing

CinderPress includes a 14-point automated test suite verifying database migrations, FTS5 queries, Cloudinary URL helpers, markdown rendering, and RBAC authorization:

```bash
npm test
```

Expected output:
```
🔥 Running CinderPress Comprehensive Test Suite...

📂 1. Database Schema & Migrations Verification
  ✅ PASS: All required CinderPress relational tables exist
  ✅ PASS: Default publication and editorial seed data exist

🔍 2. FTS5 Full-Text Search Engine Verification
  ✅ PASS: FTS5 virtual table indexes title, excerpt, and content
  ✅ PASS: FTS5 handles prefix and boolean queries safely

📰 3. Post Publishing Lifecycle & Relations
  ✅ PASS: Can fetch story by slug with author and category relations
  ✅ PASS: Publish and unpublish state transitions

🖼️ 4. Cloudinary Image Optimization & Presets
  ✅ PASS: buildOptimizedImageUrl injects f_auto,q_auto and handles presets
  ✅ PASS: getResponsiveSrcSet generates correct multi-resolution descriptor string

🔒 5. InsForge Authorization & Role Verification
  ✅ PASS: Owner has all permissions
  ✅ PASS: Editor can publish and edit any post, but cannot manage users
  ✅ PASS: Author can edit own post, but cannot publish or edit others
  ✅ PASS: Moderator can moderate comments, but cannot edit posts

📝 6. Editorial Markdown Engine
  ✅ PASS: renderMarkdown converts headers, blockquotes, and lists
  ✅ PASS: renderMarkdown sanitizes malicious script tags

========================================
CinderPress Test Results: 14 Passed, 0 Failed
========================================
```

---

## ☁️ Cloudflare Pages Deployment

Deploy directly via Cloudflare Wrangler:
```bash
# Export static bundles and Edge worker
npm run build
npx tsx scripts/export-pages.ts

# Deploy to Cloudflare Pages
npx wrangler pages deploy out_pages --project-name=cinderpress --branch=main
```

Live Edge Deployment: **[https://cinderpress.pages.dev](https://cinderpress.pages.dev)**

---

## 📜 License

MIT License. Designed and crafted for high-performance publishing.
