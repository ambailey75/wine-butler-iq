import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wine Butler AI — Coming Soon',
  description: 'Your personal wine inventory tracker and AI sommelier.',
  openGraph: {
    title: 'Wine Butler AI',
    description: 'Your personal wine inventory tracker and AI sommelier.',
    images: [{ url: '/wine-butler-ai-logo.png', width: 512, height: 512, alt: 'Wine Butler AI' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">{children}</body>
    </html>
  )
}
