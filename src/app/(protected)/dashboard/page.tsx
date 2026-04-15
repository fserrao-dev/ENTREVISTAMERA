'use client'
// src/app/(protected)/dashboard/page.tsx

import { useState, useEffect } from 'react'
import type { DashboardStats } from '@/types'
import { CAMPANA_LABELS } from '@/types'
import { StatCard, CompletitudCard, Spinner, HBarChart } from '@/components/ui'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setStats(d.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (!stats) return <div style={{ color: 'var(--text3)', padding: 20 }}>No se pudieron cargar las métricas.</div>

  return (
    <div>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total colaboradores" value={stats.total} />
        <StatCard label="Ingresados" value={stats.ingresados} color="var(--green)" sub={`${stats.pctConversion}% conversión`} />
        <StatCard label="Con alerta" value={stats.conAlerta} color="var(--yellow)" />
        <StatCard label="Riesgo ALTO" value={stats.riesgoAlto} color="var(--red)" />
        <StatCard label="Ingresados c/ alerta" value={stats.ingresadosConAlerta} color="var(--red)" sub={`${stats.pctRiesgoEnIngresados}% del total`} />
      </div>

      {/* Scores promedio */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Score Prom. Operaciones</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.avgScoreOps}<span style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 400 }}>/5</span></div>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Score Prom. RRHH</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.avgScoreRRHH}<span style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 400 }}>/5</span></div>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Score Prom. Capacitación</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.avgScoreCap}<span style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 400 }}>/5</span></div>
        </div>
      </div>

      {/* Completitud + por campaña */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Completitud de evaluaciones</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <CompletitudCard titulo="Operaciones" pct={stats.completitudOps} done={Math.round(stats.total * stats.completitudOps / 100)} total={stats.total} color="var(--accent)" />
            <CompletitudCard titulo="RRHH" pct={stats.completitudRRHH} done={Math.round(stats.total * stats.completitudRRHH / 100)} total={stats.total} color="var(--blue)" />
            <CompletitudCard titulo="Capacitación" pct={stats.completitudCap} done={Math.round(stats.total * stats.completitudCap / 100)} total={stats.total} color="var(--green)" />
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Por campaña</div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <HBarChart
              color="var(--accent)"
              items={stats.porCampana.map(p => ({ label: CAMPANA_LABELS[p.campana], value: p.total }))}
            />
          </div>
        </div>
      </div>

      {/* Por estado */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Distribución por estado</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {stats.porEstado.map(e => (
            <div key={e.estado} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{e.total}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                {{ EN_PROCESO: 'En proceso', EN_CAPACITACION: 'En capacitación', INGRESADO: 'Ingresado', RECHAZADO: 'Rechazado' }[e.estado]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
