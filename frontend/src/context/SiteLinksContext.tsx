'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSiteLinks, SiteLinks } from '@/lib/api';
import { HARDCODED_WHATSAPP_LINK, resolveWhatsAppLink } from '@/lib/constants';

const defaultLinks: SiteLinks = {
  whatsapp_link: resolveWhatsAppLink(process.env.NEXT_PUBLIC_WHATSAPP_LINK),
  foodpanda_link:
    process.env.NEXT_PUBLIC_FOODPANDA_LINK || 'https://www.foodpanda.pk',
};

const SiteLinksContext = createContext<SiteLinks>(defaultLinks);

export const SiteLinksProvider: React.FC<{
  children: React.ReactNode;
  initialLinks?: SiteLinks;
}> = ({ children, initialLinks }) => {
  const [links, setLinks] = useState<SiteLinks>(initialLinks || defaultLinks);

  useEffect(() => {
    getSiteLinks().then((res) => {
      if (res.data) {
        setLinks({
          whatsapp_link: resolveWhatsAppLink(res.data.whatsapp_link),
          foodpanda_link: res.data.foodpanda_link || defaultLinks.foodpanda_link,
        });
      }
    });
  }, []);

  return <SiteLinksContext.Provider value={links}>{children}</SiteLinksContext.Provider>;
};

export const useSiteLinks = (): SiteLinks => {
  const context = useContext(SiteLinksContext);
  return context || defaultLinks;
};
