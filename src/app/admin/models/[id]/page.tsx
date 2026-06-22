'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const SEGMENTS = ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'MPV', 'Coupe', 'Roadster', 'Xe may', 'Xe dien']
const FUEL_TYPES = ['Xang', 'Dau diesel', 'Dien', 'Hybrid', 'Plug-in Hybrid']
const VEHICLE_TYPES = ['car', 'motorcycle', 'electric']

export default function AdminModelEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isNew = id === 'new'

  const [brands, setBrands] = useState<any[]>([])
  const [form, setForm] = useState({
    brand_id: '', name: '', slug: '', segment: '', fuel_type: '',
    vehicle_type: 'car', description: '', thumbnail_url: '', is_active: true,
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from('brands').select('id, name').order('name').then(({ data }) => setBrands(data || []))
    if (!isNew) {
      supabase.from('models').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setForm({
          brand_id: String(data.brand_id),
          name: data.name, slug: data.slug,
          segment: data.segment ?? '', fuel_type: data.fuel_type ?? '',
          vehicle_type: data.vehicle_type ?? 'car',
          description: data.description ?? '', thumbnail_url: data.thumbnail_url ?? '',
          is_active: data.is_active ?? true,
        })
        setLoading(false)
      })
    }
  }, [id, isNew])

  async function save() {
    setSaving(true); setMsg('')
    const payload = {
      brand_id: parseInt(form.brand_id),
      name: form.name, slug: form.slug,
      segment: form.segment || null, fuel_type: form.fuel_type || null,
      vehicle_type: form.vehicle_type,
      description: form.description || null,
      thumbnail_url: form.thumbnail_url || null,
      is_active: form.is_active,
    }
    const { error } = isNew
      ? await supabase.from('models').insert(payload)
      : await supabase.from('models').update(payload).eq('id', id)
    setSaving(false)
    if (error) setMsg('Loi: ' + error.message)
    else { setMsg('Da luu!'); setTimeout(() => router.push('/admin/models'), 1000) }
  }

  if (loading) return <div className="text-gray-500">Dang tai...</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/models" className="text-gray-500 hover:text-gray-700">← Quay lai</Link>
        <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Them dong xe' : 'Sua dong xe'}</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hang xe *</label>
          <select
            value={form.brand_id}
            onChange={e => setForm(p => ({ ...p, brand_id: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
          >
            <option value="">-- Chon hang xe --</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        {[
          { key: 'name', label: 'Ten xe *', placeholder: 'Camry' },
          { key: 'slug', label: 'Slug *', placeholder: 'toyota-camry' },
          { key: 'thumbnail_url', label: 'URL anh dai dien', placeholder: 'https://...' },
          { key: 'description', label: 'Mo ta', placeholder: '' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            {f.key === 'description' ? (
              <textarea
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
              />
            ) : (
              <input
                type="text"
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
              />
            )}
          </div>
        ))}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loai xe</label>
            <select value={form.vehicle_type} onChange={e => setForm(p => ({ ...p, vehicle_type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
              {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phan khuc</label>
            <select value={form.segment} onChange={e => setForm(p => ({ ...p, segment: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
              <option value="">--</option>
              {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhien lieu</label>
            <select value={form.fuel_type} onChange={e => setForm(p => ({ ...p, fuel_type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400">
              <option value="">--</option>
              {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="rounded" />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Hien thi tren website</label>
        </div>
        {msg && <p className={`text-sm ${msg.startsWith('Loi') ? 'text-red-600' : 'text-green-600'}`}>{msg}</p>}
        <button
          onClick={save}
          disabled={saving || !form.name || !form.slug || !form.brand_id}
          className="w-full bg-red-600 disabled:bg-gray-300 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition"
        >
          {saving ? 'Dang luu...' : 'Luu dong xe'}
        </button>
      </div>
    </div>
  )
}
