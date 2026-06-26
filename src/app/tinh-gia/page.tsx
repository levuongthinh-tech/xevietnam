'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

// ── Phí trước bạ ──────────────────────────────────────────────────
// Nguồn: Nghị định 10/2022/NĐ-CP + nghị quyết HĐND các tỉnh (2024-2025)
const PROVINCES: { name: string; carRate: number; bikeRate: number }[] = [
  { name: 'Hà Nội',               carRate: 0.12, bikeRate: 0.12 },
  { name: 'TP. Hồ Chí Minh',     carRate: 0.10, bikeRate: 0.05 },
  { name: 'Đà Nẵng',              carRate: 0.10, bikeRate: 0.05 },
  { name: 'Hải Phòng',            carRate: 0.10, bikeRate: 0.05 },
  { name: 'Cần Thơ',              carRate: 0.10, bikeRate: 0.05 },
  { name: 'Quảng Ninh',           carRate: 0.10, bikeRate: 0.05 },
  { name: 'Bình Dương',           carRate: 0.10, bikeRate: 0.05 },
  { name: 'Đồng Nai',             carRate: 0.10, bikeRate: 0.05 },
  { name: 'Bà Rịa - Vũng Tàu',  carRate: 0.10, bikeRate: 0.05 },
  { name: 'An Giang',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Bạc Liêu',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Bắc Giang',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Bắc Kạn',              carRate: 0.11, bikeRate: 0.05 },
  { name: 'Bắc Ninh',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Bến Tre',              carRate: 0.11, bikeRate: 0.05 },
  { name: 'Bình Định',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Bình Phước',           carRate: 0.11, bikeRate: 0.05 },
  { name: 'Bình Thuận',           carRate: 0.11, bikeRate: 0.05 },
  { name: 'Cà Mau',               carRate: 0.11, bikeRate: 0.05 },
  { name: 'Cao Bằng',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Đắk Lắk',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Đắk Nông',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Điện Biên',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Đồng Tháp',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Gia Lai',              carRate: 0.11, bikeRate: 0.05 },
  { name: 'Hà Giang',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Hà Nam',               carRate: 0.11, bikeRate: 0.05 },
  { name: 'Hà Tĩnh',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Hải Dương',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Hậu Giang',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Hòa Bình',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Hưng Yên',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Khánh Hòa',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Kiên Giang',           carRate: 0.11, bikeRate: 0.05 },
  { name: 'Kon Tum',              carRate: 0.11, bikeRate: 0.05 },
  { name: 'Lai Châu',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Lâm Đồng',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Lạng Sơn',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Lào Cai',              carRate: 0.11, bikeRate: 0.05 },
  { name: 'Long An',              carRate: 0.11, bikeRate: 0.05 },
  { name: 'Nam Định',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Nghệ An',              carRate: 0.11, bikeRate: 0.05 },
  { name: 'Ninh Bình',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Ninh Thuận',           carRate: 0.11, bikeRate: 0.05 },
  { name: 'Phú Thọ',              carRate: 0.11, bikeRate: 0.05 },
  { name: 'Phú Yên',              carRate: 0.11, bikeRate: 0.05 },
  { name: 'Quảng Bình',           carRate: 0.11, bikeRate: 0.05 },
  { name: 'Quảng Nam',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Quảng Ngãi',           carRate: 0.11, bikeRate: 0.05 },
  { name: 'Quảng Trị',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Sóc Trăng',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Sơn La',               carRate: 0.11, bikeRate: 0.05 },
  { name: 'Tây Ninh',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Thái Bình',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Thái Nguyên',          carRate: 0.11, bikeRate: 0.05 },
  { name: 'Thanh Hóa',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Thừa Thiên Huế',      carRate: 0.11, bikeRate: 0.05 },
  { name: 'Tiền Giang',           carRate: 0.11, bikeRate: 0.05 },
  { name: 'Trà Vinh',             carRate: 0.11, bikeRate: 0.05 },
  { name: 'Tuyên Quang',          carRate: 0.11, bikeRate: 0.05 },
  { name: 'Vĩnh Long',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Vĩnh Phúc',            carRate: 0.11, bikeRate: 0.05 },
  { name: 'Yên Bái',              carRate: 0.11, bikeRate: 0.05 },
]

// Bảo hiểm TNDS bắt buộc (theo Nghị định 67/2023/NĐ-CP)
function getBHTNDS(loai: string, choNgoi: number): number {
  if (loai === 'xe-may') return 66_000
  if (choNgoi <= 6)  return 533_000
  if (choNgoi <= 11) return 599_000
  if (choNgoi <= 30) return 1_050_000
  return 1_578_000
}

// Phí đường bộ / năm (Thông tư 293/2016/TT-BTC)
function getPhiDuongBo(loai: string): number {
  if (loai === 'xe-may') return 120_000
  return 1_560_000  // ô tô < 10 chỗ
}

// Phí đăng ký (biển số) — giá ước tính trung bình
function getPhiDangKy(loai: string): number {
  if (loai === 'xe-may') return 120_000
  return 1_000_000
}

function fmt(n: number): string {
  return n.toLocaleString('vi-VN') + ' ₫'
}

function fmtShort(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(3).replace(/\.?0+$/, '') + ' tỷ'
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.?0+$/, '')     + ' tr'
  return n.toLocaleString('vi-VN')
}

function parseNum(s: string): number {
  return parseInt(s.replace(/\D/g, '')) || 0
}

export default function TinhGiaPage() {
  const [loai, setLoai]           = useState<'o-to' | 'xe-may'>('o-to')
  const [tinh, setTinh]           = useState(0)   // index
  const [giaStr, setGiaStr]       = useState('800.000.000')
  const [choNgoi, setChoNgoi]     = useState(5)
  const [bhVC, setBhVC]           = useState(false) // bảo hiểm vật chất
  const [bhVCRate, setBhVCRate]   = useState(1.5)   // % giá xe / năm

  const province = PROVINCES[tinh]
  const giaXe    = parseNum(giaStr)
  const rate     = loai === 'o-to' ? province.carRate : province.bikeRate
  const truocBa  = Math.round(giaXe * rate)
  const bhtnds   = getBHTNDS(loai, choNgoi)
  const duongBo  = getPhiDuongBo(loai)
  const dangKy   = getPhiDangKy(loai)
  const bhVCVal  = bhVC ? Math.round(giaXe * bhVCRate / 100) : 0
  const total    = giaXe + truocBa + dangKy + bhtnds + duongBo + bhVCVal

  const rows = [
    { label: 'Giá niêm yết',            val: giaXe,    note: '' },
    { label: `Phí trước bạ (${(rate * 100).toFixed(0)}%)`, val: truocBa, note: `${province.name}` },
    { label: 'Phí đăng ký / biển số',   val: dangKy,   note: 'Ước tính số thường' },
    { label: 'Bảo hiểm TNDS (1 năm)',   val: bhtnds,   note: `${loai === 'xe-may' ? 'Xe máy' : `${choNgoi} chỗ`}` },
    { label: 'Phí đường bộ (1 năm)',     val: duongBo,  note: '' },
    ...(bhVC ? [{ label: `Bảo hiểm vật chất (${bhVCRate}%)`, val: bhVCVal, note: 'Ước tính năm đầu' }] : []),
  ]

  function handleGiaInput(v: string) {
    const digits = v.replace(/\D/g, '')
    const n = parseInt(digits) || 0
    setGiaStr(n.toLocaleString('vi-VN'))
  }

  const BG   = '#0b0b07'
  const CARD = 'rgba(255,255,255,0.04)'
  const BDR  = 'rgba(255,255,255,0.08)'
  const RED  = '#ef4444'
  const AMB  = '#d4a843'

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI","Inter",sans-serif' }}>

      {/* NAV */}
      <nav style={{ borderBottom: `1px solid ${BDR}`, padding: '14px 6%', display: 'flex', alignItems: 'center', gap: 24 }}>
        <Link href="/" style={{ color: '#ef4444', fontWeight: 700, fontSize: 18, textDecoration: 'none' }}>🚘 XeVietnam</Link>
        <Link href="/tinh-gia"     style={{ color: '#fff',   fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>Giá lăn bánh</Link>
        <Link href="/tinh-tra-gop" style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none' }}>Trả góp</Link>
        <Link href="/o-to"         style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none' }}>Ô tô</Link>
        <Link href="/so-sanh"      style={{ color: '#9ca3af', fontSize: 14, textDecoration: 'none' }}>So sánh</Link>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid rgba(239,68,68,0.3)`, background: 'rgba(239,68,68,0.07)', borderRadius: 999, padding: '5px 14px', fontSize: 12, color: '#f87171', marginBottom: 16 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: RED, display: 'block' }} />
            Công cụ tính giá
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 10 }}>
            Tính giá lăn bánh
          </h1>
          <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.7 }}>
            Bao gồm phí trước bạ, đăng ký, bảo hiểm TNDS và phí đường bộ theo từng tỉnh/thành phố.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>

          {/* ── LEFT: Inputs ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Loại xe */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Loại xe</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['o-to', 'xe-may'] as const).map((t) => (
                  <button key={t} onClick={() => setLoai(t)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                    background: loai === t ? RED : 'rgba(255,255,255,0.06)',
                    color: loai === t ? '#fff' : '#9ca3af',
                    transition: 'all 0.15s',
                  }}>
                    {t === 'o-to' ? '🚗 Ô tô' : '🏍️ Xe máy'}
                  </button>
                ))}
              </div>
            </div>

            {/* Giá xe */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: '18px 20px' }}>
              <label style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>Giá niêm yết (VNĐ)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={giaStr}
                  onChange={(e) => handleGiaInput(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 10, padding: '12px 14px', fontSize: 20, fontWeight: 700, color: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#6b7280' }}>₫</span>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[400, 600, 800, 1000, 1500].map((m) => (
                  <button key={m} onClick={() => setGiaStr((m * 1_000_000).toLocaleString('vi-VN'))} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, border: `1px solid ${BDR}`, background: 'rgba(255,255,255,0.04)', color: '#9ca3af', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {m} tr
                  </button>
                ))}
              </div>
            </div>

            {/* Tỉnh/thành */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: '18px 20px' }}>
              <label style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>Tỉnh/Thành phố đăng ký</label>
              <select
                value={tinh}
                onChange={(e) => setTinh(Number(e.target.value))}
                style={{ width: '100%', background: '#18180f', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#fff', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {PROVINCES.map((p, i) => (
                  <option key={p.name} value={i}>{p.name} — {loai === 'o-to' ? (p.carRate * 100).toFixed(0) : (p.bikeRate * 100).toFixed(0)}%</option>
                ))}
              </select>
            </div>

            {/* Số chỗ (ô tô) */}
            {loai === 'o-to' && (
              <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: '18px 20px' }}>
                <label style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>Số chỗ ngồi (tính bảo hiểm TNDS)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[5, 7, 9, 12, 30].map((c) => (
                    <button key={c} onClick={() => setChoNgoi(c)} style={{
                      flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                      background: choNgoi === c ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                      color: choNgoi === c ? RED : '#9ca3af',
                      outline: choNgoi === c ? `1px solid ${RED}40` : 'none',
                    }}>
                      {c === 30 ? '30+' : `${c} chỗ`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bảo hiểm vật chất */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: bhVC ? 12 : 0 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Thêm bảo hiểm vật chất</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Tùy chọn — bảo hiểm thân xe năm đầu</div>
                </div>
                <button onClick={() => setBhVC(!bhVC)} style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                  background: bhVC ? RED : 'rgba(255,255,255,0.15)',
                }}>
                  <span style={{ position: 'absolute', top: 2, left: bhVC ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>
              {bhVC && (
                <div>
                  <label style={{ fontSize: 12, color: '#6b7280', display: 'block', marginBottom: 6 }}>Tỷ lệ phí (%/năm)</label>
                  <input
                    type="number" step="0.1" min="0.5" max="5"
                    value={bhVCRate}
                    onChange={(e) => setBhVCRate(parseFloat(e.target.value) || 1.5)}
                    style={{ width: 80, background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: 8, padding: '8px 10px', fontSize: 14, color: '#fff', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Result ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Total card */}
            <div style={{ background: `linear-gradient(135deg, rgba(239,68,68,0.12), rgba(212,168,67,0.08))`, border: `1px solid rgba(239,68,68,0.25)`, borderRadius: 16, padding: '24px 22px' }}>
              <div style={{ fontSize: 12, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Giá lăn bánh ước tính</div>
              <div style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, background: 'linear-gradient(135deg,#ef4444,#f97316,#d4a843)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {fmtShort(total)}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{fmt(total)}</div>
              <div style={{ marginTop: 12, fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>
                Tại {province.name} · {loai === 'o-to' ? `${choNgoi} chỗ · ` : ''}Phí trước bạ {(rate * 100).toFixed(0)}%
              </div>
            </div>

            {/* Breakdown */}
            <div style={{ background: CARD, border: `1px solid ${BDR}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${BDR}`, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chi tiết</div>
              {rows.map((r, i) => (
                <div key={i} style={{ padding: '13px 20px', borderBottom: i < rows.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, color: i === 0 ? '#d1d5db' : '#9ca3af' }}>{r.label}</div>
                    {r.note && <div style={{ fontSize: 11, color: '#4b5563', marginTop: 2 }}>{r.note}</div>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? '#fff' : '#d1d5db', textAlign: 'right' }}>
                    {fmt(r.val)}
                  </div>
                </div>
              ))}
              <div style={{ padding: '14px 20px', background: 'rgba(239,68,68,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Tổng giá lăn bánh</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: RED }}>{fmt(total)}</div>
              </div>
            </div>

            {/* CTA to tra gop */}
            <Link href={`/tinh-tra-gop?gia=${giaXe}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${BDR}`, borderRadius: 12,
              padding: '14px 20px', color: '#d1d5db', fontSize: 14, fontWeight: 500, textDecoration: 'none',
              transition: 'all 0.15s',
            }}>
              💳 Tính trả góp cho xe này →
            </Link>

            {/* Disclaimer */}
            <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.6, padding: '0 4px' }}>
              * Giá lăn bánh mang tính tham khảo. Phí thực tế có thể thay đổi theo chính sách ưu đãi và nghị quyết địa phương.
              Phí trước bạ theo Nghị định 10/2022/NĐ-CP. Bảo hiểm TNDS theo Nghị định 67/2023/NĐ-CP.
            </div>
          </div>
        </div>

        {/* Related tools */}
        <div style={{ marginTop: 48, borderTop: `1px solid ${BDR}`, paddingTop: 32 }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>Công cụ liên quan</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/tinh-tra-gop" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: CARD, border: `1px solid ${BDR}`, borderRadius: 10, color: '#d1d5db', fontSize: 13, textDecoration: 'none' }}>
              💳 Ước tính trả góp
            </Link>
            <Link href="/so-sanh" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: CARD, border: `1px solid ${BDR}`, borderRadius: 10, color: '#d1d5db', fontSize: 13, textDecoration: 'none' }}>
              ⚖️ So sánh xe
            </Link>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: CARD, border: `1px solid ${BDR}`, borderRadius: 10, color: '#d1d5db', fontSize: 13, textDecoration: 'none' }}>
              🤖 Hỏi AI tư vấn
            </Link>
          </div>
        </div>
      </div>

      <style>{`* { margin: 0; padding: 0; box-sizing: border-box; } select option { background: #1a1a10; } input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }`}</style>
    </div>
  )
}
