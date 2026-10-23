'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogOut, Settings } from 'lucide-react';
import { clearAdminCookie } from '@/lib/auth';
import { COPY } from '@/lib/copy';

export const AdminPreviewBar: React.FC = () => {
  const router = useRouter();

  const handleSignOut = () => {
    // Clear both cookie and session storage
    clearAdminCookie();
    try {
      sessionStorage.removeItem('gfc_admin_token');
      sessionStorage.removeItem('gfc_admin_user');
    } catch {
      // Ignore storage error
    }
    // Refresh to trigger 404 unavailable page immediately
    router.refresh();
  };

  return (
    <aside
      aria-label="Admin Preview Mode"
      className="bg-[#2B0A0C] border-b-2 border-craze-amber text-craze-cream px-3 py-2 sticky top-0 z-50 shadow-md"
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-craze-red px-2.5 py-1 rounded-full text-white font-sans font-bold uppercase tracking-wider text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-craze-amber" />
            Admin Preview
          </span>
          <span className="hidden sm:inline font-sans text-craze-amber/90">
            {COPY.unavailable.adminPreviewBanner}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/admin/reviews"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-craze-cream font-sans font-medium transition-colors min-h-[36px]"
          >
            <Settings className="w-3.5 h-3.5 text-craze-amber" />
            <span>Admin Panel</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-craze-red hover:bg-craze-red-dark text-white font-sans font-medium transition-colors min-h-[36px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{COPY.unavailable.signOutButton}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
