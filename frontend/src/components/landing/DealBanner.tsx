'use client';

import React, { useEffect, useState } from 'react';
import { Deal, getCurrentDeal } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Clock, MessageCircle, Tag } from 'lucide-react';
import { COPY } from '@/lib/copy';
import { trackClick } from '@/lib/tracking';
import { fireBrandConfetti } from '@/components/ui/Confetti';
import { useSiteLinks } from '@/context/SiteLinksContext';

interface DealBannerProps {
  initialDeal?: Deal | null;
}

export const DealBanner: React.FC<DealBannerProps> = ({ initialDeal }) => {
  const [deal, setDeal] = useState<Deal | null>(initialDeal || null);

  useEffect(() => {
    let mounted = true;
    getCurrentDeal()
      .then((res) => {
        if (mounted && res.data) {
          setDeal(res.data);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const { whatsapp_link } = useSiteLinks();
  const whatsappUrl =
    whatsapp_link || process.env.NEXT_PUBLIC_WHATSAPP_LINK || 'https://chat.whatsapp.com/sample-gfc-invite';

  useEffect(() => {
    if (!deal?.valid_until) return;

    const target = new Date(deal.valid_until).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deal]);

  if (!deal) return null;

  const handleClaim = () => {
    fireBrandConfetti();
    trackClick('deal_whatsapp_claim');
  };

  return (
    <section className="px-4 sm:px-6 py-8">
      <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-craze-red-dark via-craze-red to-craze-red-dark border-4 border-craze-amber text-craze-cream shadow-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Glow & background patterns */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-craze-amber/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Deal Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-craze-amber text-craze-dark text-xs font-heading uppercase tracking-widest mb-3 shadow-sm">
              <Tag className="w-3.5 h-3.5" />
              <span>{COPY.dealBanner.badge}</span>
            </div>

            <h3 className="font-heading text-3xl sm:text-4xl lg:text-5xl uppercase tracking-wide text-craze-amber leading-tight">
              {deal.title}
            </h3>

            <p className="font-sans text-sm sm:text-base text-craze-cream/90 mt-2 max-w-lg leading-relaxed">
              {deal.description}
            </p>

            <div className="mt-4 inline-block bg-black/30 border border-craze-amber/40 rounded-xl px-4 py-2">
              <span className="font-heading text-2xl sm:text-3xl tracking-wider text-white">
                {deal.price_text}
              </span>
            </div>
          </div>

          {/* Countdown & Action */}
          <div className="flex flex-col items-center shrink-0 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-sans uppercase font-bold tracking-wider text-craze-cream/80 mb-2">
              <Clock className="w-4 h-4 text-craze-amber" />
              <span>{COPY.dealBanner.endsIn}</span>
            </div>

            {/* Countdown Boxes */}
            <div className="flex gap-2 sm:gap-3 mb-6">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Mins', value: timeLeft.minutes },
                { label: 'Secs', value: timeLeft.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-black/40 border border-craze-amber/30 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-center min-w-[50px] sm:min-w-[62px]"
                >
                  <span className="font-heading text-2xl sm:text-3xl text-craze-amber block leading-none">
                    {String(item.value).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-sans uppercase tracking-wider text-craze-cream/70">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Button
              href={whatsappUrl}
              external
              variant="primary"
              size="md"
              fullWidth
              onClick={handleClaim}
              leftIcon={<MessageCircle className="w-5 h-5 fill-craze-dark text-craze-amber" />}
              className="text-lg sm:text-xl py-3 px-6 shadow-chunky-amber"
            >
              {COPY.dealBanner.orderNow}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
