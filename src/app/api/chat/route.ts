import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { formatPriceRange } from '@/lib/supabase'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// Extract price range from Vietnamese text
function extractPriceRange(text: string): { min?: number; max?: number } {
  const t = text.toLowerCase()
  const duoiMatch = t.match(/d[\u01b0u][\u1edboo]i\s+(\d+(?:[.,]\d+)?)\s*(tri[e\u1ec7]u|ty|t\u1ef7)?/)
  const tuDenMatch = t.match(/t[\u1eeb u]\s+(\d+(?:[.,]\d+)?)\s*(tri[e\u1ec7]u|ty|t\u1ef7)?\s+(?:\u0111[e\u1ebf]n|den|-)\s+(\d+(?:[.,]\d+)?)\s*(tri[e\u1ec7]u|ty|t\u1ef7)?/)
  const khoanMatch = t.match(/kho[a\u1ea3]ng\s+(\d+(?:[.,]\d+)?)\s*(tri[e\u1ec7]u|ty|t\u1ef7)?/)
  const trenMatch = t.match(/tr[e\xea]n\s+(\d+(?:[.,]\d+)?)\s*(tri[e\u1ec7]u|ty|t\u1ef7)?/)

  const toVnd = (num: string, unit?: string) => {
    const n = parseFloat(num.replace(',', '.'))
    if (unit && (unit.startsWith('ty') || unit.startsWith('t\u1ef7'))) return n * 1_000_000_000
    return n * 1_000_000
  }

  if (tuDenMatch) return { min: toVnd(tuDenMatch[1], tuDenMatch[2]), max: toVnd(tuDenMatch[3], tuDenMatch[4]) }
  if (duoiMatch) return { max: toVnd(duoiMatch[1], duoiMatch[2]) }
  if (khoanMatch) {
    const center = toVnd(khoanMatch[1], khoanMatch[2])
    return { min: center * 0.8, max: center * 1.2 }
  }
  if (trenMatch) return { min: toVnd(trenMatch[1], trenMatch[2]) }
  return {}
}

// Detect vehicle type from text
function detectVehicleType(text: string): 'car' | 'bike' | null {
  const t = text.toLowerCase()
  if (t.match(/\b(xe? m[a\xe1]y|motor|m\xe1y|scooter)\b/)) return 'bike'
  if (t.match(/\b(xe? [o\xf4\xf6] t[o\xf4]|[o\xf4\xf6] t[o\xf4]|sedan|suv|hatchback|mpv|pickup)\b/)) return 'car'
  return null
}

async function getRelevantVehicles(conversationText: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const priceRange = extractPriceRange(conversationText)

    const { data, error } = await supabase
      .from('models')
      .select(`
        name, slug, segment, fuel_type, seats, engine_cc, origin,
        brand:brands(name, vehicle_type),
        versions(price_history(price_min, price_max, price_raw))
      `)
      .eq('is_active', true)
      .order('view_count', { ascending: false })
      .limit(40)

    if (error || !data) return ''

    // Filter by price range
    let vehicles = data.filter((m: any) => {
      if (!priceRange.min && !priceRange.max) return true
      const ph = m.versions?.[0]?.price_history?.[0]
      if (!ph?.price_min) return true
      if (priceRange.max && ph.price_min > priceRange.max * 1.15) return false
      if (priceRange.min && ph.price_max && ph.price_max < priceRange.min * 0.85) return false
      return true
    }).slice(0, 15)

    return vehicles.map((m: any) => {
      const ph = m.versions?.[0]?.price_history?.[0]
      const price = ph ? formatPriceRange(ph.price_min, ph.price_max) : 'Li\xean h\u1ec7'
      return [
        `\u2022 ${m.brand?.name} ${m.name}`,
        `  Gi\xe1: ${price}`,
        m.fuel_type ? `  Nhi\xean li\u1ec7u: ${m.fuel_type}` : '',
        m.seats ? `  S\u1ed1 ch\u1ed7: ${m.seats}` : '',
        m.segment ? `  Ph\xe2n kh\xfac: ${m.segment}` : '',
      ].filter(Boolean).join('\n')
    }).join('\n\n')
  } catch (e) {
    console.error('Supabase query error:', e)
    return ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === 'your-anthropic-api-key-here') {
      return NextResponse.json(
        { content: 'T\xednh n\u0103ng AI ch\u01b0a \u0111\u01b0\u1ee3c c\u1ea5u h\xecnh. Vui l\xf2ng li\xean h\u1ec7 admin \u0111\u1ec3 k\xedch ho\u1ea1t.' },
        { status: 200 }
      )
    }

    const allText = messages.map((m: any) => m.content).join(' ')
    const vehicleContext = await getRelevantVehicles(allText)

    const systemPrompt = `B\u1ea1n l\xe0 chuy\xean gia t\u01b0 v\u1ea5n xe t\u1ea1i XeVietnam.vn \u2014 n\u1ec1n t\u1ea3ng d\u1eef li\u1ec7u xe \xf4 t\xf4 v\xe0 xe m\xe1y Vi\u1ec7t Nam.

Nhi\u1ec7m v\u1ee5: T\u01b0 v\u1ea5n ng\u01b0\u1eddi d\xf9ng ch\u1ecdn xe ph\xf9 h\u1ee3p d\u1ef1a tr\xean ng\xe2n s\xe1ch, nhu c\u1ea7u v\xe0 s\u1edf th\xedch c\xe1 nh\xe2n.

${vehicleContext ? `D\u1eef li\u1ec7u xe ph\xf9 h\u1ee3p trong h\u1ec7 th\u1ed1ng:\n${vehicleContext}` : 'D\u1eef li\u1ec7u xe \u0111ang \u0111\u01b0\u1ee3c t\u1ea3i.'}

Quy t\u1eafc tr\u1ea3 l\u1eddi:
- Lu\xf4n tr\u1ea3 l\u1eddi b\u1eb1ng ti\u1ebfng Vi\u1ec7t c\xf3 d\u1ea5u, th\xe2n thi\u1ec7n v\xe0 ng\u1eafn g\u1ecdn (t\u1ed1i \u0111a 200 t\u1eeb)
- \u0110\u1ec1 xu\u1ea5t 2-3 xe c\u1ee5 th\u1ec3 k\xe8m gi\xe1 v\xe0 l\xfd do ph\xf9 h\u1ee3p v\u1edbi nhu c\u1ea7u
- N\u1ebfu ch\u01b0a r\xf5 ng\xe2n s\xe1ch ho\u1eb7c nhu c\u1ea7u, h\u1ecfi th\xeam 1 c\xe2u ng\u1eafn g\u1ecdn
- Kh\xf4ng b\u1ecba \u0111\u1eb7t th\xf4ng s\u1ed1 ho\u1eb7c gi\xe1 kh\xf4ng c\xf3 trong d\u1eef li\u1ec7u
- D\xf9ng emoji ph\xf9 h\u1ee3p \u0111\u1ec3 tr\u1ea3 l\u1eddi sinh \u0111\u1ed9ng h\u01a1n`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', response.status, err)
      return NextResponse.json(
        { content: 'H\u1ec7 th\u1ed1ng AI \u0111ang b\u1eadn, vui l\xf2ng th\u1eed l\u1ea1i sau \xedt ph\xfat nh\xe9! \ud83d\ude4f' },
        { status: 200 }
      )
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || 'Xin l\u1ed7i, t\xf4i ch\u01b0a hi\u1ec3u c\xe2u h\u1ecfi. B\u1ea1n c\xf3 th\u1ec3 n\xf3i r\xf5 h\u01a1n kh\xf4ng?'

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { content: '\u0110\xe3 x\u1ea3y ra l\u1ed7i k\u1ebft n\u1ed1i. Vui l\xf2ng th\u1eed l\u1ea1i sau! \ud83d\ude4f' },
      { status: 200 }
    )
  }
}
