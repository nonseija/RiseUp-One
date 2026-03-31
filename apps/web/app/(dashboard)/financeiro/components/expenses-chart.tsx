'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { FinancialEntry } from '../types'

interface Props {
  entries: FinancialEntry[]
  isLoading: boolean
}

const COLORS = ['#dc2626', '#f59e0b', '#6366f1', '#29d9d5', '#2a9d5c', '#ec4899', '#8b5cf6']

export default function ExpensesChart({ entries, isLoading }: Props) {
  const expenses = entries.filter((e) => e.type === 'DESPESA')

  const categoryMap: Record<string, number> = {}
  for (const e of expenses) {
    const cat = e.category ?? 'Outros'
    categoryMap[cat] = (categoryMap[cat] ?? 0) + e.amount
  }

  const data = Object.entries(categoryMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-[#f7f8fa]" />
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-[#e8eaed] bg-white">
        <p className="text-sm text-[#aaaaaa]">Nenhuma despesa registrada</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#e8eaed] bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-[#111111]">Despesas por categoria</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#888888' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#888888' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
            }
          />
          <Tooltip
            formatter={(value) =>
              typeof value === 'number'
                ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : String(value)
            }
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e8eaed',
              fontSize: 12,
            }}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-2">
        {data.map((item, i) => (
          <span key={item.name} className="flex items-center gap-1 text-xs text-[#555555]">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {item.name}:{' '}
            <strong>
              {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </strong>
          </span>
        ))}
      </div>
    </div>
  )
}
