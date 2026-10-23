'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DeleteButtonProps {
  reviewId: string;
  reviewerName: string;
  onConfirm: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  reviewId,
  reviewerName,
  onConfirm,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    await onConfirm(reviewId);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete</span>
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-red-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-craze-red">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h4 className="font-heading text-2xl uppercase tracking-wider text-craze-dark mb-1">
              Delete This Review?
            </h4>
            <p className="font-sans text-sm text-gray-600 mb-6">
              Review by <strong className="text-craze-dark">{reviewerName}</strong> will be
              soft-deleted and hidden from the public Craze Wall. You can restore it at any time.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-heading uppercase tracking-wider text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <Button
                variant="secondary"
                size="sm"
                isLoading={isLoading}
                onClick={handleConfirm}
                className="shadow-xs"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
