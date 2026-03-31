'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  User,
  ClipboardList,
  Calendar,
  DollarSign,
  Plus,
  Link,
} from 'lucide-react'
import api from '@/lib/api'
import ProntuarioCard, { type MedicalRecord } from '../components/prontuario-card'
import NewProntuarioModal from '../components/new-prontuario-modal'
import AnamuseSummary from '../components/anamnese-summary'

interface Appointment {
  id: string
  datetime: string
  service: string
  status: string
  duration: number
}

interface FinancialEntry {
  id: string
  description: string
  amount: number
  status: string
  dueDate?: string
}

interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  birthDate?: string
  notes?: string
  createdAt: string
  appointments: Appointment[]
  anamnesis?: {
    completedAt?: string | null
    allergies?: string | null
    medications?: string | null
    illnesses?: string | null
    surgeries?: string | null
    pregnant?: boolean | null
    smoker?: boolean | null
    notes?: string | null
  } | null
}

type Tab = 'resumo' | 'prontuarios' | 'consultas' | 'financeiro'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'resumo', label: 'Resumo', icon: User },
  { id: 'prontuarios', label: 'Prontuários', icon: ClipboardList },
  { id: 'consultas', label: 'Consultas', icon: Calendar },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
]

const STATUS_LABELS: Record<string, string> = {
  AGENDADA: 'Agendada',
  CONFIRMADA: 'Confirmada',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
  FALTA: 'Falta',
}

const STATUS_COLORS: Record<string, string> = {
  AGENDADA: '#6366f1',
  CONFIRMADA: '#29d9d5',
  CONCLUIDA: '#2a9d5c',
  CANCELADA: '#ef4444',
  FALTA: '#f59e0b',
}

function calcAge(birthDate?: string) {
  if (!birthDate) return null
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [patient, setPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('resumo')
  const [showNewRecord, setShowNewRecord] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadPatient = useCallback(async () => {
    try {
      const { data } = await api.get<Patient>(`/api/patients/${patientId}`)
      setPatient(data)
    } catch {
      router.push('/pacientes')
    }
  }, [patientId, router])

  const loadRecords = useCallback(async () => {
    try {
      const { data } = await api.get<MedicalRecord[]>(
        `/api/medical-records/patient/${patientId}`,
      )
      setRecords(data)
    } catch {
      // ignore
    }
  }, [patientId])

  const loadFinancial = useCallback(async () => {
    try {
      const { data } = await api.get<FinancialEntry[]>('/api/financial', {
        params: { patientId },
      })
      setFinancialEntries(data)
    } catch {
      // ignore
    }
  }, [patientId])

  useEffect(() => {
    setIsLoading(true)
    Promise.all([loadPatient(), loadRecords(), loadFinancial()]).finally(() =>
      setIsLoading(false),
    )
  }, [loadPatient, loadRecords, loadFinancial])

  const sendAnamnesisLink = async () => {
    try {
      const { data } = await api.post<{ link: string }>(
        `/api/medical-records/anamnesis/${patientId}`,
      )
      await navigator.clipboard.writeText(data.link)
      alert('Link copiado para a área de transferência!')
    } catch {
      alert('Erro ao gerar link')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#29d9d5] border-t-transparent" />
      </div>
    )
  }

  if (!patient) return null

  const age = calcAge(patient.birthDate)

  return (
    <div className="p-6">
      {/* Back + header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/pacientes')}
          className="mb-4 flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#29d9d5]"
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
              style={{ backgroundColor: '#29d9d5' }}
            >
              {patient.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#111111]">{patient.name}</h1>
              <p className="text-sm text-[#888888]">
                {patient.phone}
                {age !== null && ` · ${age} anos`}
                {patient.email && ` · ${patient.email}`}
              </p>
            </div>
          </div>

          <button
            onClick={sendAnamnesisLink}
            className="flex items-center gap-2 rounded-xl border border-[#e8eaed] px-4 py-2 text-sm font-medium text-[#555555] hover:bg-[#f7f8fa]"
          >
            <Link size={14} />
            Enviar Anamnese
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-[#e8eaed]">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                borderColor: active ? '#29d9d5' : 'transparent',
                color: active ? '#29d9d5' : '#888888',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Resumo tab */}
      {activeTab === 'resumo' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[#e8eaed] bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#111111]">Dados pessoais</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="w-32 font-medium text-[#888888]">Telefone</dt>
                <dd className="text-[#555555]">{patient.phone}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 font-medium text-[#888888]">E-mail</dt>
                <dd className="text-[#555555]">{patient.email ?? '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 font-medium text-[#888888]">Nascimento</dt>
                <dd className="text-[#555555]">
                  {patient.birthDate
                    ? new Date(patient.birthDate).toLocaleDateString('pt-BR')
                    : '—'}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 font-medium text-[#888888]">Paciente desde</dt>
                <dd className="text-[#555555]">
                  {new Date(patient.createdAt).toLocaleDateString('pt-BR')}
                </dd>
              </div>
            </dl>
            {patient.notes && (
              <div className="mt-3 rounded-lg bg-[#f7f8fa] p-3">
                <p className="text-xs text-[#888888]">{patient.notes}</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-[#111111]">Anamnese</h3>
            <AnamuseSummary anamnesis={patient.anamnesis} />
          </div>
        </div>
      )}

      {/* Prontuários tab */}
      {activeTab === 'prontuarios' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[#888888]">
              {records.length} prontuário{records.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setShowNewRecord(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: '#29d9d5' }}
            >
              <Plus size={14} />
              Adicionar Prontuário
            </button>
          </div>

          {records.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[#e8eaed] bg-white">
              <p className="text-sm text-[#aaaaaa]">Nenhum prontuário registrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <ProntuarioCard key={r.id} record={r} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Consultas tab */}
      {activeTab === 'consultas' && (
        <div className="overflow-hidden rounded-xl border border-[#e8eaed] bg-white">
          {patient.appointments.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-[#aaaaaa]">Nenhuma consulta registrada</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8eaed] bg-[#f7f8fa]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Serviço</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Duração</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Status</th>
                </tr>
              </thead>
              <tbody>
                {patient.appointments.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`border-b border-[#f0f0f0] ${i === patient.appointments.length - 1 ? 'border-0' : ''}`}
                  >
                    <td className="px-4 py-3 text-[#555555]">
                      {new Date(a.datetime).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#111111]">{a.service}</td>
                    <td className="px-4 py-3 text-[#888888]">{a.duration} min</td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          color: STATUS_COLORS[a.status] ?? '#888888',
                          backgroundColor: `${STATUS_COLORS[a.status] ?? '#888888'}18`,
                        }}
                      >
                        {STATUS_LABELS[a.status] ?? a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Financeiro tab */}
      {activeTab === 'financeiro' && (
        <div className="overflow-hidden rounded-xl border border-[#e8eaed] bg-white">
          {financialEntries.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm text-[#aaaaaa]">Nenhum lançamento financeiro</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8eaed] bg-[#f7f8fa]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Vencimento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Status</th>
                </tr>
              </thead>
              <tbody>
                {financialEntries.map((e, i) => (
                  <tr
                    key={e.id}
                    className={`border-b border-[#f0f0f0] ${i === financialEntries.length - 1 ? 'border-0' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-[#111111]">{e.description}</td>
                    <td className="px-4 py-3 text-[#555555]">
                      {e.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-3 text-[#888888]">
                      {e.dueDate
                        ? new Date(e.dueDate).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{
                          color:
                            e.status === 'PAGO'
                              ? '#2a9d5c'
                              : e.status === 'VENCIDO'
                                ? '#ef4444'
                                : '#f59e0b',
                          backgroundColor:
                            e.status === 'PAGO'
                              ? '#f0faf4'
                              : e.status === 'VENCIDO'
                                ? '#fff0f0'
                                : '#fffbeb',
                        }}
                      >
                        {e.status === 'PAGO'
                          ? 'Pago'
                          : e.status === 'VENCIDO'
                            ? 'Vencido'
                            : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showNewRecord && (
        <NewProntuarioModal
          patientId={patientId}
          onClose={() => setShowNewRecord(false)}
          onSaved={() => {
            setShowNewRecord(false)
            void loadRecords()
          }}
        />
      )}
    </div>
  )
}
