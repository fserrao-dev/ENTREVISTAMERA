// src/app/api/candidatos/[id]/route.ts
// GET: detalle | PATCH: actualizar (eval, estado)

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRouteClient } from '@/lib/supabase/server'
import { calcularRiesgo } from '@/lib/utils'
import type { UserRole } from '@/types'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createRouteClient(request)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

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
  const supabase = createRouteClient(request)
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const role = (user.user_metadata?.role as UserRole) ?? 'operaciones'
  const autorId = user.id
  const autorNombre = user.user_metadata?.nombre || user.email || ''
  const body = await request.json()
  const { action } = body

  // ── Cambio de estado: todos los roles ──
  if (action === 'estado') {
    const updated = await prisma.candidato.update({
      where: { id: params.id },
      data: { estado: body.estado },
      include: { evalOps: true, evalRRHH: true, evalCap: true, alertas: true, historial: true },
    })
    return NextResponse.json({ data: updated })
  }

  // ── Evaluaciones: según rol ──
  const stagePermissions: Record<UserRole, string[]> = {
    admin:       ['eval_ops', 'eval_rrhh', 'eval_cap'],
    operaciones: ['eval_ops'],
    rrhh:        ['eval_rrhh'],
    capacitacion:['eval_cap'],
  }

  if (!stagePermissions[role].includes(action)) {
    return NextResponse.json({ error: 'No tenés permiso para modificar esta etapa.' }, { status: 403 })
  }

  if (action === 'eval_ops') {
    await prisma.evalOperaciones.upsert({
      where: { candidatoId: params.id },
      create: { candidatoId: params.id, score: body.score, tecnica: body.tecnica, recomendado: body.recomendado, comentarios: body.comentarios, autorId, autorNombre },
      update: { score: body.score, tecnica: body.tecnica, recomendado: body.recomendado, comentarios: body.comentarios, autorId, autorNombre },
    })
  }

  if (action === 'eval_rrhh') {
    await prisma.evalRRHH.upsert({
      where: { candidatoId: params.id },
      create: { candidatoId: params.id, blandas: body.blandas, comunicacion: body.comunicacion, adaptabilidad: body.adaptabilidad, aptoC: body.aptoC, comentarios: body.comentarios, autorId, autorNombre },
      update: { blandas: body.blandas, comunicacion: body.comunicacion, adaptabilidad: body.adaptabilidad, aptoC: body.aptoC, comentarios: body.comentarios, autorId, autorNombre },
    })
  }

  if (action === 'eval_cap') {
    await prisma.evalCapacitacion.upsert({
      where: { candidatoId: params.id },
      create: { candidatoId: params.id, herramientas: body.herramientas, curva: body.curva, cumplimiento: body.cumplimiento, listo: body.listo, tieneAlerta: body.tieneAlerta, tipoAlerta: body.tipoAlerta ?? null, comentarios: body.comentarios, autorId, autorNombre },
      update: { herramientas: body.herramientas, curva: body.curva, cumplimiento: body.cumplimiento, listo: body.listo, tieneAlerta: body.tieneAlerta, tipoAlerta: body.tipoAlerta ?? null, comentarios: body.comentarios, autorId, autorNombre },
    })
  }

  // Recalcular riesgo
  const alertas = await prisma.alerta.findMany({ where: { candidatoId: params.id } })
  const nuevoRiesgo = calcularRiesgo(alertas)

  const updated = await prisma.candidato.update({
    where: { id: params.id },
    data: { riesgo: nuevoRiesgo },
    include: { evalOps: true, evalRRHH: true, evalCap: true, alertas: true, historial: true },
  })

  return NextResponse.json({ data: updated })
}
