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
      brand:brands(name, slug, country, logo_url),
      vehicle_type_info:vehicle_types(name, slug),
      versions(
        id, name, specs, is_active,
        price_history(id, price_min, price_max, price_raw, recorded_at)
      )
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
      id, name, slug, thumbnail_url,
      brand:brands(name, slug),
      versions(price_history(price_min, price_max))
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

  const ph = model.versions?.[0]?.price_history?.[0]
  const price = ph ? formatPriceRange(ph.price_min, ph.price_max) : null

  return {
    title: `${model.name} ${price ? `- Giá ${price}` : ''}`,
    description: model.description || `Thông số và giá xe ${model.name} tại Việt Nam.`,
  }
}

export default async function ModelDetailPage({ params }: Props) {
  const { slug } = await params
  const model = await getModel(slug)
  if (!model) notFound()

  const similarModels = await getSimilarModels(model.brand_id, slug)
  const latestVersion = model.versions?.[0]
  const latestPrice = latestVersion?.price_history?.[0]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-red-600">Trang ch�ủ</Link>
        <span>›</span>
        <Link
          href={model.brand?.slug ? (model.versions?.length ? '/o-to' : '/xe-may') : '/'}
          className="hover:text-red-600"
        >
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
            <div className="w5-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-8xl opacity-30">🚗</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">{model.brand?.name}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{model.name}</h1>

          {latestPrice && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">Giá bán lẻ đề xuất</p>
              <p className="text-2xl font-bold text-red-600">
                {formatPriceRange(latestPrice.price_min, latestPrice.price_max)}
              </p>
              {latestPrice.price_raw && (
                <p className="text-xs text-gray-400 mt-1">{latestPrice.price_raw}</p>
              )}
            </div>
          )}

          <dl className="space-y-2 text-sm">
            {model.brand?.country && (
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-500">Xuất xỉ</dt>
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
              href={`/r�-sanh?xe1=${slug}`}
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

      {/* Phi�a��n bản */}
      {model.versions && model.versions.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Phi�a��n bản & Giá</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold text-gray-600">Phien bản</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Giá từ</th>
                  <th className="text-right p-3 font-semibold text-gray-600">Giá đến</th>
                </tr>
              </thead>
              <tbody>
                {model.versions.map((ver: any) => {
                  const ph = ver.price_history?.[0]
                  return (
                    <tr key={ver.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{ver.name}</td>
                      <td className="p-3 text-right text-red-600">
                        {ph?.price_min ? formatPriceRange(ph.price_min, null) : '-'}
                      </td>
                      <td className="p-3 text-right">
                        {ph:.price_max ? formatPriceRange(ph.price_max, null) : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Thông số kỹ thuật */}
      {model.specs && Object.keys(model.specs).length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thông số k*ỹ thuật</h2>
          <div className="bg-white border rounded-xl overflow-hidden">
            {Object.entries(model.specs).map(([key, value], i) => (
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
              const ph = m.versions?.[0]?.price_history?.[0]
              return (
                <Link
                  key={m.id}
                  href={`/xe/${m.slug}`}
                  className="border rounded-xl overflow-hidden hover:shadow-md transition group"
                >
                  {m.thumbnail_url ? (
                    <img src={m.thumbnail_url} alt={m.name} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w5-full h-32 bg-gray-100 flex items-center justify-center">
                      <span className="text-3xl opacity-30">🚗</span>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800 leading-tight">{m.name}</p>
                    {ph && (
                      <p className="text-xs text-red-600 mt-1">
                        {formatPriceRange(ph.price_min, ph.price_max)}
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
