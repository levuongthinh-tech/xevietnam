'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPricesPage() {
  const [models, setModels] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [versions, setVersions] = useState<any[]>([])
  const [prices, setPrices] = useState<Record<number, { min: string; max: string; raw: string }>>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('models').select('id, name, slug, brand:brands(name)').eq('is_active', true).order('name').limit(200)
      .then(({ data }) => setModels(data || []))
  }, [])

  async function selectModel(model: any) {
    setSelected(model)
    setMsg('')
    const { data } = await supabase.from('versions').select('id, name').eq('model_id', model.id).order('name')
    setVersions(data || [])
    const init: Record<number, { min: string; max: string; raw: string }> = {}
    data?.forEach(v => { init[v.id] = { min: '', max: '', raw: '' } })
    setPrices(init)
  }

  async function savePrices() {
    setSaving(true)
    setMsg('')
    const records = Object.entries(prices)
      .filter(([, v]) => v.min || v.max || v.raw)
      .map(([versionId, v]) => ({
        version_id: parseInt(versionId),
        price_min: v.min ? parseInt(v.min) * 1_000_000 : null,
        price_max: v.max ? parseInt(v.max) * 1_000_000 : null,
        price_raw: v.raw || null,
        recorded_at: new Date().toISOString().split('T')[0],
      }))

    if (!records.length) { setMsg('Chua nhap gia nao'); setSaving(false); return }

    const { error } = await supabase.from('price_history').insert(records)
    setSaving(false)
    setMsg(error ? 'Loi: ' + error.message : `Da luu ${records.length} ban ghi gia!`)
  }

  const filtered = search
    ? models.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || (m.brand as any)?.name?.toLowerCase().includes(search.toLowerCase()))
    : models.slice(0, 20)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cap nhat gia xe</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model picker */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-800 mb-3">1. Chon dong xe</h2>
          <input
            type="text"
            placeholder="Tim dong xe..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-red-400"
          />
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {filtered.map(m => (
              <button
                key={m.id}
                onClick={() => selectModel(m)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${selected?.id === m.id ? 'bg-red-50 text-red-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <span className="text-gray-400 mr-1">{(m.brand as any)?.name}</span> {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price input */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-800 mb-3">2. Nhap gia (trieu dong)</h2>
          {!selected ? (
            <p className="text-gray-400 text-sm">Chon dong xe de nhap gia</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">{(selected.brand as any)?.name} {selected.name}</p>
              {versions.map(v => (
                <div key={v.id} className="border rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">{v.name}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['min', 'max', 'raw'] as const).map(field => (
                      <div key={field}>
                        <label className="text-xs text-gray-400">{field === 'raw' ? 'Gia hien thi' : field === 'min' ? 'Tu (trieu)' : 'Den (trieu)'}</label>
                        <input
                          type={field === 'raw' ? 'text' : 'number'}
                          value={prices[v.id]?.[field] ?? ''}
                          onChange={e => setPrices(p => ({ ...p, [v.id]: { ...p[v.id], [field]: e.target.value } }))}
                          placeholder={field === 'raw' ? 'VD: 650 trieu' : '650'}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-red-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {msg && <p className={`text-sm ${msg.startsWith('Loi') ? 'text-red-600' : 'text-green-600'}`}>{msg}</p>}
              <button
                onClick={savePrices}
                disabled={saving}
                className="w-full bg-red-600 disabled:bg-gray-300 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
              >
                {saving ? 'Dang luu...' : 'Luu gia'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
