'use client'
// src/components/candidatos/CandidatoTable.tsx

import { useState } from 'react'
import type { Candidato, EstadoCandidato } from '@/types'
import { CAMPANA_LABELS, ESTADO_LABELS } from '@/types'
import { EstadoBadge, RiesgoBadge, ScoreBar, ProgressDots, AlertaChip, EmptyState } from '@/components/ui'

interface Props {
  candidatos: Candidato[]
  onRowClick: (c: Candidato) => void
  onEstadoChange: (id: string, estado: EstadoCandidato) => void
}

const th: React.CSSProperties = {
  padding: '10px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text3)',
  textTransform: 'uppercase', letterSpacing: 0.5,
  borderBottom: '1px solid var(--border)', background: 'var(--bg2)',
}
const td: React.CSSProperties = {
  padding: '11px 14px', fontSize: 12,
  borderBottom: '1px solid rgba(42,51,72,0.3)', verticalAlign: 'middle',
}

const ESTADOS: EstadoCandidato[] = ['EN_PROCESO', 'EN_CAPACITACION', 'INGRESADO', 'RECHAZADO']
const ESTADO_CLS: Record<EstadoCandidato, string> = {
  INGRESADO: 'badge-green', EN_CAPACITACION: 'badge-blue',
  EN_PROCESO: 'badge-gray', RECHAZADO: 'badge-red',
}

export default function CandidatoTable({ candidatos, onRowClick, onEstadoChange }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const realAlerts = (c: Candidato) => c.alertas.filter(a => !a.esDeEstado).length

  if (!candidatos.length) return <EmptyState message="No hay colaboradores con los filtros aplicados." />

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Colaborador', 'Campaña', 'Estado', 'Etapas', 'Riesgo', 'Ops', 'RRHH', 'Cap', 'Alertas'].map(h => (
              <th key={h} style={th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidatos.map(c => (
            <tr
              key={c.id}
              onClick={() => onRowClick(c)}
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <td style={td}>
                <div style={{ fontWeight: 500 }}>{c.nombre}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                  {c.dni}{c.legajo ? ` · Leg. ${c.legajo}` : ''} · {c.fechaIngreso.split('T')[0]}
                </div>
              </td>

              <td style={td}>
                <span className="badge-gray">{CAMPANA_LABELS[c.campana]}</span>
              </td>

              <td style={td} onClick={e => e.stopPropagation()}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <span
                    className={ESTADO_CLS[c.estado]}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                  >
                    {ESTADO_LABELS[c.estado]} ▾
                  </span>
                  {openMenu === c.id && (
                    <div style={{
                      position: 'absolute', top: '110%', left: 0,
                      background: 'var(--bg2)', border: '1px solid var(--border)',
                      borderRadius: 8, zIndex: 100, minWidth: 160,
                      boxShadow: '0 8px 24px rgba(0,0,0,.4)', overflow: 'hidden',
                    }}>
                      {ESTADOS.map(e => (
                        <div
                          key={e}
                          style={{ padding: '9px 14px', fontSize: 12, cursor: 'pointer', color: 'var(--text2)' }}
                          onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--card)')}
                          onMouseLeave={ev => (ev.currentTarget.style.background = 'transparent')}
                          onClick={() => { onEstadoChange(c.id, e); setOpenMenu(null) }}
                        >
                          {ESTADO_LABELS[e]}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>

              <td style={td}><ProgressDots candidato={c} /></td>

              <td style={td}>
                {c.riesgo !== 'BAJO' ? <RiesgoBadge riesgo={c.riesgo} /> : <span style={{ color: 'var(--text3)', fontSize: 11 }}>—</span>}
              </td>

              <td style={td}>{c.evalOps ? <ScoreBar value={c.evalOps.score} /> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
              <td style={td}>{c.evalRRHH ? <ScoreBar value={c.evalRRHH.blandas} /> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
              <td style={td}>{c.evalCap ? <ScoreBar value={c.evalCap.herramientas} /> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>

              <td style={td}><AlertaChip count={realAlerts(c)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
