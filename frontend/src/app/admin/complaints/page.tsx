'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Complaint,
  ComplaintStatus,
  getAdminComplaints,
  updateComplaintStatusApi,
  updateComplaintNotesApi,
  deleteComplaintApi,
  restoreComplaintApi,
} from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { clearAdminCookie } from '@/lib/auth';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminComplaintsInbox } from '@/components/admin/AdminComplaintsInbox';
import { ShieldAlert, AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminComplaintsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('Moderator');

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState<{ code?: string; message: string } | null>(null);
  const [isNotAdmin, setIsNotAdmin] = useState(false);

  // Helper to read fresh token from Supabase session
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

  // Load complaints
  const loadComplaints = useCallback(async () => {
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
      const res = await getAdminComplaints(activeToken, true);

      if (res.error) {
        if (res.error.code === 'AUTH_MISSING' || res.error.code === 'UNAUTHORIZED') {
          setIsNotAdmin(true);
        } else {
          setErrorBanner(res.error);
        }
      } else if (res.data) {
        setComplaints(res.data);
      }
    } catch {
      setErrorBanner({ message: 'Network error loading complaints inbox.' });
    } finally {
      setIsLoading(false);
    }
  }, [getFreshToken, router]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  // Update status handler
  const handleUpdateStatus = async (id: string, status: ComplaintStatus): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await updateComplaintStatusApi(id, status, token);
      if (res.data) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status, updated_at: res.data!.updated_at } : c))
        );
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  };

  // Update notes handler
  const handleUpdateNotes = async (id: string, admin_notes: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await updateComplaintNotesApi(id, admin_notes, token);
      if (res.data) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, admin_notes, updated_at: res.data!.updated_at } : c))
        );
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  };

  // Delete complaint handler
  const handleDelete = async (id: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await deleteComplaintApi(id, token);
      if (res.data?.success) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, deleted_at: new Date().toISOString() } : c))
        );
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  };

  // Restore complaint handler
  const handleRestore = async (id: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await restoreComplaintApi(id, token);
      if (res.data?.success) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === id ? { ...c, deleted_at: null } : c))
        );
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  };

  const newCount = complaints.filter((c) => !c.deleted_at && c.status === 'new').length;

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
            type="button"
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
        newComplaintsCount={newCount}
        onLogout={handleLogout}
      />

      {/* Main Admin Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {errorBanner && (
          <div className="p-4 rounded-2xl bg-red-100 border-2 border-red-300 text-red-800 text-sm font-sans flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <span className="font-semibold">
                [{errorBanner.code || 'ERROR'}] {errorBanner.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => loadComplaints()}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 min-h-[36px]"
            >
              Dobara koshish karein
            </button>
          </div>
        )}

        {/* Page Title & Refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-craze-red">
              Complaints and Suggestions Inbox
            </h1>
            <p className="font-serif italic text-xs sm:text-sm text-craze-dark/75 mt-0.5">
              Customer issues, suggestions, order complaints, and team resolutions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadComplaints()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-sans font-bold uppercase tracking-wider shadow-xs min-h-[40px] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Complaints Inbox List */}
        <AdminComplaintsInbox
          complaints={complaints}
          token={token || ''}
          showDeleted={showDeleted}
          onToggleDeleted={setShowDeleted}
          onUpdateStatus={handleUpdateStatus}
          onUpdateNotes={handleUpdateNotes}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />
      </main>
    </div>
  );
}
