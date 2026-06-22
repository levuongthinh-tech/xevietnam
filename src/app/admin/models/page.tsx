import { createServerClient } from '@/lib/supabase'
import Link from 'next/link'

export default async function AdminModelsPage({
  searchParams,
}: {
  searchParams: { brand?: string; page?: string }
}) {
  const supabase = createServerClient()
  const page = parseInt(searchParams.page ?? '1')
  const perPage = 30
  const from = (page - 1) * perPage

  let query = supabase
    .from('models')
    .select('id, name, slug, segment, fuel_type, is_active, brand:brands(name)', { count: 'exact' })
    .order('brand_id')
    .order('name')
    .range(from, from + perPage - 1)

  if (searchParams.brand) query = query.eq('brand_id', searchParams.brand)

  const { data: models, count } = await query
  const totalPages = Math.ceil((count ?? 0) / perPage)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dong xe ({count ?? 0})</h1>
        <Link href="/admin/models/new" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
          + Them dong xe
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Ten xe</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Hang</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Phan khuc</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Nhien lieu</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Hien thi</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {models?.map(m => (
              <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="px-4 py-3 text-gray-500">{(m.brand as any)?.name}</td>
                <td className="px-4 py-3 text-gray-500">{m.segment ?? '-'}</td>
                <td className="px-4 py-3 text-gray-500">{m.fuel_type ?? '-'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${m.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/models/${m.id}`} className="text-blue-600 hover:text-blue-800 font-medium">Sua</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/admin/models?page=${p}`}
              className={`px-3 py-1.5 rounded-lg text-sm ${p === page ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
