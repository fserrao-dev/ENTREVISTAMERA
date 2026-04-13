// prisma/seed.ts
// Ejecutar con: npm run db:seed

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding MERA Tracker...')

  // Limpiar todo primero
  await prisma.historial.deleteMany()
  await prisma.alerta.deleteMany()
  await prisma.evalCapacitacion.deleteMany()
  await prisma.evalRRHH.deleteMany()
  await prisma.evalOperaciones.deleteMany()
  await prisma.candidato.deleteMany()

  // ── Federico Serrao — ADT — RIESGO ALTO ──
  const federico = await prisma.candidato.create({
    data: {
      nombre: 'Federico Serrao', dni: '37241100', puesto: 'Agente Contact Center',
      campana: 'ADT', estado: 'INGRESADO', riesgo: 'ALTO',
      fechaPostulacion: new Date('2024-01-15'),
      evalOps: { create: { score: 5, tecnica: 4, recomendado: true, comentarios: 'Gran perfil, muy proactivo.' } },
      evalRRHH: { create: { blandas: 5, comunicacion: 5, adaptabilidad: 4, aptoC: true, comentarios: 'Excelente fit cultural.' } },
      evalCap: { create: { herramientas: 2, curva: 3, cumplimiento: 4, listo: false, tieneAlerta: true, tipoAlerta: 'TECNICA', comentarios: 'Problemas con herramientas CRM.' } },
      alertas: { create: [{ etapa: 'CAPACITACION', tipo: 'TECNICA', descripcion: 'Dificultades con sistema CRM', esDeEstado: false }] },
      historial: { create: [
        { evento: 'Candidato creado', detalle: 'Postulación registrada para campaña ADT', color: 'blue' },
        { evento: 'Evaluación Operaciones', detalle: 'Score 5/5 — Recomendado', color: 'blue' },
        { evento: 'Evaluación RRHH', detalle: 'Blandas 5/5 — Apto Cultural', color: 'purple' },
        { evento: 'Evaluación Capacitación', detalle: 'Herramientas 2/5 — No listo', color: 'red' },
        { evento: '✅ Ingresó', detalle: 'Incorporado como Agente Contact Center en campaña ADT', color: 'green' },
      ]},
    },
  })

  // ── Luciana Torres — TLMK ──
  await prisma.candidato.create({
    data: {
      nombre: 'Luciana Torres', dni: '38500222', puesto: 'Agente Telemarketing',
      campana: 'TLMK', estado: 'EN_CAPACITACION', riesgo: 'BAJO',
      fechaPostulacion: new Date('2024-01-20'),
      evalOps: { create: { score: 4, tecnica: 4, recomendado: true, comentarios: 'Buen perfil comercial.' } },
      evalRRHH: { create: { blandas: 3, comunicacion: 3, adaptabilidad: 4, aptoC: true, comentarios: 'OK.' } },
      evalCap: { create: { herramientas: 4, curva: 4, cumplimiento: 3, listo: false, tieneAlerta: false, comentarios: 'Buen ritmo de aprendizaje.' } },
      historial: { create: [
        { evento: 'Candidato creado', color: 'blue' },
        { evento: 'Evaluación Operaciones', detalle: 'Score 4/5 — Recomendado', color: 'blue' },
      ]},
    },
  })

  // ── Marcos Villalba — EDESUR — RIESGO ALTO, RECHAZADO ──
  await prisma.candidato.create({
    data: {
      nombre: 'Marcos Villalba', dni: '39100400', puesto: 'Agente Atención',
      campana: 'EDESUR', estado: 'RECHAZADO', riesgo: 'ALTO',
      fechaPostulacion: new Date('2024-01-22'),
      evalOps: { create: { score: 2, tecnica: 2, recomendado: false, comentarios: 'No cumple perfil técnico.' } },
      evalRRHH: { create: { blandas: 2, comunicacion: 2, adaptabilidad: 2, aptoC: false, comentarios: 'Actitud defensiva en entrevista.' } },
      alertas: { create: [
        { etapa: 'RRHH', tipo: 'CONDUCTUAL', descripcion: 'Actitud conflictiva en entrevista', esDeEstado: false },
        { etapa: 'OPERACIONES', tipo: 'TECNICA', descripcion: 'No alcanza mínimos técnicos requeridos', esDeEstado: false },
      ]},
      historial: { create: [
        { evento: 'Candidato creado', color: 'blue' },
        { evento: '⚠ Alerta — RRHH', detalle: '[CONDUCTUAL] Actitud conflictiva', color: 'red' },
        { evento: '✗ Rechazado', detalle: 'No superó el proceso de selección', color: 'red' },
      ]},
    },
  })

  // ── Valentina Ríos — FARMACITY — INGRESADA ──
  await prisma.candidato.create({
    data: {
      nombre: 'Valentina Ríos', dni: '40200150', puesto: 'Agente CSR',
      campana: 'FARMACITY', estado: 'INGRESADO', riesgo: 'BAJO',
      fechaPostulacion: new Date('2024-02-01'),
      evalOps: { create: { score: 4, tecnica: 5, recomendado: true, comentarios: 'Muy buena trayectoria.' } },
      evalRRHH: { create: { blandas: 5, comunicacion: 5, adaptabilidad: 5, aptoC: true, comentarios: 'Perfil sobresaliente.' } },
      evalCap: { create: { herramientas: 5, curva: 5, cumplimiento: 5, listo: true, tieneAlerta: false, comentarios: 'Lista para piso desde el día 3.' } },
      historial: { create: [
        { evento: 'Candidato creado', color: 'blue' },
        { evento: 'Evaluación Operaciones', detalle: 'Score 4/5 — Recomendado', color: 'blue' },
        { evento: 'Evaluación RRHH', detalle: 'Blandas 5/5 — Apto Cultural', color: 'purple' },
        { evento: 'Evaluación Capacitación', detalle: 'Herramientas 5/5 — Lista para piso', color: 'green' },
        { evento: '✅ Ingresó', color: 'green' },
      ]},
    },
  })

  // ── Rodrigo Mendez — MIRGOR ──
  await prisma.candidato.create({
    data: {
      nombre: 'Rodrigo Mendez', dni: '41300700', puesto: 'Agente Cobranzas',
      campana: 'MIRGOR', estado: 'EN_PROCESO', riesgo: 'MEDIO',
      fechaPostulacion: new Date('2024-02-05'),
      evalOps: { create: { score: 3, tecnica: 3, recomendado: true, comentarios: 'Perfil aceptable.' } },
      evalRRHH: { create: { blandas: 4, comunicacion: 4, adaptabilidad: 3, aptoC: true, comentarios: 'Buen potencial.' } },
      evalCap: { create: { herramientas: 2, curva: 2, cumplimiento: 3, listo: false, tieneAlerta: true, tipoAlerta: 'TECNICA', comentarios: 'Bajo rendimiento en simulaciones.' } },
      alertas: { create: [{ etapa: 'CAPACITACION', tipo: 'TECNICA', descripcion: 'Bajo rendimiento en simulaciones de atención', esDeEstado: false }] },
      historial: { create: [{ evento: 'Candidato creado', color: 'blue' }] },
    },
  })

  // ── Sabrina Castro — AYSA ──
  await prisma.candidato.create({
    data: {
      nombre: 'Sabrina Castro', dni: '42100900', puesto: 'Agente Atención',
      campana: 'AYSA', estado: 'EN_CAPACITACION', riesgo: 'BAJO',
      fechaPostulacion: new Date('2024-02-08'),
      evalOps: { create: { score: 5, tecnica: 4, recomendado: true, comentarios: 'Excelente perfil.' } },
      evalRRHH: { create: { blandas: 5, comunicacion: 5, adaptabilidad: 5, aptoC: true, comentarios: 'Ideal.' } },
      evalCap: { create: { herramientas: 4, curva: 5, cumplimiento: 5, listo: true, tieneAlerta: false, comentarios: 'Rápida curva de aprendizaje.' } },
      historial: { create: [{ evento: 'Candidato creado', color: 'blue' }] },
    },
  })

  // ── Diego Herrera — CSV ──
  await prisma.candidato.create({
    data: {
      nombre: 'Diego Herrera', dni: '39800300', puesto: 'Agente CSR',
      campana: 'CSV', estado: 'INGRESADO', riesgo: 'MEDIO',
      fechaPostulacion: new Date('2024-01-10'),
      evalOps: { create: { score: 4, tecnica: 3, recomendado: true, comentarios: 'Buena actitud.' } },
      evalRRHH: { create: { blandas: 2, comunicacion: 3, adaptabilidad: 2, aptoC: false, comentarios: 'Poca adaptabilidad al cambio.' } },
      evalCap: { create: { herramientas: 3, curva: 3, cumplimiento: 4, listo: true, tieneAlerta: false, comentarios: 'Mejoró durante capacitación.' } },
      alertas: { create: [{ etapa: 'RRHH', tipo: 'CONDUCTUAL', descripcion: 'Baja adaptabilidad al cambio detectada en entrevista', esDeEstado: false }] },
      historial: { create: [{ evento: 'Candidato creado', color: 'blue' }, { evento: '✅ Ingresó', color: 'green' }] },
    },
  })

  console.log('✅ Seed completado — 7 candidatos cargados')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
