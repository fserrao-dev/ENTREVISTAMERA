// src/app/api/candidatos/[id]/route.ts
// GET: detalle | PATCH: actualizar (eval, estado)

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcularRiesgo } from '@/lib/utils'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const candidato = await prisma.candidato.findUnique({
      where: { id: params.id },
      include: {
        evalOps: true, evalRRHH: true, evalCap: true,
        alertas: { orderBy: { createdAt: 'desc' } },
        historial: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!candidato) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ data: candidato })
  } catch (err: unknown) {
    const msg = (err as Error).message ?? String(err)
    console.error('[GET /api/candidatos/[id]]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'estado') {
      const updated = await prisma.candidato.update({
        where: { id: params.id },
        data: { estado: body.estado },
        include: { evalOps: true, evalRRHH: true, evalCap: true, alertas: true, historial: true },
      })
      return NextResponse.json({ data: updated })
    }

    if (action === 'eval_ops') {
      await prisma.evalOperaciones.upsert({
        where: { candidatoId: params.id },
        create: { candidatoId: params.id, score: body.score, tecnica: body.tecnica, recomendado: body.recomendado, comentarios: body.comentarios },
        update: { score: body.score, tecnica: body.tecnica, recomendado: body.recomendado, comentarios: body.comentarios },
      })
    }

    if (action === 'eval_rrhh') {
      await prisma.evalRRHH.upsert({
        where: { candidatoId: params.id },
        create: { candidatoId: params.id, blandas: body.blandas, comunicacion: body.comunicacion, adaptabilidad: body.adaptabilidad, aptoC: body.aptoC, comentarios: body.comentarios },
        update: { blandas: body.blandas, comunicacion: body.comunicacion, adaptabilidad: body.adaptabilidad, aptoC: body.aptoC, comentarios: body.comentarios },
      })
    }

    if (action === 'eval_cap') {
      await prisma.evalCapacitacion.upsert({
        where: { candidatoId: params.id },
        create: { candidatoId: params.id, herramientas: body.herramientas, curva: body.curva, cumplimiento: body.cumplimiento, listo: body.listo, tieneAlerta: body.tieneAlerta, tipoAlerta: body.tipoAlerta ?? null, comentarios: body.comentarios },
        update: { herramientas: body.herramientas, curva: body.curva, cumplimiento: body.cumplimiento, listo: body.listo, tieneAlerta: body.tieneAlerta, tipoAlerta: body.tipoAlerta ?? null, comentarios: body.comentarios },
      })
    }

    const alertas = await prisma.alerta.findMany({ where: { candidatoId: params.id } })
    const nuevoRiesgo = calcularRiesgo(alertas)

    const updated = await prisma.candidato.update({
      where: { id: params.id },
      data: { riesgo: nuevoRiesgo },
      include: { evalOps: true, evalRRHH: true, evalCap: true, alertas: true, historial: true },
    })

    return NextResponse.json({ data: updated })
  } catch (err: unknown) {
    const msg = (err as Error).message ?? String(err)
    console.error('[PATCH /api/candidatos/[id]]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
