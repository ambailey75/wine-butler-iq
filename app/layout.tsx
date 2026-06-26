import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = 'https://www.winebutlerai.com'
const LOGO_URL = `${SITE_URL}/wine-butler-ai-logo.png`

export const metadata: Metadata = {
  title: 'Wine Butler AI — Coming Soon',
  description: 'Your personal wine inventory tracker and AI sommelier.',
  icons: {
    icon: '/wine-butler-ai-logo.png',
  },
  openGraph: {
    title: 'Wine Butler AI',
    description: 'Your personal wine inventory tracker and AI sommelier.',
    images: [{ url: LOGO_URL, width: 512, height: 512, alt: 'Wine Butler AI' }],
  },
  twitter: {
    card: 'summary',
    title: 'Wine Butler AI',
    description: 'Your personal wine inventory tracker and AI sommelier.',
    images: [LOGO_URL],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
