'use client'

import { useState, useRef, useEffect } from 'react'

type ExpertId = 'mua-xe' | 'ky-thuat' | 'tai-chinh'

interface Expert {
  id: ExpertId
  name: string
  icon: string
  accent: string
  bg: string
  desc: string
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
    bg: 'rgba(239,68,68,0.1)',
    desc: 'So sánh, tư vấn chọn xe phù hợp ngân sách và nhu cầu',
  },
  'ky-thuat': {
    id: 'ky-thuat',
    name: 'Kỹ thuật xe',
    icon: '🔧',
    accent: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    desc: 'Thông số kỹ thuật, bảo dưỡng, sửa chữa và công nghệ xe',
  },
  'tai-chinh': {
    id: 'tai-chinh',
    name: 'Tài chính & Bảo hiểm',
    icon: '💰',
    accent: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
    desc: 'Vay trả góp, bảo hiểm, chi phí trước bạ và phí sử dụng',
  },
}

const SUGGESTION_CHIPS = [
  'SUV 7 chỗ dưới 1 tỷ tốt nhất?',
  'Vay 500 triệu mua xe trả góp bao nhiêu/tháng?',
  'Xe điện có nên mua không?',
  'Bảo dưỡng Toyota Hybrid thế nào?',
]

const STATS = [
  { value: '1000+', label: 'Mẫu xe trong cơ sở dữ liệu' },
  { value: '43', label: 'Thương hiệu ô tô & xe máy' },
  { value: '3', label: 'Chuyên gia AI chuyên biệt' },
  { value: '24/7', label: 'Phản hồi tức thì, mọi lúc' },
]

function detectExpert(text: string): ExpertId {
  const t = text.toLowerCase()
  if (
    t.match(
      /vay|tr[aả]\s*g[oó]p|b[aả]o\s*hi[eể]m|ph[ií]|l[aã]i|ng[aâ]n\s*h[aà]ng|tr[uướ][oơ]c\s*b[aạ]|chi\s*ph[ií]/
    )
  )
    return 'tai-chinh'
  if (
    t.match(
      /b[aả]o\s*d[uưỡ][oơ]ng|s[uửữ]a|[dđ][oộ]ng\s*c[oơ]|hybrid|[dđ]i[eệ]n|th[oô]ng\s*s[oố]|ti[eê]u\s*hao|m[aã]\s*l[uự]c|h[oộ]p\s*s[oố]|k[yỹ]\s*thu[aậ]t/
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
  const chatRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasMessages = messages.length > 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const expert = detectExpert(trimmed)
    setActiveExpert(expert)

    if (!hasMessages) {
      setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }

    const nextMessages: Message[] = [
      ...messages,
      { role: 'user', content: trimmed, expert },
    ]
    setMessages(nextMessages)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
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
        background: '#0b0b07',
        color: '#fff',
        minHeight: '100vh',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif',
      }}
    >
      {/* ══ HERO ══ */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          padding: '80px 6% 60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient blobs */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            right: '8%',
            width: 700,
            height: 700,
            background:
              'radial-gradient(circle, rgba(239,68,68,0.10) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '0%',
            width: 500,
            height: 500,
            background:
              'radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 80,
          }}
        >
          {/* ── Left: Copy ── */}
          <div style={{ flex: 1, zIndex: 1 }}>
            {/* Category pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid rgba(239,68,68,0.35)',
                background: 'rgba(239,68,68,0.08)',
                borderRadius: 999,
                padding: '6px 16px',
                fontSize: 13,
                color: '#f87171',
                marginBottom: 28,
                letterSpacing: '0.01em',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#ef4444',
                  flexShrink: 0,
                }}
              />
              Nền tảng AI tư vấn xe Việt Nam
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(38px, 5vw, 66px)',
                fontWeight: 800,
                lineHeight: 1.08,
                marginBottom: 22,
                letterSpacing: '-0.025em',
              }}
            >
              <span style={{ display: 'block', color: '#f9fafb' }}>
                Tư vấn xe thông minh
              </span>
              <span
                style={{
                  display: 'block',
                  background:
                    'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #d4a843 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Powered by AI
              </span>
            </h1>

            {/* Sub */}
            <p
              style={{
                color: '#9ca3af',
                fontSize: 17,
                lineHeight: 1.75,
                maxWidth: 480,
                marginBottom: 38,
              }}
            >
              Đặt câu hỏi về bất kỳ loại xe nào — mua xe, kỹ thuật, hay tài
              chính. AI sẽ tự động nhận diện và kết nối bạn với chuyên gia phù
              hợp trong vài giây.
            </p>

            {/* Feature chips */}
            <div
              style={{
                display: 'flex',
                gap: 10,
                marginBottom: 44,
                flexWrap: 'wrap',
              }}
            >
              {[
                { icon: '🚗', label: 'Tư vấn mua xe' },
                { icon: '🔧', label: 'Hỗ trợ kỹ thuật' },
                { icon: '💰', label: 'Tài chính & Bảo hiểm' },
              ].map((c) => (
                <div
                  key={c.label}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 999,
                    padding: '8px 16px',
                    fontSize: 13,
                    color: '#d1d5db',
                  }}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={() =>
                  chatRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 30px',
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 0 30px rgba(239,68,68,0.25)',
                }}
              >
                Bắt đầu hỏi ngay
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </button>
              <span style={{ fontSize: 13, color: '#4b5563' }}>
                Miễn phí · Không cần đăng ký
              </span>
            </div>
          </div>

          {/* ── Right: Visual ── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              minHeight: 460,
            }}
          >
            {/* Outer ring */}
            <div
              style={{
                width: 400,
                height: 400,
                borderRadius: '50%',
                border: '1px solid rgba(239,68,68,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Inner ring */}
              <div
                style={{
                  width: 310,
                  height: 310,
                  borderRadius: '50%',
                  border: '1px solid rgba(239,68,68,0.18)',
                  background:
                    'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Center icon */}
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 30,
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 56,
                  }}
                >
                  🚗
                </div>
              </div>

              {/* Floating card: Mau xe */}
              <div
                style={{
                  position: 'absolute',
                  top: 30,
                  right: -40,
                  background: 'rgba(15,15,10,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14,
                  padding: '14px 18px',
                  minWidth: 150,
                }}
              >
                <div
                  style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}
                >
                  1000+
                </div>
                <div
                  style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}
                >
                  Mẫu xe trong database
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: '#4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#4ade80',
                    }}
                  />
                  Luôn cập nhật
                </div>
              </div>

              {/* Floating card: Chuyen gia */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 50,
                  left: -50,
                  background: 'rgba(15,15,10,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14,
                  padding: '14px 18px',
                  minWidth: 160,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  {['🚗', '🔧', '💰'].map((ic) => (
                    <span
                      key={ic}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                      }}
                    >
                      {ic}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#f9fafb',
                  }}
                >
                  3 Chuyên gia AI
                </div>
                <div
                  style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}
                >
                  Mua xe · Kỹ thuật · Tài chính
                </div>
              </div>

              {/* Floating card: Phan hoi */}
              <div
                style={{
                  position: 'absolute',
                  top: 140,
                  right: -60,
                  background: 'rgba(15,15,10,0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 14,
                  padding: '12px 16px',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: '#10b981',
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: '#10b981',
                    }}
                  />
                  AI đang trực tuyến
                </div>
                <div style={{ fontSize: 13, color: '#d1d5db' }}>
                  Phản hồi tức thì
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.015)',
          padding: '30px 6%',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  background:
                    'linear-gradient(135deg, #ef4444, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {s.value}
              </div>
              <div
                style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CHAT SECTION ══ */}
      <section ref={chatRef} style={{ padding: '80px 6%' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2
              style={{
                fontSize: 'clamp(24px, 3vw, 34px)',
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Hỏi bất kỳ điều gì về xe
            </h2>
            <p style={{ color: '#6b7280', fontSize: 15 }}>
              AI tự nhận diện câu hỏi và kết nối với chuyên gia phù hợp
            </p>
          </div>

          {/* Expert badge */}
          {hasMessages && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 14,
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
          )}

          {/* Messages */}
          {hasMessages && (
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 18,
                padding: '20px 20px 16px',
                marginBottom: 10,
                maxHeight: 400,
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {messages.map((msg, i) => {
                  const msgExp = msg.expert
                    ? EXPERTS[msg.expert]
                    : expert
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
                            fontSize: 15,
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
                          padding: '11px 15px',
                          fontSize: 14,
                          lineHeight: 1.65,
                          whiteSpace: 'pre-wrap',
                          ...(msg.role === 'user'
                            ? { background: '#ffffff', color: '#111827' }
                            : {
                                background: 'rgba(255,255,255,0.07)',
                                color: '#e5e7eb',
                              }),
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )
                })}

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
                        fontSize: 15,
                        flexShrink: 0,
                      }}
                    >
                      {expert.icon}
                    </div>
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.07)',
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
          )}

          {/* Quick suggestion chips (empty state) */}
          {!hasMessages && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 10,
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
          )}

          {/* Expert switcher (chat state) */}
          {hasMessages && (
            <div
              style={{
                display: 'flex',
                gap: 6,
                marginBottom: 8,
                flexWrap: 'wrap',
              }}
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
          )}

          {/* Chat input */}
          <div
            style={{
              background: '#111110',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 0 40px rgba(0,0,0,0.4)',
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder={
                hasMessages
                  ? 'Tiếp tục h:...'
                  : 'Hỏi về xe, giá care, kỹ thuật hay tài chính...'
              }
              rows={1}
              disabled={loading}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '17px 20px 8px',
                fontSize: 15,
                color: '#fff',
                resize: 'none',
                outline: 'none',
                minHeight: 58,
                maxHeight: 140,
                boxSizing: 'border-box',
                opacity: loading ? 0.5 : 1,
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 16px 14px',
              }}
            >
              <span style={{ fontSize: 12, color: '#374151' }}>
                AI tự chọn chuyên gia phù hợp
              </span>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background:
                    input.trim() && !loading ? '#ef4444' : '#1f2937',
                  border: 'none',
                  cursor:
                    input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s',
                  boxShadow:
                    input.trim() && !loading
                      ? '0 0 16px rgba(239,68,68,0.35)'
                      : 'none',
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
        </div>
      </section>

      <section
        style={{
          padding: '60px 6% 100px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background:
            'linear-gradient(to bottom, transparent, rgba(239,68,68,0.03))',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2
              style={{
                fontSize: 'clamp(22px, 2.5vw, 30px)',
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              3 Chuyên gia AI chuyên biệt
            </h2>
            <p style={{ color: '#6b7280', fontSize: 14 }}>
              Mỗi chuyên gia được huấn luyện với dữ liệu xe Việt Nam thực tế
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {(Object.values(EXPERTS) as Expert[]).map((e) => (
              <div
                key={e.id}
                onClick={() => {
                  setActiveExpert(e.id)
                  chatRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 18,
                  padding: '30px 26px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(el) => {
                  el.currentTarget.style.background = e.bg
                  el.currentTarget.style.borderColor = `${e.accent}35`
                  el.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(el) => {
                  el.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  el.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                  el.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: e.bg,
                    border: `1px solid ${e.accent}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    marginBottom: 18,
                  }}
                >
                  {e.icon}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    marginBottom: 10,
                    color: '#f9fafb',
                  }}
                >
                  {e.name}
                </h3>

                {/* Desc */}
                <p
                  style={{
                    color: '#6b7280',
                    fontSize: 13,
                    lineHeight: 1.65,
                    marginBottom: 20,
                  }}
                >
                  {e.desc}
                </p>

                {/* Link */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    color: e.accent,
                    fontWeight: 500,
                  }}
                >
                  Bắt đầu hỏi
                  <svg
                    width="13"
                    height="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        button { font-family: inherit; }
        textarea { font-family: inherit; }
      `}</style>
    </div>
  )
}
