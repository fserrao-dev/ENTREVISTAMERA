// src/types/index.ts

export type Campana =
  | 'CSV' | 'TLMK' | 'EDESUR' | 'AYSA' | 'ADT' | 'CAR_ONE'
  | 'EDENRED' | 'FARMACITY' | 'LEBEN_SALUD' | 'STRIX'
  | 'MATER_DEI' | 'MIRGOR' | 'RIO_GAS' | 'DENTAL_TOTAL'

export type EstadoCandidato =
  | 'EN_PROCESO' | 'EN_CAPACITACION' | 'INGRESADO' | 'RECHAZADO'

export type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO'
export type TipoAlerta = 'TECNICA' | 'CONDUCTUAL' | 'ASISTENCIA'
export type EtapaAlerta = 'OPERACIONES' | 'RRHH' | 'CAPACITACION' | 'GENERAL'

export type UserRole = 'admin' | 'rrhh' | 'operaciones' | 'capacitacion'

export interface EvalOps {
  id: string
  score: number
  tecnica: number
  recomendado: boolean
  comentarios?: string | null
  updatedAt: string
}

export interface EvalRRHH {
  id: string
  blandas: number
  comunicacion: number
  adaptabilidad: number
  aptoC: boolean
  comentarios?: string | null
  updatedAt: string
}

export interface EvalCap {
  id: string
  herramientas: number
  curva: number
  cumplimiento: number
  listo: boolean
  tieneAlerta: boolean
  tipoAlerta?: TipoAlerta | null
  comentarios?: string | null
  updatedAt: string
}

export interface Alerta {
  id: string
  etapa: EtapaAlerta
  tipo: TipoAlerta
  descripcion: string
  esDeEstado: boolean
  createdAt: string
}

export interface Historial {
  id: string
  evento: string
  detalle?: string | null
  color: string
  createdAt: string
}

export interface Candidato {
  id: string
  nombre: string
  dni: string
  campana: Campana
  estado: EstadoCandidato
  fechaPostulacion: string
  riesgo: NivelRiesgo
  createdAt: string
  updatedAt: string
  evalOps?: EvalOps | null
  evalRRHH?: EvalRRHH | null
  evalCap?: EvalCap | null
  alertas: Alerta[]
  historial: Historial[]
}

// ─── LABELS ─────────────────────────────────────────────

export const CAMPANA_LABELS: Record<Campana, string> = {
  CSV: 'CSV', TLMK: 'TLMK', EDESUR: 'EDESUR', AYSA: 'AYSA',
  ADT: 'ADT', CAR_ONE: 'CAR ONE', EDENRED: 'EDENRED',
  FARMACITY: 'FARMACITY', LEBEN_SALUD: 'LEBEN SALUD', STRIX: 'STRIX',
  MATER_DEI: 'MATER DEI', MIRGOR: 'MIRGOR', RIO_GAS: 'RIO GAS',
  DENTAL_TOTAL: 'DENTAL TOTAL',
}

export const ESTADO_LABELS: Record<EstadoCandidato, string> = {
  EN_PROCESO: 'En proceso',
  EN_CAPACITACION: 'En capacitación',
  INGRESADO: 'Ingresado',
  RECHAZADO: 'Rechazado',
}

export const ALERTA_TIPO_LABELS: Record<TipoAlerta, string> = {
  TECNICA: 'Técnica',
  CONDUCTUAL: 'Conductual',
  ASISTENCIA: 'Asistencia',
}

export const ETAPA_LABELS: Record<EtapaAlerta, string> = {
  OPERACIONES: 'Operaciones',
  RRHH: 'RRHH',
  CAPACITACION: 'Capacitación',
  GENERAL: 'General',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  rrhh: 'RRHH',
  operaciones: 'Operaciones',
  capacitacion: 'Capacitación',
}

// ─── FILTROS ─────────────────────────────────────────────

export interface FiltrosCandidatos {
  campana?: Campana
  estado?: EstadoCandidato
  alerta?: 'con' | 'sin'
  search?: string
  desde?: string
  hasta?: string
}

// ─── API RESPONSES ───────────────────────────────────────

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface DashboardStats {
  total: number
  ingresados: number
  conAlerta: number
  riesgoAlto: number
  ingresadosConAlerta: number
  pctConversion: number
  pctRiesgoEnIngresados: number
  avgScoreOps: number
  avgScoreRRHH: number
  avgScoreCap: number
  completitudOps: number
  completitudRRHH: number
  completitudCap: number
  porCampana: { campana: Campana; total: number; conAlerta: number }[]
  porEstado: { estado: EstadoCandidato; total: number }[]
}
