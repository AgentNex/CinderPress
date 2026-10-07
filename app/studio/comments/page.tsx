'use client';

import React from 'react';
import { StudioHeader } from '@/components/navigation/StudioHeader';
import { CommentModerator } from '@/components/studio/CommentModerator';

export default function StudioCommentsPage() {
  return (
    <div className="flex-1 flex flex-col bg-cinder-paper">
      <StudioHeader
        title="Comment Moderation"
        description="Review, approve, and protect reader conversations from spam."
      />
      <div className="p-8 max-w-7xl">
        <CommentModerator />
      </div>
    </div>
  );
}
