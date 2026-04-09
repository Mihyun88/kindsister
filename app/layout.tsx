import './globals.css'
import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: '착한언니복덕방',
  description: '직원 전용 매물 관리 시스템',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '착한언니복덕방',
  },
  icons: {
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#E8185A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="착한언니복덕방" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>{children}</body>
    </html>
  )
}
