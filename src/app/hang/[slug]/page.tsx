import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient, formatPriceRange } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  params: Promise<{ slug: string }>
}

async function getBrand(slug: string) {
  const db = createServerClient()
  const { data } = await db
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data
}

async function getBrandModels(brandId: number) {
  const db = createServerClient()
  const { data } = await db
    .from('models')
    .select('id, name, slug, thumbnail_url, specs, fuel_type, segment, model_year')
    .eq('brand_id', brandId)
    .eq('is_active', true)
    .order('view_count', { ascending: false })
  return data || []
}

function parseSpecs(raw: any) {
  if (!raw) return null
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { return null } }
  return raw
}

function getPrice(specs: any) {
  const s = parseSpecs(specs)
  return {
    str: formatPriceRange(s?.price_min ?? null, s?.price_max ?? null),
    min: s?.price_min ?? null,
    max: s?.price_max ?? null,
  }
}

function specCount(specs: any) {
  const s = parseSpecs(specs)
  if (!s) return 0
  return Object.keys(s).filter(k => !['price_min','price_max','price_raw'].includes(k)).length
}

function getFuelBadge(specs: any, fuelType: string | null) {
  const s = parseSpecs(specs)
  const fuel = (s?.['Loáº¡i nhiÃªn liá»u'] || fuelType || '').toLowerCase()
  if (fuel.includes('Äiá»n') || fuel.includes('electric')) return { label: 'Äiá»n', color: 'bg-green-100 text-green-700' }
  if (fuel.includes('hybrid') || fuel.includes('lai')) return { label: 'Hybrid', color: 'bg-blue-100 text-blue-700' }
  if (fuel.includes('xÄng') || fuel.includes('petrol') || fuel.includes('gasoline')) return { label: 'XÄng', color: 'bg-orange-100 text-orange-700' }
  if (fuel.includes('dáº§u') || fuel.includes('diesel')) return { label: 'Dáº§u', color: 'bg-gray-100 text-gray-600' }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrand(slug)
  if (!brand) return { title: 'KhÃ´ng tÃ¬m tháº¥y hÃ£ng xe' }
  const type = brand.vehicle_type === 'bike' ? 'xe mÃ¡y' : 'Ã´ tÃ´'
  return {
    title: `${brand.name} - Báº£ng giÃ¡ ${type} vÃ  thÃ´ng sá» ká»¹ thuáº­t 2025`,
    description: `ToÃ n bá» dÃ²ng ${type} ${brand.name} táº¡i Viá»t Nam: giÃ¡ niÃªm yáº¿t, thÃ´ng sá» ká»¹ thuáº­t, so sÃ¡nh vÃ  tÆ° váº¥n AI.`,
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const brand = await getBrand(slug)
  if (!brand) notFound()

  const models = await getBrandModels(brand.id)

  const isEV = brand.name === 'VinFast' || models.every(m => {
    const s = parseSpecs(m.specs)
    return (s?.['Loáº¡i nhiÃªn liá»u'] || '').toLowerCase().includes('Äiá»n')
  })

  // Stats
  const withPrice = models.filter(m => getPrice(m.specs).min)
  const prices = withPrice.map(m => getPrice(m.specs).min as number)
  const minPrice = prices.length ? Math.min(...prices) : null
  const maxPrice = prices.length ? Math.max(...prices) : null
  const withSpecs = models.filter(m => specCount(m.specs) > 3)

  const isVietnamese = brand.country === 'Viá»t Nam' || brand.name === 'VinFast'
  const isCar = brand.vehicle_type === 'car'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className={`relative overflow-hidden ${isVietnamese ? 'bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'} text-white`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-red-600/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 relative">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-400 mb-8 flex items-center gap-1.5">
            <Link href="/" className="hover:text-white transition">Trang chá»§</Link>
            <span>âº</span>
            <Link href={isCar ? '/o-to' : '/xe-may'} className="hover:text-white transition">
              {isCar ? 'Xe Ã´ tÃ´' : 'Xe mÃ¡y'}
            </Link>
            <span>âº</span>
            <span className="text-white">{brand.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Brand identity */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="w-14 h-14 object-contain" />
                ) : (
                  <span className="text-2xl font-black text-white">{brand.name.slice(0,2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-4xl font-black text-white">{brand.name}</h1>
                  {isVietnamese && (
                    <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-semibold">ð»ð³ Viá»t Nam</span>
                  )}
                </div>
                <p className="text-gray-300 text-sm">
                  {models.length} dÃ²ng {isCar ? 'Ã´ tÃ´' : 'xe mÃ¡y'}
                  {brand.country && ` Â· Xuáº¥t xá»©: ${brand.country}`}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="md:ml-auto grid grid-cols-3 gap-3">
              <div className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-white">{models.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">DÃ²ng xe</p>
              </div>
              <div className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-white">{withSpecs.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">CÃ³ thÃ´ng sá»</p>
              </div>
              <div className="bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-center">
                <p className="text-lg font-bold text-white leading-tight">
                  {minPrice ? `${Math.round(minPrice / 1e9) > 0 ? (minPrice/1e9).toFixed(1)+'tá»·' : Math.round(minPrice/1e6)+'tr'}` : 'â'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Tá»« giÃ¡</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Advisor CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">ð¤</span>
            <p className="text-sm font-medium">Cáº§n tÆ° váº¥n chá»n xe {brand.name}? AI phÃ¢n tÃ­ch theo ngÃ¢n sÃ¡ch & nhu cáº§u cá»§a báº¡n.</p>
          </div>
          <Link
            href={`/tu-van?q=${encodeURIComponent(`TÆ° váº¥n xe ${brand.name} phÃ¹ há»£p cho tÃ´i`)}`}
            className="bg-white text-blue-700 font-bold px-5 py-2 rounded-xl hover:bg-blue-50 transition text-sm whitespace-nowrap flex-shrink-0"
          >
            TÆ° váº¥n ngay â
          </Link>
        </div>
      </section>

      {/* Models grid */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Táº¥t cáº£ dÃ²ng xe {brand.name}
          </h2>
          <span className="text-sm text-gray-400">{models.length} xe</span>
        </div>

        {models.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">ð</p>
            <p>ChÆ°a cÃ³ dá»¯ liá»u xe</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {models.map((model: any) => {
              const price = getPrice(model.specs)
              const cnt = specCount(model.specs)
              const fuel = getFuelBadge(model.specs, model.fuel_type)

              return (
                <Link
                  key={model.id}
                  href={`/xe/${model.slug}`}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group flex flex-col"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {model.thumbnail_url ? (
                      <img
                        src={model.thumbnail_url}
                        alt={model.name}
                        className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-44 flex items-center justify-center">
                        <span className="text-5xl opacity-20">ð</span>
                      </div>
                    )}
                    {fuel && (
                      <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${fuel.color}`}>
                        {fuel.label}
                      </span>
                    )}
                    {cnt > 0 && (
                      <span className="absolute top-2 right-2 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                        {cnt} TS
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">{model.name}</h3>
                    {model.model_year && (
                      <p className="text-xs text-gray-400 mb-2">{model.model_year}</p>
                    )}
                    <div className="mt-auto">
                      <p className="text-red-600 font-bold text-sm">{price.str}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Specs comparison teaser */}
      {withSpecs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <p className="text-3xl mb-4">ð¤</p>
              <h3 className="text-2xl font-bold mb-2">So sÃ¡nh thÃ´ng sá» ká»¹ thuáº­t</h3>
              <p className="text-gray-300 mb-6 text-sm max-w-md mx-auto">
                {withSpecs.length} dÃ²ng {brand.name} cÃ³ Äáº§y Äá»§ thÃ´ng sá». Há»i AI Äá» so sÃ¡nh chi tiáº¿t.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {models.slice(0, 4).map(m => (
                  <Link
                    key={m.id}
                    href={`/xe/${m.slug}`}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-1.5 text-sm text-gray-200 hover:text-white transition"
                  >
                    {m.name}
                  </Link>
                ))}
              </div>
              <Link
                href={`/tu-van?q=${encodeURIComponent(`So sÃ¡nh cÃ¡c dÃ²ng xe ${brand.name} vá»i nhau`)}`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-2xl transition"
              >
                So sÃ¡nh vá»i AI â
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
