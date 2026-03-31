'use client'

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import MetricCard from './metric-card'
import ChartWrapper from './chart-wrapper'

interface AppointmentsData {
  total: number
  attendanceRate: number
  cancelRate: number
  byStatus: { status: string; count: number }[]
  byDentist: { dentistName: string; total: number; concluded: number }[]
  byService: { service: string; count: number }[]
  byDayOfWeek: { day: string; count: number }[]
  evolution: { date: string; count: number }[]
}

const STATUS_LABELS: Record<string, string> = {
  AGENDADA: 'Agendada', CONFIRMADA: 'Confirmada', CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada', FALTA: 'Falta',
}
const PIE_COLORS = ['#29d9d5', '#1fb8b4', '#94e8e6', '#0f8c8a', '#888888', '#e8eaed']

const TOOLTIP_STYLE = {
  contentStyle: { borderRadius: 8, border: '1px solid #e8eaed', fontSize: 12 },
}

interface Props { data: AppointmentsData | null; isLoading: boolean }

export default function AppointmentsReport({ data, isLoading }: Props) {
  return (
    <div className="space-y-5">
      {/* Cards */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Total de consultas" value={data?.total ?? 0} color="#111111" />
        <MetricCard
          label="Taxa de presença"
          value={`${data?.attendanceRate ?? 0}%`}
          color={(data?.attendanceRate ?? 0) >= 85 ? '#2a9d5c' : (data?.attendanceRate ?? 0) >= 70 ? '#f59e0b' : '#dc2626'}
        />
        <MetricCard
          label="Taxa de cancelamento"
          value={`${data?.cancelRate ?? 0}%`}
          color={(data?.cancelRate ?? 0) > 20 ? '#dc2626' : '#111111'}
        />
      </div>

      {/* Evolution line chart */}
      <ChartWrapper title="Evolução diária" isLoading={isLoading}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.evolution ?? []} {...TOOLTIP_STYLE}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="count" stroke="#29d9d5" strokeWidth={2} dot={false} name="Consultas" />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* byDayOfWeek */}
        <ChartWrapper title="Por dia da semana" isLoading={isLoading}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.byDayOfWeek ?? []} {...TOOLTIP_STYLE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#29d9d5" radius={[4, 4, 0, 0]} name="Consultas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* byStatus pie */}
        <ChartWrapper title="Por status" isLoading={isLoading}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={(data?.byStatus ?? []).map((s) => ({ ...s, name: STATUS_LABELS[s.status] ?? s.status }))}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={(p: any) => `${String(p.name ?? '')} ${((p.percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {(data?.byStatus ?? []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Top services */}
      <ChartWrapper title="Top procedimentos" isLoading={isLoading}>
        <div className="space-y-2">
          {(data?.byService ?? []).slice(0, 8).map((s, i) => {
            const max = data?.byService[0]?.count ?? 1
            const pct = Math.round((s.count / max) * 100)
            return (
              <div key={s.service} className="flex items-center gap-3">
                <span className="w-4 text-xs font-bold text-[#888888]">{i + 1}</span>
                <div className="flex-1">
                  <div className="mb-0.5 flex justify-between text-xs">
                    <span className="font-medium text-[#111111]">{s.service}</span>
                    <span className="text-[#888888]">{s.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f0]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#29d9d5' }} />
                  </div>
                </div>
              </div>
            )
          })}
          {(data?.byService ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-[#aaaaaa]">Nenhum dado disponível</p>
          )}
        </div>
      </ChartWrapper>
    </div>
  )
}
