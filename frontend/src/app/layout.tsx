import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { SiteLinksProvider } from '@/context/SiteLinksContext';
import { EnvCheck } from '@/components/ui/EnvCheck';

const bebasNeue = localFont({
  src: '../fonts/BebasNeue-Regular.woff2',
  variable: '--font-bebas',
  display: 'swap',
  fallback: ['Impact', 'Arial Black', 'sans-serif'],
});

const oswald = localFont({
  src: '../fonts/Oswald-Regular.woff2',
  variable: '--font-oswald',
  display: 'swap',
  fallback: ['Arial Narrow', 'sans-serif'],
});

const lora = localFont({
  src: '../fonts/Lora-Regular.woff2',
  variable: '--font-lora',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

const inter = localFont({
  src: '../fonts/Inter-Regular.woff2',
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

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
    <html
      lang="en"
      className={`${bebasNeue.variable} ${oswald.variable} ${lora.variable} ${inter.variable}`}
    >
      <body className="bg-craze-cream text-craze-dark antialiased min-h-screen flex flex-col selection:bg-craze-amber selection:text-craze-dark">
        <EnvCheck />
        <SiteLinksProvider>{children}</SiteLinksProvider>
      </body>
    </html>
  );
}
