import Link from 'next/link'
import { supabase, formatPriceRange } from '@/lib/supabase'
import type { Model } from '@/lib/supabase'

async function getFeaturedModels() {
  const { data } = await supabase
    .from('models')
    .select(`
      *,
      brand:brands(name, slug, logo_url),
      versions(
        id,
        price_history(price_min, price_max, price_raw)
      )
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(6)

  return data || []
}

async function getPopularModels() {
  const { data } = await supabase
    .from('models')
    .select(`
      *,
      brand:brands(name, slug),
      versions(
        id,
        price_history(price_min, price_max, price_raw)
      )
    `)
    .eq('is_active', true)
    .order('view_count', { ascending: false })
    .limit(8)

  return data || []
}

async function getBrands(type: 'car' | 'bike') {
  const { data } = await supabase
    .from('brands')
    .select('id, name, slug, logo_url')
    .or(`vehicle_type.eq.${type},vehicle_type.eq.both`)
    .eq('is_active', true)
    .order('name')
    .limit(12)

  return data || []
}

function getModelPrice(model: Model & { versions?: { price_history: { price_min: number | null; price_max: number | null; price_raw: string | null }[] }[] }) {
  const ph = model.versions?.[0]?.price_history?.[0]
  return ph ? formatPriceRange(ph.price_min, ph.price_max) : 'Liên hệ'
}

export default async function HomePage() {
  const [popularModels, carBrands, bikeBrands] = await Promise.all([
    getPopularModels(),
    getBrands('car'),
    getBrands('bike'),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Dữ liệu xe Việt Nam
          </h1>
          <p className="text-xl text-red-100 mb-8">
            Tra cứu giá, thông số và so sánh hàng trăm dòng xe ô tô, xe máy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/o-to"
              className="bg-white text-red-600 font-semibold px-8 py-3 rounded-full hover:bg-red-50 transition"
            >
              Xe ô tô
            </Link>
            <Link
              href="/xe-may"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition"
            >
              Xe máy
            </Link>
          </div>
        </div>
      </section>

      {/* Hãng ô tô */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Hãng ô tô</h2>
          <Link href="/o-to" className="text-red-600 hover:underline text-sm">Xem tất cả →</Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
          {carBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/hang/${brand.slug}`}
              className="flex flex-col items-center p-2 bg-white rounded-lg border hover:border-red-400 hover:shadow-sm transition group"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                <span className="text-xs font-bold text-gray-500 group-hover:text-red-600">
                  {brand.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">{brand.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Hãng xe máy */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Hãng xe máy</h2>
          <Link href="/xe-may" className="text-red-600 hover:underline text-sm">Xem tất cả →</Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
          {bikeBrands.map((brand) => (
            <Link
              key={brand.id}
              href={`/hang/${brand.slug}`}
              className="flex flex-col items-center p-2 bg-white rounded-lg border hover:border-red-400 hover:shadow-sm transition group"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                <span className="text-xs font-bold text-gray-500 group-hover:text-red-600">
                  {brand.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-600 text-center leading-tight">{brand.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Xe xem nhiều */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Xe xem nhiều nhất</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularModels.map((model: any) => (
              <Link
                key={model.id}
                href={`/xe/${model.slug}`}
                className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition group"
              >
                {model.thumbnail_url ? (
                  <img
                    src={model.thumbnail_url}
                    alt={model.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-4xl">🚗</span>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-1">{model.brand?.name}</p>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2">{model.name}</h3>
                  <p className="text-red-600 font-bold text-sm">{getModelPrice(model)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chatbot CTA */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="text-3xl font-bold mb-4">Tư vấn chọn xe bằng AI</h2>
          <p className="text-gray-300 mb-8 text-lg">
            Cho biết ngân sách và nhu cầu — AI sẽ gợi ý dòng xe phù hợp nhất với bạn.
          </p>
          <Link
            href="/tu-van"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-4 rounded-full text-lg transition"
          >
            Bắt đầu tư vấn miễn phí
          </Link>
        </div>
      </section>
    </div>
  )
}
