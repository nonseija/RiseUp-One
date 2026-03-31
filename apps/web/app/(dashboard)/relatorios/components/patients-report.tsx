'use client'

import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import MetricCard from './metric-card'
import ChartWrapper from './chart-wrapper'

interface PatientsData {
  totalPatients: number
  newPatients: number
  returningPatients: number
  byAgeGroup: { group: string; count: number }[]
  topServices: { service: string; count: number }[]
  retentionRate: number
}

const PIE_COLORS = ['#29d9d5', '#1fb8b4', '#94e8e6', '#0f8c8a', '#e8eaed']
const TOOLTIP_STYLE = { contentStyle: { borderRadius: 8, border: '1px solid #e8eaed', fontSize: 12 } }

interface Props { data: PatientsData | null; isLoading: boolean }

export default function PatientsReport({ data, isLoading }: Props) {
  return (
    <div className="space-y-5">
      {/* Cards */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Total de pacientes" value={data?.totalPatients ?? 0} color="#111111" />
        <MetricCard
          label="Novos no período"
          value={data?.newPatients ?? 0}
          color="#29d9d5"
          sub="pacientes cadastrados"
        />
        <MetricCard
          label="Taxa de retorno"
          value={`${data?.retentionRate ?? 0}%`}
          color={(data?.retentionRate ?? 0) >= 40 ? '#2a9d5c' : '#f59e0b'}
          sub="pacientes com consultas no período"
        />
      </div>

      {/* Retenção card */}
      <div className="rounded-xl border border-[#e8eaed] bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">Retenção de pacientes</h3>
            <p className="mt-0.5 text-xs text-[#888888]">
              {data?.returningPatients ?? 0} pacientes tiveram 2+ consultas no período
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: '#29d9d5' }}>
              {data?.returningPatients ?? 0}
            </p>
            <p className="text-xs text-[#888888]">recorrentes</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f0f0f0]">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${data?.retentionRate ?? 0}%`,
              backgroundColor: '#29d9d5',
            }}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* byAgeGroup bars */}
        <ChartWrapper title="Distribuição por faixa etária" isLoading={isLoading}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.byAgeGroup ?? []} {...TOOLTIP_STYLE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" fill="#29d9d5" radius={[4, 4, 0, 0]} name="Pacientes" />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        {/* topServices pie */}
        <ChartWrapper title="Top 5 procedimentos" isLoading={isLoading}>
          {(data?.topServices ?? []).length === 0 ? (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-sm text-[#aaaaaa]">Sem dados no período</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.topServices ?? []}
                  dataKey="count"
                  nameKey="service"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={(p: any) => `${String(p.service ?? '').slice(0, 12)} ${((p.percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(data?.topServices ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartWrapper>
      </div>
    </div>
  )
}
