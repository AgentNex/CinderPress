'use client';

import React, { useState, useEffect } from 'react';
import { StudioHeader } from '@/components/navigation/StudioHeader';
import { MediaAsset } from '@/lib/db';
import { MediaLibraryModal } from '@/components/studio/MediaLibraryModal';
import { UploadCloud, Image as ImageIcon, Search, Copy, Check, ExternalLink } from 'lucide-react';

export default function StudioMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const url = search ? `/api/media?q=${encodeURIComponent(search)}` : '/api/media';
      const res = await fetch(url);
      if (res.ok) {
        const d = await res.json();
        setAssets(d.assets || []);
      }
    } catch (err) {
      console.warn('Error loading media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [search]);

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-cinder-paper">
      <StudioHeader
        title="Cloudinary Media Library"
        description="Inspect, optimize, and manage media assets stored across your publication."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cinder-orange text-white text-xs font-semibold uppercase tracking-wider hover:bg-cinder-orange-deep transition-colors shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Asset</span>
          </button>
        }
      />

      <div className="p-8 space-y-6 max-w-7xl">
        {/* Search Bar */}
        <div className="max-w-md relative">
          <Search className="w-4 h-4 text-cinder-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search media by alt text or public ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange"
          />
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-cinder-muted">
            Loading Cloudinary media assets from D1...
          </div>
        ) : assets.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-cinder-paper-soft rounded-2xl border border-cinder-border p-8">
            <ImageIcon className="w-8 h-8 text-cinder-muted mx-auto" />
            <h3 className="text-base font-bold text-cinder-ink">
              Your media library is ready for its first asset.
            </h3>
            <p className="text-xs text-cinder-muted">
              Upload an image to optimize via Cloudinary and persist to D1.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cinder-ink text-white text-xs font-medium"
            >
              Upload media now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="group border border-cinder-border rounded-xl bg-cinder-paper-soft overflow-hidden space-y-2 p-2 hover:border-cinder-muted hover:shadow-card transition-all"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-cinder-bone border border-cinder-border">
                  <img
                    src={asset.secure_url}
                    alt={asset.alt_text || 'Media'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <a
                    href={asset.secure_url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-2 right-2 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Open full image"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="px-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-cinder-muted">
                    <span>{asset.width}x{asset.height}</span>
                    <button
                      onClick={() => copyUrl(asset.id, asset.secure_url)}
                      className="hover:text-cinder-orange flex items-center gap-1"
                      title="Copy URL"
                    >
                      {copiedId === asset.id ? (
                        <Check className="w-3 h-3 text-cinder-success" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-cinder-ink font-medium truncate" title={asset.alt_text || asset.cloudinary_public_id}>
                    {asset.alt_text || asset.cloudinary_public_id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MediaLibraryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          loadMedia();
        }}
        onSelect={() => {
          loadMedia();
        }}
      />
    </div>
  );
}
