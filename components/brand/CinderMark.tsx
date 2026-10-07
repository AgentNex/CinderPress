import React from 'react';

interface CinderMarkProps {
  size?: number;
  className?: string;
  variant?: 'color' | 'monochrome' | 'dark';
}

/**
 * CinderPress Architectural Geometric Isometric Brand Mark
 * Represents a layered editorial block / folded publication tile in isometric 2.5D.
 */
export function CinderMark({ size = 32, className = '', variant = 'color' }: CinderMarkProps) {
  // Color configuration
  const colors = {
    color: {
      top: '#F48120',      // Signal Flare Orange
      left: '#171717',     // Solid Deep Ink
      right: '#D86612',    // Deep Ember
      accent: '#FAF8F3',   // Warm Paper
      stroke: '#D9D4CA',
    },
    monochrome: {
      top: '#525252',
      left: '#171717',
      right: '#262626',
      accent: '#FFFFFF',
      stroke: '#737373',
    },
    dark: {
      top: '#F48120',
      left: '#262626',
      right: '#383836',
      accent: '#FAF8F3',
      stroke: '#454542',
    },
  }[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform duration-200 hover:scale-105 ${className}`}
      aria-label="CinderPress mark"
    >
      {/* Base Layer / Shadow Plate */}
      <polygon
        points="24,38 8,28.5 8,24 24,33.5 40,24 40,28.5"
        fill="#242424"
        fillOpacity="0.15"
      />

      {/* Isometric Block: Left Facet (Deep Ink) */}
      <polygon
        points="24,24 8,14.5 8,28.5 24,38"
        fill={colors.left}
      />
      {/* Left Plate Editorial Rule Line */}
      <line
        x1="12"
        y1="19"
        x2="20"
        y2="24"
        stroke={colors.top}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />

      {/* Isometric Block: Right Facet (Deep Ember / Carbon) */}
      <polygon
        points="24,24 40,14.5 40,28.5 24,38"
        fill={colors.right}
      />
      {/* Right Plate Editorial Notch */}
      <line
        x1="28"
        y1="24"
        x2="36"
        y2="19"
        stroke={colors.accent}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />

      {/* Isometric Block: Top Folded Leaf / Editorial Canvas (Signal Orange) */}
      <polygon
        points="24,10 40,19.5 24,29 8,19.5"
        fill={colors.top}
      />

      {/* Floating Precision Chamfer / Upper Inset Spine */}
      <polygon
        points="24,14 34,20 24,26 14,20"
        fill="#FFFFFF"
        fillOpacity="0.25"
      />

      {/* Architectural Central Keystone Marker */}
      <circle cx="24" cy="20" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}

export function CinderLogo({
  markSize = 28,
  showText = true,
  className = '',
}: {
  markSize?: number;
  showText?: boolean;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <CinderMark size={markSize} />
      {showText && (
        <span className="font-semibold tracking-tight text-cinder-ink text-lg flex items-center gap-1.5">
          <span>CINDERPRESS</span>
          <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-cinder-bone text-cinder-ink border border-cinder-border">
            REVIEW
          </span>
        </span>
      )}
    </div>
  );
}
