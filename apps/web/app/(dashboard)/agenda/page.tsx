'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import type { Appointment } from './types'
import { addDays, getWeekStart, isoDate } from './types'
import api from '@/lib/api'

import DateNavigator from './components/date-navigator'
import CalendarDay from './components/calendar-day'
import CalendarWeek from './components/calendar-week'
import NewAppointmentModal from './components/new-appointment-modal'
import AppointmentDetailModal from './components/appointment-detail-modal'

type ViewMode = 'day' | 'week'

export default function AgendaPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [newModal, setNewModal] = useState<{ open: boolean; date?: string; time?: string }>({
    open: false,
  })
  const [detailApt, setDetailApt] = useState<Appointment | null>(null)

  // ─── Fetch appointments ──────────────────────────────────────────────────

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      let params: string
      if (viewMode === 'day') {
        params = `date=${isoDate(currentDate)}`
      } else {
        const weekStart = getWeekStart(currentDate)
        const weekEnd = addDays(weekStart, 6)
        params = `dateFrom=${isoDate(weekStart)}&dateTo=${isoDate(weekEnd)}`
      }
      const res = await api.get<{ data: Appointment[] }>(`/api/appointments?${params}`)
      setAppointments(res.data.data)
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [currentDate, viewMode])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSlotClick = (date: string, time: string) => {
    setNewModal({ open: true, date, time })
  }

  const handleAppointmentClick = (apt: Appointment) => {
    setDetailApt(apt)
  }

  const handleCreated = (apt: Appointment) => {
    setAppointments((prev) =>
      [...prev, apt].sort((a, b) => a.datetime.localeCompare(b.datetime)),
    )
  }

  const handleUpdated = (updated: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#f7f8fa]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8eaed] bg-white px-4 py-3 lg:px-6">
        <DateNavigator mode={viewMode} currentDate={currentDate} onChange={setCurrentDate} />

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-[#e8eaed] bg-white p-0.5">
            {(['day', 'week'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: viewMode === mode ? '#f0fffe' : 'transparent',
                  color: viewMode === mode ? '#1fb8b4' : '#888888',
                }}
              >
                {mode === 'day' ? 'Dia' : 'Semana'}
              </button>
            ))}
          </div>

          {/* New appointment button */}
          <button
            onClick={() => setNewModal({ open: true, date: isoDate(currentDate) })}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#29d9d5' }}
          >
            <Plus size={16} />
            Nova Consulta
          </button>
        </div>
      </div>

      {/* Calendar area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2"
              style={{ borderColor: '#29d9d5', borderTopColor: 'transparent' }}
            />
          </div>
        ) : viewMode === 'day' ? (
          <CalendarDay
            date={currentDate}
            appointments={appointments}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        ) : (
          <CalendarWeek
            currentDate={currentDate}
            appointments={appointments}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        )}
      </div>

      {/* Modals */}
      <NewAppointmentModal
        isOpen={newModal.open}
        defaultDate={newModal.date}
        defaultTime={newModal.time}
        onClose={() => setNewModal({ open: false })}
        onCreated={handleCreated}
      />

      {detailApt && (
        <AppointmentDetailModal
          appointment={detailApt}
          onClose={() => setDetailApt(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}
