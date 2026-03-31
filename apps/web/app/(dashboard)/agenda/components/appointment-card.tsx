import type { Appointment } from '../types'
import { STATUS_META, toHHMM } from '../types'

interface Props {
  appointment: Appointment
  onClick: (apt: Appointment) => void
  compact?: boolean
}

export default function AppointmentCard({ appointment, onClick, compact = false }: Props) {
  const meta = STATUS_META[appointment.status] ?? STATUS_META.AGENDADA

  return (
    <button
      onClick={() => onClick(appointment)}
      className="w-full rounded-md px-2 py-1.5 text-left transition-opacity hover:opacity-80"
      style={{
        backgroundColor: '#f0fffe',
        borderLeft: '3px solid #29d9d5',
      }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: '#29d9d5' }}>
          {toHHMM(appointment.datetime)}
        </span>
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
          style={{ backgroundColor: meta.bg, color: meta.color }}
        >
          {meta.label}
        </span>
      </div>
      <p className="truncate text-xs font-medium text-[#111111]">
        {appointment.patient.name}
      </p>
      {!compact && (
        <p className="truncate text-[11px] text-[#888888]">{appointment.service}</p>
      )}
    </button>
  )
}
