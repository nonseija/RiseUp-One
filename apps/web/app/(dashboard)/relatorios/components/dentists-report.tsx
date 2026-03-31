'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface Dentist {
  id: string
  name: string
  totalAppointments: number
  concluded: number
  canceled: number
  attendanceRate: number
  revenue: number
  avgAppointmentsPerDay: number
}

interface DentistsData {
  dentists: Dentist[]
}

type SortKey = keyof Omit<Dentist, 'id' | 'name'>

interface Props { data: DentistsData | null; isLoading: boolean }

function AttendanceBar({ rate }: { rate: number }) {
  const color = rate >= 85 ? '#2a9d5c' : rate >= 70 ? '#f59e0b' : '#dc2626'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#f0f0f0]">
        <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{rate}%</span>
    </div>
  )
}

export default function DentistsReport({ data, isLoading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('totalAppointments')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...(data?.dentists ?? [])].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1
    return (a[sortKey] - b[sortKey]) * mul
  })

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === 'asc'
        ? <ChevronUp size={12} style={{ color: '#29d9d5' }} />
        : <ChevronDown size={12} style={{ color: '#29d9d5' }} />
      : <ChevronDown size={12} className="text-[#e8eaed]" />

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-[#f7f8fa]" />
  }

  if (sorted.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-[#e8eaed] bg-white">
        <p className="text-sm text-[#aaaaaa]">Nenhum dentista com dados no período</p>
      </div>
    )
  }

  const cols: { key: SortKey; label: string }[] = [
    { key: 'totalAppointments', label: 'Consultas' },
    { key: 'concluded', label: 'Concluídas' },
    { key: 'canceled', label: 'Canceladas' },
    { key: 'attendanceRate', label: 'Presença' },
    { key: 'revenue', label: 'Faturamento' },
    { key: 'avgAppointmentsPerDay', label: 'Méd./dia' },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8eaed] bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e8eaed] bg-[#f7f8fa]">
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Dentista</th>
            {cols.map((c) => (
              <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">
                <button
                  onClick={() => toggleSort(c.key)}
                  className="flex items-center gap-1 hover:text-[#29d9d5]"
                >
                  {c.label}
                  <SortIcon k={c.key} />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((d, i) => (
            <tr
              key={d.id}
              className={`border-b border-[#f0f0f0] hover:bg-[#f7f8fa] ${i === sorted.length - 1 ? 'border-0' : ''}`}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: '#29d9d5' }}
                  >
                    {d.name[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium text-[#111111]">{d.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-[#555555]">{d.totalAppointments}</td>
              <td className="px-4 py-3 text-[#2a9d5c]">{d.concluded}</td>
              <td className="px-4 py-3 text-[#dc2626]">{d.canceled}</td>
              <td className="px-4 py-3">
                <AttendanceBar rate={d.attendanceRate} />
              </td>
              <td className="px-4 py-3 font-semibold text-[#111111]">
                {d.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
              <td className="px-4 py-3 text-[#888888]">{d.avgAppointmentsPerDay}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
