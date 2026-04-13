// prisma/schema.prisma
// MERA Tracker — Schema de base de datos
// Conectar a Supabase: DATABASE_URL en .env

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── ENUMS ───────────────────────────────────────────────

enum Campana {
  CSV
  TLMK
  EDESUR
  AYSA
  ADT
  CAR_ONE
  EDENRED
  FARMACITY
  LEBEN_SALUD
  STRIX
  MATER_DEI
  MIRGOR
  RIO_GAS
  DENTAL_TOTAL
}

enum EstadoCandidato {
  EN_PROCESO
  EN_CAPACITACION
  INGRESADO
  RECHAZADO
}

enum NivelRiesgo {
  BAJO
  MEDIO
  ALTO
}

enum TipoAlerta {
  TECNICA
  CONDUCTUAL
  ASISTENCIA
}

enum EtapaAlerta {
  OPERACIONES
  RRHH
  CAPACITACION
  GENERAL
}

// ─── CANDIDATO ───────────────────────────────────────────

model Candidato {
  id               String          @id @default(cuid())
  nombre           String
  dni              String          @unique
  puesto           String?
  campana          Campana
  estado           EstadoCandidato @default(EN_PROCESO)
  fechaPostulacion DateTime        @default(now())
  riesgo           NivelRiesgo     @default(BAJO)
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  // Relaciones
  evalOps     EvalOperaciones?
  evalRRHH    EvalRRHH?
  evalCap     EvalCapacitacion?
  alertas     Alerta[]
  historial   Historial[]

  @@index([campana])
  @@index([estado])
  @@index([riesgo])
  @@index([fechaPostulacion])
}

// ─── EVALUACIONES ────────────────────────────────────────

model EvalOperaciones {
  id           String     @id @default(cuid())
  candidatoId  String     @unique
  candidato    Candidato  @relation(fields: [candidatoId], references: [id], onDelete: Cascade)

  score        Int        // 1-5
  tecnica      Int        // 1-5
  recomendado  Boolean
  comentarios  String?

  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model EvalRRHH {
  id           String     @id @default(cuid())
  candidatoId  String     @unique
  candidato    Candidato  @relation(fields: [candidatoId], references: [id], onDelete: Cascade)

  blandas      Int        // 1-5
  comunicacion Int        // 1-5
  adaptabilidad Int       // 1-5
  aptoC        Boolean
  comentarios  String?

  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model EvalCapacitacion {
  id            String     @id @default(cuid())
  candidatoId   String     @unique
  candidato     Candidato  @relation(fields: [candidatoId], references: [id], onDelete: Cascade)

  herramientas  Int        // 1-5
  curva         Int        // 1-5
  cumplimiento  Int        // 1-5
  listo         Boolean
  tieneAlerta   Boolean    @default(false)
  tipoAlerta    TipoAlerta?
  comentarios   String?

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

// ─── ALERTAS ─────────────────────────────────────────────

model Alerta {
  id           String      @id @default(cuid())
  candidatoId  String
  candidato    Candidato   @relation(fields: [candidatoId], references: [id], onDelete: Cascade)

  etapa        EtapaAlerta
  tipo         TipoAlerta
  descripcion  String
  esDeEstado   Boolean     @default(false) // alertas de cambio de estado (internas)

  createdAt    DateTime    @default(now())

  @@index([candidatoId])
  @@index([etapa])
  @@index([tipo])
}

// ─── HISTORIAL ───────────────────────────────────────────

model Historial {
  id           String    @id @default(cuid())
  candidatoId  String
  candidato    Candidato @relation(fields: [candidatoId], references: [id], onDelete: Cascade)

  evento       String    // descripción del evento
  detalle      String?
  color        String    @default("blue") // green | yellow | red | blue | purple

  createdAt    DateTime  @default(now())

  @@index([candidatoId])
}
