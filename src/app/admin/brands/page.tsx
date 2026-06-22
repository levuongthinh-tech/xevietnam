import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function AdminBrandsPage() {
  const supabase = createServerClient()
  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, slug, country, logo_url, (models(count))')
    .order('name')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hang xe ({brands?.length ?? 0})</h1>
        <Link
          href="/admin/brands/new"
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          + Them hang xe
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Ten hang</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Slug</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Quoc gia</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">So dong xe</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {brands?.map(b => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {b.logo_url && <img src={b.logo_url} alt={b.name} className="w-8 h-8 object-contain" />}
                    <span className="font-medium text-gray-900">{b.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{b.slug}</td>
                <td className="px-4 py-3 text-gray-500">{b.country ?? '-'}</td>
                <td className="px-4 py-3 text-right text-gray-700">{(b as any).models?.[0]?.count ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/brands/${b.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    Sua
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
