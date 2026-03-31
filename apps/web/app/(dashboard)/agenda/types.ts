export type AppointmentStatus =
  | 'AGENDADA'
  | 'CONFIRMADA'
  | 'CONCLUIDA'
  | 'CANCELADA'
  | 'FALTA'

export type Appointment = {
  id: string
  datetime: string
  patientId: string
  patient: { id: string; name: string; phone: string; email?: string }
  dentistId: string
  service: string
  duration: number
  status: AppointmentStatus
  notes?: string | null
}

export type PatientSuggestion = {
  id: string
  name: string
  phone: string
  email?: string | null
}

export type DentistOption = {
  id: string
  name: string
  email: string
  role: string
}

export const STATUS_META: Record<
  AppointmentStatus,
  { label: string; bg: string; color: string }
> = {
  AGENDADA:   { label: 'Agendada',   bg: '#fff8e6', color: '#b07d00' },
  CONFIRMADA: { label: 'Confirmada', bg: '#e8fffe', color: '#1fb8b4' },
  CONCLUIDA:  { label: 'Concluída',  bg: '#f0faf4', color: '#2a9d5c' },
  CANCELADA:  { label: 'Cancelada',  bg: '#fef2f2', color: '#dc2626' },
  FALTA:      { label: 'Falta',      bg: '#fef2f2', color: '#dc2626' },
}

export const HOURS = Array.from({ length: 10 }, (_, i) => i + 8) // 8..17

export function toHHMM(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function toLocalDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function getWeekStart(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export function addDays(d: Date, n: number): Date {
  const result = new Date(d)
  result.setDate(result.getDate() + n)
  return result
}
