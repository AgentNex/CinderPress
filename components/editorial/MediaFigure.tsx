'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getOptimizedMediaUrl, TransformationOptions } from '@/lib/cloudinary';

interface MediaFigureProps {
  src: string;
  alt: string;
  caption?: string | null;
  credit?: string | null;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  aspectRatio?: string; // e.g. "16/9"
  options?: TransformationOptions;
}

export function MediaFigure({
  src,
  alt,
  caption,
  credit,
  width = 1200,
  height = 675,
  priority = false,
  className = '',
  options = {},
}: MediaFigureProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // If using Cloudinary public ID or cloud URL
  const optimizedUrl = getOptimizedMediaUrl(src, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto',
    ...options,
  });

  return (
    <figure className={`my-8 select-none ${className}`}>
      <div className="relative overflow-hidden rounded-xl bg-cinder-bone border border-cinder-border transition-all">
        {!loaded && !error && (
          <div className="absolute inset-0 bg-cinder-bone animate-pulse flex items-center justify-center text-xs font-mono text-cinder-muted">
            Optimizing media via Cloudinary...
          </div>
        )}

        <img
          src={optimizedUrl || src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-auto object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {(caption || credit) && (
        <figcaption className="mt-2.5 text-xs text-cinder-muted leading-relaxed flex flex-wrap items-center justify-between gap-2 px-1">
          {caption && <span>{caption}</span>}
          {credit && <span className="font-mono text-[11px] opacity-75">Photo: {credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}
