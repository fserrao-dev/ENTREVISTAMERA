'use client'
// src/components/ui/FiltersBar.tsx

import { CAMPANA_LABELS, ESTADO_LABELS } from '@/types'
import type { Campana, EstadoCandidato, FiltrosCandidatos } from '@/types'

interface FiltersBarProps {
  filters: FiltrosCandidatos
  onChange: (f: Partial<FiltrosCandidatos>) => void
  showSearch?: boolean
  showDates?: boolean
}

const inputStyle = {
  background: 'var(--card)', border: '1px solid var(--border)',
  color: 'var(--text2)', padding: '7px 10px', borderRadius: 7, fontSize: 12, cursor: 'pointer',
}

export default function FiltersBar({ filters, onChange, showSearch = true, showDates = true }: FiltersBarProps) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
      {showSearch && (
        <input
          style={{ ...inputStyle, flex: 1, minWidth: 180, color: 'var(--text)' }}
          placeholder="Buscar por nombre o DNI..."
          value={filters.search ?? ''}
          onChange={e => onChange({ search: e.target.value })}
        />
      )}

      <select style={inputStyle} value={filters.campana ?? ''} onChange={e => onChange({ campana: (e.target.value as Campana) || undefined })}>
        <option value="">Todas las campañas</option>
        {Object.entries(CAMPANA_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>

      <select style={inputStyle} value={filters.estado ?? ''} onChange={e => onChange({ estado: (e.target.value as EstadoCandidato) || undefined })}>
        <option value="">Todos los estados</option>
        {Object.entries(ESTADO_LABELS).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>

      <select style={inputStyle} value={filters.alerta ?? ''} onChange={e => onChange({ alerta: (e.target.value as 'con' | 'sin') || undefined })}>
        <option value="">Con y sin alertas</option>
        <option value="con">Con alertas</option>
        <option value="sin">Sin alertas</option>
      </select>

      {showDates && (
        <>
          <input
            type="date" style={inputStyle} value={filters.desde ?? ''}
            onChange={e => onChange({ desde: e.target.value || undefined })}
            title="Desde"
          />
          <input
            type="date" style={inputStyle} value={filters.hasta ?? ''}
            onChange={e => onChange({ hasta: e.target.value || undefined })}
            title="Hasta"
          />
          {(filters.desde || filters.hasta) && (
            <button
              className="btn-secondary"
              style={{ fontSize: 11, padding: '5px 10px' }}
              onClick={() => onChange({ desde: undefined, hasta: undefined })}
            >
              ✕ fechas
            </button>
          )}
        </>
      )}
    </div>
  )
}
