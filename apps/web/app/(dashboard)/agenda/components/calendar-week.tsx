import type { Appointment } from '../types'
import { HOURS, addDays, getWeekStart, isoDate } from '../types'
import AppointmentCard from './appointment-card'

interface Props {
  currentDate: Date
  appointments: Appointment[]
  onSlotClick: (date: string, time: string) => void
  onAppointmentClick: (apt: Appointment) => void
}

export default function CalendarWeek({
  currentDate,
  appointments,
  onSlotClick,
  onAppointmentClick,
}: Props) {
  const weekStart = getWeekStart(currentDate)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const todayStr = isoDate(new Date())

  // Group appointments by date+hour key
  const byKey: Record<string, Appointment[]> = {}
  for (const apt of appointments) {
    const d = new Date(apt.datetime)
    const key = `${isoDate(d)}_${d.getHours()}`
    if (!byKey[key]) byKey[key] = []
    byKey[key].push(apt)
  }

  const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8eaed] bg-white">
      {/* Header row */}
      <div className="grid border-b border-[#e8eaed]" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
        {/* Corner */}
        <div className="border-r border-[#e8eaed] py-2" />
        {days.map((day, i) => {
          const ds = isoDate(day)
          const isToday = ds === todayStr
          return (
            <div
              key={ds}
              className="border-r border-[#e8eaed] px-1 py-2 text-center last:border-r-0"
              style={{ backgroundColor: isToday ? '#f0fffe' : undefined }}
            >
              <p
                className="text-[11px] font-medium"
                style={{ color: isToday ? '#29d9d5' : '#888888' }}
              >
                {DAY_NAMES[i]}
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: isToday ? '#1fb8b4' : '#111111' }}
              >
                {day.getDate().toString().padStart(2, '0')}
              </p>
            </div>
          )
        })}
      </div>

      {/* Time rows */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {HOURS.map((hour) => {
          const timeStr = `${hour.toString().padStart(2, '0')}:00`
          return (
            <div
              key={hour}
              className="grid border-b border-[#e8eaed] last:border-b-0"
              style={{ gridTemplateColumns: '64px repeat(7, 1fr)', minHeight: 72 }}
            >
              {/* Time label */}
              <div className="flex items-start justify-center border-r border-[#e8eaed] pt-2">
                <span className="text-[11px] text-[#aaaaaa]">{timeStr}</span>
              </div>

              {/* Day cells */}
              {days.map((day) => {
                const ds = isoDate(day)
                const isToday = ds === todayStr
                const key = `${ds}_${hour}`
                const cellApts = byKey[key] ?? []
                const isEmpty = cellApts.length === 0

                return (
                  <div
                    key={ds}
                    className={`border-r border-[#e8eaed] p-1 last:border-r-0 ${
                      isEmpty ? 'cursor-pointer hover:bg-[#f7f8fa]' : ''
                    }`}
                    style={{ backgroundColor: isToday && isEmpty ? '#fafffe' : undefined }}
                    onClick={() => isEmpty && onSlotClick(ds, timeStr)}
                  >
                    {cellApts.map((apt) => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        onClick={onAppointmentClick}
                        compact
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
