'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { LogOut, MessageSquare, Inbox, ExternalLink } from 'lucide-react';
import { COPY } from '@/lib/copy';

interface AdminNavProps {
  userEmail?: string;
  newComplaintsCount?: number;
  onLogout: () => void;
}

export const AdminNav: React.FC<AdminNavProps> = ({
  userEmail = 'Admin',
  newComplaintsCount = 0,
  onLogout,
}) => {
  const pathname = usePathname();

  const isReviewsActive = pathname === '/admin/reviews';
  const isComplaintsActive = pathname === '/admin/complaints';

  return (
    <header className="sticky top-0 z-40 bg-craze-dark border-b-4 border-craze-amber text-craze-cream px-4 sm:px-6 py-3 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Top bar on mobile / left on desktop: Brand & User */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showSteam={false} />
            <div>
              <span className="font-heading text-lg sm:text-xl uppercase tracking-wider text-craze-amber block leading-tight">
                {COPY.brand.name}
              </span>
              <span className="text-[10px] font-sans text-craze-cream/70 uppercase tracking-widest block">
                Control Panel • {userEmail}
              </span>
            </div>
          </div>

          {/* Quick Logout for mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-sans font-bold uppercase tracking-wider text-craze-cream transition-colors min-h-[44px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Link
            href="/admin/reviews"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-heading uppercase tracking-wider transition-all min-h-[44px] shrink-0 ${
              isReviewsActive
                ? 'bg-craze-amber text-craze-dark font-bold shadow-xs'
                : 'text-craze-cream/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Reviews</span>
          </Link>

          <Link
            href="/admin/complaints"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-heading uppercase tracking-wider transition-all min-h-[44px] shrink-0 ${
              isComplaintsActive
                ? 'bg-craze-amber text-craze-dark font-bold shadow-xs'
                : 'text-craze-cream/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Complaints Inbox</span>
            {newComplaintsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-craze-red text-white text-[11px] font-bold font-sans">
                {newComplaintsCount}
              </span>
            )}
          </Link>

          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-heading uppercase tracking-wider text-craze-cream/70 hover:text-white px-3 py-2 rounded-xl min-h-[44px] shrink-0"
          >
            <span>Public Site</span>
          </Link>

          <div className="hidden md:block">
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-sans font-bold uppercase tracking-wider text-craze-cream transition-colors min-h-[44px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
