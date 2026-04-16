'use client'
// src/components/ui/index.tsx

import type { EstadoCandidato, NivelRiesgo, Candidato } from '@/types'
import { ESTADO_LABELS } from '@/types'

// ─── ESTADO BADGE ─────────────────────────────────────────

export function EstadoBadge({ estado }: { estado: EstadoCandidato }) {
  const cls: Record<EstadoCandidato, string> = {
    INGRESADO:       'badge-green',
    EN_CAPACITACION: 'badge-blue',
    EN_PROCESO:      'badge-gray',
    RECHAZADO:       'badge-red',
  }
  return <span className={cls[estado]}>{ESTADO_LABELS[estado]}</span>
}

// ─── RIESGO BADGE ─────────────────────────────────────────

export function RiesgoBadge({ riesgo }: { riesgo: NivelRiesgo }) {
  if (!riesgo || riesgo === 'BAJO') return null
  return <span className={riesgo === 'ALTO' ? 'risk-alto' : 'risk-medio'}>⚡ {riesgo}</span>
}

// ─── SCORE BAR ────────────────────────────────────────────

export function ScoreBar({ value }: { value: number }) {
  const pct = (value / 5) * 100
  const color = value >= 4 ? 'var(--green)' : value >= 3 ? 'var(--yellow)' : 'var(--red)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ height: 4, width: 50, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--text3)', minWidth: 20 }}>{value}/5</span>
    </div>
  )
}

// ─── PROGRESS DOTS ────────────────────────────────────────

export function ProgressDots({ candidato }: { candidato: Candidato }) {
  const stages = [
    { key: 'evalOps',  label: 'Ops',  data: candidato.evalOps },
    { key: 'evalRRHH', label: 'RRHH', data: candidato.evalRRHH },
    { key: 'evalCap',  label: 'Cap',  data: candidato.evalCap },
  ]
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {stages.map(s => {
        const hasAlert = s.key === 'evalCap' && candidato.evalCap?.tieneAlerta
        return (
          <div
            key={s.key}
            title={`${s.label}: ${!s.data ? 'Pendiente' : hasAlert ? 'Con alerta' : 'OK'}`}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              ...(!s.data ? { background: 'var(--border2)' } : hasAlert ? { background: 'var(--red)' } : { background: 'var(--green)' }),
            }}
          />
        )
      })}
    </div>
  )
}

// ─── ALERTA CHIP ──────────────────────────────────────────

export function AlertaChip({ count }: { count: number }) {
  if (count === 0) return <span style={{ color: 'var(--text3)', fontSize: 11 }}>—</span>
  return <span className="alert-chip">⚠ {count}</span>
}

// ─── AVATAR ───────────────────────────────────────────────

export function Avatar({ nombre, size = 44 }: { nombre: string; size?: number }) {
  const initials = nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: 10, background: 'var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: '#fff', flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────

export function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color ?? 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// ─── COMPLETITUD CARD ─────────────────────────────────────

export function CompletitudCard({ titulo, pct, done, total, color }: { titulo: string; pct: number; done: number; total: number; color: string }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>{titulo}</span>
        <span style={{ fontSize: 20, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .3s' }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>{done} de {total} evaluados</div>
    </div>
  )
}

// ─── LOADING SPINNER ──────────────────────────────────────

export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────

export function EmptyState({ message = 'No hay resultados.' }: { message?: string }) {
  return <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)', fontSize: 13 }}>{message}</div>
}

// ─── HORIZONTAL BAR CHART ────────────────────────────────

export function HBarChart({ items, color }: { items: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div title={item.label} style={{ fontSize: 11, color: 'var(--text3)', width: 72, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.label}
          </div>
          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round((item.value / max) * 100)}%`, background: color, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', minWidth: 20 }}>{item.value}</div>
        </div>
      ))}
    </div>
  )
}
