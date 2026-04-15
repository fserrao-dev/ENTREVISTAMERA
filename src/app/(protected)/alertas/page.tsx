'use client'
// src/app/(protected)/alertas/page.tsx

import { useState, useEffect } from 'react'
import type { EtapaAlerta, TipoAlerta } from '@/types'
import { ETAPA_LABELS, ALERTA_TIPO_LABELS } from '@/types'
import { Spinner, EmptyState } from '@/components/ui'

interface AlertaConCandidato {
  id: string
  etapa: EtapaAlerta
  tipo: TipoAlerta
  descripcion: string
  esDeEstado: boolean
  createdAt: string
  candidato: { id: string; nombre: string; dni: string; campana: string }
}

const TIPO_COLOR: Record<TipoAlerta, string> = {
  TECNICA: 'var(--yellow)',
  CONDUCTUAL: 'var(--red)',
  ASISTENCIA: 'var(--blue)',
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<AlertaConCandidato[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEtapa, setFiltroEtapa] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  useEffect(() => {
    fetch('/api/alertas')
      .then(r => r.json())
      .then(d => { setAlertas(d.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const selectStyle = {
    background: 'var(--card)', border: '1px solid var(--border)',
    color: 'var(--text2)', padding: '7px 10px', borderRadius: 7, fontSize: 12,
  }

  const alertasFiltradas = alertas.filter(a => {
    if (filtroEtapa && a.etapa !== filtroEtapa) return false
    if (filtroTipo && a.tipo !== filtroTipo) return false
    return true
  })

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select style={selectStyle} value={filtroEtapa} onChange={e => setFiltroEtapa(e.target.value)}>
          <option value="">Todas las etapas</option>
          {Object.entries(ETAPA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select style={selectStyle} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {Object.entries(ALERTA_TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text3)', alignSelf: 'center', marginLeft: 'auto' }}>
          {alertasFiltradas.length} alerta{alertasFiltradas.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? <Spinner /> : alertasFiltradas.length === 0 ? <EmptyState message="No hay alertas registradas." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alertasFiltradas.map(a => (
            <div key={a.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: TIPO_COLOR[a.tipo] }}>
                    {ETAPA_LABELS[a.etapa]} — {ALERTA_TIPO_LABELS[a.tipo]}
                  </span>
                  <span className="badge-gray">{a.candidato.nombre}</span>
                  <span style={{ fontSize: 10, color: 'var(--text3)' }}>DNI: {a.candidato.dni}</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text3)', flexShrink: 0 }}>{a.createdAt.split('T')[0]}</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{a.descripcion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
