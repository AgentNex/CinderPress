// ==============================================================================
// CINDERPRESS DATABASE TYPES & SCHEMAS
// ==============================================================================

export type PostStatus = 'draft' | 'published' | 'archived';
export type PostVisibility = 'public' | 'private';
export type AuthorRole = 'owner' | 'editor' | 'author' | 'moderator';
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';

export interface Publication {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_media_id: string | null;
  favicon_media_id: string | null;
  default_cover_media_id: string | null;
  locale: string;
  timezone: string;
  theme_config: string | null; // JSON string
  social_links: string | null; // JSON string
  seo_defaults: string | null; // JSON string
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  publication_id: string;
  auth_user_id: string;
  display_name: string;
  slug: string;
  bio: string | null;
  avatar_media_id: string | null;
  website: string | null;
  social_links: string | null; // JSON string
  role: AuthorRole;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: string;
  publication_id: string;
  owner_auth_user_id: string;
  cloudinary_public_id: string;
  cloudinary_asset_id: string | null;
  resource_type: string;
  secure_url: string;
  format: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  bytes: number | null;
  alt_text: string | null;
  caption: string | null;
  credit: string | null;
  folder: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  publication_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  publication_id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Post {
  id: string;
  publication_id: string;
  author_id: string;
  title: string;
  slug: string;
  dek: string | null;
  excerpt: string | null;
  content_json: string;
  content_html: string | null;
  cover_media_id: string | null;
  status: PostStatus;
  visibility: PostVisibility;
  published_at: string | null;
  scheduled_at: string | null;
  reading_time_minutes: number;
  canonical_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_title: string | null;
  og_description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PostWithRelations extends Post {
  author?: Author;
  cover_media?: MediaAsset | null;
  categories?: Category[];
  tags?: Tag[];
  revisions?: PostRevision[];
}

export interface PostRevision {
  id: string;
  post_id: string;
  author_id: string;
  title: string;
  dek: string | null;
  excerpt: string | null;
  content_json: string;
  cover_media_id: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string | null;
  body: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  actor_auth_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata_json: string | null;
  created_at: string;
}
