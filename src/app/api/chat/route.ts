import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, formatPriceRange } from '@/lib/supabase'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

async function getVehicleContext(query: string): Promise<string> {
  try {
    const supabase = createServerClient()
    const { data } = await supabase
      .from('models')
      .select(`
        name, slug, segment, fuel_type, seats, engine_cc, origin,
        brand:brands(name, country),
        versions(name, price_history(price_min, price_max, price_raw, recorded_at))
      `)
      .eq('is_active', true)
      .limit(30)

    if (!data || data.length === 0) return ''

    const lines = data.map((m: any) => {
      const brand = (m.brand as any)?.name ?? ''
      const allPrices = (m.versions ?? []).flatMap((v: any) =>
        (v.price_history ?? []).map((ph: any) => ({
          version: v.name,
          price: ph.price_raw || formatPriceRange(ph.price_min, ph.price_max),
          date: ph.recorded_at
        }))
      )
      const latestPrice = allPrices[0]?.price ?? 'Lien he dai ly'
      const specs = [
        m.fuel_type ? `Nhien lieu: ${m.fuel_type}` : '',
        m.seats ? `So cho: ${m.seats}` : '',
        m.engine_cc ? `Dung tich: ${m.engine_cc}cc` : '',
        m.segment ? `Phan khuc: ${m.segment}` : '',
      ].filter(Boolean).join(', ')
      return `- ${brand} ${m.name}: ${latestPrice}${specs ? ' | ' + specs : ''}`
    }).join('\n')

    return lines
  } catch (e) {
    console.error('getVehicleContext error:', e)
    return ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json()
    if (!message) return NextResponse.json({ content: 'Vui long nhap cau hoi.' }, { status: 400 })
    if (!ANTHROPIC_API_KEY) return NextResponse.json({ content: 'API key chua duoc cai dat.' }, { status: 500 })

    const vehicleContext = await getVehicleContext(message)

    const systemPrompt = `Ban la tro ly tu van xe chuyen nghiep cua XeVietnam.vn - nen tang du lieu xe Viet Nam.
${vehicleContext ? `\nDu lieu xe hien co:\n${vehicleContext}` : ''}
Tra loi bang tieng Viet, ngan gon, chinh xac. Neu khong co du lieu phu hop, tu van chung chung ve loai xe do.`

    const messages = [
      ...(history as { role: string; content: string }[]).slice(-6),
      { role: 'user', content: message }
    ]

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return NextResponse.json({ content: 'Loi ket noi AI. Thu lai sau.' }, { status: 500 })
    }

    const data = await response.json()
    const content = data.content?.[0]?.text ?? 'Khong co phan hoi.'
    return NextResponse.json({ content })
  } catch (e) {
    console.error('Chat API error:', e)
    return NextResponse.json({ content: 'Co loi xay ra. Vui long thu lai sau.' }, { status: 500 })
  }
}
