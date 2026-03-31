'use client'

import { useState } from 'react'
import { X, Phone, Mail, Calendar, UserCheck } from 'lucide-react'
import type { Conversation } from '@/hooks/use-chat'
import ChannelBadge from './channel-badge'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

interface Props {
  conversation: Conversation
  onClose: () => void
}

export default function ContactInfo({ conversation, onClose }: Props) {
  const [converting, setConverting] = useState(false)
  const router = useRouter()

  const convertToPatient = async () => {
    if (!conversation.leadId) return
    if (!confirm('Converter este lead em paciente?')) return
    setConverting(true)
    try {
      await api.post(`/api/crm/leads/${conversation.leadId}/convert`)
    } catch {
      // ignore
    } finally {
      setConverting(false)
    }
  }

  const scheduleAppointment = () => {
    router.push('/agenda')
  }

  const initials = (name?: string) => {
    if (!name) return '?'
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  }

  return (
    <div
      className="flex h-full flex-col border-l border-[#e8eaed] bg-white"
      style={{ width: 280, flexShrink: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e8eaed] px-4 py-3">
        <span className="text-sm font-semibold text-[#111111]">Perfil do Contato</span>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#888888] hover:bg-[#f7f8fa]"
        >
          <X size={15} />
        </button>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center px-4 py-6">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ backgroundColor: '#29d9d5' }}
        >
          {initials(conversation.contactName)}
        </div>
        <p className="mt-3 text-sm font-semibold text-[#111111]">
          {conversation.contactName ?? 'Desconhecido'}
        </p>
        <div className="mt-1">
          <ChannelBadge channel={conversation.channel} />
        </div>
      </div>

      {/* Contact details */}
      <div className="space-y-3 px-4">
        {conversation.contactPhone && (
          <div className="flex items-center gap-2 text-sm text-[#555555]">
            <Phone size={14} className="text-[#29d9d5]" />
            {conversation.contactPhone}
          </div>
        )}

        {/* Type label */}
        <div className="rounded-lg bg-[#f7f8fa] px-3 py-2 text-xs text-[#888888]">
          {conversation.patientId ? (
            <span className="font-semibold text-[#2a9d5c]">Paciente</span>
          ) : conversation.leadId ? (
            <span className="font-semibold text-[#6366f1]">Lead</span>
          ) : (
            <span>Contato não vinculado</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-2 border-t border-[#e8eaed] px-4 py-4">
        <button
          onClick={scheduleAppointment}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: '#29d9d5' }}
        >
          <Calendar size={14} />
          Agendar Consulta
        </button>

        {conversation.leadId && !conversation.patientId && (
          <button
            onClick={convertToPatient}
            disabled={converting}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#f0faf4', color: '#2a9d5c' }}
          >
            <UserCheck size={14} />
            Converter em Paciente
          </button>
        )}

        {conversation.patientId && (
          <button
            onClick={() => router.push('/prontuarios')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#e8eaed] py-2 text-sm font-medium text-[#555555] hover:bg-[#f7f8fa]"
          >
            <Mail size={14} />
            Ver Prontuário
          </button>
        )}
      </div>
    </div>
  )
}
