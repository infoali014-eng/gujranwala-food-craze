'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { Sparkles, UtensilsCrossed, Gift } from 'lucide-react';
import { COPY } from '@/lib/copy';

export const WhyJoin: React.FC = () => {
  const icons = [
    <Sparkles key="1" className="w-7 h-7 text-craze-red" />,
    <UtensilsCrossed key="2" className="w-7 h-7 text-craze-red" />,
    <Gift key="3" className="w-7 h-7 text-craze-red" />,
  ];

  return (
    <Section
      id="why-join"
      bg="cream"
      badge="Group Perks"
      title={COPY.whyJoin.title}
      subtitle={COPY.whyJoin.subtitle}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COPY.whyJoin.benefits.map((benefit, index) => (
          <Card
            key={benefit.title}
            variant="cream"
            interactive
            padding="lg"
            className="flex flex-col items-center text-center group hover:border-craze-red/60"
          >
            <div className="w-14 h-14 rounded-2xl bg-craze-amber/25 border-2 border-craze-amber flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-craze-amber/40 transition-transform">
              {icons[index]}
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-craze-red mb-2">
              {benefit.title}
            </h3>
            <p className="font-sans text-sm sm:text-base text-craze-dark/80 leading-relaxed">
              {benefit.description}
            </p>
          </Card>
        ))}
      </div>
    </Section>
  );
};
