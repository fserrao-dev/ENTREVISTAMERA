// src/app/api/alertas/route.ts
// GET: todas las alertas reales | POST: crear alerta

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calcularRiesgo } from '@/lib/utils'

export async function GET() {
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
  const body = await request.json()
  const { candidatoId, etapa, tipo, descripcion } = body

  if (!candidatoId || !etapa || !tipo || !descripcion?.trim()) {
    return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 })
  }

  const alerta = await prisma.alerta.create({
    data: { candidatoId, etapa, tipo, descripcion: descripcion.trim(), esDeEstado: false },
  })

  const todasAlertas = await prisma.alerta.findMany({ where: { candidatoId } })
  const nuevoRiesgo = calcularRiesgo(todasAlertas)
  await prisma.candidato.update({ where: { id: candidatoId }, data: { riesgo: nuevoRiesgo } })

  return NextResponse.json({ data: alerta }, { status: 201 })
}
