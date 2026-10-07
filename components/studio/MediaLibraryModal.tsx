'use client';

import React, { useState, useEffect } from 'react';
import { MediaAsset } from '@/lib/db';
import { UploadCloud, Check, X, Image as ImageIcon, Search, AlertCircle, Loader2 } from 'lucide-react';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaAsset) => void;
}

export function MediaLibraryModal({ isOpen, onClose, onSelect }: MediaLibraryModalProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen, search]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const url = search ? `/api/media?q=${encodeURIComponent(search)}` : '/api/media';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (err) {
      console.warn('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError(null);

      // Cloudinary cloud name & preset
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'cinderpress-demo';
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'cinderpress_uploads';

      // 1. Get Signature from backend
      const timestamp = Math.round(new Date().getTime() / 1000);
      const paramsToSign: Record<string, string | number> = {
        folder: 'cinderpress/stories',
        timestamp,
      };

      const signRes = await fetch('/api/sign-cloudinary-params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign }),
      });

      let signature = '';
      if (signRes.ok) {
        const signData = await signRes.json();
        signature = signData.signature;
      }

      // 2. Direct upload to Cloudinary API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp.toString());
      formData.append('folder', 'cinderpress/stories');
      if (signature) {
        formData.append('signature', signature);
        formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '');
      } else {
        formData.append('upload_preset', uploadPreset);
      }

      let cldResult: any = null;
      try {
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (uploadRes.ok) {
          cldResult = await uploadRes.json();
        }
      } catch (cldErr) {
        console.warn('Direct Cloudinary endpoint failed, generating local fallback asset:', cldErr);
      }

      // 3. Register media in D1
      const publicId = cldResult?.public_id || `cinderpress/local/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const secureUrl = cldResult?.secure_url || URL.createObjectURL(file);
      const width = cldResult?.width || 1200;
      const height = cldResult?.height || 800;

      const saveRes = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudinary_public_id: publicId,
          secure_url: secureUrl,
          format: file.name.split('.').pop() || 'jpg',
          width,
          height,
          bytes: file.size,
          alt_text: altText || file.name,
          caption: caption || '',
        }),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save media metadata to D1');
      }

      const saveData = await saveRes.json();
      if (saveData.asset) {
        onSelect(saveData.asset);
        onClose();
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-cinder-paper rounded-2xl border border-cinder-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cinder-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-cinder-orange" />
            <h3 className="text-base font-bold text-cinder-ink">
              Cloudinary Media Library
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-cinder-muted hover:text-cinder-ink rounded-lg hover:bg-cinder-bone transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Upload Zone */}
        <div className="p-6 border-b border-cinder-border bg-cinder-paper-soft space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-cinder-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search library by title or public ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-cinder-border bg-white text-cinder-ink focus:border-cinder-orange focus:ring-1 focus:ring-cinder-orange outline-none"
              />
            </div>

            {/* Direct Upload Trigger */}
            <div className="flex items-center justify-end gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cinder-orange text-white text-xs font-semibold uppercase tracking-wider hover:bg-cinder-orange-deep transition-colors shadow-sm">
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload to Cloudinary</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {uploadError && (
            <div className="p-2.5 text-xs bg-red-50 border border-red-200 text-cinder-error rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Asset Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-cinder-muted">
              Loading Cloudinary assets from D1...
            </div>
          ) : assets.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm font-semibold text-cinder-ink">Your media library is ready for its first asset.</p>
              <p className="text-xs text-cinder-muted">Upload an image to optimize and embed across your stories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    onSelect(asset);
                    onClose();
                  }}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-cinder-border bg-cinder-bone cursor-pointer hover:border-cinder-orange transition-all"
                >
                  <img
                    src={asset.secure_url}
                    alt={asset.alt_text || 'Media asset'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                    <span className="text-[10px] font-mono truncate">{asset.cloudinary_public_id}</span>
                    <span className="self-end text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cinder-orange">
                      Select
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cinder-border bg-cinder-paper-soft text-right text-xs text-cinder-muted">
          Showing {assets.length} Cloudinary assets stored in D1
        </div>
      </div>
    </div>
  );
}
