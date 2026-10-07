// ==============================================================================
// CINDERPRESS SERVER AUTH & AUTHORIZATION LAYER
// ==============================================================================

import { query, queryOne, execute, Author, AuthorRole } from '@/lib/db';
import { insforge } from './client';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  } | null;
  author: Author | null;
}

/**
 * Resolves current user and author record from InsForge token or headers
 */
export async function getAuthenticatedAuthor(tokenOrHeader?: string | null): Promise<AuthSession> {
  try {
    if (!tokenOrHeader) {
      return { user: null, author: null };
    }

    const token = tokenOrHeader.startsWith('Bearer ') 
      ? tokenOrHeader.slice(7).trim() 
      : tokenOrHeader.trim();

    if (!token) {
      return { user: null, author: null };
    }

    // Call InsForge to verify session and get user info
    // When using token header, authenticate against InsForge
    const res = await insforge.auth.getCurrentUser();
    const user = res.data?.user;

    if (!user) {
      return { user: null, author: null };
    }

    // Check if author exists in D1
    let author = await queryOne<Author>(
      'SELECT * FROM authors WHERE auth_user_id = ?',
      [user.id]
    );

    // If new user, create an author record
    if (!author) {
      const authorId = `auth_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const pub = await queryOne<{ id: string }>('SELECT id FROM publications LIMIT 1');
      const pubId = pub?.id || 'pub_cinderpress_main';
      const displayName = user.profile?.name || user.email.split('@')[0];
      const slug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      await execute(
        `INSERT INTO authors (id, publication_id, auth_user_id, display_name, slug, bio, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [authorId, pubId, user.id, displayName, `${slug}-${Date.now().toString().slice(-4)}`, '', 'author']
      );

      author = await queryOne<Author>('SELECT * FROM authors WHERE id = ?', [authorId]);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.name,
      },
      author,
    };
  } catch (err) {
    console.error('[CinderPress Server Auth] Error resolving session:', err);
    return { user: null, author: null };
  }
}

/**
 * Extract role string from role string or Author object
 */
function extractRole(roleOrAuthor: string | Author | null | undefined): AuthorRole | null {
  if (!roleOrAuthor) return null;
  if (typeof roleOrAuthor === 'string') return roleOrAuthor as AuthorRole;
  return roleOrAuthor.role as AuthorRole;
}

/**
 * RBAC Permission Table
 */
const ROLE_PERMISSIONS: Record<AuthorRole, string[]> = {
  owner: ['create_post', 'edit_any_post', 'publish_post', 'delete_post', 'manage_users', 'moderate_comments', 'manage_settings'],
  editor: ['create_post', 'edit_any_post', 'publish_post', 'delete_post', 'moderate_comments'],
  author: ['create_post', 'edit_own_post'],
  moderator: ['moderate_comments'],
};

/**
 * Check if a role or author has a specific permission
 */
export function hasPermission(
  roleOrAuthor: string | Author | null | undefined,
  permission: string
): boolean {
  const role = extractRole(roleOrAuthor);
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

/**
 * Authorization policy helpers
 */
export function canEditPost(
  roleOrAuthor: string | Author | null | undefined,
  currentAuthorOrUserId: string,
  postAuthorId?: string
): boolean {
  const role = extractRole(roleOrAuthor);
  if (!role) return false;
  if (role === 'owner' || role === 'editor') return true;
  if (role === 'author') {
    // If 2 arguments were passed: canEditPost(authorObj, postAuthorId)
    if (postAuthorId === undefined && typeof roleOrAuthor === 'object' && roleOrAuthor !== null) {
      return roleOrAuthor.id === currentAuthorOrUserId;
    }
    // If 3 arguments: canEditPost('author', authorId, postAuthorId)
    return currentAuthorOrUserId === postAuthorId;
  }
  return false;
}

export function canPublishPost(roleOrAuthor: string | Author | null | undefined): boolean {
  return hasPermission(roleOrAuthor, 'publish_post');
}

export const canPublish = canPublishPost;

export function canModerateComments(roleOrAuthor: string | Author | null | undefined): boolean {
  return hasPermission(roleOrAuthor, 'moderate_comments');
}

export function canManageSettings(roleOrAuthor: string | Author | null | undefined): boolean {
  return hasPermission(roleOrAuthor, 'manage_settings');
}
