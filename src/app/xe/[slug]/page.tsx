import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase, formatPriceRange } from '@/lib/supabase'
import Link from 'next/link'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabase
    .from('models')
    .select('name, brand:brands(name)')
    .eq('slug', params.slug)
    .single()
  if (!data) return { title: 'Xe khong tim thay' }
  return { title: `${(data.brand as any)?.name} ${data.name} - XeVietnam.vn` }
}

export default async function XeDetailPage({ params }: Props) {
  const { data: model } = await supabase
    .from('models')
    .select(`
      id, name, slug, thumbnail_url, segment, fuel_type, seats, engine_cc, origin, specs,
      brand:brands(name, slug, country),
      versions(id, name, price_history(price_min, price_max, price_raw, recorded_at))
    `)
    .eq('slug', params.slug)
    .single()

  if (!model) notFound()

  const brand = model.brand as any
  const versions = (model.versions as any[]) || []
  const latestPrice = versions[0]?.price_history?.[0]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-red-600">Trang chu</Link>
        <span className="mx-2">/</span>
        <Link href={`/hang/${brand?.slug}`} className="hover:text-red-600">{brand?.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{model.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Image */}
        <div>
          {model.thumbnail_url ? (
            <img src={model.thumbnail_url} alt={model.name} className="w-full rounded-2xl object-cover h-72" />
          ) : (
            <div className="w-full h-72 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <span className="text-6xl opacity-30">&#128663;</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">{brand?.name}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{model.name}</h1>
          {latestPrice && (
            <p className="text-2xl font-bold text-red-600 mb-6">
              {formatPriceRange(latestPrice.price_min, latestPrice.price_max)}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {model.fuel_type && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 mb-1">Nhien lieu</p>
                <p className="font-medium">{model.fuel_type}</p>
              </div>
            )}
            {model.seats && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 mb-1">So cho</p>
                <p className="font-medium">{model.seats} cho</p>
              </div>
            )}
            {model.engine_cc && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 mb-1">Dung tich</p>
                <p className="font-medium">{model.engine_cc} cc</p>
              </div>
            )}
            {model.origin && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 mb-1">Xuat xu</p>
                <p className="font-medium">{model.origin}</p>
              </div>
            )}
          </div>
          <Link
            href="/tu-van"
            className="mt-6 inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition font-medium"
          >
            <span>&#129318;</span> Tu van AI ve xe nay
          </Link>
        </div>
      </div>

      {/* Versions */}
      {versions.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Phien ban & Gia</h2>
          <div className="border rounded-xl overflow-hidden">
            {versions.map((v: any) => {
              const ph = v.price_history?.[0]
              return (
                <div key={v.id} className="flex items-center justify-between px-4 py-3 border-b last:border-0 hover:bg-gray-50">
                  <span className="font-medium text-gray-800">{v.name}</span>
                  <span className="text-red-600 font-semibold">
                    {ph ? formatPriceRange(ph.price_min, ph.price_max) : 'Lien he'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Specs */}
      {model.specs && Object.keys(model.specs as object).length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thong so ky thuat</h2>
          <div className="border rounded-xl overflow-hidden">
            {Object.entries(model.specs as Record<string, string>).map(([k, v]) => (
              <div key={k} className="grid grid-cols-2 px-4 py-3 border-b last:border-0 text-sm hover:bg-gray-50">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
