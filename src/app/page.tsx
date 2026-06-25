'use client'

import { useState, useRef, useEffect } from 'react'

type ExpertId = 'mua-xe' | 'ky-thuat' | 'tai-chinh'

interface Expert {
  id: ExpertId
  name: string
  icon: string
  accent: string
  bg: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  expert?: ExpertId
}

const EXPERTS: Record<ExpertId, Expert> = {
  'mua-xe': {
    id: 'mua-xe',
    name: 'Tư vấn mua xe',
    icon: '🚗',
    accent: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
  },
  'ky-thuat': {
    id: 'ky-thuat',
    name: 'Kỹ thuật xe',
    icon: '🔧',
    accent: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
  },
  'tai-chinh': {
    id: 'tai-chinh',
    name: 'Tài chính & Bảo hiểm',
    icon: '💰',
    accent: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
  },
}

const SUGGESTION_CHIPS = [
  'SUV 7 chỗ dưới 1 tỷ tốt nhất?',
  'Vay 500 triệu mua xe trả góp bao nhiêu?',
  'Xe điện có nên mua không?',
  'Bảo dưỡng Toyota Hybrid thế nào?',
]

function detectExpert(text: string): ExpertId {
  const t = text.toLowerCase()
  if (
    t.match(
      /vay|tr[aả]\s*g[oó]p|b[aả]o\s*hi[eể]m|ph[ií]\s*tr[uướ][oơ]c\s*b[aạ]|l[aã]i\s*su[aấ]t|ng[aâ]n\s*h[aà]ng|chi\s*ph[ií]\s*h[aà]ng|[dđ][aă]ng\s*k[yý]/
    )
  )
    return 'tai-chinh'
  if (
    t.match(
      /b[aả]o\s*d[uưỡ][oơ]ng|s[uửữ]a|[dđ][oộ]ng\s*c[oơ]|hybrid|[dđ]i[eệ]n|th[oô]ng\s*s[oố]|ti[eê]u\s*hao|m[aã]\s*l[uự]c|h[oộ]p\s*s[oố]|c[oô]ng\s*ngh[eệ]|[kk][yý]\s*thu[aậ]t/
    )
  )
    return 'ky-thuat'
  return 'mua-xe'
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeExpert, setActiveExpert] = useState<ExpertId>('mua-xe')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasMessages = messages.length > 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text: string, forceExpert?: ExpertId) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const expert = forceExpert ?? detectExpert(trimmed)
    setActiveExpert(expert)

    const nextMessages: Message[] = [
      ...messages,
      { role: 'user', content: trimmed, expert },
    ]
    setMessages(nextMessages)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          expert,
        }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            data.content ||
            'Xin lỗi, tôi chưa hiểu câu hỏi. Bạn có thể nói rõ hơn không?',
          expert,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau!',
          expert,
        },
      ])
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

  const expert = EXPERTS[activeExpert]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#030305',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {!hasMessages ? (
        /* ── Empty state ── */
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px 80px',
          }}
        >
          {/* Live indicator */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 999,
              padding: '6px 16px',
              fontSize: 12,
              color: '#9ca3af',
              marginBottom: 32,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: '#4ade80',
                borderRadius: '50%',
              }}
            />
            AI đang trực tuyến — sẵn sàng tư vấn xe
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Hoi bat ky dieu gi
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #f87171, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ve xe Viet Nam
            </span>
          </h1>
          <p
            style={{
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: 32,
              fontSize: 14,
              maxWidth: 360,
            }}
          >
            AI tu nhan dien cau hoi va ket noi voi chuyen gia phu hop nhat
          </p>

          {/* Expert chips */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 24,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {(Object.values(EXPERTS) as Expert[]).map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  setActiveExpert(e.id)
                  textareaRef.current?.focus()
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.03)',
                  color: '#d1d5db',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(el) => {
                  el.currentTarget.style.background =
                    'rgba(255,255,255,0.07)'
                }}
                onMouseLeave={(el) => {
                  el.currentTarget.style.background =
                    'rgba(255,255,255,0.03)'
                }}
              >
                <span>{e.icon}</span>
                <span>{e.name}</span>
              </button>
            ))}
          </div>

          {/* Chat input */}
          <div style={{ width: '100%', maxWidth: 680 }}>
            <div
              style={{
                background: '#111113',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
              onFocus={() => {}}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                placeholder="Hoi ve xe, gia ca, ky thuat hay tai chinh..."
                rows={1}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '16px 20px 8px',
                  fontSize: 15,
                  color: '#fff',
                  resize: 'none',
                  outline: 'none',
                  minHeight: 56,
                  maxHeight: 140,
                  boxSizing: 'border-box',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 16px 12px',
                }}
              >
                <span style={{ fontSize: 12, color: '#4b5563' }}>
                  AI tu chon chuyen gia phu hop
                </span>
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background:
                      input.trim() && !loading ? '#ef4444' : '#374151',
                    border: 'none',
                    cursor:
                      input.trim() && !loading
                        ? 'pointer'
                        : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Suggestions */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 12,
                flexWrap: 'wrap',
              }}
            >
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => sendMessage(chip)}
                  style={{
                    fontSize: 13,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: '#9ca3af',
                    borderRadius: 10,
                    padding: '7px 13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(el) => {
                    el.currentTarget.style.color = '#e5e7eb'
                    el.currentTarget.style.background =
                      'rgba(255,255,255,0.08)'
                  }}
                  onMouseLeave={(el) => {
                    el.currentTarget.style.color = '#9ca3af'
                    el.currentTarget.style.background =
                      'rgba(255,255,255,0.04)'
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Chat state ── */
        <>
          {/* Expert badge */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '12px 16px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 999,
                fontSize: 13,
                background: expert.bg,
                border: `1px solid ${expert.accent}50`,
                color: expert.accent,
              }}
            >
              <span>{expert.icon}</span>
              <span style={{ fontWeight: 500 }}>{expert.name}</span>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: expert.accent,
                }}
              />
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 16px 16px',
              maxWidth: 720,
              width: '100%',
              margin: '0 auto',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {messages.map((msg, i) => {
                const msgExp = msg.expert ? EXPERTS[msg.expert] : expert
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent:
                        msg.role === 'user' ? 'flex-end' : 'flex-start',
                      gap: 10,
                      alignItems: 'flex-start',
                    }}
                  >
                    {msg.role === 'assistant' && (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: msgExp.bg,
                          border: `1px solid ${msgExp.accent}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        {msgExp.icon}
                      </div>
                    )}
                    <div
                      style={{
                        maxWidth: '78%',
                        borderRadius:
                          msg.role === 'user'
                            ? '18px 18px 4px 18px'
                            : '18px 18px 18px 4px',
                        padding: '12px 16px',
                        fontSize: 14,
                        lineHeight: 1.65,
                        whiteSpace: 'pre-wrap',
                        ...(msg.role === 'user'
                          ? {
                              background: '#ffffff',
                              color: '#111827',
                            }
                          : {
                              background: 'rgba(255,255,255,0.06)',
                              color: '#e5e7eb',
                            }),
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })}

              {/* Loading dots */}
              {loading && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: expert.bg,
                      border: `1px solid ${expert.accent}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {expert.icon}
                  </div>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '18px 18px 18px 4px',
                      padding: '14px 18px',
                      display: 'flex',
                      gap: 5,
                      alignItems: 'center',
                    }}
                  >
                    {[0, 1, 2].map((n) => (
                      <span
                        key={n}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: '#6b7280',
                          display: 'block',
                          animation: 'bounce 1.2s infinite',
                          animationDelay: `${n * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Sticky bottom input */}
          <div
            style={{
              padding: '0 16px 24px',
              maxWidth: 720,
              width: '100%',
              margin: '0 auto',
            }}
          >
            {/* Switch expert pills */}
            <div
              style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}
            >
              {(Object.values(EXPERTS) as Expert[]).map((e) => {
                const isActive = activeExpert === e.id
                return (
                  <button
                    key={e.id}
                    onClick={() => {
                      setActiveExpert(e.id)
                      textareaRef.current?.focus()
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '5px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      ...(isActive
                        ? {
                            background: e.bg,
                            border: `1px solid ${e.accent}60`,
                            color: e.accent,
                          }
                        : {
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#9ca3af',
                          }),
                    }}
                  >
                    <span>{e.icon}</span>
                    <span>{e.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Input */}
            <div
              style={{
                background: '#111113',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                placeholder="Tiep tuc hoi..."
                rows={1}
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '14px 20px 6px',
                  fontSize: 14,
                  color: '#fff',
                  resize: 'none',
                  outline: 'none',
                  minHeight: 50,
                  maxHeight: 140,
                  boxSizing: 'border-box',
                  opacity: loading ? 0.5 : 1,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  padding: '6px 14px 12px',
                }}
              >
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background:
                      input.trim() && !loading ? '#ef4444' : '#374151',
                    border: 'none',
                    cursor:
                      input.trim() && !loading
                        ? 'pointer'
                        : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}
