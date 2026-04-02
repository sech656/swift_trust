import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Swift Trust - Modern Banking',
    template: '%s | Swift Trust'
  },
  description: 'Experience the future of premium banking with Swift Trust. Secure, fast, and sophisticated financial solutions for the modern world.',
  keywords: ['banking', 'finance', 'secure banking', 'premium financial services', 'online banking', 'swift trust'],
  authors: [{ name: 'Swift Trust' }],
  creator: 'Swift Trust',
  publisher: 'Swift Trust',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://swift-trust-bank.vercel.app'), // Placeholder URL
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://swift-trust-bank.vercel.app',
    siteName: 'Swift Trust',
    title: 'Swift Trust - Modern Banking',
    description: 'Experience the future of premium banking with Swift Trust. Secure, fast, and sophisticated financial solutions for the modern world.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Swift Trust - Modern Banking',
    description: 'Experience the future of premium banking with Swift Trust. Secure, fast, and sophisticated financial solutions for the modern world.',
    creator: '@swifttrust',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0052cc', // Assuming a premium blue color based on the context
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
