'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import type { Lead, LeadSource } from '../types'
import api from '@/lib/api'

const schema = z.object({
  name:   z.string().min(1, 'Nome obrigatório'),
  phone:  z.string().min(8, 'Telefone inválido'),
  email:  z.string().email('E-mail inválido').optional().or(z.literal('')),
  source: z.enum(['WHATSAPP', 'INSTAGRAM', 'AGENDAMENTO_ONLINE', 'MANUAL'] as const),
  notes:  z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: (lead: Lead) => void
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  WHATSAPP: 'WhatsApp',
  INSTAGRAM: 'Instagram',
  AGENDAMENTO_ONLINE: 'Agendamento Online',
  MANUAL: 'Manual',
}

export default function NewLeadModal({ isOpen, onClose, onCreated }: Props) {
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { source: 'MANUAL' },
  })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      const res = await api.post<Lead>('/api/crm/leads', {
        ...data,
        email: data.email || undefined,
      })
      onCreated(res.data)
      reset()
      onClose()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setServerError(e.response?.data?.message ?? 'Erro ao criar lead')
    }
  }

  if (!isOpen) return null

  const FieldErr = ({ msg }: { msg?: string }) =>
    msg ? <p className="mt-0.5 text-xs text-red-500">{msg}</p> : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl"
        style={{ border: '1px solid #e8eaed', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #e8eaed', backgroundColor: '#f0fffe' }}
        >
          <h2 className="text-base font-semibold text-[#111111]">Novo Lead</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#888888] hover:bg-white"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555555]">Nome</label>
            <input
              type="text"
              {...register('name')}
              placeholder="Nome completo"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
              style={{ borderColor: errors.name ? '#ef4444' : '#e8eaed' }}
            />
            <FieldErr msg={errors.name?.message} />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555555]">Telefone</label>
            <input
              type="text"
              {...register('phone')}
              placeholder="(11) 99999-9999"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
              style={{ borderColor: errors.phone ? '#ef4444' : '#e8eaed' }}
            />
            <FieldErr msg={errors.phone?.message} />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555555]">
              E-mail <span className="font-normal text-[#aaa]">(opcional)</span>
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="email@exemplo.com"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
              style={{ borderColor: errors.email ? '#ef4444' : '#e8eaed' }}
            />
            <FieldErr msg={errors.email?.message} />
          </div>

          {/* Source */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555555]">Origem</label>
            <select
              {...register('source')}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
              style={{ borderColor: '#e8eaed' }}
            >
              {(Object.keys(SOURCE_LABELS) as LeadSource[]).map((s) => (
                <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555555]">
              Observações <span className="font-normal text-[#aaa]">(opcional)</span>
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Observações sobre o lead..."
              className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
              style={{ borderColor: '#e8eaed' }}
            />
          </div>

          {serverError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#e8eaed] py-2.5 text-sm font-medium text-[#555555] hover:bg-[#f7f8fa]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: '#29d9d5' }}
            >
              {isSubmitting ? 'Criando...' : 'Criar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
