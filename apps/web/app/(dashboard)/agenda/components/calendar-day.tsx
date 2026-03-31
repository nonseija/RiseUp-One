import type { Appointment } from '../types'
import { HOURS, isoDate } from '../types'
import AppointmentCard from './appointment-card'

interface Props {
  date: Date
  appointments: Appointment[]
  onSlotClick: (date: string, time: string) => void
  onAppointmentClick: (apt: Appointment) => void
}

export default function CalendarDay({ date, appointments, onSlotClick, onAppointmentClick }: Props) {
  const dayStr = isoDate(date)

  // Group appointments by start hour
  const byHour: Record<number, Appointment[]> = {}
  for (const apt of appointments) {
    const h = new Date(apt.datetime).getHours()
    if (!byHour[h]) byHour[h] = []
    byHour[h].push(apt)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8eaed] bg-white">
      {/* Header */}
      <div
        className="border-b border-[#e8eaed] px-4 py-3"
        style={{ backgroundColor: '#f0fffe' }}
      >
        <p className="text-sm font-semibold capitalize" style={{ color: '#29d9d5' }}>
          {date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
          })}
        </p>
        <p className="text-xs text-[#888888]">
          {appointments.length} consulta{appointments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Time grid */}
      <div>
        {HOURS.map((hour) => {
          const timeStr = `${hour.toString().padStart(2, '0')}:00`
          const slotApts = byHour[hour] ?? []
          const isEmpty = slotApts.length === 0

          return (
            <div
              key={hour}
              className="flex border-b border-[#e8eaed] last:border-b-0"
              style={{ minHeight: 64 }}
            >
              {/* Time label */}
              <div className="flex w-16 flex-shrink-0 items-start justify-center pt-2">
                <span className="text-[11px] text-[#aaaaaa]">{timeStr}</span>
              </div>

              {/* Slot area */}
              <div
                className={`flex-1 border-l border-[#e8eaed] p-1.5 ${
                  isEmpty ? 'cursor-pointer hover:bg-[#f7f8fa]' : ''
                }`}
                onClick={() => isEmpty && onSlotClick(dayStr, timeStr)}
              >
                {isEmpty ? (
                  <div className="flex h-full items-center">
                    <span className="text-[11px] text-[#cccccc]">Horário livre</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {slotApts.map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        onClick={onAppointmentClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
