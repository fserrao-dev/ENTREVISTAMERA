// src/lib/prisma.ts
// Singleton de Prisma + parches de schema idempotentes que corren una vez por proceso

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  schemaPromise: Promise<void> | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

const SCHEMA_PATCHES = [
  `ALTER TABLE "EvalOperaciones" ADD COLUMN IF NOT EXISTS "autorId" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "EvalOperaciones" ADD COLUMN IF NOT EXISTS "autorNombre" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "EvalRRHH" ADD COLUMN IF NOT EXISTS "autorId" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "EvalRRHH" ADD COLUMN IF NOT EXISTS "autorNombre" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "EvalCapacitacion" ADD COLUMN IF NOT EXISTS "autorId" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "EvalCapacitacion" ADD COLUMN IF NOT EXISTS "autorNombre" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "Alerta" ADD COLUMN IF NOT EXISTS "autorId" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "Alerta" ADD COLUMN IF NOT EXISTS "autorNombre" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "Candidato" ADD COLUMN IF NOT EXISTS "legajo" TEXT`,
  `ALTER TABLE "Candidato" ADD COLUMN IF NOT EXISTS "fechaFinCapa" TIMESTAMP(3)`,
]

export function ensureSchema(): Promise<void> {
  if (!globalForPrisma.schemaPromise) {
    globalForPrisma.schemaPromise = (async () => {
      for (const sql of SCHEMA_PATCHES) {
        await prisma.$executeRawUnsafe(sql).catch(() => {})
      }
    })()
  }
  return globalForPrisma.schemaPromise
}
