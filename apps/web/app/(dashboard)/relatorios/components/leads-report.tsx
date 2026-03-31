'use client'

import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import MetricCard from './metric-card'
import ChartWrapper from './chart-wrapper'

interface LeadsData {
  totalLeads: number
  bySource: { source: string; count: number }[]
  byStage: { stage: string; count: number }[]
  conversionRate: number
  averageTimeToConvert: number
  evolution: { date: string; count: number }[]
}

const SOURCE_LABELS: Record<string, string> = {
  WHATSAPP: 'WhatsApp', INSTAGRAM: 'Instagram',
  AGENDAMENTO_ONLINE: 'Agend. Online', MANUAL: 'Manual',
}
const STAGE_LABELS: Record<string, string> = {
  NOVO: 'Novo', CONTATADO: 'Contatado', AGENDADO: 'Agendado',
  ATIVO: 'Ativo', RECORRENTE: 'Recorrente',
}
const PIE_COLORS = ['#25D366', '#E1306C', '#29d9d5', '#888888']
const FUNNEL_COLORS = ['#29d9d5', '#1fb8b4', '#94e8e6', '#0f8c8a', '#e8eaed']
const TOOLTIP_STYLE = { contentStyle: { borderRadius: 8, border: '1px solid #e8eaed', fontSize: 12 } }

interface Props { data: LeadsData | null; isLoading: boolean }

export default function LeadsReport({ data, isLoading }: Props) {
  const maxStage = Math.max(...(data?.byStage ?? []).map((s) => s.count), 1)

  return (
    <div className="space-y-5">
      {/* Cards */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Total de leads" value={data?.totalLeads ?? 0} color="#111111" />
        <MetricCard
          label="Taxa de conversão"
          value={`${data?.conversionRate ?? 0}%`}
          color={(data?.conversionRate ?? 0) >= 30 ? '#2a9d5c' : '#f59e0b'}
        />
        <MetricCard
          label="Tempo médio de conversão"
          value={`${data?.averageTimeToConvert ?? 0} dias`}
          color="#29d9d5"
        />
      </div>

      {/* Evolution line */}
      <ChartWrapper title="Novos leads por dia" isLoading={isLoading}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.evolution ?? []} {...TOOLTIP_STYLE}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="count" stroke="#29d9d5" strokeWidth={2} dot={false} name="Leads" />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Funnel - horizontal bars */}
        <ChartWrapper title="Funil de leads por stage" isLoading={isLoading}>
          <div className="space-y-3 py-4">
            {(data?.byStage ?? []).map((s, i) => {
              const pct = Math.round((s.count / maxStage) * 100)
              return (
                <div key={s.stage}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-[#555555]">{STAGE_LABELS[s.stage] ?? s.stage}</span>
                    <span className="font-semibold text-[#111111]">{s.count}</span>
                  </div>
                  <div className="h-7 overflow-hidden rounded-lg bg-[#f0f0f0]">
                    <div
                      className="flex h-full items-center rounded-lg px-2 text-xs font-semibold text-white transition-all"
                      style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: FUNNEL_COLORS[i] ?? '#29d9d5' }}
                    >
                      {pct}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ChartWrapper>

        {/* bySource pie */}
        <ChartWrapper title="Leads por origem" isLoading={isLoading}>
          {(data?.bySource ?? []).length === 0 ? (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-sm text-[#aaaaaa]">Sem dados</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(data?.bySource ?? []).map((s) => ({
                    ...s,
                    name: SOURCE_LABELS[s.source] ?? s.source,
                  }))}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={(p: any) => `${String(p.name ?? '')} ${((p.percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(data?.bySource ?? []).map((_, i) => (
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
