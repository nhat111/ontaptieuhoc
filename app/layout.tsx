import type { Metadata } from 'next'
import './globals.css'
import 'katex/dist/katex.min.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getGrades } from '@/lib/services/grades'

export const metadata: Metadata = {
  title: 'ÔnTập - Luyện tập thông minh',
  description: 'Nền tảng luyện tập trực tuyến THCS & THPT với hàng nghìn câu hỏi chất lượng cao',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const grades = await getGrades()

  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <Header grades={grades} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
