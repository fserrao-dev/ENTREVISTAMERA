// src/app/api/candidatos/route.ts
// GET: lista candidatos con filtros | POST: crea candidato

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma, ensureSchema } from '@/lib/prisma'
import type { Campana, EstadoCandidato } from '@/types'

export async function GET(request: NextRequest) {
  try {
    await ensureSchema()
    const { searchParams } = new URL(request.url)
    const search  = searchParams.get('search') ?? ''
    const campana = searchParams.get('campana') as Campana | null
    const estado  = searchParams.get('estado') as EstadoCandidato | null
    const alerta  = searchParams.get('alerta') as 'con' | 'sin' | null
    const desde   = searchParams.get('desde')
    const hasta   = searchParams.get('hasta')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (campana) where.campana = campana
    if (estado) where.estado = estado
    if (search) where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { dni: { contains: search } },
    ]
    if (desde || hasta) {
      where.fechaPostulacion = {}
      if (desde) where.fechaPostulacion.gte = new Date(desde)
      if (hasta) where.fechaPostulacion.lte = new Date(hasta + 'T23:59:59')
    }
    if (alerta === 'con') where.alertas = { some: { esDeEstado: false } }
    if (alerta === 'sin') where.alertas = { none: { esDeEstado: false } }

    const candidatos = await prisma.candidato.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        evalOps:  true,
        evalRRHH: true,
        evalCap:  true,
        alertas:  { orderBy: { createdAt: 'desc' } },
        historial: { orderBy: { createdAt: 'desc' } },
      },
    })

    return NextResponse.json({ data: candidatos })
  } catch (err: unknown) {
    const msg = (err as Error).message ?? String(err)
    console.error('[GET /api/candidatos]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  await ensureSchema()
  const body = await request.json()
  const { nombre, dni, legajo, campana, fechaIngreso, fechaFinCapa } = body

  if (!nombre?.trim() || !dni?.trim() || !campana) {
    return NextResponse.json({ error: 'Nombre, DNI y campaña son obligatorios.' }, { status: 400 })
  }

  try {
    const candidato = await prisma.candidato.create({
      data: {
        nombre: nombre.trim(),
        dni: dni.trim(),
        legajo: legajo?.trim() || null,
        campana,
        fechaPostulacion: fechaIngreso ? new Date(fechaIngreso) : new Date(),
        fechaFinCapa: fechaFinCapa ? new Date(fechaFinCapa) : null,
      },
      include: {
        evalOps: true, evalRRHH: true, evalCap: true,
        alertas: true, historial: true,
      },
    })
    return NextResponse.json({ data: candidato }, { status: 201 })
  } catch (err: unknown) {
    const isUniqueError = (err as { code?: string })?.code === 'P2002'
    if (isUniqueError) {
      return NextResponse.json({ error: 'Ya existe un colaborador con ese DNI.' }, { status: 409 })
    }
    const msg = (err as Error).message ?? String(err)
    console.error('[POST /api/candidatos]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
