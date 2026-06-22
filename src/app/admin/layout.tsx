import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-800">
          <Link href="/" className="text-white font-bold text-lg">XeVietnam</Link>
          <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/admin/brands" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition">
            Hang xe
          </Link>
          <Link href="/admin/models" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition">
            Dong xe
          </Link>
          <Link href="/admin/prices" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 hover:text-white transition">
            Cap nhat gia
          </Link>
        </nav>
        <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-600">
          XeVietnam CMS v1.0
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
