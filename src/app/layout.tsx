import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
  title: {
    default: 'XeVietnam - Dữ liệu xe ô tô và xe máy Việt Nam',
    template: '%s | XeVietnam',
  },
  description: 'Tra cứu giá xe, thông số kỹ thuật và so sánh xe ô tô, xe máy tại Việt Nam. Tư vấn chọn xe bằng AI.',
  keywords: ['xe ô tô', 'xe máy', 'giá xe', 'thông số xe', 'so sánh xe', 'Việt Nam'],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://xevietnam.vn',
    siteName: 'XeVietnam',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
