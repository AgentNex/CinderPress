'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PostEditor } from '@/components/studio/PostEditor';
import { PostWithRelations } from '@/lib/db';
import { Loader2 } from 'lucide-react';

export default function EditPostPage() {
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost] = useState<PostWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) {
          throw new Error('Post not found');
        }
        const data = await res.json();
        setPost(data.post);
      } catch (err: any) {
        setError(err.message || 'Error loading post');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-20">
        <Loader2 className="w-6 h-6 animate-spin text-cinder-orange" />
        <p className="text-xs font-mono text-cinder-muted">Loading story editor...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-12 text-center space-y-3">
        <h3 className="text-lg font-bold text-cinder-ink">Unable to Load Story</h3>
        <p className="text-xs text-cinder-muted">{error || 'Story not found.'}</p>
      </div>
    );
  }

  return <PostEditor initialPost={post} />;
}
