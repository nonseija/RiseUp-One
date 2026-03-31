'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import api from '@/lib/api'

const PAYMENT_METHODS = [
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'PIX', label: 'PIX' },
  { value: 'CARTAO_CREDITO', label: 'Cartão de crédito' },
  { value: 'CARTAO_DEBITO', label: 'Cartão de débito' },
  { value: 'BOLETO', label: 'Boleto' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
]

const CATEGORIES = [
  'Consulta',
  'Procedimento',
  'Material',
  'Equipamento',
  'Aluguel',
  'Salário',
  'Outros',
]

const schema = z.object({
  type: z.enum(['RECEITA', 'DESPESA']),
  description: z.string().min(2, 'Descrição obrigatória'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  category: z.string().optional(),
  patientId: z.string().optional(),
  dentistId: z.string().optional(),
  status: z.enum(['PENDENTE', 'PAGO', 'VENCIDO']).optional(),
  paymentMethod: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Patient { id: string; name: string }

interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function NewEntryModal({ onClose, onSaved }: Props) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientSearch, setPatientSearch] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'RECEITA', status: 'PENDENTE' },
  })

  const type = watch('type')
  const status = watch('status')

  const searchPatients = useCallback(async (q: string) => {
    if (q.length < 2) { setPatients([]); return }
    try {
      const { data } = await api.get<Patient[]>('/api/patients/search', { params: { q } })
      setPatients(data)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => void searchPatients(patientSearch), 300)
    return () => clearTimeout(t)
  }, [patientSearch, searchPatients])

  const onSubmit = async (data: FormData) => {
    await api.post('/api/financial', {
      ...data,
      amount: Number(data.amount),
      paymentMethod: data.paymentMethod || undefined,
      patientId: data.patientId || undefined,
      dentistId: data.dentistId || undefined,
      dueDate: data.dueDate || undefined,
      notes: data.notes || undefined,
      category: data.category || undefined,
    })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e8eaed] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111111]">Novo Lançamento</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#888888] hover:bg-[#f7f8fa]"
          >
            <X size={15} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 space-y-4 overflow-y-auto p-5"
        >
          {/* Type toggle */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">Tipo</label>
            <div className="flex rounded-xl border border-[#e8eaed] overflow-hidden">
              {(['RECEITA', 'DESPESA'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t)}
                  className="flex-1 py-2 text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: type === t ? (t === 'RECEITA' ? '#2a9d5c' : '#dc2626') : 'white',
                    color: type === t ? 'white' : '#888888',
                  }}
                >
                  {t === 'RECEITA' ? 'Receita' : 'Despesa'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">Descrição *</label>
            <input
              {...register('description')}
              placeholder="Ex: Consulta ortodôntica"
              className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
            {errors.description && (
              <p className="mt-0.5 text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#555555]">Valor (R$) *</label>
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
              />
              {errors.amount && (
                <p className="mt-0.5 text-xs text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#555555]">Categoria</label>
              <select
                {...register('category')}
                className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
              >
                <option value="">Selecionar...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">Paciente</label>
            <input
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Buscar paciente..."
              className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
            {patients.length > 0 && (
              <div className="mt-1 overflow-hidden rounded-xl border border-[#e8eaed] bg-white shadow-sm">
                {patients.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setValue('patientId', p.id)
                      setPatientSearch(p.name)
                      setPatients([])
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[#f7f8fa]"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#555555]">Status</label>
              <select
                {...register('status')}
                className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
              >
                <option value="PENDENTE">Pendente</option>
                <option value="PAGO">Pago</option>
                <option value="VENCIDO">Vencido</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#555555]">Vencimento</label>
              <input
                {...register('dueDate')}
                type="date"
                className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
              />
            </div>
          </div>

          {status === 'PAGO' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-[#555555]">
                Método de pagamento
              </label>
              <select
                {...register('paymentMethod')}
                className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
              >
                <option value="">Selecionar...</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">Observações</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Observações..."
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
