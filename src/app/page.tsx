'use client'

import { useState, useRef, useEffect } from 'react'

/* âââ Expert config âââââââââââââââââââââââââââââââââââââââââââââââââââ */
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
    name: 'TÆ° váº¥n mua xe',
    role: 'ChuyÃªn gia chá»n xe phÃ¹ há»£p ngÃ¢n sÃ¡ch & nhu cáº§u',
    icon: 'ð',
    activeBorder: 'border-red-500',
    activeBg: 'bg-red-500/10',
    sendGradient: 'from-red-500 to-orange-500',
    greeting: 'Xin chÃ o! TÃ´i lÃ  chuyÃªn gia tÆ° váº¥n mua xe cá»§a XeVietnam. HÃ£y cho tÃ´i biáº¿t ngÃ¢n sÃ¡ch vÃ  nhu cáº§u cá»§a báº¡n â tÃ´i sáº½ gá»£i Ã½ nhá»¯ng dÃ²ng xe phÃ¹ há»£p nháº¥t! ð',
    placeholder: 'VÃ­ dá»¥: Xe gia ÄÃ¬nh 7 chá» dÆ°á»i 700 triá»u...',
    chips: ['Xe gia ÄÃ¬nh dÆ°á»i 700 triá»u', 'Xe tay ga cho ná»¯ dÆ°á»i 50 triá»u', 'Xe Äiá»n giÃ¡ re nháº¥t', 'SUV dÆ°á»i 1 táº·'],
  },
  {
    id: 'ky-thuat',
    name: 'TÆ° táº¥n ká»¹ thuáº­t',
    role: 'ChuyÃªn gia Äá»ng cÆ£, thÃ´ng sá» & báº£o dÆ°á»¡ng xe',
    icon: 'ð§',
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-500/10',
    sendGradient: 'from-blue-500 to-cyan-500',
    greeting: 'Xin chÃ o! TÃ´i lÃ  chuyÃªn gia ká»¹ thuáº­t xe. Báº¡n muoá»n há»i vá» thÃ´ng sá» Äá»ng cÆ¢, so sÃ¡nh cÃ´ng nghiá» hay lá»ch báº£o dÆ°á»¡ng? TÃ´i sáºµn sÃ ng giáº£i ÄÃ¡p! ð§',
    placeholder: 'VÃ­ dá»¥: Hybrid vÃ  xÄng thÆ°á»ng khÃ¡c nhau tháº¿ nÃ o?',
    chips: ['Toyota Camry Hybrid vs xäng', 'Báº£o dÆ°á»¡ng 10.000 km gá»m nhá»¯ng gÃ¬?', 'Äá»ng cÆ¡ tÄng Ã¡p cÃ³ bá»n khÃ´ng?', 'Xe Äiá»n sáº¡c máº¥t bao lÃ¢u?'],
  },
  {
    id: 'tai-chinh',
    name: 'TÃ i chÃ­nh & Báº£o hiá»m',
    role: 'ChuyÃªn gia vay mua xe, báº£o hiá»m & chi phÃ­ sá» há»¯t',
    icon: 'ð°',
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-500/10',
    sendGradient: 'from-emerald-500 to-teal-500',
    greeting: 'Xin chÃ o! TÃ´i lÃ  chuyÃªn gia tÃ i chÃ­nh & báº£o hiá»m xe. TÃ´i cÃ³ thá» giÃºp báº¡n tÃ­nh toÃ¡n khoáº£n vay, phÃ­ báº£o hiá»m vÃ  tá»ng chi phÃ­ sá» há»¯u xe. Há»i tÃ´i Äi! ð°',
    placeholder: 'VÃ­ dá»¥: Vay 400 triá»u mua xe, tráº£ gÃ³p bao nhiÃªu/thÃ¡ng?',
    chips: ['Vay 500 triá»u tráº£ trong 5 nÄm', 'Báº£o hiá»m Ã´ tÃ´ cáº§n nhá»¯ng loáº¡i gÃ¬?', 'PhÃ­ trÆ°á»c báº¡ xe má»i tÃ­nh tháº¿ nÃ o?', 'Chi phÃ­ nuÃ´i xe Ã´ tÃ´ hÃ ng thÃ¡ng'],
  },
]

/* âââ Message type ââââââââââââââââââââââââââââââââââââââââââââââââââââ */
interface Message {
  role: 'user' | 'assistant'
  content: string
}

/* âââ Component âââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
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
        content: data.content || 'Xin lá»i, tÃ´i chÆ°a hiá»u cÃ¢u há»i. Báº¡n cÃ³ thá» nÃ³i rÃµ hÆ¡n khÃ´ng?',
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
          { role: 'assistant', content: 'ÄÃ£ xáº£y ra lá»i káº¿t ná»i. Vui lÃ²ng thá»­ láº¡i sau! ð' },
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

      {/* ââ Hero tagline ââ */}
      <div className="text-center pt-10 pb-6 px-4">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-400 mb-4">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          CÃ¡c chuyÃªn gia AI Äang trá»±c tuyáº¿n
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Há»i chuyÃªn gia xe
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400"> báº±ng AI</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Chá»n chuyÃªn gia phÃ¹ há»£p vÃ  Äáº·t cÃ¢u há»i â nháº­n tÆ° váº¥n dá»±a trÃªn dá»¯ liá»u xe thá»±c táº¯ táº¡i Viá»t Nam
        </p>
      </div>

      {/* ââ Expert selector ââ */}
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

      {/* ââ Chat window ââ */}
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
              Trá»±c tuyáº¿n
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

        {/* ââ Suggestion chips (shown only on empty chat) ââ */}
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

        {/* ââ Input bar ââ */}
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
