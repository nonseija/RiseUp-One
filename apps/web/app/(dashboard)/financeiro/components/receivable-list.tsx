'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import StatusBadge from './status-badge'
import PayModal from './pay-modal'
import type { FinancialEntry } from '../types'

interface Props {
  entries: FinancialEntry[]
  isLoading: boolean
  onRefresh: () => void
}

export default function ReceivableList({ entries, isLoading, onRefresh }: Props) {
  const [payingId, setPayingId] = useState<string | null>(null)

  const receivables = entries
    .filter((e) => e.type === 'RECEITA' && e.status !== 'PAGO')
    .sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#29d9d5] border-t-transparent" />
      </div>
    )
  }

  if (receivables.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-[#e8eaed] bg-white">
        <p className="text-sm text-[#aaaaaa]">Nenhum valor a receber</p>
      </div>
    )
  }

  const overdue = receivables.filter((e) => e.status === 'VENCIDO')
  const pending = receivables.filter((e) => e.status === 'PENDENTE')

  const renderEntry = (e: FinancialEntry) => {
    const isOverdue = e.status === 'VENCIDO'
    return (
      <div
        key={e.id}
        className="flex items-center justify-between rounded-xl border px-4 py-3"
        style={{
          backgroundColor: isOverdue ? '#fef2f2' : 'white',
          borderColor: isOverdue ? '#fecaca' : '#e8eaed',
        }}
      >
        <div className="flex items-center gap-3">
          {isOverdue ? (
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          ) : (
            <div className="h-4 w-4 rounded-full flex-shrink-0" style={{ backgroundColor: '#29d9d5' }} />
          )}
          <div>
            <p className="text-sm font-medium" style={{ color: isOverdue ? '#dc2626' : '#111111' }}>
              {e.description}
            </p>
            <p className="text-xs text-[#888888]">
              {e.patient?.name ?? 'Sem paciente'}
              {e.dueDate && ` · vence ${new Date(e.dueDate).toLocaleDateString('pt-BR')}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold" style={{ color: isOverdue ? '#dc2626' : '#2a9d5c' }}>
              {e.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <StatusBadge status={e.status} />
          </div>
          <button
            onClick={() => setPayingId(e.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#f0faf4] text-[#888888] hover:text-[#2a9d5c]"
            title="Marcar como pago"
          >
            <CheckCircle size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {overdue.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-500">
            Vencidos ({overdue.length})
          </p>
          <div className="space-y-2">{overdue.map(renderEntry)}</div>
        </div>
      )}
      {pending.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#888888]">
            Pendentes ({pending.length})
          </p>
          <div className="space-y-2">{pending.map(renderEntry)}</div>
        </div>
      )}

      {payingId && (
        <PayModal
          entryId={payingId}
          onClose={() => setPayingId(null)}
          onPaid={() => { setPayingId(null); onRefresh() }}
        />
      )}
    </div>
  )
}
