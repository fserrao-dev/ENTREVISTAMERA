// src/app/api/candidatos/[id]/route.ts
// GET: detalle | PATCH: actualizar (eval, estado)

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcularRiesgo } from '@/lib/utils'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
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
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const { action } = body
  const autorNombre = body.autorNombre ?? ''

  if (action === 'estado') {
    const prev = await prisma.candidato.findUnique({ where: { id: params.id }, select: { estado: true } })
    const updated = await prisma.candidato.update({
      where: { id: params.id },
      data: { estado: body.estado },
      include: { evalOps: true, evalRRHH: true, evalCap: true, alertas: true, historial: true },
    })
    // Registrar cambio de estado en historial
    const estadoLabels: Record<string, string> = {
      EN_PROCESO: 'En Proceso', EN_CAPACITACION: 'En Capacitación',
      INGRESADO: 'Ingresado', RECHAZADO: 'Rechazado',
    }
    const colorMap: Record<string, string> = {
      EN_PROCESO: 'blue', EN_CAPACITACION: 'yellow', INGRESADO: 'green', RECHAZADO: 'red',
    }
    await prisma.historial.create({
      data: {
        candidatoId: params.id,
        evento: 'Cambio de estado',
        detalle: `${estadoLabels[prev?.estado ?? ''] ?? prev?.estado} → ${estadoLabels[body.estado] ?? body.estado}${autorNombre ? ' · por ' + autorNombre : ''}`,
        color: colorMap[body.estado] ?? 'blue',
      },
    })
    return NextResponse.json({ data: updated })
  }

  const autorId = body.autorId ?? ''

  if (action === 'eval_ops') {
    await prisma.evalOperaciones.upsert({
      where: { candidatoId: params.id },
      create: { candidatoId: params.id, score: body.score, tecnica: body.tecnica, recomendado: body.recomendado, comentarios: body.comentarios, autorId, autorNombre },
      update: { score: body.score, tecnica: body.tecnica, recomendado: body.recomendado, comentarios: body.comentarios, autorId, autorNombre },
    })
    await prisma.historial.create({
      data: {
        candidatoId: params.id,
        evento: 'Evaluación Operaciones',
        detalle: `Score: ${body.score}/5 · Técnica: ${body.tecnica}/5 · ${body.recomendado ? 'Recomendado' : 'No recomendado'}${autorNombre ? ' · por ' + autorNombre : ''}`,
        color: 'blue',
      },
    })
  }

  if (action === 'eval_rrhh') {
    await prisma.evalRRHH.upsert({
      where: { candidatoId: params.id },
      create: { candidatoId: params.id, blandas: body.blandas, comunicacion: body.comunicacion, adaptabilidad: body.adaptabilidad, aptoC: body.aptoC, comentarios: body.comentarios, autorId, autorNombre },
      update: { blandas: body.blandas, comunicacion: body.comunicacion, adaptabilidad: body.adaptabilidad, aptoC: body.aptoC, comentarios: body.comentarios, autorId, autorNombre },
    })
    await prisma.historial.create({
      data: {
        candidatoId: params.id,
        evento: 'Evaluación RRHH',
        detalle: `Blandas: ${body.blandas}/5 · Comunicación: ${body.comunicacion}/5 · Adaptabilidad: ${body.adaptabilidad}/5 · ${body.aptoC ? 'Apto Cultural' : 'No Apto'}${autorNombre ? ' · por ' + autorNombre : ''}`,
        color: 'purple',
      },
    })
  }

  if (action === 'eval_cap') {
    await prisma.evalCapacitacion.upsert({
      where: { candidatoId: params.id },
      create: { candidatoId: params.id, herramientas: body.herramientas, curva: body.curva, cumplimiento: body.cumplimiento, listo: body.listo, tieneAlerta: body.tieneAlerta, tipoAlerta: body.tipoAlerta ?? null, comentarios: body.comentarios, autorId, autorNombre },
      update: { herramientas: body.herramientas, curva: body.curva, cumplimiento: body.cumplimiento, listo: body.listo, tieneAlerta: body.tieneAlerta, tipoAlerta: body.tipoAlerta ?? null, comentarios: body.comentarios, autorId, autorNombre },
    })
    await prisma.historial.create({
      data: {
        candidatoId: params.id,
        evento: 'Evaluación Capacitación',
        detalle: `Herramientas: ${body.herramientas}/5 · Curva: ${body.curva}/5 · Cumplimiento: ${body.cumplimiento}/5 · ${body.listo ? 'Listo para piso' : 'No listo'}${autorNombre ? ' · por ' + autorNombre : ''}`,
        color: 'orange',
      },
    })
  }

  const alertas = await prisma.alerta.findMany({ where: { candidatoId: params.id } })
  const nuevoRiesgo = calcularRiesgo(alertas)

  const updated = await prisma.candidato.update({
    where: { id: params.id },
    data: { riesgo: nuevoRiesgo },
    include: { evalOps: true, evalRRHH: true, evalCap: true, alertas: true, historial: { orderBy: { createdAt: 'desc' } } },
  })

  return NextResponse.json({ data: updated })
}
