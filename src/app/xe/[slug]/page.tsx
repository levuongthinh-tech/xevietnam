import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase, formatPriceRange } from '@/lib/supabase'

interface Props {
  params: Promise<{ slug: string }>
}

async function getModel(slug: string) {
  const { data } = await supabase
    .from('models')
    .select(`
      *,
      brand:brands(name, slug, country, logo_url, vehicle_type),
      vehicle_type_info:vehicle_types(name, slug)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data
}

async function getSimilarModels(brandId: number, currentSlug: string) {
  const { data } = await supabase
    .from('models')
    .select(`id, name, slug, thumbnail_url, specs, brand:brands(name, slug)`)
    .eq('brand_id', brandId)
    .eq('is_active', true)
    .neq('slug', currentSlug)
    .limit(4)
  return data || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const model = await getModel(slug)
  if (!model) return { title: 'Không tìm thấy xe' }
  let specs = model.specs as any
  if (typeof specs === 'string') { try { specs = JSON.parse(specs) } catch { specs = null } }
  const price = specs?.price_min ? formatPriceRange(specs.price_min, specs.price_max) : null
  return {
    title: `${model.name}${price ? ` - Giá ${price}` : ''} | XeVietnam`,
    description: model.description || `Thông số kỹ thuật, giá bán và đánh giá xe ${model.name} tại Việt Nam.`,
  }
}

// Group spec keys into categories based on Vietnamese keywords
function groupSpecs(specs: Record<string, string>) {
  const PRICE_KEYS = new Set(['price_min', 'price_max', 'price_raw'])
  const groups: Record<string, Record<string, string>> = {
    'Động cơ': {},
    'Kích thước & Trọng lượng': {},
    'Hiệu suất & Nhiên liệu': {},
    'Khung gầm & Phanh': {},
    'Chiếu sáng & Điện': {},
    'Khác': {},
  }

  const ENGINE_KEYS = /động cơ|dung tích|công suất|mô-men|hộp số|tỷ số nén|xi-lanh|hành trình|xylanh|bộ ly hợp|khởi động|làm mát|công nghệ/i
  const DIM_KEYS = /dài|rộng|cao|khoảng cách|độ cao|yên|gầm|trọng lượng|kích thước|tải trọng/i
  const PERF_KEYS = /tiêu thụ|bình xăng|lít|tốc độ tối đa|0-100|tăng tốc/i
  const CHASSIS_KEYS = /phanh|giảm xóc|lốp|bánh|khung|hệ thống treo|abs|cbs/i
  const ELEC_KEYS = /đèn|điện|usb|sạc|màn hình|đồng hồ|kết nối|bluetooth|wifi/i

  for (const [k, v] of Object.entries(specs)) {
    if (PRICE_KEYS.has(k)) continue
    if (ENGINE_KEYS.test(k)) groups['Động cơ'][k] = v
    else if (DIM_KEYS.test(k)) groups['Kích thước & Trọng lượng'][k] = v
    else if (PERF_KEYS.test(k)) groups['Hiệu suất & Nhiên liệu'][k] = v
    else if (CHASSIS_KEYS.test(k)) groups['Khung gầm & Phanh'][k] = v
    else if (ELEC_KEYS.test(k)) groups['Chiếu sáng & Điện'][k] = v
    else groups['Khác'][k] = v
  }

  return Object.entries(groups).filter(([, v]) => Object.keys(v).length > 0)
}

const GROUP_ICONS: Record<string, string> = {
  'Động cơ': '⚙️',
  'Kích thước & Trọng lượng': '📐',
  'Hiệu suất & Nhiên liệu': '⛽',
  'Khung gầm & Phanh': '🛞',
  'Chiếu sáng & Điện': '💡',
  'Khác': '📋',
}

export default async function ModelDetailPage({ params }: Props) {
  const { slug } = await params
  const model = await getModel(slug)
  if (!model) notFound()

  const similarModels = await getSimilarModels(model.brand_id, slug)
  let specs = model.specs as any
  if (typeof specs === 'string') { try { specs = JSON.parse(specs) } catch { specs = null } }
  const priceMin = specs?.price_min ?? null
  const priceMax = specs?.price_max ?? null
  const specGroups = specs ? groupSpecs(specs) : []
  const totalSpecs = specGroups.reduce((n, [, v]) => n + Object.keys(v).length, 0)

  const vehicleType = model.brand?.vehicle_type
  const listHref = vehicleType === 'bike' ? '/xe-may' : '/o-to'
  const vehicleLabel = vehicleType === 'bike' ? 'Xe máy' : 'Xe ô tô'

  const aiQuestions = [
    `So sánh ${model.name} v雋i đối thủ cùng phân khúc`,
    `${model.name} có phù hợp cho người mới lái không?`,
    `Chi phí vận hành của ${model.name} như thế nào?`,
    `${model.name} bao lâu thì bảo dưỡng một lần?`,
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-white transition">Trang chủ</Link>
            <span className="text-gray-600">›</span>
            <Link href={listHref} className="hover:text-white transition">{vehicleLabel}</Link>
            <span className="text-gray-600">›</span>
            <Link href={`/hang/${model.brand?.slug}`} className="hover:text-white transition">{model.brand?.name}</Link>
            <span className="text-gray-600">›</span>
            <span className="text-gray-200">{model.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-10 items-center pb-8">
            {/* Image */}
            <div className="relative">
              {model.thumbnail_url ? (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={model.thumbnail_url}
                    alt={model.name}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                </div>
              ) : (
                <div className="w-full h-64 md:h-80 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-8xl opacity-20">🚗</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">
                {model.brand?.name} · {vehicleLabel}
              </p>
              <h1 className="text-4xl font-bold text-white mb-2 leading-tight">{model.name}</h1>

              {totalSpecs > 0 && (
                <p className="text-sm text-gray-400 mb-5">
                  {totalSpecs} thông số kỹ thuật · {specGroups.length} nhóm
                </p>
              )}

              {priceMin ? (
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 mb-6">
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Giá bán lẻ đề xuất</p>
                  <p className="text-3xl font-bold text-white">{formatPriceRange(priceMin, priceMax)}</p>
                  {specs?.price_raw && (
                    <p className="text-xs text-gray-400 mt-2">{specs.price_raw}</p>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                  <p className="text-sm text-gray-400">Liên hệ đại lý để biết giá chính xác</p>
                </div>
              )}

              {/* Quick facts */}
              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                {model.brand?.country && (
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <p className="text-gray-500 text-xs mb-0.5">Xuất xứ</p>
                    <p className="font-semibold">{model.brand.country}</p>
                  </div>
                )}
                {model.fuel_type && (
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <p className="text-gray-500 text-xs mb-0.5">Nhiên liệu</p>
                    <p className="font-semibold">{model.fuel_type}</p>
                  </div>
                )}
                {model.seats && (
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <p className="text-gray-500 text-xs mb-0.5">Số chỗ</p>
                    <p className="font-semibold">{model.seats} chỗ</p>
                  </div>
                )}
                {model.engine_cc && (
                  <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <p className="text-gray-500 text-xs mb-0.5">Dung tích</p>
                    <p className="font-semibold">{model.engine_cc} cc</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/so-sanh?xe1=${slug}`}
                  className="flex-1 text-center border border-white/30 text-white font-semibold py-3 rounded-xl hover:bg-white/10 transition text-sm"
                >
                  ⚖️ So sánh xe
                </Link>
                <Link
                  href={`/tu-van?xe=${slug}`}
                  className="flex-1 text-center bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-500 transition text-sm"
                >
                  🤖 Hỏi AI
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Specs — 2/3 width */}
          <div className="lg:col-span-2 space-y-5">
            {specGroups.length > 0 ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>🍊</span> Thông số kỹ thuật
                  <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-1">
                    {totalSpecs} thông số
                  </span>
                </h2>
                {specGroups.map(([groupName, groupSpecs]) => (
                  <div key={groupName} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                      <span>{GROUP_ICONS[groupName] || '📋'}</span>
                      <h3 className="font-semibold text-gray-800 text-sm">{groupName}</h3>
                      <span className="ml-auto text-xs text-gray-400">{Object.keys(groupSpecs).length} mục</span>
                    </div>
                    <div>
                      {Object.entries(groupSpecs).map(([key, value], i) => (
                        <div
                          key={key}
                          className={`flex justify-between items-start px-5 py-3 text-sm gap-4 ${
                            i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <span className="text-gray-500 shrink-0">{key}</span>
                          <span className="font-medium text-gray-900 text-right">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-400 text-5xl mb-3">📋</p>
                <p className="text-gray-500">Chưa có thông số kỹ thuật chi tiết cho xe náy</p>
              </div>
            )}
          </div>

          {/* AI Sidebar — 1/3 width */}
          <div className="space-y-5">
            {/* AI Ask Panel */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🤖</span>
                <h3 className="font-bold">Hỏi AI về {model.name}</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                AI được tích hợp dữ liệu từ cơ sở dữ liệu xe Việt Nam.
              </p>
              <div className="space-y-2">
                {aiQuestions.map((q, i) => (
                  <Link
                    key={i}
                    href={`/tu-van?xe=${slug}&q=${encodeURIComponent(q)}`}
                    className="block w-full text-left text-sm bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 py-2.5 transition text-gray-200 hover:text-white"
                  >
                    {q}
                  </Link>
                ))}
              </div>
              <Link
                href={`/tu-van?xe=${slug}`}
                className="mt-4 flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition text-sm"
              >
                Đặt câu hỏi riêng →
              </Link>
            </div>

            {/* Model info card */}
            {(model.segment || model.model_year || model.origin) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Thông tin chung</h3>
                <dl className="space-y-2 text-sm">
                  {model.segment && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Phân khúc</dt>
                      <dd className="font-medium">{model.segment}</dd>
                    </div>
                  )}
                  {model.model_year && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Năm model</dt>
                      <dd className="font-medium">{model.model_year}</dd>
                    </div>
                  )}
                  {model.origin && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Sản xuất tại</dt>
                      <dd className="font-medium">{model.origin}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Compare CTA */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-5">
              <p className="text-sm font-semibold text-gray-900 mb-1">⚖️ So sánh xe</p>
              <p className="text-xs text-gray-500 mb-3">Đặt {model.name} cạnh đối thủ để so sánh thông số</p>
              <Link
                href={`/so-sanh?xe1=${slug}`}
                className="block text-center text-sm font-semibold text-red-600 border border-red-200 bg-white rounded-xl py-2.5 hover:bg-red-50 transition"
              >
                So sánh ngay
              </Link>
            </div>
          </div>
        </div>

        {/* Similar models */}
        {similarModels.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Xe cùng hãng</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarModels.map((m: any) => {
                let ms = m.specs as any
                if (typeof ms === 'string') { try { ms = JSON.parse(ms) } catch { ms = null } }
                return (
                  <Link
                    key={m.id}
                    href={`/xe/${m.slug}`}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group"
                  >
                    {m.thumbnail_url ? (
                      <img src={m.thumbnail_url} alt={m.name} className="w-full h-32 object-cover group-hover:scale-105 transition duration-300" />
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-3xl opacity-20">🚗</span>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs text-gray-400 mb-0.5">{m.brand?.name}</p>
                      <p className="text-sm font-semibold text-gray-800 leading-tight">{m.name}</p>
                      {ms?.price_min && (
                        <p className="text-xs text-red-600 font-semibold mt-1">
                          {formatPriceRange(ms.price_min, ms.price_max)}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
