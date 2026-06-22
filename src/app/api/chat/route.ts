import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, formatPriceRange } from '@/lib/supabase'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

async function getRelevantVehicles(query: string) {
  const supabase = createServerClient()

  // Search models by name (full-text or simple ILIKE)
  const { data } = await supabase
    .from('models')
    .select(`
      name, slug, segment, fuel_type, seats, engine_cc, origin,
      brand:brands(name, country),
      versions(price_history(price_min, price_max, price_raw))
    `)
    .eq('is_active', true)
    .limit(20)

  if (!data) return ''

  // Format for AI context
  const vehicleList = data.map((m: any) => {
    const ph = m.versions?.[0]?.price_history?.[0]
    const price = ph ? formatPriceRange(ph.price_min, ph.price_max) : 'Liên hệ'
    const parts = [
      `- ${m.brand?.name} ${m.name}`,
      `  Giá: ${price}`,
      m.fuel_type ? `  Nhiên liệu: ${m.fuel_type}` : '',
      m.seats ? `  Số chỗ: ${m.seats}` : '',
      m.engine_cc ? `  Dung tích: ${m.engine_cc}cc` : '',
      m.segment ? `  Phân khúc: ${m.segment}` : '',
    ].filter(Boolean)
    return parts.join('\n')
  })

  return vehicleList.join('\n\n')
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

    // Get vehicle data from database
    const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()?.content || ''
    const vehicleContext = await getRelevantVehicles(lastUserMsg)

    const systemPrompt = `Bạn là chuyên gia tư vấn xe tại XeVietnam.vn — nền tảng dữ liệu xe ô tô và xe máy Việt Nam.

Nhiệm vụ: Tư vấn người dùng chọn xe phù hợp dựa trên ngân sách, nhu cầu và sở thích.

Dữ liệu xe hiện có trong hệ thống:
${vehicleContext}

Hướng dẫn:
- Trả lời bằng tiếng Việt, thân thiện và ngắn gọn
- Khi đề xuất xe, luôn nêu rõ giá và lý do phù hợp
- So sánh 2-3 lựa chọn nếu phù hợp
- Hỏi thêm nếu cần thông tin (ngân sách, gia đình/cá nhân, đường phố/đường dài...)
- Không bịa đặt thông tin không có trong dữ liệu`

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
      console.error('Anthropic error:', err)
      return NextResponse.json(
        { content: 'Có lỗi xảy ra khi kết nối AI. Vui lòng thử lại.' },
        { status: 200 }
      )
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || 'Xin lỗi, tôi không hiểu câm hỏi này.'

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { content: 'Có lỗi xảy ra. Vui lòng thử lại sau.' },
      { status: 200 }
    )
  }
}
