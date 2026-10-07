// ==============================================================================
// CINDERPRESS CLOUDINARY MEDIA LAYER
// Follows official cloudinary-next & cloudinary-transformations skills
// ==============================================================================

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'cinderpress-demo';

export interface TransformationOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'limit' | 'pad' | 'thumb';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south';
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
  aspectRatio?: string;
}

/**
 * Builds high-performance, responsive Cloudinary delivery URLs
 * Automatically appends f_auto/q_auto per transformation best practice
 */
export function getOptimizedMediaUrl(
  publicIdOrUrl: string,
  options: TransformationOptions = {}
): string {
  if (!publicIdOrUrl) return '';

  // If it's already an external non-cloudinary URL (e.g. Unsplash fallback)
  if (publicIdOrUrl.startsWith('http') && !publicIdOrUrl.includes('cloudinary.com')) {
    return publicIdOrUrl;
  }

  // Extract public ID if full cloudinary URL was passed
  let cleanPublicId = publicIdOrUrl;
  if (publicIdOrUrl.includes('res.cloudinary.com')) {
    const parts = publicIdOrUrl.split('/upload/');
    if (parts.length > 1) {
      // Remove any transformation string in between
      const afterUpload = parts[1];
      const segments = afterUpload.split('/');
      // If first segment starts with v followed by numbers (version) or transformation
      cleanPublicId = segments.slice(segments[0].startsWith('v') ? 1 : 0).join('/');
    }
  }

  // Construct transformation parts
  const transforms: string[] = [];

  const crop = options.crop || 'fill';
  transforms.push(`c_${crop}`);

  if (options.gravity) {
    transforms.push(`g_${options.gravity}`);
  } else if (crop === 'fill' || crop === 'thumb') {
    transforms.push('g_auto');
  }

  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.aspectRatio) transforms.push(`ar_${options.aspectRatio}`);

  // Mandatory performance optimization per Cloudinary skill
  const format = options.format || 'auto';
  const quality = options.quality || 'auto';
  transforms.push(`f_${format}`);
  transforms.push(`q_${quality}`);

  const transformString = transforms.join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${cleanPublicId}`;
}

export const buildOptimizedImageUrl = getOptimizedMediaUrl;

/**
 * Editorial Preset transformation configurations
 */
export const EDITORIAL_PRESETS = {
  heroCover: { width: 1600, height: 900, crop: 'fill' as const, gravity: 'auto' as const },
  storyCard: { width: 800, height: 500, crop: 'fill' as const, gravity: 'auto' as const },
  compactThumbnail: { width: 320, height: 240, crop: 'fill' as const, gravity: 'auto' as const },
  authorAvatar: { width: 120, height: 120, crop: 'thumb' as const, gravity: 'face' as const },
  inlineProse: { width: 1200, crop: 'limit' as const },
};

/**
 * Common presets for editorial layouts (callable functions)
 */
export const MediaPresets = {
  heroCover: (id: string) => getOptimizedMediaUrl(id, EDITORIAL_PRESETS.heroCover),
  storyCard: (id: string) => getOptimizedMediaUrl(id, EDITORIAL_PRESETS.storyCard),
  compactThumbnail: (id: string) => getOptimizedMediaUrl(id, EDITORIAL_PRESETS.compactThumbnail),
  authorAvatar: (id: string) => getOptimizedMediaUrl(id, EDITORIAL_PRESETS.authorAvatar),
  inlineProse: (id: string) => getOptimizedMediaUrl(id, EDITORIAL_PRESETS.inlineProse),
};

/**
 * Generate a responsive srcset descriptor string for multi-resolution displays
 */
export function getResponsiveSrcSet(
  publicIdOrUrl: string,
  widths: number[] = [640, 768, 1024, 1280, 1600]
): string {
  return widths
    .map((w) => `${getOptimizedMediaUrl(publicIdOrUrl, { width: w, crop: 'scale' })} ${w}w`)
    .join(', ');
}
