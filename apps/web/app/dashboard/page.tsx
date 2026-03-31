'use client'

import { useEffect, useState } from 'react'
import {
  Calendar,
  TrendingUp,
  Users,
  Activity,
  MessageCircle,
  Instagram,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import api from '@/lib/api'

// ─── Types ───────────────────────────────────────────────────────────────────

type AppointmentItem = {
  id: string
  datetime: string
  patientName: string
  service: string
  status: 'AGENDADA' | 'CONFIRMADA' | 'CONCLUIDA' | 'CANCELADA' | 'FALTA'
  duration: number
}

type RecentMessage = {
  id: string
  name: string
  channel: 'WHATSAPP' | 'INSTAGRAM'
  lastMessage: string
  unread: boolean
}

type RecentLead = {
  id: string
  name: string
  phone: string
  stage: string
  source: string
  createdAt: string
}

type DashboardData = {
  appointmentsToday: number
  appointmentsTodayList: AppointmentItem[]
  monthRevenue: number
  revenueGrowth: number
  activeLeads: number
  leadsAwaitingContact: number
  attendanceRate: number
  recentMessages: RecentMessage[]
  crmFunnel: Record<string, number>
  recentLeads: RecentLead[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  AGENDADA: { bg: '#fff8e6', color: '#b07d00', label: 'Agendada' },
  CONFIRMADA: { bg: '#e8fffe', color: '#1fb8b4', label: 'Confirmada' },
  CONCLUIDA: { bg: '#f0faf4', color: '#2a9d5c', label: 'Concluída' },
  CANCELADA: { bg: '#fef2f2', color: '#dc2626', label: 'Cancelada' },
  FALTA: { bg: '#fef2f2', color: '#dc2626', label: 'Falta' },
}

const CRM_STAGE_LABELS: Record<string, string> = {
  NOVO: 'Novo',
  CONTATADO: 'Contatado',
  AGENDADO: 'Agendado',
  ATIVO: 'Ativo',
  RECORRENTE: 'Recorrente',
}

const CRM_STAGES = ['NOVO', 'CONTATADO', 'AGENDADO', 'ATIVO', 'RECORRENTE']

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  subColor = '#888888',
  growth,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub: string
  subColor?: string
  growth?: number
}) {
  return (
    <div
      className="rounded-[10px] bg-white p-4"
      style={{ border: '1px solid #e8eaed' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#888888]">
          {label}
        </p>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: '#f0fffe' }}
        >
          <Icon size={16} color="#29d9d5" />
        </div>
      </div>
      <p className="text-2xl font-medium text-[#111111]">{value}</p>
      <div className="mt-1 flex items-center gap-1">
        {growth !== undefined && (
          <>
            {growth >= 0 ? (
              <ArrowUpRight size={12} color="#2a9d5c" />
            ) : (
              <ArrowDownRight size={12} color="#dc2626" />
            )}
            <span
              className="text-xs font-medium"
              style={{ color: growth >= 0 ? '#2a9d5c' : '#dc2626' }}
            >
              {growth >= 0 ? '+' : ''}
              {growth}%
            </span>
          </>
        )}
        <span className="text-xs" style={{ color: subColor }}>
          {sub}
        </span>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[10px] bg-white p-4" style={{ border: '1px solid #e8eaed' }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="h-3 w-24 rounded bg-gray-100" />
        <div className="h-8 w-8 rounded-lg bg-gray-100" />
      </div>
      <div className="h-7 w-20 rounded bg-gray-100" />
      <div className="mt-2 h-3 w-32 rounded bg-gray-100" />
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<DashboardData>('/api/dashboard/overview')
      .then((res) => setData(res.data))
      .catch(() => setError('Não foi possível carregar o dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (error) {
    return (
      <div className="flex min-h-96 items-center justify-center p-6">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  const confirmedToday =
    data?.appointmentsTodayList.filter((a) => a.status === 'CONFIRMADA').length ?? 0

  const maxFunnelValue =
    data ? Math.max(...Object.values(data.crmFunnel), 1) : 1

  return (
    <div className="p-4 lg:p-6">
      {/* ─── Metric cards ─────────────────────────────────────────────── */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <MetricCard
              icon={Calendar}
              label="Consultas hoje"
              value={String(data?.appointmentsToday ?? 0)}
              sub={`${confirmedToday} confirmada${confirmedToday !== 1 ? 's' : ''}`}
            />
            <MetricCard
              icon={TrendingUp}
              label="Faturamento do mês"
              value={formatCurrency(data?.monthRevenue ?? 0)}
              sub="vs. mês anterior"
              growth={data?.revenueGrowth}
              subColor="#888888"
            />
            <MetricCard
              icon={Users}
              label="Leads ativos"
              value={String(data?.activeLeads ?? 0)}
              sub={`${data?.leadsAwaitingContact ?? 0} aguardando contato`}
              subColor="#b07d00"
            />
            <MetricCard
              icon={Activity}
              label="Taxa de presença"
              value={`${data?.attendanceRate ?? 0}%`}
              sub="últimos 30 dias"
            />
          </>
        )}
      </div>

      {/* ─── Middle row: progress bar for attendance ──────────────────── */}
      {!loading && data && (
        <div
          className="mb-4 rounded-[10px] bg-white px-4 py-3"
          style={{ border: '1px solid #e8eaed' }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#888888]">
              Presença — últimos 30 dias
            </p>
            <span className="text-sm font-semibold" style={{ color: '#29d9d5' }}>
              {data.attendanceRate}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#f0fffe]">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${data.attendanceRate}%`, backgroundColor: '#29d9d5' }}
            />
          </div>
        </div>
      )}

      {/* ─── Three-column section ─────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Agenda do dia */}
        <div
          className="rounded-[10px] bg-white p-4"
          style={{ border: '1px solid #e8eaed' }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#888888]">
            Agenda de hoje
          </p>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="h-4 w-12 rounded bg-gray-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 rounded bg-gray-100" />
                    <div className="h-3 w-16 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.appointmentsTodayList.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#888888]">
              Nenhuma consulta hoje
            </p>
          ) : (
            <div className="space-y-2">
              {data!.appointmentsTodayList.map((apt) => {
                const s = STATUS_STYLES[apt.status] ?? STATUS_STYLES.AGENDADA
                return (
                  <div key={apt.id} className="flex items-start gap-3 py-1">
                    <span
                      className="mt-0.5 flex-shrink-0 text-sm font-semibold tabular-nums"
                      style={{ color: '#29d9d5' }}
                    >
                      {formatTime(apt.datetime)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#111111]">
                        {apt.patientName}
                      </p>
                      <p className="truncate text-xs text-[#888888]">{apt.service}</p>
                    </div>
                    <span
                      className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Funil CRM */}
        <div
          className="rounded-[10px] bg-white p-4"
          style={{ border: '1px solid #e8eaed' }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#888888]">
            Funil CRM
          </p>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-1">
                  <div className="h-2.5 w-16 rounded bg-gray-100" />
                  <div className="h-5 rounded bg-gray-100" style={{ width: `${60 - i * 8}%` }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {CRM_STAGES.map((stage) => {
                  const count = data?.crmFunnel[stage] ?? 0
                  const pct = Math.round((count / maxFunnelValue) * 100)
                  return (
                    <div key={stage}>
                      <div className="mb-0.5 flex items-center justify-between">
                        <span className="text-xs text-[#555555]">{CRM_STAGE_LABELS[stage]}</span>
                        <span className="text-xs font-semibold text-[#111111]">{count}</span>
                      </div>
                      <div className="h-5 w-full overflow-hidden rounded" style={{ backgroundColor: '#f0fffe' }}>
                        <div
                          className="h-full rounded transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: '#29d9d5', opacity: 0.7 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Recent leads */}
              {data && data.recentLeads.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-[#e8eaed] pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#bbb]">
                    Leads recentes
                  </p>
                  {data.recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: '#29d9d5' }}
                      >
                        {lead.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-[#111111]">{lead.name}</p>
                      </div>
                      <span
                        className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: '#f0fffe', color: '#1fb8b4' }}
                      >
                        {CRM_STAGE_LABELS[lead.stage] ?? lead.stage}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Mensagens recentes */}
        <div
          className="rounded-[10px] bg-white p-4"
          style={{ border: '1px solid #e8eaed' }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#888888]">
            Mensagens recentes
          </p>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-20 rounded bg-gray-100" />
                    <div className="h-3 w-32 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.recentMessages.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#888888]">Nenhuma mensagem</p>
          ) : (
            <div className="space-y-1">
              {data!.recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-[#f7f8fa]"
                  style={{ backgroundColor: msg.unread ? '#f0fffe' : undefined }}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{
                        backgroundColor:
                          msg.channel === 'WHATSAPP' ? '#25d366' : '#e1306c',
                      }}
                    >
                      {msg.channel === 'WHATSAPP' ? (
                        <MessageCircle size={14} />
                      ) : (
                        <Instagram size={14} />
                      )}
                    </div>
                    {msg.unread && (
                      <span
                        className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white"
                        style={{ backgroundColor: '#29d9d5' }}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[#111111]">{msg.name}</p>
                    <p className="truncate text-xs text-[#888888]">{msg.lastMessage || '—'}</p>
                  </div>
                  <span
                    className="mt-0.5 flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                    style={{
                      backgroundColor: msg.channel === 'WHATSAPP' ? '#dcfce7' : '#fce7f3',
                      color: msg.channel === 'WHATSAPP' ? '#16a34a' : '#be185d',
                    }}
                  >
                    {msg.channel === 'WHATSAPP' ? 'WPP' : 'IG'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
