'use client'

import { useState, useCallback, useEffect } from 'react'
import { BarChart2 } from 'lucide-react'
import api from '@/lib/api'
import DateRangePicker, { type DateRange } from './components/date-range-picker'
import AppointmentsReport from './components/appointments-report'
import RevenueReport from './components/revenue-report'
import LeadsReport from './components/leads-report'
import DentistsReport from './components/dentists-report'
import PatientsReport from './components/patients-report'

type Tab = 'consultas' | 'faturamento' | 'leads' | 'dentistas' | 'pacientes'

const TABS: { id: Tab; label: string }[] = [
  { id: 'consultas', label: 'Consultas' },
  { id: 'faturamento', label: 'Faturamento' },
  { id: 'leads', label: 'Leads' },
  { id: 'dentistas', label: 'Dentistas' },
  { id: 'pacientes', label: 'Pacientes' },
]

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function defaultRange(): DateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 29)
  return { dateFrom: isoDate(from), dateTo: isoDate(to) }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReportData = any

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('consultas')
  const [range, setRange] = useState<DateRange>(defaultRange)
  const [data, setData] = useState<Record<Tab, ReportData>>({
    consultas: null, faturamento: null, leads: null, dentistas: null, pacientes: null,
  })
  const [loading, setLoading] = useState<Record<Tab, boolean>>({
    consultas: false, faturamento: false, leads: false, dentistas: false, pacientes: false,
  })

  const endpointMap: Record<Tab, string> = {
    consultas: '/api/reports/appointments',
    faturamento: '/api/reports/revenue',
    leads: '/api/reports/leads',
    dentistas: '/api/reports/dentists',
    pacientes: '/api/reports/patients',
  }

  const load = useCallback(
    async (tab: Tab, r: DateRange) => {
      setLoading((prev) => ({ ...prev, [tab]: true }))
      try {
        const { data: result } = await api.get<ReportData>(endpointMap[tab], {
          params: { dateFrom: r.dateFrom, dateTo: r.dateTo },
        })
        setData((prev) => ({ ...prev, [tab]: result }))
      } catch {
        // ignore
      } finally {
        setLoading((prev) => ({ ...prev, [tab]: false }))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // Load current tab on mount and when range/tab changes
  useEffect(() => {
    void load(activeTab, range)
  }, [activeTab, range, load])

  const handleRangeChange = (r: DateRange) => {
    setRange(r)
    // Reset data for all tabs so they reload fresh
    setData({ consultas: null, faturamento: null, leads: null, dentistas: null, pacientes: null })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: '#f0fffe', border: '1.5px solid rgba(41,217,213,0.25)' }}
          >
            <BarChart2 size={20} style={{ color: '#29d9d5' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#111111]">Relatórios</h1>
            <p className="text-xs text-[#888888]">Analytics e performance da clínica</p>
          </div>
        </div>
        <DateRangePicker value={range} onChange={handleRangeChange} />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-[#e8eaed]">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                borderColor: active ? '#29d9d5' : 'transparent',
                color: active ? '#29d9d5' : '#888888',
              }}
            >
              {tab.label}
              {loading[tab.id] && (
                <span className="ml-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'consultas' && (
        <AppointmentsReport data={data.consultas} isLoading={loading.consultas} />
      )}
      {activeTab === 'faturamento' && (
        <RevenueReport data={data.faturamento} isLoading={loading.faturamento} />
      )}
      {activeTab === 'leads' && (
        <LeadsReport data={data.leads} isLoading={loading.leads} />
      )}
      {activeTab === 'dentistas' && (
        <DentistsReport data={data.dentistas} isLoading={loading.dentistas} />
      )}
      {activeTab === 'pacientes' && (
        <PatientsReport data={data.pacientes} isLoading={loading.pacientes} />
      )}
    </div>
  )
}
