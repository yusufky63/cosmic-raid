import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import './globals.css';
import '../style.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: 'Cosmic Raid - Epic Space Shooter',
  description: 'Defend the galaxy! Battle bosses with progressive ship upgrades.',
  keywords: ['cosmic', 'raid', 'space', 'shooter', 'game', 'farcaster', 'base', 'blockchain', 'web3', 'miniapp', 'galaxy', 'boss', 'battle'],
  authors: [{ name: 'Cosmic Raid Team' }],
  openGraph: {
    title: 'Cosmic Raid - Epic Space Shooter',
    description: 'Defend the galaxy in this epic space shooter! Battle through 10 challenging boss fights on Farcaster.',
    url: 'https://cosmic-raid.vercel.app',
    siteName: 'Cosmic Raid',
    images: [
      {
        url: 'https://cosmic-raid.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cosmic Raid Game Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmic Raid - Epic Space Shooter',
    description: 'Defend the galaxy in this epic space shooter! Built for Farcaster on Base network.',
    images: ['https://cosmic-raid.vercel.app/og-image.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cosmic-raid.vercel.app';
  const miniAppEmbed = JSON.stringify({
    version: 'next',
    imageUrl: `${baseUrl}/og-image.png`,
    button: {
      title: '🚀 Start Mission',
      action: {
        type: 'launch_miniapp',
        name: 'Cosmic Raid',
        url: baseUrl,
        splashImageUrl: `${baseUrl}/splash.png`,
        splashBackgroundColor: '#000000',
      },
    },
  });
  return (
    <html lang="en" className={`${inter.className} ${orbitron.variable}`}>
      <head>
        {/* Farcaster Frame Embed */}
        <meta name="fc:frame" content={miniAppEmbed} />
        
        {/* Base.dev compatible meta tags */}
        <meta name="base:miniapp" content="true" />
        <meta name="base:name" content="Cosmic Raid" />
        <meta name="base:description" content="Defend the galaxy in this epic space shooter!" />
        <meta name="base:image" content={`${baseUrl}/og-image.png`} />
        <meta name="base:url" content={baseUrl} />
        
        {/* Additional Farcaster meta tags */}
        <meta property="fc:frame:name" content="Cosmic Raid" />
        <meta property="fc:frame:image" content={`${baseUrl}/og-image.png`} />
        <meta property="fc:frame:button:1" content="🚀 Start Mission" />
        <meta property="fc:frame:button:1:action" content="link" />
        <meta property="fc:frame:button:1:target" content={baseUrl} />
        
        {/* Progressive Web App meta tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Cosmic Raid" />
        
        {/* Additional gaming-specific meta tags */}
        <meta name="application-name" content="Cosmic Raid" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Performance and security */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.app" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
