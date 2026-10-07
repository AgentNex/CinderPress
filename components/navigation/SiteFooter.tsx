import React from 'react';
import Link from 'next/link';
import { CinderLogo } from '@/components/brand/CinderMark';
import { Rss, Globe, Shield, Terminal } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-cinder-border bg-cinder-paper-soft text-cinder-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Statement */}
          <div className="md:col-span-2 space-y-4">
            <CinderLogo markSize={30} />
            <p className="text-sm text-cinder-muted max-w-md leading-relaxed">
              CinderPress Review is an independent publication dedicated to systems architecture, 
              interface craftsmanship, edge computing, and durable software design. 
              Engineered with industrial precision.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-cinder-muted">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cinder-bone border border-cinder-border">
                <Terminal className="w-3.5 h-3.5 text-cinder-orange" />
                <span>CF Workers / D1</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cinder-bone border border-cinder-border">
                <Globe className="w-3.5 h-3.5 text-cinder-orange" />
                <span>Cloudinary CDN</span>
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cinder-bone border border-cinder-border">
                <Shield className="w-3.5 h-3.5 text-cinder-orange" />
                <span>InsForge Auth</span>
              </span>
            </div>
          </div>

          {/* Col 2: Editorial Taxonomies */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-cinder-muted font-semibold">
              Sections
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category/architecture" className="text-cinder-ink hover:text-cinder-orange transition-colors">
                  Systems Architecture
                </Link>
              </li>
              <li>
                <Link href="/category/edge-computing" className="text-cinder-ink hover:text-cinder-orange transition-colors">
                  Edge Computing
                </Link>
              </li>
              <li>
                <Link href="/category/typography-ux" className="text-cinder-ink hover:text-cinder-orange transition-colors">
                  Typography & UX
                </Link>
              </li>
              <li>
                <Link href="/category/deep-systems" className="text-cinder-ink hover:text-cinder-orange transition-colors">
                  Deep Systems
                </Link>
              </li>
              <li>
                <Link href="/category/cultural-signals" className="text-cinder-ink hover:text-cinder-orange transition-colors">
                  Cultural Signals
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Publishing Feeds & Metadata */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-cinder-muted font-semibold">
              Syndication
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/rss.xml" className="flex items-center gap-1.5 text-cinder-ink hover:text-cinder-orange transition-colors">
                  <Rss className="w-3.5 h-3.5 text-cinder-orange" />
                  <span>RSS 2.0 Feed</span>
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="text-cinder-ink hover:text-cinder-orange transition-colors">
                  XML Sitemap
                </Link>
              </li>
              <li>
                <Link href="/robots.txt" className="text-cinder-ink hover:text-cinder-orange transition-colors">
                  Robots Directive
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-cinder-ink hover:text-cinder-orange transition-colors">
                  Colophon & Manifesto
                </Link>
              </li>
              <li>
                <Link href="/archive/2026" className="text-cinder-ink hover:text-cinder-orange transition-colors">
                  Chronological Archive
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-cinder-border flex flex-col sm:flex-row items-center justify-between text-xs text-cinder-muted gap-4">
          <p>© {new Date().getFullYear()} CinderPress Review. All rights reserved.</p>
          <p className="font-mono text-[11px]">Designed with typographic restraint and zero generic AI bloat.</p>
        </div>
      </div>
    </footer>
  );
}
