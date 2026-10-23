'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSiteLinks, SiteLinks } from '@/lib/api';

const defaultLinks: SiteLinks = {
  whatsapp_link:
    process.env.NEXT_PUBLIC_WHATSAPP_LINK || 'https://chat.whatsapp.com/sample-gfc-invite',
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
      if (res.data?.whatsapp_link && res.data?.foodpanda_link) {
        setLinks(res.data);
      }
    });
  }, []);

  return <SiteLinksContext.Provider value={links}>{children}</SiteLinksContext.Provider>;
};

export const useSiteLinks = (): SiteLinks => {
  const context = useContext(SiteLinksContext);
  return context || defaultLinks;
};
