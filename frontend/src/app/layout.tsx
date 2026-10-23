import type { Metadata } from 'next';
import { Bebas_Neue, Oswald, Lora, Inter } from 'next/font/google';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
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
        {children}
      </body>
    </html>
  );
}
