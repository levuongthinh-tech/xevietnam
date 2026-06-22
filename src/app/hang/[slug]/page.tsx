import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ModelCard from '@/components/ModelCard'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug: string }>
}

async function getBrand(slug: string) {
  const { data } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data
}

async function getBrandModels(brandId: number) {
  const { data } = await supabase
    .from('models')
    .select(`
      id, name, slug, thumbnail_url,
      brand:brands(name, slug),
      versions(price_history(price_min, price_max))
    `)
    .eq('brand_id', brandId)
    .eq('is_active', true)
    .order('view_count', { ascending: false })

  return data || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrand(slug)
  if (!brand) return { title: 'Không tìm thấy hãng xe' }
  return {
    title: `Xe ${brand.name} - Tất cả dòng xe và bảng giá`,
    description: `Danh sách xe ${brand.name} tại Việt Nam với giá và thông số cập nhật.`,
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const brand = await getBrand(slug)
  if (!brand) notFound()

  const models = await getBrandModels(brand.id)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-red-600">Trang chủ</Link>
        <span>›</span>
        <span className="text-gray-900">{brand.name}</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        <div className="w5-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400">
          {brand.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{brand.name}</h1>
          {brand.country && (
            <p className="text-gray-500 text-sm mt-1">Xuất xỉ: {brand.country}</p>
          )}
        </div>
      </div>

      <p className="text-gray-500 mb-6">{models.length} dòng xe</p>

      {models.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Chưa có dữ liệu xe</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {models.map((model: any) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      )}
    </div>
  )
}
