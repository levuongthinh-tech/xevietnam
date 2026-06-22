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
    .select(`
      id, name, slug, thumbnail_url, specs,
      brand:brands(name, slug)
    `)
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
    title: `${model.name}${price ? ` - Giá ${price}` : ''}`,
    description: model.description || `Thông số và giá xe ${model.name} tại Việt Nam.`,
  }
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

  // Separate price fields from display specs
  const displaySpecs = specs
    ? Object.entries(specs).filter(([k]) => k !== 'price_min' && k !== 'price_max' && k !== 'price_raw')
    : []

  const vehicleType = model.brand?.vehicle_type
  const listHref = vehicleType === 'bike' ? '/xe-may' : '/o-to'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-red-600">Trang chủ</Link>
        <span>›</span>
        <Link href={listHref} className="hover:text-red-600">
          {vehicleType === 'bike' ? 'Xe máy' : 'Xe ô tô'}
        </Link>
        <span>›</span>
        <Link href={`/hang/${model.brand?.slug}`} className="hover:text-red-600">
          {model.brand?.name}
        </Link>
        <span>›</span>
        <span className="text-gray-900">{model.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Ảnh */}
        <div>
          {model.thumbnail_url ? (
            <img
              src={model.thumbnail_url}
              alt={model.name}
              className="w-full rounded-xl object-cover max-h-72"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-8xl opacity-30">🚗</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">{model.brand?.name}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{model.name}</h1>

          {priceMin ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">Giá bán lẻ đề xuất</p>
              <p className="text-2xl font-bold text-red-600">
                {formatPriceRange(priceMin, priceMax)}
              </p>
              {specs?.price_raw && (
                <p className="text-xs text-gray-400 mt-1">{specs.price_raw}</p>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-500">Liên hệ đại lý để biết giá</p>
            </div>
          )}

          <dl className="space-y-2 text-sm">
            {model.brand?.country && (
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-500">Xuất xứ</dt>
                <dd className="font-medium">{model.brand.country}</dd>
              </div>
            )}
            {model.fuel_type && (
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-500">Nhiên liệu</dt>
                <dd className="font-medium">{model.fuel_type}</dd>
              </div>
            )}
            {model.seats && (
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-500">Số chỗ</dt>
                <dd className="font-medium">{model.seats} chỗ</dd>
              </div>
            )}
            {model.engine_cc && (
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-500">Dung tích</dt>
                <dd className="font-medium">{model.engine_cc} cc</dd>
              </div>
            )}
            {model.origin && (
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-500">Sản xuất</dt>
                <dd className="font-medium">{model.origin}</dd>
              </div>
            )}
            {model.model_year && (
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-500">Năm model</dt>
                <dd className="font-medium">{model.model_year}</dd>
              </div>
            )}
            {model.segment && (
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-500">Phân khúc</dt>
                <dd className="font-medium">{model.segment}</dd>
              </div>
            )}
          </dl>

          <div className="flex gap-3 mt-6">
            <Link
              href={`/so-sanh?xe1=${slug}`}
              className="flex-1 text-center border border-red-600 text-red-600 font-semibold py-2.5 rounded-full hover:bg-red-50 transition text-sm"
            >
              So sánh xe này
            </Link>
            <Link
              href={`/tu-van?xe=${slug}`}
              className="flex-1 text-center bg-red-600 text-white font-semibold py-2.5 rounded-full hover:bg-red-700 transition text-sm"
            >
              Hỏi AI về xe này
            </Link>
          </div>
        </div>
      </div>

      {/* Thông số kỹ thuật */}
      {displaySpecs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thông số kỹ thuật</h2>
          <div className="bg-white border rounded-xl overflow-hidden">
            {displaySpecs.map(([key, value], i) => (
              <div
                key={key}
                className={`flex justify-between px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-gray-50' : ''}`}
              >
                <span className="text-gray-500">{key}</span>
                <span className="font-medium text-right max-w-xs">{String(value)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Xe cùng hãng */}
      {similarModels.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Xe cùng hãng</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarModels.map((m: any) => {
              let ms = m.specs as any
              if (typeof ms === 'string') { try { ms = JSON.parse(ms) } catch { ms = null } }
              return (
                <Link
                  key={m.id}
                  href={`/xe/${m.slug}`}
                  className="border rounded-xl overflow-hidden hover:shadow-md transition group"
                >
                  {m.thumbnail_url ? (
                    <img src={m.thumbnail_url} alt={m.name} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <span className="text-3xl opacity-30">🚗</span>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{m.name}</p>
                    {ms?.price_min && (
                      <p className="text-xs text-red-600 mt-1">
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
  )
}
