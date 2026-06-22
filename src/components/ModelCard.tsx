import Link from 'next/link'
import { formatPriceRange } from '@/lib/supabase'

interface ModelCardProps {
  model: {
    id: number
    name: string
    slug: string
    thumbnail_url?: string | null
    brand?: { name: string; slug: string } | null
    specs?: { price_min?: number | null; price_max?: number | null } | null
  }
}

export default function ModelCard({ model }: ModelCardProps) {
  let specs = model.specs as any
  if (typeof specs === 'string') { try { specs = JSON.parse(specs) } catch { specs = null } }
  const priceStr = formatPriceRange(specs?.price_min ?? null, specs?.price_max ?? null)

  return (
    <Link
      href={`/xe/${model.slug}`}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-red-300 transition group block"
    >
      {model.thumbnail_url ? (
        <img
          src={model.thumbnail_url}
          alt={model.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
        />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-5xl opacity-40">🚗</span>
        </div>
      )}
      <div className="p-4">
        {model.brand && (
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{model.brand.name}</p>
        )}
        <h3 className="font-semibold text-gray-900 mb-2 leading-tight">{model.name}</h3>
        <p className="text-red-600 font-bold">{priceStr}</p>
      </div>
    </Link>
  )
}
