import React from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/navigation/SiteHeader';
import { SiteFooter } from '@/components/navigation/SiteFooter';
import { CinderLogo } from '@/components/brand/CinderMark';
import { Layers, Shield, Terminal, Globe, BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cinder-paper">
      <SiteHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
        <div className="space-y-4 border-b border-cinder-border pb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-cinder-orange font-semibold block">
            Colophon & Architectural Manifesto
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-cinder-ink">
            Crafting Instruments for Editorial Depth.
          </h1>
        </div>

        <div className="cinder-prose space-y-6">
          <p>
            CinderPress was born from an acute dissatisfaction with the state of digital publishing. 
            Over the past decade, web publications have steadily drifted toward two unfortunate extremes: 
            bloated corporate content engines laden with hundreds of third-party trackers, or generic, 
            ephemeral AI-generated dashboards that sacrifice typographic dignity in favor of neon gradients.
          </p>

          <h2>The Triad of Clean Architecture</h2>
          <p>
            CinderPress operates upon three distinct, decoupled pillars of engineering responsibility:
          </p>

          <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            <div className="p-5 rounded-xl border border-cinder-border bg-cinder-paper-soft space-y-2">
              <div className="flex items-center gap-2 text-cinder-orange">
                <Shield className="w-5 h-5" />
                <span className="font-mono text-xs uppercase font-bold">Identity</span>
              </div>
              <h3 className="font-bold text-sm text-cinder-ink">InsForge Auth</h3>
              <p className="text-xs text-cinder-muted leading-relaxed">
                Cryptographically sound user authentication, session persistence, and role verification without database coupling.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-cinder-border bg-cinder-paper-soft space-y-2">
              <div className="flex items-center gap-2 text-cinder-orange">
                <Terminal className="w-5 h-5" />
                <span className="font-mono text-xs uppercase font-bold">Relational Core</span>
              </div>
              <h3 className="font-bold text-sm text-cinder-ink">Cloudflare D1</h3>
              <p className="text-xs text-cinder-muted leading-relaxed">
                Serverless SQLite deployed at the planetary edge, storing structured posts, revisions, and FTS5 search indexes.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-cinder-border bg-cinder-paper-soft space-y-2">
              <div className="flex items-center gap-2 text-cinder-orange">
                <Globe className="w-5 h-5" />
                <span className="font-mono text-xs uppercase font-bold">Media Delivery</span>
              </div>
              <h3 className="font-bold text-sm text-cinder-ink">Cloudinary CDN</h3>
              <p className="text-xs text-cinder-muted leading-relaxed">
                Adaptive format generation (f_auto/q_auto), signed uploads, responsive breakpoints, and instant visual CDN delivery.
              </p>
            </div>
          </div>

          <h2>Typographic Restraint</h2>
          <p>
            We adhere strictly to the empirical science of reading mechanics: maximum character lines constrained between 680px and 720px, 
            high-contrast carbon ink on archival warm paper stock, and zero visual chrome that competes with the author’s voice.
          </p>

          <div className="pt-8 border-t border-cinder-border">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cinder-ink text-white text-xs font-semibold uppercase tracking-wider hover:bg-cinder-charcoal transition-colors"
            >
              <BookOpen className="w-4 h-4 text-cinder-orange" />
              <span>Explore The Archive</span>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
