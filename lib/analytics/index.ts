// ==============================================================================
// CINDERPRESS ANALYTICS & AUDIT EVENT ABSTRACTION
// ==============================================================================

import { execute } from '@/lib/db';

export type EventName = 
  | 'post_view'
  | 'search'
  | 'media_upload'
  | 'post_created'
  | 'post_updated'
  | 'post_published'
  | 'comment_submitted'
  | 'comment_moderated';

export interface EventPayload {
  name: EventName;
  actorAuthUserId?: string;
  entityType?: 'post' | 'media' | 'comment' | 'publication' | 'author';
  entityId?: string;
  metadata?: Record<string, any>;
}

export async function trackEvent(payload: EventPayload): Promise<void> {
  try {
    const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const actor = payload.actorAuthUserId || 'anonymous';
    const entityType = payload.entityType || 'post';
    const entityId = payload.entityId || 'general';
    const metaJson = payload.metadata ? JSON.stringify(payload.metadata) : null;

    // Persist into audit_events table in D1
    await execute(
      `INSERT INTO audit_events (id, actor_auth_user_id, action, entity_type, entity_id, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, actor, payload.name, entityType, entityId, metaJson]
    );
  } catch (err) {
    // Non-blocking telemetry failure should never crash user transactions
    console.warn('[CinderPress Analytics] Event tracking error:', err);
  }
}
