import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = createServerClient()
  const [
    { count: brandCount },
    { count: modelCount },
    { count: versionCount },
    { count: priceCount },
  ] = await Promise.all([
    supabase.from('brands').select('*', { count: 'exact', head: true }),
    supabase.from('models').select('*', { count: 'exact', head: true }),
    supabase.from('versions').select('*', { count: 'exact', head: true }),
    supabase.from('price_history').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Hang xe', value: brandCount ?? 0, href: '/admin/brands', color: 'bg-blue-500' },
    { label: 'Dong xe', value: modelCount ?? 0, href: '/admin/models', color: 'bg-green-500' },
    { label: 'Phien ban', value: versionCount ?? 0, href: '/admin/models', color: 'bg-yellow-500' },
    { label: 'Ban ghi gia', value: priceCount ?? 0, href: '/admin/prices', color: 'bg-red-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition">
            <div className={`w-10 h-10 ${s.color} rounded-lg mb-3`} />
            <p className="text-3xl font-bold text-gray-900">{s.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/brands" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-900 mb-1">Quan ly hang xe</h3>
          <p className="text-sm text-gray-500">Them, sua, xoa hang xe</p>
        </Link>
        <Link href="/admin/models" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border-l-4 border-green-500">
          <h3 className="font-semibold text-gray-900 mb-1">Quan ly dong xe</h3>
          <p className="text-sm text-gray-500">Them, sua dong xe va phien ban</p>
        </Link>
        <Link href="/admin/prices" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition border-l-4 border-red-500">
          <h3 className="font-semibold text-gray-900 mb-1">Cap nhat gia</h3>
          <p className="text-sm text-gray-500">Nhap gia moi cho cac phien ban</p>
        </Link>
      </div>
    </div>
  )
}
