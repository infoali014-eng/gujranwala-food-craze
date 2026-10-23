'use client';

import React, { useState } from 'react';
import { Review } from '@/lib/api';
import { DeleteButton } from './DeleteButton';
import { Star, RotateCcw, Eye, EyeOff, Search } from 'lucide-react';

interface AdminReviewListProps {
  reviews: Review[];
  showDeleted: boolean;
  onToggleShowDeleted: (show: boolean) => void;
  onDelete: (id: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  isLoadingAction?: boolean;
}

export const AdminReviewList: React.FC<AdminReviewListProps> = ({
  reviews,
  showDeleted,
  onToggleShowDeleted,
  onDelete,
  onRestore,
  isLoadingAction = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReviews = reviews.filter((r) => {
    if (!showDeleted && r.deleted_at !== null) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q) ||
        (r.source && r.source.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const liveCount = reviews.filter((r) => r.deleted_at === null).length;
  const deletedCount = reviews.filter((r) => r.deleted_at !== null).length;

  return (
    <div className="bg-white rounded-2xl border-2 border-craze-amber/40 shadow-sm overflow-hidden">
      {/* Header Controls */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF9]">
        <div>
          <h3 className="font-heading text-2xl uppercase tracking-wider text-craze-red">
            Review Moderation ({filteredReviews.length})
          </h3>
          <p className="text-xs text-gray-500 font-sans mt-0.5">
            Active: <strong className="text-emerald-700">{liveCount}</strong> • Soft-Deleted:{' '}
            <strong className="text-red-700">{deletedCount}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviewer or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-craze-amber w-44 sm:w-56 font-sans"
            />
          </div>

          {/* Toggle show deleted */}
          <button
            type="button"
            onClick={() => onToggleShowDeleted(!showDeleted)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-colors border ${
              showDeleted
                ? 'bg-craze-amber/20 text-craze-dark border-craze-amber'
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
            }`}
          >
            {showDeleted ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Show Deleted ({deletedCount})</span>
          </button>
        </div>
      </div>

      {/* Review Table / Cards */}
      {filteredReviews.length === 0 ? (
        <div className="py-16 text-center text-gray-400 font-sans text-sm">
          No reviews match your filters.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredReviews.map((review) => {
            const isDeleted = review.deleted_at !== null;

            return (
              <div
                key={review.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
                  isDeleted ? 'bg-red-50/50 opacity-80' : 'hover:bg-amber-50/20'
                }`}
              >
                {/* Review Body */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading text-lg text-craze-dark uppercase tracking-wide">
                      {review.name}
                    </span>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating
                              ? 'text-craze-amber fill-craze-amber'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Status Badge */}
                    {isDeleted ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-red-100 text-red-700">
                        Deleted
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        Live
                      </span>
                    )}

                    {/* Note Color Indicator */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-sans uppercase font-semibold ${
                        review.note_color === 'amber'
                          ? 'bg-amber-100 text-amber-800'
                          : review.note_color === 'red'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {review.note_color} note
                    </span>

                    {review.source && review.source !== 'direct' && (
                      <span className="text-[10px] text-gray-500 font-mono">
                        via ?src={review.source}
                      </span>
                    )}
                  </div>

                  {/* Message */}
                  <p className="font-sans text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    “{review.message}”
                  </p>

                  <span className="block text-[11px] text-gray-400 font-sans">
                    Posted on {new Date(review.created_at).toLocaleString('en-PK')}
                  </span>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  {isDeleted ? (
                    <button
                      type="button"
                      disabled={isLoadingAction}
                      onClick={() => onRestore(review.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                  ) : (
                    <DeleteButton
                      reviewId={review.id}
                      reviewerName={review.name}
                      onConfirm={onDelete}
                      isLoading={isLoadingAction}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
