'use client';

import React from 'react';
import { StudioHeader } from '@/components/navigation/StudioHeader';
import { CategoryManager } from '@/components/studio/CategoryManager';

export default function StudioCategoriesPage() {
  return (
    <div className="flex-1 flex flex-col bg-cinder-paper">
      <StudioHeader
        title="Sections & Categories"
        description="Organize your publication into distinct editorial verticals."
      />
      <div className="p-8 max-w-7xl">
        <CategoryManager />
      </div>
    </div>
  );
}
