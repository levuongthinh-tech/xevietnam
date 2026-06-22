'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminBrandEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const isNew = id === 'new'

  const [form, setForm] = useState({ name: '', slug: '', country: '', logo_url: '' })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!isNew) {
      supabase.from('brands').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setForm({ name: data.name, slug: data.slug, country: data.country ?? '', logo_url: data.logo_url ?? '' })
        setLoading(false)
      })
    }
  }, [id, isNew])

  async function save() {
    setSaving(true)
    setMsg('')
    const payload = { name: form.name, slug: form.slug, country: form.country || null, logo_url: form.logo_url || null }
    const { error } = isNew
      ? await supabase.from('brands').insert(payload)
      : await supabase.from('brands').update(payload).eq('id', id)
    setSaving(false)
    if (error) setMsg('Loi: ' + error.message)
    else { setMsg('Da luu!'); setTimeout(() => router.push('/admin/brands'), 1000) }
  }

  if (loading) return <div className="text-gray-500">Dang tai...</div>

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/brands" className="text-gray-500 hover:text-gray-700">← Quay lai</Link>
        <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Them hang xe' : 'Sua hang xe'}</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {[
          { key: 'name', label: 'Ten hang xe', placeholder: 'Toyota' },
          { key: 'slug', label: 'Slug', placeholder: 'toyota' },
          { key: 'country', label: 'Quoc gia', placeholder: 'Nhat Ban' },
          { key: 'logo_url', label: 'URL Logo', placeholder: 'https://...' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              type="text"
              value={(form as any)[f.key]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400"
            />
          </div>
        ))}
        {msg && <p className={`text-sm ${msg.startsWith('Loi') ? 'text-red-600' : 'text-green-600'}`}>{msg}</p>}
        <button
          onClick={save}
          disabled={saving || !form.name || !form.slug}
          className="w-full bg-red-600 disabled:bg-gray-300 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition"
        >
          {saving ? 'Dang luu...' : 'Luu hang xe'}
        </button>
      </div>
    </div>
  )
}
