'use client';

import React, { useState } from 'react';
import { Deal } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Tag, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminDealEditorProps {
  currentDeal: Deal | null;
  onSave: (deal: {
    title: string;
    description: string;
    price_text: string;
    valid_until: string;
    is_active?: boolean;
  }) => Promise<boolean>;
}

export const AdminDealEditor: React.FC<AdminDealEditorProps> = ({ currentDeal, onSave }) => {
  const [title, setTitle] = useState(currentDeal?.title || '');
  const [description, setDescription] = useState(currentDeal?.description || '');
  const [priceText, setPriceText] = useState(currentDeal?.price_text || '');
  const [validUntil, setValidUntil] = useState(
    currentDeal?.valid_until
      ? new Date(currentDeal.valid_until).toISOString().slice(0, 16)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [isActive, setIsActive] = useState(currentDeal?.is_active ?? true);

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      const isoDate = new Date(validUntil).toISOString();
      const success = await onSave({
        title,
        description,
        price_text: priceText,
        valid_until: isoDate,
        is_active: isActive,
      });

      if (success) {
        setStatus({ type: 'success', message: 'Weekly deal updated successfully!' });
        setTimeout(() => setStatus(null), 4000);
      } else {
        setStatus({ type: 'error', message: 'Failed to update deal. Check inputs.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'An error occurred while saving deal.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-craze-amber/40 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-craze-red" />
        <h3 className="font-heading text-2xl uppercase tracking-wider text-craze-red">
          Edit Weekly Deal
        </h3>
      </div>

      {status && (
        <div
          className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-sans font-bold ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-red-50 text-red-800 border border-red-300'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-heading uppercase tracking-wider text-gray-700 mb-1">
            Deal Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Craze Special Family Karahi Feast"
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-craze-amber font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-heading uppercase tracking-wider text-gray-700 mb-1">
            Description (Combo Items)
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 1KG Special Chicken Karahi + 4 Roghni Naan + Fresh Mint Raita..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-craze-amber font-sans resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-heading uppercase tracking-wider text-gray-700 mb-1">
              Price Display Text
            </label>
            <input
              type="text"
              required
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              placeholder="e.g. Rs. 1,850 (Save Rs. 450)"
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-craze-amber font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-heading uppercase tracking-wider text-gray-700 mb-1">
              Valid Until (Countdown End)
            </label>
            <input
              type="datetime-local"
              required
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-craze-amber font-sans"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="is_active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-craze-amber rounded focus:ring-craze-amber"
          />
          <label htmlFor="is_active" className="text-xs font-sans text-gray-700 select-none">
            Active (displayed publicly on landing page banner)
          </label>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            className="shadow-chunky-amber"
          >
            Save Weekly Deal
          </Button>
        </div>
      </form>
    </div>
  );
};
