'use client'

import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import MetricCard from './metric-card'
import ChartWrapper from './chart-wrapper'

interface RevenueData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  byMonth: { month: string; revenue: number; expenses: number; profit: number }[]
  byDentist: { dentistName: string; revenue: number }[]
  byCategory: { category: string; total: number }[]
  byPaymentMethod: { method: string; total: number }[]
  pendingTotal: number
  overdueTotal: number
}

const PIE_COLORS = ['#29d9d5', '#1fb8b4', '#94e8e6', '#0f8c8a', '#888888', '#e8eaed']
const PM_LABELS: Record<string, string> = {
  DINHEIRO: 'Dinheiro', PIX: 'PIX', CARTAO_CREDITO: 'Crédito',
  CARTAO_DEBITO: 'Débito', BOLETO: 'Boleto', TRANSFERENCIA: 'Transf.',
}
const TOOLTIP_STYLE = {
  contentStyle: { borderRadius: 8, border: '1px solid #e8eaed', fontSize: 12 },
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface Props { data: RevenueData | null; isLoading: boolean }

export default function RevenueReport({ data, isLoading }: Props) {
  const profit = data?.netProfit ?? 0
  return (
    <div className="space-y-5">
      {/* Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricCard label="Receita total" value={fmt(data?.totalRevenue ?? 0)} color="#2a9d5c" />
        <MetricCard label="Despesas" value={fmt(data?.totalExpenses ?? 0)} color="#dc2626" />
        <MetricCard label="Lucro líquido" value={fmt(profit)} color={profit >= 0 ? '#2a9d5c' : '#dc2626'} />
        <MetricCard label="A receber" value={fmt(data?.pendingTotal ?? 0)} color="#29d9d5" />
        <MetricCard label="Vencidos" value={fmt(data?.overdueTotal ?? 0)} color="#dc2626" />
      </div>

      {/* Grouped bar by month */}
      <ChartWrapper title="Receitas vs Despesas por mês" isLoading={isLoading}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data?.byMonth ?? []} {...TOOLTIP_STYLE}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#888888' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
              }
            />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" fill="#29d9d5" radius={[4, 4, 0, 0]} name="Receita" />
            <Bar dataKey="expenses" fill="#dc2626" radius={[4, 4, 0, 0]} name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* byDentist pie */}
        <ChartWrapper title="Receita por dentista" isLoading={isLoading}>
          {(data?.byDentist ?? []).length === 0 ? (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-sm text-[#aaaaaa]">Sem dados</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data?.byDentist ?? []} dataKey="revenue" nameKey="dentistName" cx="50%" cy="50%" outerRadius={100}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={(p: any) => `${String(p.dentistName ?? '')} ${((p.percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(data?.byDentist ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(typeof v === 'number' ? v : 0)} contentStyle={TOOLTIP_STYLE.contentStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartWrapper>

        {/* byCategory pie */}
        <ChartWrapper title="Receita por categoria" isLoading={isLoading}>
          {(data?.byCategory ?? []).length === 0 ? (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-sm text-[#aaaaaa]">Sem dados</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data?.byCategory ?? []} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={100}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  label={(p: any) => `${String(p.category ?? '')} ${((p.percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(data?.byCategory ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(typeof v === 'number' ? v : 0)} contentStyle={TOOLTIP_STYLE.contentStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartWrapper>
      </div>

      {/* byPaymentMethod bars */}
      <ChartWrapper title="Métodos de pagamento" isLoading={isLoading}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={(data?.byPaymentMethod ?? []).map((m) => ({
              ...m,
              name: PM_LABELS[m.method] ?? m.method,
            }))}
            layout="vertical"
            margin={{ left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#888888' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) =>
                v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
              }
            />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => fmt(typeof v === 'number' ? v : 0)} contentStyle={TOOLTIP_STYLE.contentStyle} />
            <Bar dataKey="total" fill="#1fb8b4" radius={[0, 4, 4, 0]} name="Valor" />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </div>
  )
}
