'use client'

import { Calendar } from 'lucide-react'

export interface DateRange {
  dateFrom: string
  dateTo: string
}

interface Shortcut {
  label: string
  getDates: () => DateRange
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

const SHORTCUTS: Shortcut[] = [
  {
    label: '7 dias',
    getDates: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 6)
      return { dateFrom: isoDate(from), dateTo: isoDate(to) }
    },
  },
  {
    label: '30 dias',
    getDates: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 29)
      return { dateFrom: isoDate(from), dateTo: isoDate(to) }
    },
  },
  {
    label: '3 meses',
    getDates: () => {
      const to = new Date()
      const from = new Date()
      from.setMonth(from.getMonth() - 3)
      return { dateFrom: isoDate(from), dateTo: isoDate(to) }
    },
  },
  {
    label: '6 meses',
    getDates: () => {
      const to = new Date()
      const from = new Date()
      from.setMonth(from.getMonth() - 6)
      return { dateFrom: isoDate(from), dateTo: isoDate(to) }
    },
  },
  {
    label: 'Este ano',
    getDates: () => {
      const now = new Date()
      return {
        dateFrom: `${now.getFullYear()}-01-01`,
        dateTo: isoDate(now),
      }
    },
  },
]

interface Props {
  value: DateRange
  onChange: (range: DateRange) => void
}

export default function DateRangePicker({ value, onChange }: Props) {
  const activeShortcut = SHORTCUTS.find((s) => {
    const d = s.getDates()
    return d.dateFrom === value.dateFrom && d.dateTo === value.dateTo
  })

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Shortcut buttons */}
      <div className="flex gap-1 rounded-xl border border-[#e8eaed] bg-white p-1">
        {SHORTCUTS.map((s) => {
          const isActive = activeShortcut?.label === s.label
          return (
            <button
              key={s.label}
              onClick={() => onChange(s.getDates())}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: isActive ? '#29d9d5' : 'transparent',
                color: isActive ? 'white' : '#555555',
              }}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Custom range */}
      <div className="flex items-center gap-1.5 rounded-xl border border-[#e8eaed] bg-white px-3 py-2">
        <Calendar size={13} className="text-[#aaaaaa]" />
        <input
          type="date"
          value={value.dateFrom}
          onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
          className="text-sm text-[#111111] focus:outline-none"
        />
        <span className="text-xs text-[#aaaaaa]">—</span>
        <input
          type="date"
          value={value.dateTo}
          onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
          className="text-sm text-[#111111] focus:outline-none"
        />
      </div>
    </div>
  )
}
