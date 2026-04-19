// src/app/api/dashboard/route.ts
// GET: métricas generales del dashboard

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { DashboardStats } from '@/types'

export async function GET() {
  try {
  const [candidatos, alertas] = await Promise.all([
    prisma.candidato.findMany({
      include: { evalOps: true, evalRRHH: true, evalCap: true, alertas: true },
    }),
    prisma.alerta.findMany({ where: { esDeEstado: false } }),
  ])

  const total      = candidatos.length
  const ingresados = candidatos.filter(c => c.estado === 'INGRESADO').length
  const conAlerta  = candidatos.filter(c => c.alertas.some(a => !a.esDeEstado)).length
  const riesgoAlto = candidatos.filter(c => c.riesgo === 'ALTO').length
  const ingresadosConAlerta = candidatos.filter(c => c.estado === 'INGRESADO' && c.alertas.some(a => !a.esDeEstado)).length

  const avg = (nums: number[]) => nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : 0

  const opsScores  = candidatos.filter(c => c.evalOps).map(c => c.evalOps!.score)
  const rrhhScores = candidatos.filter(c => c.evalRRHH).map(c => c.evalRRHH!.blandas)
  const capScores  = candidatos.filter(c => c.evalCap).map(c => c.evalCap!.herramientas)

  const pct = (n: number) => total ? Math.round((n / total) * 100) : 0

  const campanasMap = new Map<string, { total: number; conAlerta: number }>()
  candidatos.forEach(c => {
    const existing = campanasMap.get(c.campana) ?? { total: 0, conAlerta: 0 }
    existing.total++
    if (c.alertas.some(a => !a.esDeEstado)) existing.conAlerta++
    campanasMap.set(c.campana, existing)
  })
  const porCampana = Array.from(campanasMap.entries())
    .map(([campana, d]) => ({ campana: campana as DashboardStats['porCampana'][0]['campana'], ...d }))
    .sort((a, b) => b.total - a.total)

  const estadosMap = new Map<string, number>()
  candidatos.forEach(c => estadosMap.set(c.estado, (estadosMap.get(c.estado) ?? 0) + 1))
  const porEstado = Array.from(estadosMap.entries())
    .map(([estado, total]) => ({ estado: estado as DashboardStats['porEstado'][0]['estado'], total }))

  const stats: DashboardStats = {
    total, ingresados, conAlerta, riesgoAlto, ingresadosConAlerta,
    pctConversion: pct(ingresados),
    pctRiesgoEnIngresados: ingresados ? Math.round((ingresadosConAlerta / ingresados) * 100) : 0,
    avgScoreOps: avg(opsScores),
    avgScoreRRHH: avg(rrhhScores),
    avgScoreCap: avg(capScores),
    completitudOps:  pct(opsScores.length),
    completitudRRHH: pct(rrhhScores.length),
    completitudCap:  pct(capScores.length),
    porCampana, porEstado,
  }

  return NextResponse.json({ data: stats })
  } catch (err: unknown) {
    const msg = (err as Error).message ?? String(err)
    console.error('[GET /api/dashboard]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
