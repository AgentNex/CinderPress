'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PostWithRelations, Category, Tag, MediaAsset } from '@/lib/db';
import { MediaLibraryModal } from './MediaLibraryModal';
import {
  Save,
  CheckCircle,
  Eye,
  PenTool,
  ArrowLeft,
  Image as ImageIcon,
  FolderTree,
  Tag as TagIcon,
  Clock,
  History,
  AlertCircle,
  Check,
  Send,
  Loader2,
  Trash2,
} from 'lucide-react';

interface PostEditorProps {
  initialPost?: PostWithRelations;
}

export function PostEditor({ initialPost }: PostEditorProps) {
  const router = useRouter();

  // Core Post State
  const [postId, setPostId] = useState<string>(initialPost?.id || '');
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [dek, setDek] = useState(initialPost?.dek || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [contentHtml, setContentHtml] = useState(initialPost?.content_html || '');
  const [status, setStatus] = useState<'draft' | 'published'>(
    initialPost?.status === 'published' ? 'published' : 'draft'
  );
  const [coverMedia, setCoverMedia] = useState<MediaAsset | null>(
    initialPost?.cover_media || null
  );

  // Taxonomy & Revisions
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialPost?.categories?.map((c) => c.id) || []
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialPost?.tags?.map((t) => t.id) || []
  );
  const [revisions, setRevisions] = useState<any[]>(initialPost?.revisions || []);

  // UI Flow State
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
  const [publishing, setPublishing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load available taxonomies
  useEffect(() => {
    async function loadTaxonomies() {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/tags'),
        ]);
        if (catRes.ok) {
          const d = await catRes.json();
          setAllCategories(d.categories || []);
        }
        if (tagRes.ok) {
          const d = await tagRes.json();
          setAllTags(d.tags || []);
        }
      } catch (err) {
        console.warn('Taxonomy load error:', err);
      }
    }
    loadTaxonomies();
  }, []);

  // Autosave handler (debounced 1500ms)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const savePost = useCallback(
    async (overrideStatus?: 'draft' | 'published') => {
      if (!title.trim()) return;

      try {
        setSaveStatus('saving');
        setErrorMessage(null);

        const currentStatus = overrideStatus || status;
        const payload = {
          title,
          slug,
          dek,
          excerpt,
          content_html: contentHtml,
          content_json: JSON.stringify({ type: 'doc', html: contentHtml }),
          cover_media_id: coverMedia?.id || null,
          category_ids: selectedCategoryIds,
          tag_ids: selectedTagIds,
          status: currentStatus,
        };

        let res;
        if (postId) {
          // Update existing
          res = await fetch(`/api/posts/${postId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          // Create new
          res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Save failed');
        }

        const data = await res.json();
        if (data.post) {
          if (!postId) {
            setPostId(data.post.id);
            window.history.replaceState(null, '', `/studio/posts/${data.post.id}`);
          }
          if (data.post.slug) setSlug(data.post.slug);
        }

        setSaveStatus('saved');
      } catch (err: any) {
        console.error('Save error:', err);
        setSaveStatus('error');
        setErrorMessage(err.message || 'Auto-save failed');
      }
    },
    [title, slug, dek, excerpt, contentHtml, coverMedia, selectedCategoryIds, selectedTagIds, status, postId]
  );

  // Trigger autosave when text changes
  const triggerDebouncedSave = () => {
    setSaveStatus('idle');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      savePost();
    }, 1500);
  };

  // Explicit Publish action
  const handlePublish = async () => {
    if (!title.trim() || publishing) return;
    try {
      setPublishing(true);
      setErrorMessage(null);

      // Save content first
      await savePost();

      if (!postId) {
        throw new Error('Please save the draft before publishing');
      }

      const res = await fetch(`/api/posts/${postId}/publish`, {
        method: 'POST',
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Publish failed');
      }

      setStatus('published');
      setSaveStatus('saved');
    } catch (err: any) {
      setErrorMessage(err.message || 'Publishing error');
    } finally {
      setPublishing(false);
    }
  };

  // Revert to draft
  const handleUnpublish = async () => {
    if (!postId || publishing) return;
    try {
      setPublishing(true);
      const res = await fetch(`/api/posts/${postId}/unpublish`, {
        method: 'POST',
      });
      if (res.ok) {
        setStatus('draft');
      }
    } catch (err) {
      console.warn('Unpublish error:', err);
    } finally {
      setPublishing(false);
    }
  };

  // Rich formatting helper commands
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('editorial-canvas-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = contentHtml.substring(start, end);
    const replacement = `${prefix}${selected || 'Text'}${suffix}`;

    const newContent = contentHtml.substring(0, start) + replacement + contentHtml.substring(end);
    setContentHtml(newContent);
    triggerDebouncedSave();

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 10);
  };

  return (
    <div className="flex flex-col min-h-screen bg-cinder-paper">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 border-b border-cinder-border bg-cinder-paper px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/studio/posts')}
            className="p-1.5 text-cinder-muted hover:text-cinder-ink rounded-lg hover:bg-cinder-bone transition-colors"
            title="Back to Stories"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className={`px-2 py-0.5 rounded uppercase font-semibold text-[11px] ${
              status === 'published'
                ? 'bg-green-100 text-cinder-success border border-green-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}>
              {status}
            </span>

            <span className="text-cinder-muted">•</span>

            {saveStatus === 'saving' ? (
              <span className="text-cinder-muted flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </span>
            ) : saveStatus === 'saved' ? (
              <span className="text-cinder-muted flex items-center gap-1">
                <Check className="w-3 h-3 text-cinder-success" />
                <span>Draft saved</span>
              </span>
            ) : saveStatus === 'error' ? (
              <span className="text-cinder-error flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Save failed</span>
              </span>
            ) : (
              <span className="text-cinder-muted">Unsaved</span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              previewMode
                ? 'bg-cinder-ink text-white border-cinder-ink'
                : 'border-cinder-border text-cinder-ink hover:bg-cinder-bone'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'Edit' : 'Preview'}</span>
          </button>

          <button
            onClick={() => savePost()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cinder-border text-xs font-medium text-cinder-ink hover:bg-cinder-bone transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-cinder-muted" />
            <span>Save</span>
          </button>

          {status === 'published' ? (
            <button
              onClick={handleUnpublish}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-cinder-border text-xs font-medium text-cinder-ink hover:bg-red-50 hover:text-cinder-error hover:border-red-200 transition-colors"
            >
              <span>Unpublish</span>
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing || !title.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cinder-orange text-white text-xs font-semibold uppercase tracking-wider hover:bg-cinder-orange-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {publishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 text-xs text-cinder-error flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="font-mono text-xs">Dismiss</button>
        </div>
      )}

      {/* Main 2-Column Work Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto w-full">
        {/* Left Column: Writing Canvas (Cols 1-8) */}
        <div className="lg:col-span-8 p-6 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-cinder-border space-y-6">
          {previewMode ? (
            /* Reading Preview State */
            <div className="space-y-6 max-w-reading mx-auto">
              {coverMedia && (
                <div className="aspect-[16/9] rounded-xl overflow-hidden border border-cinder-border bg-cinder-bone">
                  <img src={coverMedia.secure_url} alt={title} className="w-full h-full object-cover" />
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-cinder-ink leading-tight">
                {title || 'Untitled Headline'}
              </h1>
              {dek && (
                <p className="text-lg text-cinder-muted leading-relaxed italic">
                  {dek}
                </p>
              )}
              <div className="cinder-prose pt-4 border-t border-cinder-border/60" dangerouslySetInnerHTML={{ __html: contentHtml || '<p>No content written yet.</p>' }} />
            </div>
          ) : (
            /* Active Writing Canvas */
            <div className="space-y-6 max-w-reading mx-auto">
              {/* Title Field */}
              <textarea
                rows={2}
                placeholder="Story headline..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  triggerDebouncedSave();
                }}
                className="w-full text-3xl sm:text-4xl font-bold tracking-tight text-cinder-ink placeholder:text-cinder-muted/50 bg-transparent border-none outline-none resize-none leading-tight"
              />

              {/* Dek / Subtitle */}
              <input
                type="text"
                placeholder="Dek: A descriptive subtitle giving essential context..."
                value={dek}
                onChange={(e) => {
                  setDek(e.target.value);
                  triggerDebouncedSave();
                }}
                className="w-full text-base sm:text-lg text-cinder-muted placeholder:text-cinder-muted/40 bg-transparent border-b border-cinder-border/40 pb-2 outline-none font-sans"
              />

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-cinder-paper-soft border border-cinder-border text-xs text-cinder-muted">
                <button
                  type="button"
                  onClick={() => insertFormatting('<h2>', '</h2>')}
                  className="px-2 py-1 rounded hover:bg-cinder-bone hover:text-cinder-ink font-semibold"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<h3>', '</h3>')}
                  className="px-2 py-1 rounded hover:bg-cinder-bone hover:text-cinder-ink font-semibold"
                >
                  H3
                </button>
                <span className="w-px h-4 bg-cinder-border mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting('<strong>', '</strong>')}
                  className="px-2 py-1 rounded hover:bg-cinder-bone hover:text-cinder-ink font-bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<em>', '</em>')}
                  className="px-2 py-1 rounded hover:bg-cinder-bone hover:text-cinder-ink italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<code>', '</code>')}
                  className="px-2 py-1 rounded hover:bg-cinder-bone hover:text-cinder-ink font-mono"
                >
                  {'</>'}
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<blockquote>', '</blockquote>')}
                  className="px-2 py-1 rounded hover:bg-cinder-bone hover:text-cinder-ink"
                >
                  Quote
                </button>
                <span className="w-px h-4 bg-cinder-border mx-1" />
                <button
                  type="button"
                  onClick={() => setMediaModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-cinder-bone text-cinder-orange hover:text-cinder-orange-deep font-medium"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Media</span>
                </button>
              </div>

              {/* Content Body */}
              <textarea
                id="editorial-canvas-textarea"
                rows={18}
                placeholder="Begin your essay here. Use standard paragraph HTML tags (<p>, <h2>, <blockquote>) or write clean formatted text..."
                value={contentHtml}
                onChange={(e) => {
                  setContentHtml(e.target.value);
                  triggerDebouncedSave();
                }}
                className="w-full text-base sm:text-lg text-cinder-ink bg-transparent border-none outline-none resize-y leading-relaxed font-sans placeholder:text-cinder-muted/40"
              />
            </div>
          )}
        </div>

        {/* Right Column: Publishing & Taxonomy Sidebar (Cols 9-12) */}
        <div className="lg:col-span-4 p-6 sm:p-8 bg-cinder-paper-soft space-y-6">
          {/* Cover Media Selector */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cinder-muted font-semibold flex items-center justify-between">
              <span>Cover Media</span>
              {coverMedia && (
                <button
                  onClick={() => {
                    setCoverMedia(null);
                    triggerDebouncedSave();
                  }}
                  className="text-cinder-error hover:underline text-[10px]"
                >
                  Remove
                </button>
              )}
            </h4>

            {coverMedia ? (
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-cinder-border group">
                <img
                  src={coverMedia.secure_url}
                  alt={coverMedia.alt_text || 'Cover image'}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setMediaModalOpen(true)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-mono uppercase"
                >
                  Change Cover
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMediaModalOpen(true)}
                className="w-full aspect-[16/10] border-2 border-dashed border-cinder-border rounded-xl flex flex-col items-center justify-center gap-2 text-cinder-muted hover:border-cinder-orange hover:text-cinder-orange transition-colors"
              >
                <ImageIcon className="w-6 h-6" />
                <span className="text-xs font-mono uppercase tracking-wider">Select Cloudinary Media</span>
              </button>
            )}
          </div>

          {/* Excerpt Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-cinder-muted font-semibold block">
              Excerpt
            </label>
            <textarea
              rows={3}
              placeholder="Short summary for cards and RSS feed..."
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                triggerDebouncedSave();
              }}
              className="w-full p-2.5 text-xs rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange focus:ring-1 focus:ring-cinder-orange"
            />
          </div>

          {/* URL Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-cinder-muted font-semibold block">
              Slug Path
            </label>
            <input
              type="text"
              placeholder="url-slug-handle"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                triggerDebouncedSave();
              }}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange"
            />
          </div>

          {/* Category Assignment */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-cinder-muted font-semibold block">
              Category
            </label>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {allCategories.map((cat) => {
                const checked = selectedCategoryIds.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-cinder-bone cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? selectedCategoryIds.filter((id) => id !== cat.id)
                          : [...selectedCategoryIds, cat.id];
                        setSelectedCategoryIds(next);
                        triggerDebouncedSave();
                      }}
                      className="rounded border-cinder-border text-cinder-orange focus:ring-cinder-orange"
                    />
                    <span className="text-cinder-ink font-medium">{cat.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Tag Assignment */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-cinder-muted font-semibold block">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => {
                const checked = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      const next = checked
                        ? selectedTagIds.filter((id) => id !== tag.id)
                        : [...selectedTagIds, tag.id];
                      setSelectedTagIds(next);
                      triggerDebouncedSave();
                    }}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                      checked
                        ? 'bg-cinder-orange text-white'
                        : 'bg-white border border-cinder-border text-cinder-muted hover:border-cinder-muted'
                    }`}
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEO Preview Snippet */}
          <div className="pt-4 border-t border-cinder-border space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cinder-muted font-semibold block">
              Search Snippet Preview
            </span>
            <div className="p-3 rounded-lg bg-white border border-cinder-border space-y-1">
              <span className="text-[11px] text-emerald-800 font-mono block truncate">
                https://cinderpress.com/stories/{slug || 'story-slug'}
              </span>
              <h5 className="text-sm font-semibold text-blue-800 truncate">
                {title || 'Headline'} | CinderPress Review
              </h5>
              <p className="text-xs text-cinder-muted line-clamp-2">
                {excerpt || dek || 'Read the full story on CinderPress Review.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(asset) => {
          setCoverMedia(asset);
          triggerDebouncedSave();
        }}
      />
    </div>
  );
}
