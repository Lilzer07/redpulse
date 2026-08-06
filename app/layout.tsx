import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RedPulse — Alertes cartons rouges en temps réel sur Telegram',
  description:
    'Recevez une notification Telegram en moins de 2 secondes dès qu’un carton rouge est distribué dans les plus grandes compétitions européennes.',
  generator: 'v0.app',
  keywords: [
    'carton rouge',
    'football',
    'notifications Telegram',
    'temps réel',
    'alertes football',
    'Premier League',
    'Ligue 1',
    'Champions League',
  ],
  openGraph: {
    title: 'RedPulse — Ne manquez plus jamais un carton rouge',
    description:
      'Alertes Telegram instantanées à chaque carton rouge dans les plus grands championnats européens.',
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
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
