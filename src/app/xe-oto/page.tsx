import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import ModelCard from '@/components/ModelCard'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Xe o to - Bang gia va thong so',
  description: 'Danh sach xe o to dang ban tai Viet Nam.',
}

async function getModels(brandSlug?: string, segment?: string) {
  const supabase = createServerClient()
  let query = supabase
    .from('models')
    .select(`
      id, name, slug, thumbnail_url, engine_cc, segment,
      brand:brands!inner(id, name, slug, vehicle_type),
      versions(price_history(price_min, price_max, price_raw))
    `)
    .eq('is_active', true)
    .order('view_count', { ascending: false })
    .limit(100)

  if (brandSlug) {
    query = query.eq('brand.slug' as any, brandSlug)
  }

  const { data } = await query
  let cars = (data || []).filter((m: any) =>
    m.brand?.vehicle_type === 'car' ||
    (m.brand?.vehicle_type === 'both' && m.segment !== 'xe-may')
  )
  if (segment) cars = cars.filter((m: any) => m.segment === segment)
  return cars
}

async function getCarBrands() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('brands')
    .select('id, name, slug, logo_url')
    .or('vehicle_type.eq.car,vehicle_type.eq.both')
    .eq('is_active', true)
    .order('name')
  return data || []
}

const SEGMENTS = ['Sedan', 'SUV', 'Hatchback', 'MPV', 'Pickup', 'Van', 'Coupe']

export default async function XeOtoPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; segment?: string }>
}) {
  const params = await searchParams
  const [models, brands] = await Promise.all([
    getModels(params.brand, params.segment),
    getCarBrands(),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Xe o to</h1>
        <p className="text-gray-500">{models.length} dong xe</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Link href="/xe-oto" className={`px-3 py-1.5 rounded-full text-sm border transition ${!params.segment && !params.brand ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'}`}>Tat ca</Link>
        {SEGMENTS.map(s => (
          <Link key={s} href={`/xe-oto?segment=${s}`} className={`px-3 py-1.5 rounded-full text-sm border transition ${params.segment === s ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'}`}>{s}</Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {brands.map((b: any) => (
          <Link key={b.id} href={`/xe-oto?brand=${b.slug}`} className={`px-3 py-1.5 rounded-full text-sm border transition ${params.brand === b.slug ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'}`}>{b.name}</Link>
        ))}
      </div>
      {models.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Khong co du lieu</div>
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
