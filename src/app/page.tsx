import Link from 'next/link'
import { supabase, formatPriceRange } from '@/lib/supabase'

async function getStats() {
  const [{ count: modelCount }, { count: brandCount }] = await Promise.all([
    supabase.from('models').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('brands').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])
  return { models: modelCount || 0, brands: brandCount || 0 }
}

async function getPopularModels() {
  const { data } = await supabase
    .from('models')
    .select(`id, name, slug, thumbnail_url, specs, brand:brands(name, slug, vehicle_type)`)
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

function getModelPrice(model: any) {
  let sp = model?.specs
  if (typeof sp === 'string') { try { sp = JSON.parse(sp) } catch { sp = null } }
  return sp?.price_min ? formatPriceRange(sp.price_min, sp.price_max) : 'Liên hệ'
}

function getSpecCount(model: any) {
  let sp = model?.specs
  if (typeof sp === 'string') { try { sp = JSON.parse(sp) } catch { sp = null } }
  if (!sp) return 0
  return Object.keys(sp).filter(k => !['price_min','price_max','price_raw'].includes(k)).length
}

const VEHICLE_EMOJI: Record<string, string> = {
  car: '🚗',
  bike: '🏍️',
  both: '🚗',
}

export default async function HomePage() {
  const [stats, popularModels, carBrands, bikeBrands] = await Promise.all([
    getStats(),
    getPopularModels(),
    getBrands('car'),
    getBrands('bike'),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Dữ liệu xe Việt Nam cập nhật liên tục
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-5 leading-tight">
              Tra cứu xe thông minh
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                với trợ lý AI
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Dữ liệu {stats.models}+ dòng xe từ {stats.brands}+ hãng.
              Thông số kỹ thuật chi tiết, giá thực tế và tư vấn AI cá nhân hoá.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link
                href="/tu-van"
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-2xl transition text-lg shadow-lg shadow-red-900/30"
              >
                🤖 Tư vấn với AI
              </Link>
              <Link
                href="/o-to"
                className="flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition text-lg"
              >
                Duyệt xe ngay →
              </Link>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              {[
                { value: `${stats.models}+`, label: 'Dòng xe' },
                { value: `${stats.brands}+`, label: 'Hãng xe' },
                { value: '30+', label: 'Thông số / xe' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl py-3 px-2">
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI CTA strip */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="font-semibold text-sm">Chưa biết chọn xe nào?</p>
              <p className="text-red-100 text-xs">AI sẽ gợi ý dựa trên ngân sách và nhu cầu của bạn</p>
            </div>
          </div>
          <Link
            href="/tu-van"
            className="bg-white text-red-600 font-bold px-6 py-2.5 rounded-xl hover:bg-red-50 transition text-sm whitespace-nowrap"
          >
            Bắt đầu tư vấn →
          </Link>
        </div>
      </section>

      {/* Popular models */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Xe xem nhiều nhất</h2>
            <p className="text-sm text-gray-500 mt-1">Cập nhật thông số kỹ thuật chi tiết</p>
          </div>
          <div className="flex gap-2">
            <Link href="/o-to" className="text-sm text-red-600 hover:underline font-medium">Ô tô</Link>
            <span className="text-gray-300">·</span>
            <Link href="/xe-may" className="text-sm text-red-600 hover:underline font-medium">Xe máy</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularModels.map((model: any) => {
            const specCount = getSpecCount(model)
            const isBike = model.brand?.vehicle_type === 'bike'
            return (
              <Link
                key={model.id}
                href={`/xe/${model.slug}`}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
              >
                {model.thumbnail_url ? (
                  <div className="overflow-hidden">
                    <img
                      src={model.thumbnail_url}
                      alt={model.name}
                      className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-4xl opacity-30">{VEHICLE_EMOJI[model.brand?.vehicle_type || 'car']}</span>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-0.5">{model.brand?.name}</p>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2">{model.name}</h3>
                  <p className="text-red-600 font-bold text-sm">{getModelPrice(model)}</p>
                  {specCount > 0 && (
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      {specCount} thông số
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Brands */}
      <section className="bg-white border-y border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Car brands */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-900">🚗 Hãng ô tô</h2>
              <Link href="/o-to" className="text-sm text-red-600 hover:underline font-medium">Xem tất cả →</Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
              {carBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/hang/${brand.slug}`}
                  className="flex flex-col items-center p-2 bg-gray-50 rounded-xl hover:bg-red-50 hover:border-red-200 border border-transparent transition group"
                >
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm mb-1.5 group-hover:shadow-md transition">
                    <span className="text-xs font-bold text-gray-500 group-hover:text-red-600">
                      {brand.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 text-center leading-tight group-hover:text-red-600">{brand.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Bike brands */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-900">🏍️ Hãng xe máy</h2>
              <Link href="/xe-may" className="text-sm text-red-600 hover:underline font-medium">Xem tất cả →</Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
              {bikeBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/hang/${brand.slug}`}
                  className="flex flex-col items-center p-2 bg-gray-50 rounded-xl hover:bg-red-50 hover:border-red-200 border border-transparent transition group"
                >
                  <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm mb-1.5 group-hover:shadow-md transition">
                    <span className="text-xs font-bold text-gray-500 group-hover:text-red-600">
                      {brand.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-600 text-center leading-tight group-hover:text-red-600">{brand.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI deep dive */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="w-16 h-16 bg-red-600/20 border border-red-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
              🤖
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Tư vấn xe bằng AI</h2>
            <p className="text-gray-300 mb-8 text-lg max-w-xl mx-auto">
              Cho biết ngân sách, nhu cầu và mục đích sử dụng — AI phân tích toàn bộ cơ sở dữ liệu để gợi ý xe phù hợp nhất.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              {[
                'Xe gia đình dưới 600 triệu',
                'Xe tay ga cho nữ',
                'Xe điện giá rẻ nhất',
              ].map(q => (
                <Link
                  key={q}
                  href={`/tu-van?q=${encodeURIComponent(q)}`}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-gray-200 hover:text-white transition"
                >
                  {q}
                </Link>
              ))}
            </div>
            <Link
              href="/tu-van"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-10 py-4 rounded-2xl text-lg transition shadow-lg shadow-red-900/30"
            >
              Bắt đầu tư vấn miễn phí →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
