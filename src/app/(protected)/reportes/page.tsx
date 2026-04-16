'use client'
// src/app/(protected)/reportes/page.tsx

import { useState, useEffect } from 'react'
import type { Candidato, FiltrosCandidatos } from '@/types'
import FiltersBar from '@/components/ui/FiltersBar'
import { Spinner } from '@/components/ui'

export default function ReportesPage() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FiltrosCandidatos>({})
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.campana) params.set('campana', filters.campana)
    if (filters.estado)  params.set('estado', filters.estado)
    if (filters.desde)   params.set('desde', filters.desde)
    if (filters.hasta)   params.set('hasta', filters.hasta)

    fetch(`/api/candidatos?${params}`)
      .then(r => r.json())
      .then(d => { setCandidatos(d.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filters])

  const handleExport = async () => {
    setExporting(true)
    const params = new URLSearchParams()
    if (filters.campana) params.set('campana', filters.campana)
    if (filters.estado)  params.set('estado', filters.estado)
    if (filters.desde)   params.set('desde', filters.desde)
    if (filters.hasta)   params.set('hasta', filters.hasta)

    const res = await fetch(`/api/export?${params}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mera_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const ingresados = candidatos.filter(c => c.estado === 'INGRESADO').length
  const conAlerta  = candidatos.filter(c => c.alertas.some(a => !a.esDeEstado)).length
  const riesgoAlto = candidatos.filter(c => c.riesgo === 'ALTO').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Exportar reporte</h3>
          <p style={{ fontSize: 12, color: 'var(--text3)' }}>Aplicá filtros y descargá el CSV con los datos actuales.</p>
        </div>
        <button
          className="btn-primary"
          onClick={handleExport}
          disabled={exporting || loading || candidatos.length === 0}
        >
          {exporting ? 'Exportando...' : `Exportar CSV (${candidatos.length})`}
        </button>
      </div>

      <FiltersBar
        filters={filters}
        onChange={f => setFilters(prev => ({ ...prev, ...f }))}
        showSearch={false}
      />

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {[
            { label: 'Total en reporte', value: candidatos.length },
            { label: 'Ingresados', value: ingresados, color: 'var(--green)' },
            { label: 'Con alertas', value: conAlerta, color: 'var(--yellow)' },
            { label: 'Riesgo alto', value: riesgoAlto, color: 'var(--red)' },
          ].map(item => (
            <div key={item.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{item.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: item.color ?? 'var(--text)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
