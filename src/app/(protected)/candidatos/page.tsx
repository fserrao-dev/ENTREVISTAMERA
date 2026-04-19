'use client'
// src/app/(protected)/candidatos/page.tsx

import { useState, useEffect, useCallback } from 'react'
import type { Candidato, EstadoCandidato, FiltrosCandidatos, TipoAlerta, EtapaAlerta, UserRole } from '@/types'
import { CAMPANA_LABELS } from '@/types'
import { createClient } from '@/lib/supabase/client'
import CandidatoTable from '@/components/candidatos/CandidatoTable'
import CandidatoModal from '@/components/candidatos/CandidatoModal'
import FiltersBar from '@/components/ui/FiltersBar'
import { Spinner } from '@/components/ui'

export default function CandidatosPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FiltrosCandidatos>({})
  const [selected, setSelected] = useState<Candidato | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [role, setRole] = useState<UserRole>('operaciones')

  // Leer rol del usuario actual
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setRole((data.user.user_metadata?.role as UserRole) ?? 'operaciones')
      }
    })

    // Abrir modal nuevo colaborador desde topbar
    const handler = () => setShowNew(true)
    window.addEventListener('mera_open_new_candidate', handler)
    return () => window.removeEventListener('mera_open_new_candidate', handler)
  }, [])

  const fetchCandidatos = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.search)  params.set('search', filters.search)
    if (filters.campana) params.set('campana', filters.campana)
    if (filters.estado)  params.set('estado', filters.estado)
    if (filters.alerta)  params.set('alerta', filters.alerta)
    if (filters.desde)   params.set('desde', filters.desde)
    if (filters.hasta)   params.set('hasta', filters.hasta)

    try {
      const res = await fetch(`/api/candidatos?${params}`)
      const data = await res.json()
      if (res.ok) setCandidatos(data.data ?? [])
      else console.error('[fetchCandidatos] API error:', data.error)
    } catch (e) {
      console.error('[fetchCandidatos] fetch failed:', e)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchCandidatos() }, [fetchCandidatos])

  const handleEstadoChange = async (id: string, estado: EstadoCandidato) => {
    await fetch(`/api/candidatos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'estado', estado }),
    })
    fetchCandidatos()
  }

  const handleSaveEval = async (id: string, stage: string, data: Record<string, unknown>) => {
    await fetch(`/api/candidatos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    fetchCandidatos()
    if (selected?.id === id) {
      const res = await fetch(`/api/candidatos/${id}`)
      const d = await res.json()
      if (d.data) setSelected(d.data)
    }
  }

  const handleSaveAlert = async (id: string, alertData: { etapa: EtapaAlerta; tipo: TipoAlerta; descripcion: string }) => {
    await fetch('/api/alertas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidatoId: id, ...alertData }),
    })
    fetchCandidatos()
    if (selected?.id === id) {
      const res = await fetch(`/api/candidatos/${id}`)
      const d = await res.json()
      if (d.data) setSelected(d.data)
    }
  }

  return (
    <>
      <FiltersBar filters={filters} onChange={f => setFilters(prev => ({ ...prev, ...f }))} />

      {loading ? <Spinner /> : (
        <CandidatoTable
          candidatos={candidatos}
          onRowClick={setSelected}
          onEstadoChange={handleEstadoChange}
        />
      )}

      {selected && (
        <CandidatoModal
          candidato={selected}
          role={role}
          onClose={() => setSelected(null)}
          onSaveEval={handleSaveEval}
          onSaveAlert={handleSaveAlert}
        />
      )}

      {showNew && (
        <NuevoColaboradorModal
          onClose={() => setShowNew(false)}
          onSaved={() => { setShowNew(false); fetchCandidatos() }}
        />
      )}
    </>
  )
}

// ─── MODAL NUEVO COLABORADOR ──────────────────────────────

function NuevoColaboradorModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const body = {
      nombre: fd.get('nombre'),
      dni: fd.get('dni'),
      campana: fd.get('campana'),
      fechaIngreso: fd.get('fechaIngreso') || undefined,
    }
    const res = await fetch('/api/candidatos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Error al crear.'); setSaving(false); return }
    onSaved()
  }

  const inputStyle = {
    width: '100%', background: 'var(--card)', border: '1px solid var(--border)',
    color: 'var(--text)', padding: '9px 12px', borderRadius: 7, fontSize: 13,
  }
  const labelStyle = { display: 'block' as const, fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 5 }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 14, width: '100%', maxWidth: 480 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Nuevo Colaborador</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Nombre y apellido *</label>
              <input name="nombre" required style={inputStyle} placeholder="Juan Pérez" />
            </div>
            <div>
              <label style={labelStyle}>DNI *</label>
              <input name="dni" required style={inputStyle} placeholder="12345678" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Campaña *</label>
              <select name="campana" required style={{ ...inputStyle, cursor: 'pointer' }}>
                {Object.entries(CAMPANA_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={labelStyle}>Fecha de ingreso</label>
              <input name="fechaIngreso" type="date" style={inputStyle} defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          {error && (
            <div style={{ margin: '0 20px', background: '#ef444415', border: '1px solid #ef444430', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Crear Colaborador'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
