// src/instrumentation.ts
// Runs once on server startup — adds missing DB columns idempotently

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  try {
    const { prisma } = await import('@/lib/prisma')

    const cols = [
      `ALTER TABLE "EvalOperaciones" ADD COLUMN IF NOT EXISTS "autorId" TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE "EvalOperaciones" ADD COLUMN IF NOT EXISTS "autorNombre" TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE "EvalRRHH" ADD COLUMN IF NOT EXISTS "autorId" TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE "EvalRRHH" ADD COLUMN IF NOT EXISTS "autorNombre" TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE "EvalCapacitacion" ADD COLUMN IF NOT EXISTS "autorId" TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE "EvalCapacitacion" ADD COLUMN IF NOT EXISTS "autorNombre" TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE "Alerta" ADD COLUMN IF NOT EXISTS "autorId" TEXT NOT NULL DEFAULT ''`,
      `ALTER TABLE "Alerta" ADD COLUMN IF NOT EXISTS "autorNombre" TEXT NOT NULL DEFAULT ''`,
    ]

    for (const sql of cols) {
      await prisma.$executeRawUnsafe(sql).catch(() => {})
    }
  } catch {
    // Non-fatal — app continues even if migration fails
  }
}
