'use client'

import { useState } from 'react'

interface Props {
  selected: string    // YYYY-MM-DD
  onSelect: (date: string) => void
  workingDays: number[]  // 0=Sun..6=Sat
  primaryColor: string
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function pad(n: number) { return String(n).padStart(2, '0') }

export default function DateSelector({ selected, onSelect, workingDays, primaryColor }: Props) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1) // 1-12

  const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
    else setViewMonth(m => m + 1)
  }

  function isDisabled(day: number) {
    const date = new Date(viewYear, viewMonth - 1, day)
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (date < todayMidnight) return true
    if (!workingDays.includes(date.getDay())) return true
    return false
  }

  function toIso(day: number) {
    return `${viewYear}-${pad(viewMonth)}-${pad(day)}`
  }

  // Can't go to a past month
  const isPrevDisabled =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth() + 1)

  return (
    <div>
      <p className="mb-3 text-sm text-[#888888]">Selecione uma data disponível:</p>
      <div className="rounded-xl border border-[#e8eaed] bg-white p-4">
        {/* Month navigation */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={prevMonth}
            disabled={isPrevDisabled}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#888888] transition hover:bg-[#f0f0f0] disabled:opacity-30"
          >
            ‹
          </button>
          <span className="text-sm font-semibold text-[#111111]">
            {MONTHS[viewMonth - 1]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#888888] transition hover:bg-[#f0f0f0]"
          >
            ›
          </button>
        </div>

        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 text-center">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-xs font-medium text-[#888888]">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const iso = toIso(day)
            const disabled = isDisabled(day)
            const isSelected = selected === iso

            return (
              <button
                key={day}
                disabled={disabled}
                onClick={() => onSelect(iso)}
                className="flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition"
                style={{
                  backgroundColor: isSelected ? primaryColor : 'transparent',
                  color: isSelected ? '#ffffff' : disabled ? '#cccccc' : '#111111',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
