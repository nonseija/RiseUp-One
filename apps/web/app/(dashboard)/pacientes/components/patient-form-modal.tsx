'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import api from '@/lib/api'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().min(8, 'Telefone obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  birthDate: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function PatientFormModal({ onClose, onSaved }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await api.post('/api/patients', {
      ...data,
      email: data.email || undefined,
      birthDate: data.birthDate || undefined,
      notes: data.notes || undefined,
    })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8eaed] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111111]">Novo Paciente</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#888888] hover:bg-[#f7f8fa]"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">Nome *</label>
            <input
              {...register('name')}
              placeholder="Nome completo"
              className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
            {errors.name && <p className="mt-0.5 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">Telefone *</label>
            <input
              {...register('phone')}
              placeholder="(11) 99999-9999"
              className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
            {errors.phone && <p className="mt-0.5 text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">E-mail</label>
            <input
              {...register('email')}
              type="email"
              placeholder="email@exemplo.com"
              className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
            {errors.email && <p className="mt-0.5 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">
              Data de nascimento
            </label>
            <input
              {...register('birthDate')}
              type="date"
              className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">Observações</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Observações gerais..."
              className="w-full resize-none rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#e8eaed] py-2 text-sm font-medium text-[#555555] hover:bg-[#f7f8fa]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: '#29d9d5' }}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
