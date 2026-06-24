import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { formatPriceRange } from '@/lib/supabase'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// Extract price range from Vietnamese text
function extractPriceRange(text: string): { min?: number; max?: number } {
  const t = text.toLowerCase()

  // Patterns: "dưới X triệu/tỷ", "từ X đến Y", "khoảng X", "trên X"
  const duoiMatch = t.match(/d[ưu][ớo]i\s+(\d+(?:[.,]\d+)?)\s*(tri[eệ]u|ty|tỷ)?/)
  const tuDenMatch = t.match(/t[ừu]\s+(\d+(?:[.,]\d+)?)\s*(tri[eệ]u|ty|tỷ)?\s+(?:đ[eế]n|den|-)\s+(\d+(?:[.,]\d+)?)\s*(tri[eệ]u|ty|tỷ)?/)
  const khoanMatch = t.match(/kho[aả]ng\s+(\d+(?:[.,]\d+)?)\s*(tri[eệ]u|ty|tỷ)?/)
  const trenMatch = t.match(/tr[eê]n\s+(\d+(?:[.,]\d+)?)\s*(tri[eệ]u|ty|tỷ)?/)

  const toVnd = (num: string, unit?: string) => {
    const n = parseFloat(num.replace(',', '.'))
    if (unit && (unit.startsWith('ty') || unit.startsWith('tỷ'))) return n * 1_000_000_000
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
  if (t.match(/\b(xe? m[aá]y|xe? g[aắ]n m[aá]y|motor|máy|scooter|pkl)\b/)) return 'bike'
  if (t.match(/\b(xe? [oôö] t[oô]|[oôö] t[oô]|sedan|suv|hatchback|mpv|pickup|car)\b/)) return 'car'
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

    // Filter by price range and format output
    let vehicles = data.filter((m: any) => {
      if (!priceRange.min && !priceRange.max) return true
      const ph = m.versions?.[0]?.price_history?.[0]
      if (!ph?.price_min) return true // include if no price data
      if (priceRange.max && ph.price_min > priceRange.max * 1.1) return false
      if (priceRange.min && ph.price_max && ph.price_max < priceRange.min * 0.9) return false
      return true
    })

    // Limit to most relevant 15
    vehicles = vehicles.slice(0, 15)

    const vehicleList = vehicles.map((m: any) => {
      const ph = m.versions?.[0]?.price_history?.[0]
      const price = ph ? formatPriceRange(ph.price_min, ph.price_max) : 'Liên hệ'
      const parts = [
        `• ${m.brand?.name} ${m.name}`,
        `  Giá: ${price}`,
        m.fuel_type ? `  Nhiên liệu: ${m.fuel_type}` : '',
        m.seats ? `  Số chỗ: ${m.seats}` : '',
        m.engine_cc ? `  Dung tích: ${m.engine_cc}cc` : '',
        m.segment ? `  Phân khúc: ${m.segment}` : '',
        m.origin ? `  Xuất xứ: ${m.origin}` : '',
      ].filter(Boolean)
      return parts.join('\n')
    })

    return vehicleList.join('\n\n')
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
        { content: 'Tính năng AI chưa được cấu hình. Vui lòng liên hệ admin để kích hoạt.' },
        { status: 200 }
      )
    }

    // Combine all conversation for context extraction
    const allText = messages.map((m: any) => m.content).join(' ')
    const vehicleContext = await getRelevantVehicles(allText)

    const systemPrompt = `Bạn là chuyên gia tư vấn xe tại XeVietnam.vn — nền tảng dữ liệu xe ô tô và xe máy Việt Nam.

Nhiệm vụ: Tư vấn người dùng chọn xe phù hợp dựa trên ngân sách, nhu cầu và sở thích cá nhân.

${vehicleContext ? `Dữ liệu xe phù hợp trong hệ thống:\n${vehicleContext}` : 'Dữ liệu xe đang được tải.'}

Quy tắc trả lời:
- Luôn trả lời bằng tiếng Việt có dấu, thân thiện và ngắn gọn (tối đa 200 từ)
- Đề xuất 2-3 xe cụ thể kèm giá và lý do phù hợp với nhu cầu
- Nếu chưa rõ ngân sách hoặc nhu cầu, hỏi thêm 1 câu ngắn gọn
- Ưu tiên xe có dữ liệu thực tế trong hệ thống
- Không bịa đặt thông số hoặc giá không có trong dữ liệu
- Dùng emoji phù hợp để trả lời sinh động hơn`

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
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', response.status, err)
      return NextResponse.json(
        { content: 'Hệ thống AI đang bận, vui lòng thử lại sau ít phút nhé! 🙏' },
        { status: 200 }
      )
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || 'Xin lỗi, tôi chưa hiểu câu hỏi. Bạn có thể nói rõ hơn không?'

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { content: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau! 🙏' },
      { status: 200 }
    )
  }
}
