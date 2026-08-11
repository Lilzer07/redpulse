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
  title: 'RedMatch — Le copilote IA qui analyse les cartons rouges',
  description:
    'Dès qu’un carton rouge tombe, RedMatch analyse la situation et vous envoie une notification Telegram enrichie : probabilité de but, victoire du favori et indice de confiance, en quelques secondes.',
  generator: 'v0.app',
  keywords: [
    'carton rouge',
    'football',
    'analyse IA football',
    'indice de confiance carton rouge',
    'notifications Telegram',
    'temps réel',
    'Premier League',
    'Ligue 1',
    'Champions League',
  ],
  openGraph: {
    title: 'RedMatch — Le carton rouge, décodé par l’IA',
    description:
      'Un copilote IA qui analyse chaque carton rouge en temps réel et vous l’envoie sur Telegram.',
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
