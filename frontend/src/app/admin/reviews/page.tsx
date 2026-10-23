'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { AdminReviewList } from '@/components/admin/AdminReviewList';
import { AdminDealEditor } from '@/components/admin/AdminDealEditor';
import { AdminStatsEditor } from '@/components/admin/AdminStatsEditor';
import { AdminLinksEditor } from '@/components/admin/AdminLinksEditor';
import {
  getAdminReviews,
  deleteReviewApi,
  restoreReviewApi,
  getCurrentDeal,
  updateWeeklyDealApi,
  getMemberStats,
  updateMemberStatsApi,
  getSiteLinks,
  updateSiteLinksApi,
  Review,
  Deal,
  MemberStats,
  SiteLinks,
} from '@/lib/api';
import {
  ShieldAlert,
  LogOut,
  MessageSquare,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { COPY } from '@/lib/copy';

export default function AdminReviewsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('admin@foodcraze.pk');

  const [activeTab, setActiveTab] = useState<'reviews' | 'settings'>('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showDeleted, setShowDeleted] = useState(true);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [links, setLinks] = useState<SiteLinks | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Authenticate session on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('gfc_admin_token');
    const savedUser = sessionStorage.getItem('gfc_admin_user');

    if (!savedToken) {
      router.push('/admin/login');
      return;
    }

    setToken(savedToken);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.email) setUserEmail(parsed.email);
      } catch {
        // ignore
      }
    }
  }, [router]);

  // Load reviews, deal, and stats
  const loadAdminData = useCallback(
    async (authToken: string) => {
      setIsLoading(true);
      setErrorBanner(null);

      try {
        const [reviewsRes, dealRes, statsRes, linksRes] = await Promise.all([
          getAdminReviews(authToken, true),
          getCurrentDeal(),
          getMemberStats(),
          getSiteLinks(),
        ]);

        if (reviewsRes.error) {
          if (
            reviewsRes.error.message.includes('403') ||
            reviewsRes.error.message.includes('Access denied')
          ) {
            setErrorBanner(
              'Access Forbidden: Your account is not in the admins table. Redirecting...'
            );
            setTimeout(() => router.push('/admin/login'), 3000);
            return;
          }
          setErrorBanner(reviewsRes.error.message);
        } else if (reviewsRes.data) {
          setReviews(reviewsRes.data);
        }

        if (dealRes.data) setDeal(dealRes.data);
        if (statsRes.data) setStats(statsRes.data);
        if (linksRes.data) setLinks(linksRes.data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch admin data';
        setErrorBanner(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (token) {
      loadAdminData(token);
    }
  }, [token, loadAdminData]);

  // Soft Delete Handler
  const handleDelete = async (id: string) => {
    if (!token) return;
    setIsActionLoading(true);

    try {
      const res = await deleteReviewApi(id, token);
      if (res.data?.success) {
        // Optimistically update local reviews list
        setReviews((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, deleted_at: new Date().toISOString() } : r
          )
        );
      } else {
        alert(res.error?.message || 'Delete failed');
      }
    } catch {
      alert('Network error deleting review');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Restore Handler
  const handleRestore = async (id: string) => {
    if (!token) return;
    setIsActionLoading(true);

    try {
      const res = await restoreReviewApi(id, token);
      if (res.data?.success) {
        // Optimistically update local reviews list
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, deleted_at: null } : r))
        );
      } else {
        alert(res.error?.message || 'Restore failed');
      }
    } catch {
      alert('Network error restoring review');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Save Deal
  const handleSaveDeal = async (dealData: {
    title: string;
    description: string;
    price_text: string;
    valid_until: string;
    is_active?: boolean;
  }): Promise<boolean> => {
    if (!token) return false;
    const res = await updateWeeklyDealApi(dealData, token);
    if (res.data) {
      setDeal(res.data);
      return true;
    }
    return false;
  };

  // Save Stats
  const handleSaveStats = async (statsData: {
    joined_count: number;
    display_boost?: number;
  }): Promise<boolean> => {
    if (!token) return false;
    const res = await updateMemberStatsApi(statsData, token);
    if (res.data) {
      setStats(res.data);
      return true;
    }
    return false;
  };

  // Save Links
  const handleSaveLinks = async (linksData: {
    whatsapp_link: string;
    foodpanda_link: string;
  }): Promise<boolean> => {
    if (!token) return false;
    const res = await updateSiteLinksApi(linksData, token);
    if (res.data) {
      setLinks(res.data);
      return true;
    }
    return false;
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem('gfc_admin_token');
    sessionStorage.removeItem('gfc_admin_user');
    router.push('/admin/login');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#FDEFDA] flex items-center justify-center font-heading text-xl uppercase tracking-wider text-craze-red">
        Verifying Session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8EFE4] text-craze-dark selection:bg-craze-amber selection:text-craze-dark pb-20">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 bg-craze-dark border-b-4 border-craze-amber text-craze-cream px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showSteam={false} />
            <div>
              <span className="font-heading text-xl uppercase tracking-wider text-craze-amber block leading-tight">
                {COPY.brand.name}
              </span>
              <span className="text-[10px] font-sans text-craze-cream/70 uppercase tracking-widest block">
                Control Panel • {userEmail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center text-xs font-heading uppercase tracking-wider text-craze-cream/80 hover:text-white min-h-[48px]"
            >
              <span>Public Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-sans font-bold uppercase tracking-wider text-craze-cream transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {errorBanner && (
          <div className="p-4 rounded-2xl bg-red-100 border-2 border-red-300 text-red-800 text-sm font-sans flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-semibold">{errorBanner}</span>
          </div>
        )}

        {/* Tab Switcher & Quick Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex rounded-2xl bg-white p-1 border-2 border-craze-amber/50 shadow-xs max-w-sm">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-heading text-sm uppercase tracking-wider transition-all ${
                activeTab === 'reviews'
                  ? 'bg-craze-amber text-craze-dark shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Reviews Moderation</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-heading text-sm uppercase tracking-wider transition-all ${
                activeTab === 'settings'
                  ? 'bg-craze-amber text-craze-dark shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Site Controls</span>
            </button>
          </div>

          <button
            onClick={() => loadAdminData(token)}
            disabled={isLoading}
            className="self-end sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Tab 1: Review Moderation */}
        {activeTab === 'reviews' && (
          <section className="space-y-4">
            <AdminReviewList
              reviews={reviews}
              showDeleted={showDeleted}
              onToggleShowDeleted={setShowDeleted}
              onDelete={handleDelete}
              onRestore={handleRestore}
              isLoadingAction={isActionLoading}
            />
          </section>
        )}

        {/* Tab 2: Weekly Deal, Member Count & Business Links Controls */}
        {activeTab === 'settings' && (
          <section className="space-y-6">
            <AdminLinksEditor currentLinks={links} onSave={handleSaveLinks} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdminDealEditor currentDeal={deal} onSave={handleSaveDeal} />
              <AdminStatsEditor currentStats={stats} onSave={handleSaveStats} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
