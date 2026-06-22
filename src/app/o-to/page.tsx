import { Metadata } from 'next'
import { supabase, formatPriceRange } from '@/lib/supabase'
import ModelCard from '@/components/ModelCard'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Xe ô tô - Bảng giá và thông số',
  description: 'Danh sách xe ô tô đang bán tại Việt Nam kèm bảng giá, thông số kỹ thuật cập nhật.',
}

interface SearchParams {
  brand?: string
  type?: string
  page?: string
}

async function getModels(searchParams: SearchParams) {
  let query = supabase
    .from('models')
    .select(`
      id, name, slug, thumbnail_url, segment,
      brand:brands!inner(id, name, slug, vehicle_type),
      versions(price_history(price_min, price_max))
    `)
    .eq('is_active', true)
    .or('brand.vehicle_type.eq.car,brand.vehicle_type.eq.both')

  if (searchParams.brand) {
    query = query.eq('brand.slug', searchParams.brand)
  }

  const { data } = await query.order('view_count', { ascending: false }).limit(48)

  // Filter to car brands only
  const cars = (data || []).filter((m: any) =>
    m.brand?.vehicle_type === 'car' || m.brand?.vehicle_type === 'both'
  )

  return cars
}

async function getCarBrands() {
  const { data } = await supabase
    .from('brands')
    .select('id, name, slug')
    .or('vehicle_type.eq.car,vehicle_type.eq.both')
    .eq('is_active', true)
    .order('name')

  return data || []
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [models, brands] = await Promise.all([getModels(params), getCarBrands()])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Xe ô tô</h1>
      <p className="text-gray-500 mb-8">
        {models.length} dòng xe · giá từ thấp đến cao
      </p>

      {/* Brand filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/o-to"
          className={`px-3 py-1.5 rounded-full text-sm border transition ${
            !params.brand
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
          }`}
        >
          Tất cả
        </Link>
        {brands.map((b: any) => (
          <Link
            key={b.id}
            href={`/o-to?brand=${b.slug}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              params.brand === b.slug
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
            }`}
          >
            {b.name}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {models.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Không có dữ liệu</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {models.map((model: any) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}
    </div>
  )
}
