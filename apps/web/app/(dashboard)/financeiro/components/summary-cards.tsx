'use client'

import { TrendingUp, TrendingDown, Wallet, Clock, AlertCircle } from 'lucide-react'

interface Summary {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  receitasPendentes: number
  receitasVencidas: number
}

interface Props {
  summary: Summary
  isLoading: boolean
}

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface CardProps {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  bg: string
}

function Card({ icon, label, value, color, bg }: CardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#e8eaed] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#888888]">{label}</span>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ backgroundColor: bg }}
        >
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold" style={{ color }}>
        {fmt(value)}
      </p>
    </div>
  )
}

export default function SummaryCards({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-[#f7f8fa]"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <Card
        icon={<TrendingUp size={14} style={{ color: '#2a9d5c' }} />}
        label="Receitas do mês"
        value={summary.totalReceitas}
        color="#2a9d5c"
        bg="#f0faf4"
      />
      <Card
        icon={<TrendingDown size={14} style={{ color: '#dc2626' }} />}
        label="Despesas do mês"
        value={summary.totalDespesas}
        color="#dc2626"
        bg="#fef2f2"
      />
      <Card
        icon={<Wallet size={14} style={{ color: summary.saldo >= 0 ? '#2a9d5c' : '#dc2626' }} />}
        label="Saldo"
        value={summary.saldo}
        color={summary.saldo >= 0 ? '#2a9d5c' : '#dc2626'}
        bg={summary.saldo >= 0 ? '#f0faf4' : '#fef2f2'}
      />
      <Card
        icon={<Clock size={14} style={{ color: '#29d9d5' }} />}
        label="A receber"
        value={summary.receitasPendentes}
        color="#29d9d5"
        bg="#f0fffe"
      />
      <Card
        icon={<AlertCircle size={14} style={{ color: '#dc2626' }} />}
        label="Vencidos"
        value={summary.receitasVencidas}
        color="#dc2626"
        bg="#fef2f2"
      />
    </div>
  )
}
