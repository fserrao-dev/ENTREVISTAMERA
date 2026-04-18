// src/app/api/alertas/route.ts
// GET: todas las alertas reales | POST: crear alerta (todos los roles)

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { calcularRiesgo } from '@/lib/utils'

export async function GET(_req: NextRequest) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const alertas = await prisma.alerta.findMany({
    where: { esDeEstado: false },
    orderBy: { createdAt: 'desc' },
    include: {
      candidato: { select: { id: true, nombre: true, dni: true, campana: true } },
    },
  })

  return NextResponse.json({ data: alertas })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { candidatoId, etapa, tipo, descripcion } = body

  if (!candidatoId || !etapa || !tipo || !descripcion?.trim()) {
    return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 })
  }

  const autorId = user.id
  const autorNombre = user.user_metadata?.nombre || user.email || ''

  const alerta = await prisma.alerta.create({
    data: { candidatoId, etapa, tipo, descripcion: descripcion.trim(), esDeEstado: false, autorId, autorNombre },
  })

  // Recalcular riesgo
  const todasAlertas = await prisma.alerta.findMany({ where: { candidatoId } })
  const nuevoRiesgo = calcularRiesgo(todasAlertas)
  await prisma.candidato.update({ where: { id: candidatoId }, data: { riesgo: nuevoRiesgo } })

  return NextResponse.json({ data: alerta }, { status: 201 })
}
