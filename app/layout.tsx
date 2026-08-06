import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RedPulse — Le copilote IA qui analyse l’impact des cartons rouges',
  description:
    'Dès qu’un carton rouge tombe, RedPulse analyse son impact et vous envoie une notification Telegram enrichie : probabilité de but, victoire du favori et score d’impact, en quelques secondes.',
  generator: 'v0.app',
  keywords: [
    'carton rouge',
    'football',
    'analyse IA football',
    'impact carton rouge',
    'notifications Telegram',
    'temps réel',
    'Premier League',
    'Ligue 1',
    'Champions League',
  ],
  openGraph: {
    title: 'RedPulse — Le carton rouge, décodé par l’IA',
    description:
      'Un copilote IA qui analyse l’impact de chaque carton rouge en temps réel et vous l’envoie sur Telegram.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`dark ${inter.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
