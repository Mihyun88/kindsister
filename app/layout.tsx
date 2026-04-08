import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '착한언니복덕방 매물관리',
  description: '직원 전용 매물 관리 시스템',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
