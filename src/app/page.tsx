'use client'

import { useState, useRef, useEffect } from 'react'

/* ─── Expert config ─────────────────────────────────────────────────── */
type ExpertId = 'mua-xe' | 'ky-thuat' | 'tai-chinh'

interface Expert {
  id: ExpertId
  name: string
  role: string
  icon: string
  activeBorder: string
  activeBg: string
  sendGradient: string
  greeting: string
  placeholder: string
  chips: string[]
}

const EXPERTS: Expert[] = [
  {
    id: 'mua-xe',
    name: 'Tư vấn mua xe',
    role: 'Chuyên gia chọn xe phù hợp ngân sách & nhu cầu',
    icon: '🚗',
    activeBorder: 'border-red-500',
    activeBg: 'bg-red-500/10',
    sendGradient: 'from-red-500 to-orange-500',
    greeting: 'Xin chào! Tôi là chuyên gia tư vấn mua xe của XeVietnam. Hãy cho tôi biết ngân sách và nhu cầu của bạn — tôi sẽ gợi ý những dòng xe phù hợp nhất! 🚗',
    placeholder: 'Ví dụ: Xe gia đình 7 chỗ dưới 700 triệu...',
    chips: ['Xe gia đình dưới 700 triệu', 'Xe tay ga cho nữ dưới 50 triệu', 'Xe điện giá rẻ nhất', 'SUV dưới 1 tỷ'],
  },
  {
    id: 'ky-thuat',
    name: 'Tư vấn kỹ thuật',
    role: 'Chuyên gia động cơ, thông số & bảo dưỡng xe',
    icon: '🔧',
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-500/10',
    sendGradient: 'from-blue-500 to-cyan-500',
    greeting: 'Xin chào! Tôi là chuyên gia kỹ thuật xe. Bạn muốn hỏi về thông số động cơ, so sánh công nghệ hay lịch bảo dưỡng? Tôi sẵn sàng giải đáp! 🔧',
    placeholder: 'Ví dụ: Hybrid và xăng thường khác nhau thế nào?',
    chips: ['Toyota Camry Hybrid vs xăng', 'Bảo dưỡng 10.000 km gồm những gì?', 'Động cơ tăng áp có bền không?', 'Xe điện sạc mất bao lâu?'],
  },
  {
    id: 'tai-chinh',
    name: 'Tài chính & Bảo hiểm',
    role: 'Chuyên gia vay mua xe, bảo hiểm & chi phí sở hữu',
    icon: '💰',
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-500/10',
    sendGradient: 'from-emerald-500 to-teal-500',
    greeting: 'Xin chào! Tôi là chuyên gia tài chính & bảo hiểm xe. Tôi có thể giúp bạn tính toán khoản vay, phí bảo hiểm và tổng chi phí sở hữu xe. Hỏi tôi đi! 💰',
    placeholder: 'Ví dụ: Vay 400 triệu mua xe, trả góp bao nhiêu/tháng?',
    chips: ['Vay 500 triệu trả trong 5 năm', 'Bảo hiểm ô tô cần những loại gì?', 'Phí trước bạ xe mới tính thế nào?', 'Chi phí nuôi xe ô tô hàng tháng'],
  },
]

/* ─── Message type ──────────────────────────────────────────────────── */
interface Message {
  role: 'user' | 'assistant'
  content: string
}

/* ─── Component ─────────────────────────────────────────────────────── */
export default function HomePage() {
  const [activeExpert, setActiveExpert] = useState<Expert>(EXPERTS[0])
  const [messagesByExpert, setMessagesByExpert] = useState<Record<ExpertId, Message[]>>({
    'mua-xe': [],
    'ky-thuat': [],
    'tai-chinh': [],
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const messages = messagesByExpert[activeExpert.id]

  // Scroll to bottom when new messages appear
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Prepend greeting when chat is empty
  const displayMessages: Message[] =
    messages.length === 0
      ? [{ role: 'assistant', content: activeExpert.greeting }]
      : messages

  function switchExpert(expert: Expert) {
    setActiveExpert(expert)
    setInput('')
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const nextMessages: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessagesByExpert(prev => ({ ...prev, [activeExpert.id]: nextMessages }))
    setInput('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, expert: activeExpert.id }),
      })
      const data = await res.json()
      const reply: Message = {
        role: 'assistant',
        content: data.content || 'Xin lỗi, tôi chưa hiểu câu hỏi. Bạn có thể nói rõ hơn không?',
      }
      setMessagesByExpert(prev => ({
        ...prev,
        [activeExpert.id]: [...nextMessages, reply],
      }))
    } catch {
      setMessagesByExpert(prev => ({
        ...prev,
        [activeExpert.id]: [
          ...nextMessages,
          { role: 'assistant', content: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau! 🙏' },
        ],
      }))
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const t = e.currentTarget
    t.style.height = 'auto'
    t.style.height = Math.min(t.scrollHeight, 140) + 'px'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── Hero tagline ── */}
      <div className="text-center pt-10 pb-6 px-4">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-400 mb-4">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Các chuyên gia AI đang trực tuyến
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          H�n�� chuyên gia xe
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400"> bằng AI</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Chọn chuyên gia phù hợp và đặt câu hỏi — nhận tư vấn dựa trên dữ liệu xe thực tế tại Việt Nam
        </p>
      </div>

      {/* ── Expert selector ── */}
      <div className="max-w-3xl mx-auto w-full px-4 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {EXPERTS.map(expert => {
            const isActive = activeExpert.id === expert.id
            const hasHistory = messagesByExpert[expert.id].length > 0
            return (
              <button
                key={expert.id}
                onClick={() => switchExpert(expert)}
                className={`relative rounded-2xl border p-3 text-left transition-all duration-200 ${
                  isActive
                    ? `${expert.activeBorder} ${expert.activeBg}`
                    : 'border-white/10 bg-white/[0.03] hover:bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl leading-none mt-0.5">{expert.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm leading-tight">{expert.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight hidden sm:block line-clamp-2">{expert.role}</p>
                  </div>
                </div>
                {/* Online dot */}
                <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${
                  isActive ? 'bg-green-400 shadow-lg shadow-green-400/50' : hasHistory ? 'bg-gray-500' : 'bg-gray-700'
                }`} />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Chat window ── */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 flex flex-col">
        {/* Chat card */}
        <div
          className={`rounded-2xl border bg-gray-900/60 backdrop-blur flex flex-col overflow-hidden ${activeExpert.activeBorder} border-opacity-40`}
          style={{ minHeight: '400px', maxHeight: '58vh' }}
        >
          {/* Chat header bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.03] flex-shrink-0">
            <span className="text-xl">{activeExpert.icon}</span>
            <div>
              <p className="font-semibold text-white text-sm">{activeExpert.name}</p>
              <p className="text-xs text-gray-400">{activeExpert.role}</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Trực tuyến
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {displayMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">
                    {activeExpert.icon}
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-white text-gray-900 rounded-br-sm'
                      : 'bg-gray-800 text-gray-100 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-sm mr-2 flex-shrink-0">
                  {activeExpert.icon}
                </div>
                <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Suggestion chips (shown only on empty chat) ── */}
        {messages.length === 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {activeExpert.chips.map(chip => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                disabled={loading}
                className="flex-shrink-0 text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-xl px-3 py-2 transition disabled:opacity-40"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* ── Input bar ── */}
        <div className="mt-3 mb-8 flex gap-2 items-end">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder={activeExpert.placeholder}
              rows={1}
              disabled={loading}
              className="w-full bg-gray-800 border border-white/10 focus:border-white/30 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none outline-none transition"
              style={{ minHeight: '48px', maxHeight: '140px' }}
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition flex-shrink-0 bg-gradient-to-br ${activeExpert.sendGradient} disabled:opacity-40 disabled:cursor-not-allowed shadow-lg`}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
