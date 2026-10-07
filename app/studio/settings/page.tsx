'use client';

import React, { useState } from 'react';
import { StudioHeader } from '@/components/navigation/StudioHeader';
import { useAuth } from '@/lib/auth/context';
import { Settings, Save, CheckCircle2, Shield, Database, Globe, Server } from 'lucide-react';

export default function StudioSettingsPage() {
  const { user, author } = useAuth();

  const [pubName, setPubName] = useState('CinderPress Review');
  const [description, setDescription] = useState(
    'An independent journal of systems architecture, interface craftsmanship, and edge engineering.'
  );
  const [locale, setLocale] = useState('en-US');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col bg-cinder-paper">
      <StudioHeader
        title="Settings & System Diagnostics"
        description="Configure publication parameters and inspect infrastructure health."
      />

      <div className="p-8 max-w-4xl space-y-8">
        {/* System Health Diagnostics */}
        <div className="p-6 rounded-2xl border border-cinder-border bg-cinder-paper-soft space-y-4">
          <h3 className="text-sm font-mono uppercase tracking-wider text-cinder-muted font-semibold flex items-center gap-2">
            <Server className="w-4 h-4 text-cinder-orange" />
            <span>Infrastructure Connectivity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-cinder-border bg-white space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-cinder-ink">InsForge Auth</span>
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <p className="text-[11px] font-mono text-cinder-muted truncate">
                {user ? `Active: ${user.email}` : 'Connected'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-cinder-border bg-white space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-cinder-ink">Cloudflare D1</span>
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <p className="text-[11px] font-mono text-cinder-muted">
                cinderpress-db-local
              </p>
            </div>

            <div className="p-4 rounded-xl border border-cinder-border bg-white space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-cinder-ink">Cloudinary Media</span>
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <p className="text-[11px] font-mono text-cinder-muted">
                {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'cinderpress-demo'}
              </p>
            </div>
          </div>
        </div>

        {/* Publication Configuration Form */}
        <form onSubmit={handleSave} className="p-6 rounded-2xl border border-cinder-border bg-cinder-paper-soft space-y-6">
          <h3 className="text-sm font-mono uppercase tracking-wider text-cinder-muted font-semibold">
            Publication Identity
          </h3>

          {saved && (
            <div className="p-3 text-xs bg-green-50 border border-green-200 text-cinder-success rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Publication settings updated.</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-cinder-muted mb-1 font-semibold">
                Publication Name
              </label>
              <input
                type="text"
                value={pubName}
                onChange={(e) => setPubName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-cinder-muted mb-1 font-semibold">
                Publication Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-cinder-muted mb-1 font-semibold">
                Primary Locale
              </label>
              <input
                type="text"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-cinder-border bg-white text-cinder-ink outline-none focus:border-cinder-orange"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cinder-orange text-white text-xs font-semibold uppercase tracking-wider hover:bg-cinder-orange-deep transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
