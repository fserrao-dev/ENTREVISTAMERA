// src/lib/utils.ts

import type { Candidato, NivelRiesgo, EtapaAlerta } from '@/types'

// ─── RIESGO ──────────────────────────────────────────────

/**
 * Recalcula el nivel de riesgo en base a las alertas reales (excluye las de estado).
 * ALTO  → alertas en 2+ etapas distintas
 * MEDIO → alerta en 1 etapa
 * BAJO  → sin alertas
 */
export function calcularRiesgo(alertas: { etapa: EtapaAlerta; esDeEstado: boolean }[]): NivelRiesgo {
  const etapas = new Set(
    alertas.filter(a => !a.esDeEstado).map(a => a.etapa)
  )
  if (etapas.size >= 2) return 'ALTO'
  if (etapas.size === 1) return 'MEDIO'
  return 'BAJO'
}

/**
 * Detecta discrepancia entre Ops y Capacitación (diferencia >= 2 puntos)
 */
export function tieneDiscrepancia(c: Candidato): boolean {
  if (!c.evalOps || !c.evalCap) return false
  return Math.abs(c.evalOps.score - c.evalCap.herramientas) >= 2
}

// ─── CSV EXPORT ──────────────────────────────────────────

export function generarCSV(candidatos: Candidato[]): string {
  const headers = [
    'Nombre', 'DNI', 'Puesto', 'Campaña', 'Estado', 'Fecha Postulación', 'Riesgo',
    'Ops Score', 'Ops Técnica', 'Ops Recomendado',
    'RRHH Blandas', 'RRHH Comunicación', 'RRHH Adaptabilidad', 'RRHH Apto Cultural',
    'Cap Herramientas', 'Cap Curva', 'Cap Cumplimiento', 'Cap Listo',
    'Cantidad Alertas', 'Comentarios Ops', 'Comentarios RRHH', 'Comentarios Cap',
  ]

  const rows = candidatos.map(c => [
    c.nombre,
    c.dni,
    c.puesto ?? '',
    c.campana.replace('_', ' '),
    c.estado.replace('_', ' '),
    c.fechaPostulacion.split('T')[0],
    c.riesgo,
    c.evalOps?.score ?? '',
    c.evalOps?.tecnica ?? '',
    c.evalOps?.recomendado !== undefined ? (c.evalOps.recomendado ? 'Sí' : 'No') : '',
    c.evalRRHH?.blandas ?? '',
    c.evalRRHH?.comunicacion ?? '',
    c.evalRRHH?.adaptabilidad ?? '',
    c.evalRRHH?.aptoC !== undefined ? (c.evalRRHH.aptoC ? 'Sí' : 'No') : '',
    c.evalCap?.herramientas ?? '',
    c.evalCap?.curva ?? '',
    c.evalCap?.cumplimiento ?? '',
    c.evalCap?.listo !== undefined ? (c.evalCap.listo ? 'Sí' : 'No') : '',
    c.alertas.filter(a => !a.esDeEstado).length,
    (c.evalOps?.comentarios ?? '').replace(/,/g, ';'),
    (c.evalRRHH?.comentarios ?? '').replace(/,/g, ';'),
    (c.evalCap?.comentarios ?? '').replace(/,/g, ';'),
  ])

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
  return '\uFEFF' + csv // BOM para Excel argentino
}

// ─── FORMATO ─────────────────────────────────────────────

export function formatFecha(fecha: string | Date): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function iniciales(nombre: string): string {
  return nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}
