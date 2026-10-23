'use client';

import React, { useState, useEffect } from 'react';
import { SiteLinks } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Link2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { HARDCODED_WHATSAPP_LINK, resolveWhatsAppLink } from '@/lib/constants';

interface AdminLinksEditorProps {
  currentLinks?: SiteLinks | null;
  onSave: (links: { whatsapp_link: string; foodpanda_link: string }) => Promise<boolean>;
}

export const AdminLinksEditor: React.FC<AdminLinksEditorProps> = ({
  currentLinks,
  onSave,
}) => {
  const [whatsappLink, setWhatsappLink] = useState(
    resolveWhatsAppLink(currentLinks?.whatsapp_link)
  );
  const [foodpandaLink, setFoodpandaLink] = useState(
    currentLinks?.foodpanda_link || 'https://www.foodpanda.pk'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentLinks) {
      if (currentLinks.whatsapp_link) {
        setWhatsappLink(resolveWhatsAppLink(currentLinks.whatsapp_link));
      }
      if (currentLinks.foodpanda_link) setFoodpandaLink(currentLinks.foodpanda_link);
    }
  }, [currentLinks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(false);

    if (!whatsappLink.startsWith('http://') && !whatsappLink.startsWith('https://')) {
      setErrorMsg('WhatsApp link must start with https:// or http://');
      return;
    }

    if (!foodpandaLink.startsWith('http://') && !foodpandaLink.startsWith('https://')) {
      setErrorMsg('Foodpanda link must start with https:// or http://');
      return;
    }

    setIsLoading(true);
    try {
      const ok = await onSave({
        whatsapp_link: whatsappLink.trim(),
        foodpanda_link: foodpandaLink.trim(),
      });

      if (ok) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 4000);
      } else {
        setErrorMsg('Failed to update business links in database.');
      }
    } catch {
      setErrorMsg('Network error while saving links.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-craze-amber shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-craze-amber/20 border border-craze-amber flex items-center justify-center text-craze-dark">
          <Link2 className="w-6 h-6 text-craze-red" />
        </div>
        <div>
          <h3 className="font-heading text-2xl uppercase tracking-wider text-craze-red leading-none">
            Business and Action Links
          </h3>
          <p className="font-serif italic text-xs text-gray-600 mt-1">
            Update your public WhatsApp group invite and Foodpanda ordering links directly in the database.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-800 text-xs sm:text-sm font-sans flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-bold">Business links updated successfully in database!</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-800 text-xs sm:text-sm font-sans flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-heading uppercase tracking-wider text-gray-700 mb-1.5">
            VIP WhatsApp Group Invite Link
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              required
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/your-invite-code"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-craze-amber focus:outline-none text-base font-sans text-craze-dark bg-[#FAFAFA]"
            />
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Test WhatsApp Link"
                className="px-3 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-sans mt-1 block">
            Used across all Join WhatsApp CTA buttons, Craze Wall post-submit card, and floating widget.
          </span>
        </div>

        <div>
          <label className="block text-xs font-heading uppercase tracking-wider text-gray-700 mb-1.5">
            Foodpanda Restaurant Profile Link
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              required
              value={foodpandaLink}
              onChange={(e) => setFoodpandaLink(e.target.value)}
              placeholder="https://www.foodpanda.pk/restaurant/..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-craze-amber focus:outline-none text-base font-sans text-craze-dark bg-[#FAFAFA]"
            />
            {foodpandaLink && (
              <a
                href={foodpandaLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Test Foodpanda Link"
                className="px-3 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          <span className="text-[11px] text-gray-500 font-sans mt-1 block">
            Used on the Order on Foodpanda button in the Menu highlights carousel.
          </span>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            isLoading={isLoading}
            className="shadow-chunky-amber font-heading text-base uppercase tracking-wider"
          >
            Save Business Links
          </Button>
        </div>
      </form>
    </div>
  );
};
