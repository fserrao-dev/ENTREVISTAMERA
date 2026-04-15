// prisma/seed.ts
// Carga candidatos de prueba

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Limpiar datos existentes
  await prisma.historial.deleteMany()
  await prisma.alerta.deleteMany()
  await prisma.evalCapacitacion.deleteMany()
  await prisma.evalRRHH.deleteMany()
  await prisma.evalOperaciones.deleteMany()
  await prisma.candidato.deleteMany()

  const candidatos = [
    { nombre: 'Ana García López', dni: '30123456', puesto: 'Agente de ventas', campana: 'EDESUR' as const, estado: 'INGRESADO' as const },
    { nombre: 'Carlos Martínez', dni: '28456789', puesto: 'Operador call center', campana: 'AYSA' as const, estado: 'EN_CAPACITACION' as const },
    { nombre: 'María Rodríguez', dni: '32789012', puesto: 'Agente TLMK', campana: 'TLMK' as const, estado: 'EN_PROCESO' as const },
    { nombre: 'Diego Fernández', dni: '25345678', puesto: 'Analista', campana: 'ADT' as const, estado: 'RECHAZADO' as const },
    { nombre: 'Laura Pérez', dni: '33901234', puesto: 'Representante', campana: 'FARMACITY' as const, estado: 'EN_PROCESO' as const },
    { nombre: 'Pablo González', dni: '29567890', puesto: 'Ejecutivo', campana: 'CSV' as const, estado: 'EN_CAPACITACION' as const },
    { nombre: 'Sofía Torres', dni: '31234567', puesto: 'Agente', campana: 'MIRGOR' as const, estado: 'INGRESADO' as const },
  ]

  for (const c of candidatos) {
    await prisma.candidato.create({ data: c })
  }

  console.log(`✓ ${candidatos.length} candidatos creados.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
