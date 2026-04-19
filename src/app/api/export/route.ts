// src/app/api/export/route.ts
// GET: descarga CSV con los candidatos filtrados

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generarCSV } from '@/lib/utils'
import type { Campana, EstadoCandidato } from '@/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const campana = searchParams.get('campana') as Campana | null
  const estado  = searchParams.get('estado') as EstadoCandidato | null
  const desde   = searchParams.get('desde')
  const hasta   = searchParams.get('hasta')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}
  if (campana) where.campana = campana
  if (estado) where.estado = estado
  if (desde || hasta) {
    where.fechaPostulacion = {}
    if (desde) where.fechaPostulacion.gte = new Date(desde)
    if (hasta) where.fechaPostulacion.lte = new Date(hasta + 'T23:59:59')
  }

  const candidatos = await prisma.candidato.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { evalOps: true, evalRRHH: true, evalCap: true, alertas: true, historial: true },
  })

  const serialized = candidatos.map(c => ({
    ...c,
    fechaPostulacion: c.fechaPostulacion.toISOString(),
    fechaFinCapa: c.fechaFinCapa?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    alertas: c.alertas.map(a => ({ ...a, createdAt: a.createdAt.toISOString() })),
    historial: c.historial.map(h => ({ ...h, createdAt: h.createdAt.toISOString() })),
    evalOps: c.evalOps ? { ...c.evalOps, createdAt: c.evalOps.createdAt.toISOString(), updatedAt: c.evalOps.updatedAt.toISOString() } : null,
    evalRRHH: c.evalRRHH ? { ...c.evalRRHH, createdAt: c.evalRRHH.createdAt.toISOString(), updatedAt: c.evalRRHH.updatedAt.toISOString() } : null,
    evalCap: c.evalCap ? { ...c.evalCap, createdAt: c.evalCap.createdAt.toISOString(), updatedAt: c.evalCap.updatedAt.toISOString() } : null,
  }))

  const csv = generarCSV(serialized as Parameters<typeof generarCSV>[0])
  const filename = `mera_export_${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
