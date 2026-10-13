import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'BlockSignal OKC — Know what changed on your block',
    template: '%s | BlockSignal OKC',
  },
  description: 'Independent civic infrastructure transparency for Oklahoma City residents. Track changes to public infrastructure projects from official sources.',
  keywords: ['Oklahoma City', 'infrastructure', 'public works', 'civic tech', 'transparency', 'government', 'projects', 'construction'],
  authors: [{ name: 'BlockSignal OKC' }],
  creator: 'BlockSignal OKC',
  publisher: 'BlockSignal OKC',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://blocksignal.okc.gov',
    siteName: 'BlockSignal OKC',
    title: 'BlockSignal OKC — Know what changed on your block',
    description: 'Independent civic infrastructure transparency for Oklahoma City residents.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BlockSignal OKC — Civic infrastructure transparency',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlockSignal OKC',
    description: 'Know what changed on your block. Independent civic infrastructure transparency.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#3d4a6e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-white text-civic-900">
        {children}
      </body>
    </html>
  );
}