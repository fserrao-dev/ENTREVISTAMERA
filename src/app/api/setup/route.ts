// src/app/api/setup/route.ts
// GET: aplica columnas faltantes a la DB y reporta resultado

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const PATCHES = [
  `ALTER TABLE "Candidato" ADD COLUMN IF NOT EXISTS "legajo" TEXT`,
  `ALTER TABLE "Candidato" ADD COLUMN IF NOT EXISTS "fechaFinCapa" TIMESTAMP(3)`,
  `ALTER TABLE "EvalOperaciones" ADD COLUMN IF NOT EXISTS "autorId" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "EvalOperaciones" ADD COLUMN IF NOT EXISTS "autorNombre" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "EvalRRHH" ADD COLUMN IF NOT EXISTS "autorId" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "EvalRRHH" ADD COLUMN IF NOT EXISTS "autorNombre" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "EvalCapacitacion" ADD COLUMN IF NOT EXISTS "autorId" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "EvalCapacitacion" ADD COLUMN IF NOT EXISTS "autorNombre" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "Alerta" ADD COLUMN IF NOT EXISTS "autorId" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "Alerta" ADD COLUMN IF NOT EXISTS "autorNombre" TEXT NOT NULL DEFAULT ''`,
]

export async function GET() {
  const directUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL
  const results: { sql: string; ok: boolean; error?: string }[] = []

  const db = new PrismaClient({ datasources: { db: { url: directUrl } } })
  try {
    for (const sql of PATCHES) {
      try {
        await db.$executeRawUnsafe(sql)
        results.push({ sql, ok: true })
      } catch (e: unknown) {
        results.push({ sql, ok: false, error: (e as Error).message })
      }
    }
  } finally {
    await db.$disconnect()
  }

  const allOk = results.every(r => r.ok)
  return NextResponse.json({ allOk, results }, { status: allOk ? 200 : 207 })
}
