'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function TuVanPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Xin chao! Toi la tro ly tu van xe cua XeVietnam. Ban muon mua xe o to hay xe may? Cho toi biet ngan sach va nhu cau su dung cua ban nhe!',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })

      if (!res.ok) throw new Error('Loi ket noi')

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Xin loi, co loi xay ra. Vui long thu lai sau.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'Toi can xe o to duoi 600 trieu cho gia dinh 4 nguoi',
    'Xe may nao phu hop di lam hang ngay trong thanh pho?',
    'So sanh Toyota Vios va Honda City',
    'Xe dien nao dang mua nhat hien nay?',
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Tu van xe bang AI</h1>
        <p className="text-gray-500 text-sm">Duoc ho tro boi Claude AI + du lieu xe thuc te</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1">
                AI
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-red-600 text-white rounded-tr-sm'
                  : 'bg-white border text-gray-800 rounded-tl-sm shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm mr-2">AI</div>
            <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s)}
              className="text-xs bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 px-3 py-1.5 rounded-full transition border border-gray-200"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Nhap cau hoi ve xe..."
          className="flex-1 border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-red-600 disabled:bg-gray-300 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-red-700 transition flex-shrink-0"
        >
          &gt;
        </button>
      </div>
    </div>
  )
}
