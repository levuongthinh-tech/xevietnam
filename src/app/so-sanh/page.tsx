'use client'

import { useState, useEffect } from 'react'
import { supabase, formatPriceRange } from '@/lib/supabase'
import Link from 'next/link'

export default function SoSanhPage() {
  const [allModels, setAllModels] = useState<any[]>([])
  const [selected, setSelected] = useState<(any | null)[]>([null, null])
  const [search, setSearch] = useState(['', ''])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('models')
      .select(`
        id, name, slug, thumbnail_url, seats, fuel_type, engine_cc, origin, specs,
        brand:brands(name, slug),
        versions(price_history(price_min, price_max, price_raw))
      `)
      .eq('is_active', true)
      .order('view_count', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setAllModels(data || [])
        setLoading(false)
      })
  }, [])

  function selectModel(index: number, model: any) {
    const newSelected = [...selected]
    newSelected[index] = model
    setSelected(newSelected)
    const newSearch = [...search]
    newSearch[index] = ''
    setSearch(newSearch)
  }

  function clearModel(index: number) {
    const newSelected = [...selected]
    newSelected[index] = null
    setSelected(newSelected)
  }

  function filtered(index: number) {
    if (!search[index]) return allModels.slice(0, 10)
    const q = search[index].toLowerCase()
    return allModels.filter(m =>
      m.name.toLowerCase().includes(q) || m.brand?.name.toLowerCase().includes(q)
    ).slice(0, 10)
  }

  function getPrice(model: any) {
    const ph = model?.versions?.[0]?.price_history?.[0]
    return ph ? formatPriceRange(ph.price_min, ph.price_max) : 'Liên hệ'
  }

  const specs = [
    { key: 'price', label: 'Giá bán', fn: getPrice },
    { key: 'fuel_type', label: 'Nhiên liệu', fn: (m: any) => m?.fuel_type || '-' },
    { key: 'seats', label: 'Số chỗ', fn: (m: any) => m?.seats ? `${m.seats} chỗ` : '-' },
    { key: 'engine_cc', label: 'Dung tích', fn: (m: any) => m?.engine_cc ? `${m.engine_cc} cc` : '-' },
    { key: 'origin', label: 'Sản xuất tại', fn: (m: any) => m?.origin || '-' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">So sánh xe</h1>
      <p className="text-gray-500 mb-8">Chọn 2 dòng xe để so sánh thông số và giá</p>

      {/* Picker */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {[0, 1].map((i) => (
          <div key={i} className="relative">
            {selected[i] ? (
              <div className="border-2 border-red-400 rounded-xl p-4 bg-white">
                {selected[i].thumbnail_url && (
                  <img src={selected[i].thumbnail_url} alt={selected[i].name} className="w-full h-36 object-cover rounded-lg mb-3" />
                )}
                <p className="text-xs text-gray-400 mb-1">{selected[i].brand?.name}</p>
                <p className="font-bold text-gray-900">{selected[i].name}</p>
                <p className="text-red-600 font-semibold text-sm mt-1">{getPrice(selected[i])}</p>
                <button
                  onClick={() => clearModel(i)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl leading-none"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Xe {i + 1}</p>
                <input
                  type="text"
                  placeholder="Tìm xe..."
                  value={search[i]}
                  onChange={e => {
                    const ns = [...search]
                    ns[i] = e.target.value
                    setSearch(ns)
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
                />
                {search[i] && (
                  <div className="absolute z-10 w-full left-0 mt-1 bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filtered(i).map(m => (
                      <button
                        key={m.id}
                        onClick={() => selectModel(i, m)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b last:border-0"
                      >
                        <span className="text-gray-400 mr-1">{m.brand?.name}</span>
                        <span className="font-medium">{m.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bảng so sánh */}
      {selected[0] && selected[1] && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 px-4 py-3 font-semibold text-sm text-gray-600 border-b">
            <span>Thông số</span>
            <span className="text-center">{selected[0].name}</span>
            <span className="text-center">{selected[1].name}</span>
          </div>
          {specs.map(({ key, label, fn }) => {
            const v0 = fn(selected[0])
            const v1 = fn(selected[1])
            return (
              <div key={key} className="grid grid-cols-3 px-4 py-3 border-b last:border-0 text-sm hover:bg-gray-50">
                <span className="text-gray-500">{label}</span>
                <span className="text-center font-medium text-red-600">{v0}</span>
                <span className="text-center font-medium text-red-600">{v1}</span>
              </div>
            )
          })}
          {/* Thông số từ specs JSONB */}
          {(() => {
            const allKeys = new Set([
              ...Object.keys(selected[0].specs || {}),
              ...Object.keys(selected[1].specs || {}),
            ])
            return Array.from(allKeys).map(k => (
              <div key={k} className="grid grid-cols-3 px-4 py-3 border-b last:border-0 text-sm hover:bg-gray-50">
                <span className="text-gray-500">{k}</span>
                <span className="text-center">{selected[0].specs?.[k] || '-'}</span>
                <span className="text-center">{selected[1].specs?.[k] || '-'}</span>
              </div>
            ))
          })()}
        </div>
      )}

      {!selected[0] && !selected[1] && !loading && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-5xl mb-4">⚖️</p>
          <p>Tìm và chọn 2 dòng xe để bết đầu so sánh</p>
        </div>
      )}
    </div>
  )
}
