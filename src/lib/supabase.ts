import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client (bypass RLS)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Brand {
  id: number
  name: string
  slug: string
  logo_url: string | null
  country: string | null
  vehicle_type: 'car' | 'bike' | 'both'
  is_active: boolean
}

export interface VehicleType {
  id: number
  name: string
  slug: string
  vehicle_type: 'car' | 'bike'
}

export interface Model {
  id: number
  brand_id: number
  type_id: number | null
  name: string
  slug: string
  xevietnam_id: number | null
  segment: string | null
  seats: number | null
  fuel_type: string | null
  origin: string | null
  engine_cc: number | null
  thumbnail_url: string | null
  description: string | null
  specs: Record<string, string> | null
  launched_at: string | null
  model_year: number | null
  is_active: boolean
  is_featured: boolean
  view_count: number
  // Joined
  brand?: Brand
  vehicle_type_info?: VehicleType
  latest_price?: {
    price_min: number | null
    price_max: number | null
    price_raw: string | null
  }
}

export interface Version {
  id: number
  model_id: number
  name: string
  specs: Record<string, string> | null
  is_active: boolean
}

export interface PriceHistory {
  id: number
  version_id: number
  price_min: number | null
  price_max: number | null
  price_raw: string | null
  note: string | null
  recorded_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatPrice(price: number | null): string {
  if (!price) return 'Liên hệ'
  if (price >= 1_000_000_000) {
    const ty = Math.floor(price / 1_000_000_000)
    const trieu = Math.round((price % 1_000_000_000) / 1_000_000)
    return trieu > 0 ? `${ty} tỷ ${trieu} triệu` : `${ty} tỷ`
  }
  return `${Math.round(price / 1_000_000)} triệu`
}

export function formatPriceRange(min: number | null, max: number | null): string {
  if (!min) return 'Liên hệ'
  if (!max || min === max) return formatPrice(min)
  return `${formatPrice(min)} - ${formatPrice(max)}`
}
