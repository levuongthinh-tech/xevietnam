'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🚘</span>
          <span className="font-bold text-xl text-gray-900">
            Xe<span className="text-red-600">Vietnam</span>
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/o-to" className="hover:text-red-600 transition">Ô tô</Link>
          <Link href="/xe-may" className="hover:text-red-600 transition">Xe máy</Link>
          <Link href="/so-sanh" className="hover:text-red-600 transition">So sánh</Link>
          <Link href="/tu-van" className="bg-red-600 text-white px-4 py-1.5 rounded-full hover:bg-red-700 transition">
            Tư vấn AI
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t bg-white px-4 py-3 flex flex-col gap-3 text-sm font-medium">
          <Link href="/o-to" onClick={() => setOpen(false)} className="text-gray-700 hover:text-red-600">Ô tô</Link>
          <Link href="/xe-may" onClick={() => setOpen(false)} className="text-gray-700 hover:text-red-600">Xe máy</Link>
          <Link href="/so-sanh" onClick={() => setOpen(false)} className="text-gray-700 hover:text-red-600">So sánh xe</Link>
          <Link href="/tu-van" onClick={() => setOpen(false)} className="text-red-600 font-semibold">Tư vấn AI</Link>
        </div>
      )}
    </header>
  )
}
