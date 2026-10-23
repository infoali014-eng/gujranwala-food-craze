'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Review,
  Deal,
  MemberStats,
  SiteLinks,
  getAdminReviews,
  deleteReviewApi,
  restoreReviewApi,
  updateWeeklyDealApi,
  updateMemberStatsApi,
  updateSiteLinksApi,
  getCurrentDeal,
  getMemberStats,
  getSiteLinks,
  getAdminComplaints,
} from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { clearAdminCookie } from '@/lib/auth';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminReviewList } from '@/components/admin/AdminReviewList';
import { AdminDealEditor } from '@/components/admin/AdminDealEditor';
import { AdminStatsEditor } from '@/components/admin/AdminStatsEditor';
import { AdminLinksEditor } from '@/components/admin/AdminLinksEditor';
import { Logo } from '@/components/ui/Logo';
import {
  LogOut,
  RefreshCw,
  ShieldAlert,
  MessageSquare,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { COPY } from '@/lib/copy';

export default function AdminReviewsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('Moderator');

  const [activeTab, setActiveTab] = useState<'reviews' | 'settings'>('reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showDeleted, setShowDeleted] = useState(true);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [links, setLinks] = useState<SiteLinks | null>(null);
  const [newComplaintsCount, setNewComplaintsCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<{ code?: string; message: string } | null>(null);
  const [isNotAdmin, setIsNotAdmin] = useState(false);

  // Helper to read fresh token from Supabase session before each call
  const getFreshToken = useCallback(async (): Promise<string | null> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.access_token) {
          sessionStorage.setItem('gfc_admin_token', data.session.access_token);
          if (data.session.user?.email) {
            setUserEmail(data.session.user.email);
          }
          return data.session.access_token;
        }
      } catch (err) {
        console.warn('Could not refresh Supabase session:', err);
      }
    }
    return sessionStorage.getItem('gfc_admin_token');
  }, []);

  const handleLogout = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    sessionStorage.removeItem('gfc_admin_token');
    sessionStorage.removeItem('gfc_admin_user');
    clearAdminCookie();
    router.push('/admin/login');
  }, [router]);

  // Load reviews, deal, and stats
  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setErrorBanner(null);
    setIsNotAdmin(false);

    const activeToken = await getFreshToken();

    if (!activeToken) {
      router.push('/admin/login');
      return;
    }

    setToken(activeToken);

    try {
      const [reviewsRes, dealRes, statsRes, linksRes, complaintsRes] = await Promise.all([
        getAdminReviews(activeToken, true),
        getCurrentDeal(),
        getMemberStats(),
        getSiteLinks(),
        getAdminComplaints(activeToken, true),
      ]);

      if (complaintsRes.data) {
        const unread = complaintsRes.data.filter(
          (c) => !c.deleted_at && c.status === 'new'
        ).length;
        setNewComplaintsCount(unread);
      }

      if (reviewsRes.error) {
        const code = reviewsRes.error.code;
        const msg = reviewsRes.error.message;

        if (code === 'AUTH_MISSING' || code === 'AUTH_INVALID' || msg.includes('401')) {
          await handleLogout();
          return;
        }

        if (code === 'NOT_ADMIN' || msg.includes('403') || msg.includes('Yeh account admin nahi hai')) {
          setIsNotAdmin(true);
          setIsLoading(false);
          return;
        }

        setErrorBanner({
          code: code || 'ERROR',
          message: msg,
        });
      } else if (reviewsRes.data) {
        setReviews(reviewsRes.data);
      }

      if (dealRes.data) setDeal(dealRes.data);
      if (statsRes.data) setStats(statsRes.data);
      if (linksRes.data) setLinks(linksRes.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch admin data';
      setErrorBanner({ code: 'EXCEPTION', message: msg });
    } finally {
      setIsLoading(false);
    }
  }, [getFreshToken, handleLogout, router]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  // Soft Delete Handler
  const handleDelete = async (id: string) => {
    const activeToken = await getFreshToken();
    if (!activeToken) return;
    setIsActionLoading(true);

    try {
      const res = await deleteReviewApi(id, activeToken);
      if (res.data?.success) {
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
    const activeToken = await getFreshToken();
    if (!activeToken) return;
    setIsActionLoading(true);

    try {
      const res = await restoreReviewApi(id, activeToken);
      if (res.data?.success) {
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
    const activeToken = await getFreshToken();
    if (!activeToken) return false;
    const res = await updateWeeklyDealApi(dealData, activeToken);
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
    const activeToken = await getFreshToken();
    if (!activeToken) return false;
    const res = await updateMemberStatsApi(statsData, activeToken);
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
    const activeToken = await getFreshToken();
    if (!activeToken) return false;
    const res = await updateSiteLinksApi(linksData, activeToken);
    if (res.data) {
      setLinks(res.data);
      return true;
    }
    return false;
  };

  if (isNotAdmin) {
    return (
      <div className="min-h-screen bg-[#FDEFDA] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border-4 border-craze-red shadow-2xl p-6 sm:p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-craze-red mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl uppercase tracking-wider text-craze-red mb-2">
            Access Denied
          </h2>
          <p className="font-sans text-base text-craze-dark font-semibold mb-6">
            Yeh account admin nahi hai.
          </p>
          <button
            onClick={handleLogout}
            className="w-full py-3.5 px-4 rounded-xl bg-craze-red text-white font-heading text-lg uppercase tracking-wider hover:bg-[#8F0A13] transition-colors shadow-sm min-h-[48px]"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (!token && isLoading) {
    return (
      <div className="min-h-screen bg-[#FDEFDA] flex items-center justify-center font-heading text-xl uppercase tracking-wider text-craze-red">
        Verifying Session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8EFE4] text-craze-dark selection:bg-craze-amber selection:text-craze-dark pb-20">
      {/* Shared Admin Navigation */}
      <AdminNav
        userEmail={userEmail}
        newComplaintsCount={newComplaintsCount}
        onLogout={handleLogout}
      />

      {/* Main Admin Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {errorBanner && (
          <div className="p-4 rounded-2xl bg-red-100 border-2 border-red-300 text-red-800 text-sm font-sans flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <span className="font-semibold">
                [{errorBanner.code || 'ERROR'}] {errorBanner.message}
              </span>
            </div>
            <button
              onClick={() => loadAdminData()}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 min-h-[36px]"
            >
              Dobara koshish karein
            </button>
          </div>
        )}

        {/* Tab Switcher & Quick Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex rounded-2xl bg-white p-1 border-2 border-craze-amber/50 shadow-xs max-w-sm">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-heading text-sm uppercase tracking-wider transition-all min-h-[44px] ${
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
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-heading text-sm uppercase tracking-wider transition-all min-h-[44px] ${
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
            onClick={() => loadAdminData()}
            disabled={isLoading}
            className="self-end sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-sans font-bold uppercase tracking-wider bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-xs min-h-[44px]"
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
