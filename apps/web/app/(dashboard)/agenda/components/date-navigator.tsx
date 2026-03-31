'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, getWeekStart, isoDate } from '../types'

interface Props {
  mode: 'day' | 'week'
  currentDate: Date
  onChange: (date: Date) => void
}

export default function DateNavigator({ mode, currentDate, onChange }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const goToday = () => onChange(new Date())

  const prev = () =>
    onChange(mode === 'day' ? addDays(currentDate, -1) : addDays(currentDate, -7))

  const next = () =>
    onChange(mode === 'day' ? addDays(currentDate, 1) : addDays(currentDate, 7))

  const label = () => {
    if (mode === 'day') {
      return currentDate.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    }
    const start = getWeekStart(currentDate)
    const end = addDays(start, 6)
    const fmtDay = (d: Date) => d.getDate().toString().padStart(2, '0')
    const fmtMonth = (d: Date) =>
      d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    if (start.getMonth() === end.getMonth()) {
      return `${fmtDay(start)} – ${fmtDay(end)} ${fmtMonth(start)} ${start.getFullYear()}`
    }
    return `${fmtDay(start)} ${fmtMonth(start)} – ${fmtDay(end)} ${fmtMonth(end)} ${end.getFullYear()}`
  }

  const isToday = isoDate(currentDate) === isoDate(today)

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prev}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8eaed] bg-white text-[#555555] hover:bg-[#f7f8fa]"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="min-w-48 text-center text-sm font-medium capitalize text-[#111111]">
        {label()}
      </span>

      <button
        onClick={next}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e8eaed] bg-white text-[#555555] hover:bg-[#f7f8fa]"
      >
        <ChevronRight size={16} />
      </button>

      {!isToday && (
        <button
          onClick={goToday}
          className="rounded-lg border border-[#e8eaed] bg-white px-3 py-1.5 text-xs font-medium text-[#555555] hover:bg-[#f7f8fa]"
        >
          Hoje
        </button>
      )}
    </div>
  )
}
