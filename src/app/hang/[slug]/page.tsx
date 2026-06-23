import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerClient, formatPriceRange } from '@/lib/supabase'
import Link from 'next/link'

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
  return Object.keys(s).filter(k => !['price_min', 'price_max', 'price_raw'].includes(k)).length
}

function getEVRange(specs: any): string | null {
  const s = parseSpecs(specs)
  if (!s) return null
  const key = Object.keys(s).find(k =>
    k.toLowerCase().includes('hành trình') ||
    k.toLowerCase().includes('phạm vi') ||
    k.toLowerCase().includes('quãng đường') ||
    k.toLowerCase().includes('range')
  )
  return key ? s[key] : null
}

function getFuelBadge(specs: any, fuelType: string | null) {
  const s = parseSpecs(specs)
  const fuel = (s?.['Loại nhiên liệu'] || fuelType || '').toLowerCase()
  if (fuel.includes('điện') || fuel.includes('electric')) return { label: '⚡ Điện', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' }
  if (fuel.includes('hybrid') || fuel.includes('lai')) return { label: '🔋 Hybrid', color: 'bg-blue-500/15 text-blue-400 border border-blue-500/25' }
  if (fuel.includes('xăng') || fuel.includes('petrol') || fuel.includes('gasoline')) return { label: 'Xăng', color: 'bg-orange-500/15 text-orange-400 border border-orange-500/25' }
  if (fuel.includes('dầu') || fuel.includes('diesel')) return { label: 'Dầu', color: 'bg-gray-500/15 text-gray-400 border border-gray-500/25' }
  return null
}

function fmtPrice(n: number | null): string {
  if (!n) return '—'
  if (n >= 1e9) {
    const ty = Math.floor(n / 1e9)
    const tr = Math.round((n % 1e9) / 1e6)
    return tr > 0 ? `${ty} tỷ ${tr}tr` : `${ty} tỷ`
  }
  return `${Math.round(n / 1e6)}tr`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrand(slug)
  if (!brand) return { title: 'Không tìm thấy hãng xe' }
  const type = brand.vehicle_type === 'bike' ? 'xe máy' : 'ô tô'
  return {
    title: `${brand.name} - Bảng giá ${type} và thông số kỹ thuật 2025`,
    description: `Toàn bộ dòng ${type} ${brand.name} tại Việt Nam: giá niêm yeết, thông số kỹ thuật, so sánh và tư vấn AI.`
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const brand = await getBrand(slug)
  if (!brand) notFound()

  const models = await getBrandModels(brand.id)

  const withPrice = models.filter(m => getPrice(m.specs).min)
  const prices = withPrice.map(m => getPrice(m.specs).min as number)
  const minPrice = prices.length ? Math.min(...prices) : null
  const withSpecs = models.filter(m => specCount(m.specs) > 3)

  const isCar = brand.vehicle_type === 'car'
  const isVietnamese = brand.country === 'Việt Nam' || brand.name === 'VinFast'
  const isEVBrand = ['VinFast', 'BYD', 'Aion', 'Yadea'].includes(brand.name)

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {isEVBrand ? (
            <>
              <div className="absolute -top-32 right-0 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[140px] opacity-[0.10]" />
              <div className="absolute top-1/2 -left-32 w-[300px] h-[300px] bg-blue-600 rounded-full blur-[120px] opacity-[0.06]" />
            </>
          ) : (
            <>
              <div className="absolute -top-32 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[140px] opacity-[0.10]" />
              <div className="absolute bottom-0 -left-32 w-[300px] h-[300px] bg-indigo-700 rounded-full blur-[120px] opacity-[0.06]" />
            </>
          )}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-6 pb-12">
          <nav className="text-xs text-gray-600 mb-8 flex items-center gap-1.5">
            <Link href="/" className="hover:text-gray-400 transition">Trang chủ</Link>
            <span>/</span>
            <Link href={isCar ? '/o-to' : '/xe-may'} className="hover:text-gray-400 transition">
              {isCar ? 'Xe ô tô' : 'Xe máy'}
            </Link>
            <span>/</span>
            <span className="text-gray-300">{brand.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end gap-8">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-5">
                {isVietnamese && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full font-medium">
                    🇻🇳 Thương hiệu Việt Nam
                  </span>
                )}
                {isEVBrand && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
                    ⚡ 100% Xe điện
                  </span>
                )}
              </div>

              <div className="flex items-center gap-5">
                <div className={`w-[72px] h-[72px] flex-shrink-0 rounded-2xl flex items-center justify-center border ${isEVBrand ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} className="w-12 h-12 object-contain" />
                  ) : (
                    <span className={`text-2xl font-black ${isEVBrand ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {brand.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none">{brand.name}</h1>
                  <p className="text-gray-500 text-sm mt-2">
                    {brand.country && `${brand.country} · ` {models.length} dòng {isCar ? 'ô tô' : 'xe máy'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 lg:w-[320px]">
              {[
                { val: models.length.toString(), label: 'Dòng xe', accent: false },
                { val: withSpecs.length.toString(), label: 'Có thông số', accent: false },
                { val: fmtPrice(minPrice), label: 'Từ giá', accent: true },
              ].map(({ val, label, accent }) => (
                <div key={label} className={`rounded-xl px-3 py-3 text-center border ${accent && minPrice ? (isEVBrand ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-blue-500/8 border-blue-500/20') : 'bg-white/4 border-white/8'}`}>
                  <p className={`text-lg font-bold leading-tight ${accent && minPrice ? (isEVBrand ? 'text-emerald-400' : 'text-blue-400') : 'text-white'}`}>{val}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AI STRIP ── */}
      <div className="border-y border-white/6 bg-blue-950/25">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/25 flex items-center justify-center flex-shrink-0 text-sm">🤖</div>
            <p className="text-sm text-gray-400 truncate">
              AI tư vấn xe <span className="text-white font-medium">{brand.name}</span> theo ngân sách & nhu cầu của bạn
            </p>
          </div>
          <Link
            href={`/tu-van?q=${encodeURIComponent(`Tư vấn xe ${brand.name} phù hợp cho tôi`)}`}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition whitespace-nowrap"
          >
            Hỏi AI →
          </Link>
        </div>
      </div>

      {/* ── MODEL GRID ── */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-white">
            Tất cả dòng xe <span className={isEVBrand ? 'text-emerald-400' : 'text-blue-400'}>{brand.name}</span>
          </h2>
          <span className="text-xs text-gray-600 bg-white/4 border border-white/8 px-2.5 py-1 rounded-full">{models.length} mẫu xe</span>
        </div>

        {models.length === 0 ? (
          <div className="text-center py-24 text-gray-700">
            <p className="text-4xl mb-4">🚗</p>
            <p>Chưa có dữ liệu xe</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {models.map((model: any) => {
              const price = getPrice(model.specs)
              const cnt = specCount(model.specs)
              const fuel = getFuelBadge(model.specs, model.fuel_type)
              const range = getEVRange(model.specs)

              return (
                <Link
                  key={model.id}
                  href={`/xe/${model.slug}`}
                  className={`group bg-gray-900 rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col ${isEVBrand
                    ? 'border-white/6 hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(52,211,153,0.07)]'
                    : 'border-white/6 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.07)]'
                  }`}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden bg-gray-800" style={{ aspectRatio: '4/3' }}>
                    {model.thumbnail_url ? (
                      <img
                        src={model.thumbnail_url}
                        alt={model.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl opacity-10">{isCar ? '🚗' : '🏍️'}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent" />

                    <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                      {fuel ? (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${fuel.color}`}>
                          {fuel.label}
                        </span>
                      ) : <span />}
                      {cnt > 0 && (
                        <span className="text-[11px] bg-black/50 text-gray-400 border border-white/10 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                          {cnt} TS
                        </span>
                      )}
                    </div>

                    {model.model_year && (
                      <span className="absolute bottom-2 right-2 text-[11px] text-gray-400 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        {model.model_year}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className={`font-semibold text-sm leading-snug transition-colors mb-1 ${isEVBrand ? 'text-gray-100 group-hover:text-emerald-400' : 'text-gray-100 group-hover:text-blue-400'}`}>
                      {model.name}
                    </h3>
                    {range && (
                      <p className="text-[11px] text-emerald-500 mb-1 flex items-center gap-1 truncate">
                        <span>⚡</span><span className="truncate">{range}</span>
                      </p>
                    )}
                    <div className="mt-auto pt-2 border-t border-white/5">
                      <p className={`text-sm font-bold ${price.min ? (isEVBrand ? 'text-emerald-400' : 'text-blue-400') : 'text-gray-500'}`}>
                        {price.str}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ── AI COMPARISON ── */}
      {withSpecs.length > 1 && (
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-gray-900 to-slate-900 p-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">AI-Powered Analysis</p>
                <h3 className="text-xl font-bold text-white mb-2">So sánh thông số kỹ thuật</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {withSpecs.length} dòng {brand.name} có đầy đủ dữ liệu. Hỏi AI để so sánh chi tiết và chọn xe phù hợp nhất.
                </p>
                <div className="flex flex-wrap gap-2">
                  {models.slice(0, 5).map((m: any) => (
                    <Link key={m.id} href={`/xe/${m.slug}`}
                      className="text-xs bg-white/5 hover:bg-white/8 border border-white/10 rounded-lg px-3 py-1.5 text-gray-400 hover:text-white transition">
                      {m.name}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href={`/tu-van?q=${encodeURIComponent(`So sánh các dòng xe ${brand.name} với nhau`)}`}
                className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition text-sm"
              >
                🤖 So sánh với AI
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
