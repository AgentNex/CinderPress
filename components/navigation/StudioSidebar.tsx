'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CinderLogo } from '@/components/brand/CinderMark';
import { useAuth } from '@/lib/auth/context';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Image as ImageIcon,
  FolderTree,
  Tag as TagIcon,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export function StudioSidebar() {
  const pathname = usePathname();
  const { user, author, signOut } = useAuth();

  const links = [
    { label: 'Overview', href: '/studio', icon: LayoutDashboard },
    { label: 'All Stories', href: '/studio/posts', icon: FileText },
    { label: 'New Story', href: '/studio/posts/new', icon: PlusCircle, highlight: true },
    { label: 'Media Library', href: '/studio/media', icon: ImageIcon },
    { label: 'Categories', href: '/studio/categories', icon: FolderTree },
    { label: 'Tags', href: '/studio/tags', icon: TagIcon },
    { label: 'Comments', href: '/studio/comments', icon: MessageSquare },
    { label: 'Settings', href: '/studio/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-cinder-border bg-cinder-paper-soft flex flex-col justify-between h-screen sticky top-0">
      <div className="p-6 space-y-6">
        {/* Brand Lockup */}
        <div className="flex items-center justify-between pb-4 border-b border-cinder-border">
          <Link href="/studio">
            <CinderLogo markSize={26} />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-cinder-ink text-white shadow-sm'
                    : item.highlight
                    ? 'text-cinder-orange hover:bg-cinder-bone'
                    : 'text-cinder-muted hover:text-cinder-ink hover:bg-cinder-bone'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-cinder-orange' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User / Exit Footer */}
      <div className="p-6 border-t border-cinder-border space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between text-xs font-mono text-cinder-muted hover:text-cinder-ink transition-colors px-2"
        >
          <span>View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {user && (
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-cinder-ink text-white text-xs font-mono flex items-center justify-center flex-shrink-0">
                {author?.display_name ? author.display_name[0] : user.email[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-cinder-ink truncate block">
                  {author?.display_name || user.email.split('@')[0]}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cinder-orange block">
                  {author?.role || 'author'}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 text-cinder-muted hover:text-cinder-error rounded-lg hover:bg-cinder-bone transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
