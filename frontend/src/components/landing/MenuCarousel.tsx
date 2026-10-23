'use client';

import React, { useRef } from 'react';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Utensils } from 'lucide-react';
import { COPY } from '@/lib/copy';
import { trackClick } from '@/lib/tracking';
import { useSiteLinks } from '@/context/SiteLinksContext';

interface MenuItem {
  id: string;
  name: string;
  urduName: string;
  desc: string;
  price: string;
  badge?: string;
  iconType: 'karahi' | 'handi' | 'kabab' | 'chana' | 'naan';
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Desi Ghee Chicken Karahi',
    urduName: 'دیسی گھی چکن کڑاہی',
    desc: 'Asal Gujranwala recipe with pure desi ghee, fresh tomatoes and ginger slices.',
    price: 'Rs. 1,450',
    badge: 'Best Seller',
    iconType: 'karahi',
  },
  {
    id: '2',
    name: 'Creamy Makhni Handi',
    urduName: 'مکھنی ہانڈی',
    desc: 'Boneless tender chicken simmered in rich butter cream and mild spices.',
    price: 'Rs. 1,350',
    badge: 'Chef Choice',
    iconType: 'handi',
  },
  {
    id: '3',
    name: 'Smoky Seekh Kabab Platter',
    urduName: 'سیخ کباب پلیٹر',
    desc: 'Charcoal grilled spicy beef and chicken mince skewers with mint raita.',
    price: 'Rs. 890',
    iconType: 'kabab',
  },
  {
    id: '4',
    name: 'Shahi Murgh Chana',
    urduName: 'شاہی مرغ چنے',
    desc: 'Traditional slow-simmered chickpea gravy with tender chicken cuts.',
    price: 'Rs. 650',
    badge: 'Special',
    iconType: 'chana',
  },
  {
    id: '5',
    name: 'Garlic Roghni Naan',
    urduName: 'روغنی نان',
    desc: 'Freshly baked in hot clay tandoor, brushed with butter and sesame.',
    price: 'Rs. 110',
    iconType: 'naan',
  },
];

function DishIcon({ type }: { type: MenuItem['iconType'] }) {
  // Clean brand SVG line art for dishes (no emojis)
  switch (type) {
    case 'karahi':
      return (
        <svg className="w-16 h-16 text-craze-red" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 28C12 40 20 48 32 48C44 48 52 40 52 28H12Z" fill="#FDBC5A" fillOpacity="0.25" />
          <path d="M6 24C6 24 10 24 12 28" />
          <path d="M58 24C58 24 54 24 52 28" />
          <path d="M24 18Q22 10 26 6" strokeDasharray="2 2" />
          <path d="M32 18Q30 8 34 4" strokeDasharray="2 2" />
          <path d="M40 18Q38 10 42 6" strokeDasharray="2 2" />
          <path d="M22 52L20 58H44L42 52" />
        </svg>
      );
    case 'handi':
      return (
        <svg className="w-16 h-16 text-craze-red" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <ellipse cx="32" cy="22" rx="16" ry="6" fill="#FDBC5A" fillOpacity="0.2" />
          <path d="M16 22C16 34 22 46 32 46C42 46 48 34 48 22" />
          <path d="M22 16C22 16 32 12 42 16" />
          <circle cx="32" cy="12" r="2" fill="currentColor" />
          <path d="M24 46L22 54H42L40 46" />
        </svg>
      );
    case 'kabab':
      return (
        <svg className="w-16 h-16 text-craze-red" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="8" y1="56" x2="56" y2="8" strokeWidth="2" />
          <rect x="18" y="32" width="12" height="14" rx="4" transform="rotate(-45 18 32)" fill="#FDBC5A" fillOpacity="0.3" />
          <rect x="28" y="22" width="12" height="14" rx="4" transform="rotate(-45 28 22)" fill="#FDBC5A" fillOpacity="0.3" />
          <rect x="38" y="12" width="12" height="14" rx="4" transform="rotate(-45 38 12)" fill="#FDBC5A" fillOpacity="0.3" />
        </svg>
      );
    case 'chana':
      return (
        <svg className="w-16 h-16 text-craze-red" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 26C14 38 22 48 32 48C42 48 50 38 50 26H14Z" fill="#FDBC5A" fillOpacity="0.25" />
          <line x1="10" y1="26" x2="54" y2="26" />
          <circle cx="28" cy="34" r="3" fill="#8F0A13" />
          <circle cx="36" cy="34" r="3" fill="#8F0A13" />
          <circle cx="32" cy="40" r="3" fill="#8F0A13" />
        </svg>
      );
    case 'naan':
      return (
        <svg className="w-16 h-16 text-craze-red" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M32 10C18 10 12 24 16 42C20 54 32 54 44 48C54 42 50 20 32 10Z" fill="#FDBC5A" fillOpacity="0.3" />
          <circle cx="28" cy="28" r="1.5" fill="currentColor" />
          <circle cx="36" cy="26" r="1.5" fill="currentColor" />
          <circle cx="32" cy="36" r="1.5" fill="currentColor" />
          <circle cx="26" cy="42" r="1.5" fill="currentColor" />
          <circle cx="38" cy="42" r="1.5" fill="currentColor" />
        </svg>
      );
  }
}

export const MenuCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { foodpanda_link } = useSiteLinks();
  const foodpandaUrl =
    foodpanda_link || process.env.NEXT_PUBLIC_FOODPANDA_LINK || 'https://www.foodpanda.pk';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleFoodpandaClick = () => {
    trackClick('menu_foodpanda');
  };

  return (
    <Section
      id="menu"
      bg="cream"
      badge="Authentic Menu"
      title={COPY.menuHighlights.title}
      subtitle={COPY.menuHighlights.subtitle}
    >
      {/* Carousel Desktop Controls (Text only, no arrows) */}
      <div className="hidden sm:flex justify-end gap-2 mb-4 px-2">
        <button
          onClick={() => scroll('left')}
          type="button"
          aria-label="Previous dishes"
          className="px-3 py-1.5 rounded-xl bg-white border border-craze-amber/80 font-heading text-xs uppercase tracking-wider text-craze-dark hover:bg-craze-amber transition-colors shadow-xs min-h-[48px] min-w-[48px]"
        >
          Prev
        </button>
        <button
          onClick={() => scroll('right')}
          type="button"
          aria-label="Next dishes"
          className="px-3 py-1.5 rounded-xl bg-white border border-craze-amber/80 font-heading text-xs uppercase tracking-wider text-craze-dark hover:bg-craze-amber transition-colors shadow-xs min-h-[48px] min-w-[48px]"
        >
          Next
        </button>
      </div>

      {/* Horizontal Swipeable Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 px-2 scroll-smooth no-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {MENU_ITEMS.map((item) => (
          <div
            key={item.id}
            className="snap-start shrink-0 w-[260px] sm:w-[300px] bg-white rounded-2xl border-2 border-craze-amber/60 shadow-sm overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform"
          >
            {/* Dish Graphic Placeholder (Clean SVG, no emojis) */}
            <div className="h-36 bg-gradient-to-br from-craze-cream via-craze-amber/20 to-craze-red/10 flex flex-col items-center justify-center relative p-4 text-center">
              {item.badge && (
                <span className="absolute top-2.5 right-2.5 text-[10px] font-sans font-bold uppercase tracking-wider bg-craze-red text-craze-cream px-2 py-0.5 rounded-full shadow-xs">
                  {item.badge}
                </span>
              )}
              <DishIcon type={item.iconType} />
              <span className="font-serif italic text-xs text-craze-dark/60 mt-1">
                {item.urduName}
              </span>
            </div>

            {/* Dish Info */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-heading text-2xl uppercase tracking-wider text-craze-red leading-tight">
                  {item.name}
                </h4>
                <p className="font-sans text-xs sm:text-sm text-craze-dark/75 mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-craze-cream flex items-center justify-between">
                <span className="font-heading text-2xl text-craze-dark">
                  {item.price}
                </span>
                <span className="text-[11px] font-sans font-semibold text-craze-red uppercase tracking-wider">
                  Fresh Daily
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order on Foodpanda Secondary CTA (Text only, no arrows) */}
      <div className="mt-8 text-center flex flex-col items-center">
        <p className="font-serif italic text-xs sm:text-sm text-craze-dark/70 mb-3">
          Ghar bethe foran delivery chahiye?
        </p>
        <Button
          href={foodpandaUrl}
          external
          variant="secondary"
          size="md"
          onClick={handleFoodpandaClick}
          leftIcon={<Utensils className="w-5 h-5 text-craze-cream" />}
          className="shadow-chunky min-h-[48px]"
        >
          {COPY.menuHighlights.orderFoodpanda}
        </Button>
      </div>
    </Section>
  );
};
