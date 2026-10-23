'use client';

import React, { useState } from 'react';
import { MemberStats } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Users, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminStatsEditorProps {
  currentStats: MemberStats | null;
  onSave: (stats: { joined_count: number; display_boost?: number }) => Promise<boolean>;
}

export const AdminStatsEditor: React.FC<AdminStatsEditorProps> = ({ currentStats, onSave }) => {
  const [joinedCount, setJoinedCount] = useState<number>(currentStats?.joined_count || 312);
  const [displayBoost, setDisplayBoost] = useState<number>(currentStats?.display_boost || 0);

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const totalDisplay = (Number(joinedCount) || 0) + (Number(displayBoost) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      const success = await onSave({
        joined_count: Number(joinedCount),
        display_boost: Number(displayBoost),
      });

      if (success) {
        setStatus({ type: 'success', message: 'Member stats updated successfully!' });
        setTimeout(() => setStatus(null), 4000);
      } else {
        setStatus({ type: 'error', message: 'Failed to update stats.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'An error occurred while saving stats.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-craze-amber/40 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-craze-red" />
        <h3 className="font-heading text-2xl uppercase tracking-wider text-craze-red">
          Member Counter Settings
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-heading uppercase tracking-wider text-gray-700 mb-1">
              Base Joined Count
            </label>
            <input
              type="number"
              min={0}
              required
              value={joinedCount}
              onChange={(e) => setJoinedCount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-craze-amber font-sans"
            />
            <span className="text-[10px] text-gray-400 font-sans mt-0.5 block">
              Manually verified group members
            </span>
          </div>

          <div>
            <label className="block text-xs font-heading uppercase tracking-wider text-gray-700 mb-1">
              Display Boost (Social Proof)
            </label>
            <input
              type="number"
              min={0}
              value={displayBoost}
              onChange={(e) => setDisplayBoost(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-craze-amber font-sans"
            />
            <span className="text-[10px] text-gray-400 font-sans mt-0.5 block">
              Optional display buffer
            </span>
          </div>
        </div>

        {/* Live Total Badge */}
        <div className="p-3 bg-amber-50 rounded-xl border border-craze-amber/50 flex items-center justify-between">
          <span className="text-xs font-sans text-gray-700">Public Displayed Number:</span>
          <span className="font-heading text-2xl text-craze-red">
            {totalDisplay.toLocaleString()}+ Food Lovers
          </span>
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            className="shadow-chunky-amber"
          >
            Update Member Count
          </Button>
        </div>
      </form>
    </div>
  );
};
