import Link from 'next/link'
import { formatPriceRange } from '@/lib/supabase'

interface ModelCardProps {
  model: {
    id: number
    name: string
    slug: string
    thumbnail_url?: string | null
    brand?: { name: string; slug: string; vehicle_type?: string } | null
    specs?: any
  }
}

export default function ModelCard({ model }: ModelCardProps) {
  let specs = model.specs as any
  if (typeof specs === 'string') { try { specs = JSON.parse(specs) } catch { specs = null } }
  const priceStr = formatPriceRange(specs?.price_min ?? null, specs?.price_max ?? null)
  const specCount = specs
    ? Object.keys(specs).filter(k => !['price_min', 'price_max', 'price_raw'].includes(k)).length
    : 0
  const isBike = model.brand?.vehicle_type === 'bike'

  return (
    <Link
      href={`/xe/${model.slug}`}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group block"
    >
      {model.thumbnail_url ? (
        <div className="overflow-hidden">
          <img
            src={model.thumbnail_url}
            alt={model.name}
            className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-5xl opacity-20">{isBike ? '🏍️' : '🚗'}</span>
        </div>
      )}
      <div className="p-4">
        {model.brand && (
          <p className="text-xs text-gray-400 mb-0.5">{model.brand.name}</p>
        )}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2">{model.name}</h3>
        <p className="text-red-600 font-bold text-sm">{priceStr}</p>
        {specCount > 0 && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
            {specCount} thông số
          </p>
        )}
      </div>
    </Link>
  )
}
