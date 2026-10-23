'use client';

import React, { useState, useMemo } from 'react';
import {
  Complaint,
  ComplaintStatus,
  ComplaintType,
} from '@/lib/api';
import {
  Phone,
  MessageCircle,
  Copy,
  Check,
  Search,
  Filter,
  Trash2,
  RotateCcw,
  Download,
  AlertCircle,
  Calendar,
  Save,
  Clock,
  Sparkles,
} from 'lucide-react';
import { COPY } from '@/lib/copy';
import { getWhatsAppContactLink } from '@/lib/phone';

interface AdminComplaintsInboxProps {
  complaints: Complaint[];
  token: string;
  showDeleted: boolean;
  onToggleDeleted: (val: boolean) => void;
  onUpdateStatus: (id: string, status: ComplaintStatus) => Promise<boolean>;
  onUpdateNotes: (id: string, notes: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onRestore: (id: string) => Promise<boolean>;
}

export const AdminComplaintsInbox: React.FC<AdminComplaintsInboxProps> = ({
  complaints,
  token,
  showDeleted,
  onToggleDeleted,
  onUpdateStatus,
  onUpdateNotes,
  onDelete,
  onRestore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ComplaintStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ComplaintType>('all');

  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});
  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);
  const [savedNotesSuccess, setSavedNotesSuccess] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Initialize activeNotes with complaint.admin_notes
  React.useEffect(() => {
    const map: Record<string, string> = {};
    complaints.forEach((c) => {
      map[c.id] = c.admin_notes || '';
    });
    setActiveNotes(map);
  }, [complaints]);

  // Statistics
  const stats = useMemo(() => {
    const active = complaints.filter((c) => !c.deleted_at);
    return {
      total: active.length,
      newCount: active.filter((c) => c.status === 'new').length,
      inProgressCount: active.filter((c) => c.status === 'in_progress').length,
      resolvedCount: active.filter((c) => c.status === 'resolved').length,
      deletedCount: complaints.filter((c) => c.deleted_at).length,
    };
  }, [complaints]);

  // Filtered & Searched complaints list
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      // Deleted filter
      if (!showDeleted && item.deleted_at) return false;
      if (showDeleted && !item.deleted_at) {
        // If showDeleted is true, we display all (or deleted only if preferred)
      }

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Type filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Search query (matches reference, name, phone, order_details, message)
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const refMatch = item.reference_number.toLowerCase().includes(q);
        const nameMatch = item.name.toLowerCase().includes(q);
        const phoneMatch = item.phone.toLowerCase().includes(q);
        const orderMatch = (item.order_details || '').toLowerCase().includes(q);
        const msgMatch = item.message.toLowerCase().includes(q);
        if (!refMatch && !nameMatch && !phoneMatch && !orderMatch && !msgMatch) {
          return false;
        }
      }

      return true;
    });
  }, [complaints, showDeleted, statusFilter, typeFilter, searchQuery]);

  // Copy phone number helper
  const handleCopyPhone = (id: string, phone: string) => {
    try {
      navigator.clipboard.writeText(phone);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Ignore
    }
  };

  // Status change handler
  const handleStatusChange = async (id: string, newStatus: ComplaintStatus) => {
    setActionInProgress(id);
    await onUpdateStatus(id, newStatus);
    setActionInProgress(null);
  };

  // Save admin notes handler
  const handleSaveNotes = async (id: string) => {
    const noteText = activeNotes[id] ?? '';
    setSavingNotesId(id);
    const ok = await onUpdateNotes(id, noteText);
    setSavingNotesId(null);
    if (ok) {
      setSavedNotesSuccess(id);
      setTimeout(() => setSavedNotesSuccess(null), 3000);
    }
  };

  // CSV Export handler
  const handleExportCsv = () => {
    const headers = [
      'Reference Number',
      'Type',
      'Status',
      'Name',
      'Phone Number',
      'Order Details',
      'Message',
      'Source',
      'Admin Internal Notes',
      'Date Submitted',
      'Last Updated',
      'Is Deleted',
    ];

    const rows = filteredComplaints.map((c) => [
      c.reference_number,
      c.type,
      c.status,
      c.name,
      c.phone,
      c.order_details || '',
      c.message.replace(/\r?\n/g, ' '),
      c.source || 'direct',
      (c.admin_notes || '').replace(/\r?\n/g, ' '),
      new Date(c.created_at).toLocaleString(),
      new Date(c.updated_at).toLocaleString(),
      c.deleted_at ? 'Yes' : 'No',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((row) =>
          row
            .map((field) => `"${String(field).replace(/"/g, '""')}"`)
            .join(',')
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `gfc-complaints-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-gray-500">
            Total Active
          </span>
          <span className="text-3xl font-heading text-craze-dark mt-1 font-bold">
            {stats.total}
          </span>
        </div>

        <div className="bg-red-50 p-4 rounded-2xl border-2 border-red-300 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-red-700">
              New (Unread)
            </span>
            {stats.newCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            )}
          </div>
          <span className="text-3xl font-heading text-red-800 mt-1 font-bold">
            {stats.newCount}
          </span>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-300 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-blue-700">
            In Progress
          </span>
          <span className="text-3xl font-heading text-blue-800 mt-1 font-bold">
            {stats.inProgressCount}
          </span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-300 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-emerald-700">
            Resolved
          </span>
          <span className="text-3xl font-heading text-emerald-800 mt-1 font-bold">
            {stats.resolvedCount}
          </span>
        </div>
      </div>

      {/* 2. Controls Bar (Search, Filters, CSV Export, Deleted Toggle) */}
      <div className="bg-white rounded-2xl border-2 border-craze-amber/40 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, name, phone, message..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:border-craze-amber focus:outline-none text-sm font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons: Export CSV & Show Deleted Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-sans font-bold uppercase tracking-wider text-craze-dark transition-colors min-h-[40px]"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleDeleted(!showDeleted)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-colors min-h-[40px] border ${
                showDeleted
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{showDeleted ? 'Hide Deleted' : 'Show Deleted'}</span>
              {stats.deletedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-gray-200 text-gray-800 text-[10px]">
                  {stats.deletedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Chips: Status and Type */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-sans font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0">
              Status:
            </span>
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'new', label: 'New' },
                { key: 'in_progress', label: 'In Progress' },
                { key: 'resolved', label: 'Resolved' },
              ] as const
            ).map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setStatusFilter(s.key)}
                className={`px-3 py-1 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-colors min-h-[32px] shrink-0 ${
                  statusFilter === s.key
                    ? 'bg-craze-dark text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-sans font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0">
              Type:
            </span>
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'complaint', label: 'Complaint' },
                { key: 'suggestion', label: 'Suggestion' },
                { key: 'other', label: 'Other' },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTypeFilter(t.key)}
                className={`px-3 py-1 rounded-lg text-xs font-sans font-bold uppercase tracking-wider transition-colors min-h-[32px] shrink-0 ${
                  typeFilter === t.key
                    ? 'bg-craze-amber text-craze-dark'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Submissions List */}
      {filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-300 p-12 text-center text-gray-500">
          <p className="font-heading text-xl uppercase tracking-wider text-gray-600 mb-1">
            No Submissions Found
          </p>
          <p className="text-xs font-sans">
            Koi shikayat ya suggestion filter ke mutabiq nahi mili.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((item) => {
            const isDeleted = Boolean(item.deleted_at);
            const isNew = item.status === 'new';
            const waLink = getWhatsAppContactLink(
              item.phone,
              COPY.complaints.whatsappMessageTemplate
            );
            const cleanPhoneDigits = item.phone.replace(/\D/g, '');

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border-2 p-5 sm:p-6 shadow-sm transition-all ${
                  isDeleted
                    ? 'opacity-60 border-gray-300 bg-gray-50'
                    : isNew
                    ? 'border-red-400 bg-red-50/20 shadow-md ring-2 ring-red-200/50'
                    : 'border-gray-200'
                }`}
              >
                {/* Header Row: Reference, Type, Status, Source, Date */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Reference Number Badge */}
                    <span className="font-heading text-base font-bold tracking-wider text-craze-red bg-[#FDEFDA] px-2.5 py-1 rounded-lg border border-craze-amber/50">
                      {item.reference_number}
                    </span>

                    {/* Type Badge */}
                    <span
                      className={`text-[11px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        item.type === 'complaint'
                          ? 'bg-red-100 text-red-800'
                          : item.type === 'suggestion'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.type}
                    </span>

                    {/* Source Tag */}
                    <span className="text-[10px] font-sans text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Source: {item.source || 'direct'}
                    </span>

                    {isDeleted && (
                      <span className="text-[10px] font-sans font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Deleted
                      </span>
                    )}
                  </div>

                  {/* Submission Timestamp */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 font-sans">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* Main Body: Customer Details & Message */}
                <div className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div>
                      <h4 className="font-heading text-lg sm:text-xl text-craze-dark tracking-wide">
                        {item.name}
                      </h4>
                      <p className="text-xs font-sans text-gray-600 font-medium">
                        Mobile:{' '}
                        <span className="text-craze-red font-bold select-all">
                          {item.phone}
                        </span>
                      </p>
                    </div>

                    {item.order_details && (
                      <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-sans text-amber-900 max-w-xs">
                        <span className="font-bold">Order Details:</span> {item.order_details}
                      </div>
                    )}
                  </div>

                  {/* Customer Message */}
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-sans text-craze-dark whitespace-pre-wrap leading-relaxed">
                    {item.message}
                  </div>
                </div>

                {/* Quick Action Contact Buttons (Strictly NO arrows on buttons!) */}
                <div className="flex flex-wrap items-center gap-2 pt-1 pb-4 border-b border-gray-100">
                  {/* Call Button */}
                  <a
                    href={`tel:${cleanPhoneDigits}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans font-bold uppercase tracking-wider transition-colors min-h-[40px] shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  {/* WhatsApp Direct Chat Button */}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-sans font-bold uppercase tracking-wider transition-colors min-h-[40px] shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Copy Number Button */}
                  <button
                    type="button"
                    onClick={() => handleCopyPhone(item.id, item.phone)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-sans font-bold uppercase tracking-wider transition-colors min-h-[40px]"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                        <span>Copy Number</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom Row: Status Toggles & Private Internal Notes */}
                <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Status Selection (Single Tap) */}
                  <div className="lg:col-span-5 space-y-1.5">
                    <span className="block text-xs font-sans font-bold uppercase tracking-wider text-gray-500">
                      Update Status:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {(
                        [
                          {
                            key: 'new',
                            label: 'New',
                            activeClass: 'bg-red-600 text-white border-red-600',
                          },
                          {
                            key: 'in_progress',
                            label: 'In Progress',
                            activeClass: 'bg-blue-600 text-white border-blue-600',
                          },
                          {
                            key: 'resolved',
                            label: 'Resolved',
                            activeClass: 'bg-emerald-600 text-white border-emerald-600',
                          },
                        ] as const
                      ).map((st) => (
                        <button
                          key={st.key}
                          type="button"
                          disabled={actionInProgress === item.id}
                          onClick={() => handleStatusChange(item.id, st.key)}
                          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-sans font-bold uppercase tracking-wider border transition-colors min-h-[38px] text-center ${
                            item.status === st.key
                              ? st.activeClass
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span>{st.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Private Internal Notes Field */}
                  <div className="lg:col-span-7 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-sans font-bold uppercase tracking-wider text-gray-500">
                        Internal Notes (Private):
                      </span>
                      {savedNotesSuccess === item.id && (
                        <span className="text-xs font-sans text-emerald-700 font-bold">
                          Notes Saved!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={activeNotes[item.id] ?? ''}
                        onChange={(e) =>
                          setActiveNotes({ ...activeNotes, [item.id]: e.target.value })
                        }
                        placeholder="Action taken, kitchen resolution, etc..."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-gray-300 focus:border-craze-amber focus:outline-none text-xs font-sans min-h-[38px]"
                      />
                      <button
                        type="button"
                        disabled={savingNotesId === item.id}
                        onClick={() => handleSaveNotes(item.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-craze-dark hover:bg-craze-dark/80 text-white text-xs font-sans font-bold uppercase tracking-wider min-h-[38px] transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingNotesId === item.id ? '...' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Soft Delete / Restore Controls */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span className="text-[11px]">
                    Last updated: {new Date(item.updated_at).toLocaleString()}
                  </span>

                  <div>
                    {isDeleted ? (
                      <button
                        type="button"
                        onClick={() => onRestore(item.id)}
                        className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-bold"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Submission</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 hover:underline font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl border-4 border-red-500 max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl uppercase tracking-wider text-red-700">
              Delete Submission?
            </h3>
            <p className="font-sans text-xs text-gray-600 leading-relaxed">
              Yeh submission soft-delete ho jayegi. Aap baad mein Show Deleted toggle se ise dobara restore kar sakte hain.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 px-4 rounded-xl border border-gray-300 font-sans text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-100 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = deleteConfirmId;
                  setDeleteConfirmId(null);
                  await onDelete(id);
                }}
                className="py-2.5 px-4 rounded-xl bg-red-600 text-white font-sans text-xs font-bold uppercase tracking-wider hover:bg-red-700 min-h-[44px]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
