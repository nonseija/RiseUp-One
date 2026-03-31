'use client'

import { useState } from 'react'
import { X, User, Clock, Stethoscope, FileText } from 'lucide-react'
import type { Appointment } from '../types'
import { STATUS_META, toHHMM, toLocalDate } from '../types'
import api from '@/lib/api'

interface Props {
  appointment: Appointment
  onClose: () => void
  onUpdated: (updated: Appointment) => void
}

type StatusAction = {
  label: string
  nextStatus: Appointment['status']
  color: string
  bg: string
}

const ACTIONS: Record<Appointment['status'], StatusAction[]> = {
  AGENDADA: [
    { label: 'Confirmar', nextStatus: 'CONFIRMADA', color: '#1fb8b4', bg: '#e8fffe' },
    { label: 'Cancelar',  nextStatus: 'CANCELADA',  color: '#dc2626', bg: '#fef2f2' },
  ],
  CONFIRMADA: [
    { label: 'Concluir', nextStatus: 'CONCLUIDA', color: '#2a9d5c', bg: '#f0faf4' },
    { label: 'Falta',    nextStatus: 'FALTA',     color: '#dc2626', bg: '#fef2f2' },
    { label: 'Cancelar', nextStatus: 'CANCELADA', color: '#dc2626', bg: '#fef2f2' },
  ],
  CONCLUIDA: [],
  CANCELADA: [],
  FALTA:     [],
}

export default function AppointmentDetailModal({ appointment, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const meta = STATUS_META[appointment.status]
  const actions = ACTIONS[appointment.status] ?? []

  const changeStatus = async (nextStatus: Appointment['status']) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.patch<Appointment>(`/api/appointments/${appointment.id}`, {
        status: nextStatus,
      })
      onUpdated(res.data)
      onClose()
    } catch {
      setError('Não foi possível atualizar o status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        style={{ border: '1px solid #e8eaed' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between rounded-t-2xl px-6 py-4"
          style={{ backgroundColor: '#f0fffe', borderBottom: '1px solid #e8eaed' }}
        >
          <div>
            <h2 className="text-base font-semibold text-[#111111]">Detalhes da Consulta</h2>
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{ backgroundColor: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#888888] hover:bg-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          <InfoRow icon={User} label="Paciente" value={appointment.patient.name} />
          <InfoRow
            icon={Clock}
            label="Horário"
            value={`${toLocalDate(appointment.datetime)} às ${toHHMM(appointment.datetime)} (${appointment.duration}min)`}
          />
          <InfoRow icon={Stethoscope} label="Procedimento" value={appointment.service} />
          {appointment.notes && (
            <InfoRow icon={FileText} label="Observações" value={appointment.notes} />
          )}
          <div className="text-xs text-[#888888]">
            <span>Tel: </span>
            <span className="font-medium text-[#555555]">{appointment.patient.phone}</span>
          </div>
        </div>

        {error && (
          <p className="px-6 pb-2 text-sm text-red-500">{error}</p>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex gap-2 border-t border-[#e8eaed] px-6 py-4">
            {actions.map((action) => (
              <button
                key={action.nextStatus}
                onClick={() => changeStatus(action.nextStatus)}
                disabled={loading}
                className="flex-1 rounded-lg py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
                style={{ backgroundColor: action.bg, color: action.color }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {actions.length === 0 && (
          <div className="border-t border-[#e8eaed] px-6 py-4">
            <button
              onClick={onClose}
              className="w-full rounded-lg py-2 text-sm font-medium text-[#888888] hover:bg-[#f7f8fa]"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: '#f0fffe' }}
      >
        <Icon size={14} color="#29d9d5" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888888]">{label}</p>
        <p className="text-sm text-[#111111]">{value}</p>
      </div>
    </div>
  )
}
