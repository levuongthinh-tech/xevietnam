'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

function fmt(n: number): string {
  return Math.round(n).toLocaleString('vi-VN') + ' ₫'
}
function fmtShort(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(3).replace(/\.?0+$/, '') + ' tỷ'
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.?0+$/, '')     + ' triệu'
  return Math.round(n).toLocaleString('vi-VN')
}
function parseNum(s: string): number {
  return parseInt(s.replace(/\D/g, '')) || 0
}

const LOAN_TERMS = [12, 24, 36, 48, 60, 72, 84]
const BANKS = [
  { name: 'VietcomBank',  rate: 8.0  },
  { name: 'VietinBank',   rate: 8.3  },
  { name: 'BIDV',         rate: 8.5  },
  { name: 'Techcombank',  rate: 8.8  },
  { name: 'TPBank',       rate: 9.0  },
  { name: 'VPBank',       rate: 9.5  },
  { name: 'MBBank',       rate: 9.2  },
  { name: 'Tùy chỉnh',   rate: 8.5  },
]

export default function TinhTraGopPage() {
  const [giaStr,    setGiaStr]    = useState('800.000.000')
  const [downPct,   setDownPct]   = useState(30)   // %
  const [term,      setTerm]      = useState(60)   // months
  const [bankIdx,   setBankIdx]   = useState(2)    // BIDV default
  const [customRate,setCustomRate]= useState(8.5)
  const [showTable, setShowTable] = useState(false)

  const isCustom   = bankIdx === BANKS.length - 1
  const laiSuat    = isCustom ? customRate : BANKS[bankIdx].rate
  const giaXe      = parseNum(giaStr)
  const tienTruoc  = Math.round(giaXe * downPct / 100)
  const vonVay     = giaXe - tienTruoc
  const r          = laiSuat / 100 / 12
  const n          = term

  const monthly = useMemo(() => {
    if (vonVay <= 0 || n <= 0) return 0
    if (r === 0) return vonVay / n
    return (vonVay * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  }, [vonVay, r, n])

  const tongTra  = monthly * n
  const tongLai  = tongTra - vonVay

  // Amortization table (first 6 + last 1 rows)
  const amort = useMemo(() => {
    if (vonVay <= 0 || monthly <= 0) return []
    const rows = []
    let balance = vonVay
    for (let i = 1; i <= n; i++) {
      const interest = balance * r
      const principal = monthly - interest
      balance = Math.max(0, balance - principal)
      rows.push({ month: i, payment: monthly, interest, principal, balance })
    }
    return rows
  }, [vonVay, monthly, r, n])

  function handleGiaInput(v: string) {
    const digits = v.replace(/\D/g, '')
    const num = parseInt(digits) || 0
    setGiaStr(num.toLocaleString('vi-VN'))
  }

  const BG   = '#0b0b07'
  const CARD = 'rgba(255,255,255,0.04)'
  const BDR  = 'rgba(255,255,255,0.08)'
  const RED  = '#ef4444'
  const GREEN= '#10b981'

  // Progress bar width
  const laiPct = tongTra > 0 ? (tongLai / tongTra) * 100 : 0

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI","Inter",sans-serif' }}>

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${BDR}`, padding: '14px 6%', display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/" style={{ color: '#ef4444', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>🚘 XeVietnam</Link>
        <Link href="/tinh-gia"     style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none' }}>Giá lăn bánh</Link>
        <Link href="/tinh-tra-gop" style={{ color: '#fff',   fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>Trả góp</Link>
        <Link href="/o-to"         style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none' }}>Ô tô</Link>
        <Link href="/so-sanh"      style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none' }}>So sánh</Link>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid rgba(16,185,129,0.3)`, background: 'rgba(16,185,129,0.07)', borderRadius: 999, padding: '5px 14px', fontSize: 12, color: '#34d399', marginBottom: 16 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: GREEN, display: 'block' }} />
            Công cụ tài chính
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 10 }}>
            Ước tính trả góp
          </h1>
          <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.7 }}>
            Tính số tiền trả hàng tháng, tổng lãi và tổng chi phí vay mua xe theo lãi suất ngân hàng.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>

          {/* ── LEFT: Inputs ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Giá xe */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: '18px 20px' }}>
              <label style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>Giá xe (VNĐ)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text" value={giaStr}
                  onChange={(e) => handleGiaInput(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 10, padding: '12px 40px 12px 14px', fontSize: 20, fontWeight: 700, color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#6b7280' }}>₫</span>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[500, 700, 900, 1200, 1500, 2000].map((m) => (
                  <button key={m} onClick={() => setGiaStr((m * 1_000_000).toLocaleString('vi-VN'))} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, border: `1px solid ${BDR}`, background: 'rgba(255,255,255,0.04)', color: '#9ca3af', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {m >= 1000 ? `${m/1000}tỷ` : `${m}tr`}
                  </button>
                ))}
              </div>
            </div>

            {/* Trả trước */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trả trước</label>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{downPct}% — {fmtShort(tienTruoc)}</span>
              </div>
              <input type="range" min={10} max={80} step={5} value={downPct} onChange={(e) => setDownPct(Number(e.target.value))}
                style={{ width: '100%', accentColor: RED, cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#4b5563' }}>
                <span>10%</span><span>Vốn vay: {fmtShort(vonVay)}</span><span>80%</span>
              </div>
            </div>

            {/* Thời hạn */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: '18px 20px' }}>
              <label style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 12 }}>Thời hạn vay</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {LOAN_TERMS.map((t) => (
                  <button key={t} onClick={() => setTerm(t)} style={{
                    padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                    background: term === t ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                    color: term === t ? RED : '#9ca3af',
                    outline: term === t ? `1px solid ${RED}40` : 'none',
                  }}>
                    {t < 12 ? `${t}T` : `${t/12} năm`}
                  </button>
                ))}
              </div>
            </div>

            {/* Lãi suất / Ngân hàng */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: '18px 20px' }}>
              <label style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 12 }}>Lãi suất ngân hàng (%/năm)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
                {BANKS.map((b, i) => (
                  <button key={i} onClick={() => setBankIdx(i)} style={{
                    padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', textAlign: 'center',
                    background: bankIdx === i ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                    color: bankIdx === i ? GREEN : '#9ca3af',
                    outline: bankIdx === i ? `1px solid ${GREEN}40` : 'none',
                  }}>
                    <div style={{ fontWeight: 600 }}>{i === BANKS.length - 1 ? '✏️' : b.rate + '%'}</div>
                    <div style={{ fontSize: 10, marginTop: 2, color: bankIdx === i ? '#6ee7b7' : '#4b5563' }}>{b.name}</div>
                  </button>
                ))}
              </div>
              {isCustom && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="number" step="0.1" min="1" max="30" value={customRate}
                    onChange={(e) => setCustomRate(parseFloat(e.target.value) || 8.5)}
                    style={{ width: 80, background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 8, padding: '8px 10px', fontSize: 16, fontWeight: 700, color: '#fff', outline: 'none', fontFamily: 'inherit' }} />
                  <span style={{ fontSize: 13, color: '#6b7280' }}>%/năm</span>
                </div>
              )}
              {!isCustom && <div style={{ fontSize: 12, color: '#4b5563' }}>Lãi suất tham khảo, thực tế có thể thay đổi</div>}
            </div>
          </div>

          {/* ── RIGHT: Results ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Monthly payment hero */}
            <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(59,130,246,0.08))', border: `1px solid rgba(16,185,129,0.2)`, borderRadius: 16, padding: '24px 22px' }}>
              <div style={{ fontSize: 12, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Trả hàng tháng</div>
              <div style={{ fontSize: 'clamp(30px,5vw,46px)', fontWeight: 800, background: 'linear-gradient(135deg,#10b981,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {fmtShort(monthly)}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{fmt(monthly)}/tháng</div>
              <div style={{ marginTop: 14, fontSize: 12, color: '#4b5563', lineHeight: 1.6 }}>
                {BANKS[bankIdx].name} · {laiSuat}%/năm · {term} tháng
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, overflow: 'hidden' }}>
              {[
                { label: 'Giá xe',           val: giaXe,      color: '#d1d5db' },
                { label: `Trả trước (${downPct}%)`, val: tienTruoc, color: '#9ca3af' },
                { label: 'Vốn vay',          val: vonVay,     color: '#d1d5db' },
                { label: 'Tổng lãi phải trả',val: tongLai,    color: '#f87171' },
                { label: `Tổng trả (${term} tháng)`, val: tongTra, color: RED },
              ].map((row, i) => (
                <div key={i} style={{ padding: '12px 20px', borderBottom: i < 4 ? `1px solid rgba(255,255,255,0.04)` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: i === 4 ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: i >= 3 ? 700 : 500, color: row.color }}>{fmt(row.val)}</span>
                </div>
              ))}
            </div>

            {/* Interest ratio bar */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}>
                <span style={{ color: GREEN }}>Gốc: {(100 - laiPct).toFixed(0)}%</span>
                <span style={{ color: '#f87171' }}>Lãi: {laiPct.toFixed(0)}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${100 - laiPct}%`, background: `linear-gradient(90deg,${GREEN},#3b82f6)`, borderRadius: 4 }} />
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: '#4b5563' }}>
                Cứ {fmt(giaXe > 0 ? tongTra / giaXe : 1)} trả tổng cộng cho {fmt(giaXe)} xe
              </div>
            </div>

            {/* Amortization toggle */}
            <button onClick={() => setShowTable(!showTable)} style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 10, padding: '11px 16px', color: '#9ca3af', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>📊 Lịch trả nợ chi tiết</span>
              <span>{showTable ? '▲' : '▼'}</span>
            </button>

            {/* CTA to tinh-gia */}
            <Link href="/tinh-gia" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: `1px solid ${BDR}`, borderRadius: 12, padding: '13px 20px', color: '#d1d5db', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              🚗 Tính giá lăn bánh →
            </Link>
          </div>
        </div>

        {/* Amortization table */}
        {showTable && amort.length > 0 && (
          <div style={{ marginTop: 24, background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, overflow: 'auto' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BDR}`, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Lịch trả nợ ({term} kỳ)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BDR}` }}>
                  {['Kỳ', 'Trả tháng', 'Tiền gốc', 'Tiền lãi', 'Dư nợ còn lại'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'right', color: '#6b7280', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {amort.slice(0, 6).map((row) => (
                  <tr key={row.month} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                    <td style={{ padding: '9px 16px', color: '#6b7280', textAlign: 'right' }}>{row.month}</td>
                    <td style={{ padding: '9px 16px', color: '#d1d5db', textAlign: 'right' }}>{fmtShort(row.payment)}</td>
                    <td style={{ padding: '9px 16px', color: GREEN,    textAlign: 'right' }}>{fmtShort(row.principal)}</td>
                    <td style={{ padding: '9px 16px', color: '#f87171', textAlign: 'right' }}>{fmtShort(row.interest)}</td>
                    <td style={{ padding: '9px 16px', color: '#9ca3af', textAlign: 'right' }}>{fmtShort(row.balance)}</td>
                  </tr>
                ))}
                {amort.length > 7 && (
                  <tr><td colSpan={5} style={{ padding: '8px 16px', color: '#374151', textAlign: 'center', fontSize: 11 }}>···</td></tr>
                )}
                {amort.length > 6 && (() => {
                  const last = amort[amort.length - 1]
                  return (
                    <tr style={{ borderTop: `1px solid ${BDR}` }}>
                      <td style={{ padding: '9px 16px', color: '#6b7280', textAlign: 'right' }}>{last.month}</td>
                      <td style={{ padding: '9px 16px', color: '#d1d5db', textAlign: 'right' }}>{fmtShort(last.payment)}</td>
                      <td style={{ padding: '9px 16px', color: GREEN,    textAlign: 'right' }}>{fmtShort(last.principal)}</td>
                      <td style={{ padding: '9px 16px', color: '#f87171', textAlign: 'right' }}>{fmtShort(last.interest)}</td>
                      <td style={{ padding: '9px 16px', color: '#d1d5db', textAlign: 'right', fontWeight: 700 }}>{fmtShort(last.balance)}</td>
                    </tr>
                  )
                })()}
              </tbody>
            </table>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ marginTop: 32, fontSize: 11, color: '#374151', lineHeight: 1.7, padding: '0 2px' }}>
          * Số liệu mang tính tham khảo. Lãi suất thực tế do ngân hàng quyết định và có thể thay đổi.
          Kết quả tính theo phương pháp dư nợ giảm dần. Liên hệ ngân hàng để biết điều kiện vay cụ thể.
        </div>
      </div>

      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } input[type=range] { -webkit-appearance: none; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; } input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #ef4444; cursor: pointer; box-shadow: 0 0 8px rgba(239,68,68,0.4); } input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }`}</style>
    </div>
  )
}
