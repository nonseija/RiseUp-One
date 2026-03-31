'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import api from '@/lib/api'

const PAYMENT_METHODS = [
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'PIX', label: 'PIX' },
  { value: 'CARTAO_CREDITO', label: 'Cartão de crédito' },
  { value: 'CARTAO_DEBITO', label: 'Cartão de débito' },
  { value: 'BOLETO', label: 'Boleto' },
  { value: 'TRANSFERENCIA', label: 'Transferência' },
] as const

interface Props {
  entryId: string
  onClose: () => void
  onPaid: () => void
}

export default function PayModal({ entryId, onClose, onPaid }: Props) {
  const [method, setMethod] = useState<string>('PIX')
  const [saving, setSaving] = useState(false)

  const handlePay = async () => {
    setSaving(true)
    try {
      await api.patch(`/api/financial/${entryId}/pay`, { paymentMethod: method })
      onPaid()
    } catch {
      alert('Erro ao marcar como pago')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e8eaed] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111111]">Marcar como Pago</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#888888] hover:bg-[#f7f8fa]"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">
              Método de pagamento
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#e8eaed] py-2 text-sm font-medium text-[#555555] hover:bg-[#f7f8fa]"
            >
              Cancelar
            </button>
            <button
              onClick={handlePay}
              disabled={saving}
              className="flex-1 rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: '#2a9d5c' }}
            >
              {saving ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
