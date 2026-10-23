import type { Metadata } from 'next';
import './globals.css';
import { SiteLinksProvider } from '@/context/SiteLinksContext';
import { EnvCheck } from '@/components/ui/EnvCheck';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Gujranwala Food Craze: The taste of Punjab',
  description: 'Join the Craze! New weekly deals straight to your WhatsApp. The authentic taste of Punjab in Gujranwala.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-craze-cream text-craze-dark antialiased min-h-screen flex flex-col selection:bg-craze-amber selection:text-craze-dark font-sans">
        <EnvCheck />
        <SiteLinksProvider>{children}</SiteLinksProvider>
      </body>
    </html>
  );
}
