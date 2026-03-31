'use client'

import { useState } from 'react'
import { CheckSquare, Square, CheckCircle, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import StatusBadge from './status-badge'
import EntryTypeBadge from './entry-type-badge'
import PayModal from './pay-modal'
import type { FinancialEntry, Filters } from '../types'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'PIX',
  CARTAO_CREDITO: 'Crédito',
  CARTAO_DEBITO: 'Débito',
  BOLETO: 'Boleto',
  TRANSFERENCIA: 'Transf.',
}

interface Props {
  entries: FinancialEntry[]
  total: number
  page: number
  pageSize: number
  filters: Filters
  isLoading: boolean
  onFiltersChange: (f: Partial<Filters>) => void
  onPageChange: (page: number) => void
  onRefresh: () => void
  onDelete: (id: string) => void
}

export default function EntriesTable({
  entries,
  total,
  page,
  pageSize,
  filters,
  isLoading,
  onFiltersChange,
  onPageChange,
  onRefresh,
  onDelete,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [payingId, setPayingId] = useState<string | null>(null)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const toggleAll = () => {
    if (selected.size === entries.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(entries.map((e) => e.id)))
    }
  }

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  return (
    <div className="space-y-3">
      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        <input
          value={filters.q ?? ''}
          onChange={(e) => onFiltersChange({ q: e.target.value, page: 1 })}
          placeholder="Buscar descrição..."
          className="rounded-xl border border-[#e8eaed] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
        />
        <input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => onFiltersChange({ dateFrom: e.target.value, page: 1 })}
          className="rounded-xl border border-[#e8eaed] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
        />
        <input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => onFiltersChange({ dateTo: e.target.value, page: 1 })}
          className="rounded-xl border border-[#e8eaed] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
        />
        <select
          value={filters.type ?? ''}
          onChange={(e) => onFiltersChange({ type: e.target.value as 'RECEITA' | 'DESPESA' | undefined || undefined, page: 1 })}
          className="rounded-xl border border-[#e8eaed] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
        >
          <option value="">Todos os tipos</option>
          <option value="RECEITA">Receita</option>
          <option value="DESPESA">Despesa</option>
        </select>
        <select
          value={filters.status ?? ''}
          onChange={(e) => onFiltersChange({ status: e.target.value as 'PENDENTE' | 'PAGO' | 'VENCIDO' | undefined || undefined, page: 1 })}
          className="rounded-xl border border-[#e8eaed] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
        >
          <option value="">Todos os status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PAGO">Pago</option>
          <option value="VENCIDO">Vencido</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#e8eaed] bg-white">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#29d9d5] border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-sm text-[#aaaaaa]">Nenhum lançamento encontrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8eaed] bg-[#f7f8fa]">
                <th className="px-3 py-3">
                  <button onClick={toggleAll}>
                    {selected.size === entries.length && entries.length > 0 ? (
                      <CheckSquare size={14} style={{ color: '#29d9d5' }} />
                    ) : (
                      <Square size={14} className="text-[#aaaaaa]" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#888888]">Data</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#888888]">Descrição</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#888888]">Paciente</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#888888]">Categoria</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-[#888888]">Valor</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#888888]">Tipo</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#888888]">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#888888]">Método</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr
                  key={e.id}
                  className={`border-b border-[#f0f0f0] hover:bg-[#f7f8fa] ${i === entries.length - 1 ? 'border-0' : ''}`}
                >
                  <td className="px-3 py-3">
                    <button onClick={() => toggle(e.id)}>
                      {selected.has(e.id) ? (
                        <CheckSquare size={14} style={{ color: '#29d9d5' }} />
                      ) : (
                        <Square size={14} className="text-[#aaaaaa]" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-3 text-[#888888] whitespace-nowrap">
                    {new Date(e.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-3 py-3 font-medium text-[#111111] max-w-[180px] truncate">
                    {e.description}
                  </td>
                  <td className="px-3 py-3 text-[#555555]">{e.patient?.name ?? '—'}</td>
                  <td className="px-3 py-3 text-[#888888]">{e.category ?? '—'}</td>
                  <td className="px-3 py-3 text-right font-semibold whitespace-nowrap"
                    style={{ color: e.type === 'RECEITA' ? '#2a9d5c' : '#dc2626' }}
                  >
                    {e.type === 'RECEITA' ? '+' : '-'}
                    {e.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-3 py-3">
                    <EntryTypeBadge type={e.type} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-3 py-3 text-xs text-[#888888]">
                    {e.paymentMethod ? PAYMENT_METHOD_LABELS[e.paymentMethod] ?? e.paymentMethod : '—'}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {e.status !== 'PAGO' && (
                        <button
                          title="Marcar como pago"
                          onClick={() => setPayingId(e.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#888888] hover:bg-[#f0faf4] hover:text-[#2a9d5c]"
                        >
                          <CheckCircle size={13} />
                        </button>
                      )}
                      <button
                        title="Excluir"
                        onClick={() => onDelete(e.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#888888] hover:bg-[#fef2f2] hover:text-[#dc2626]"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-[#888888]">
        <span>{total} lançamento{total !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#f7f8fa] disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-2 text-xs">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#f7f8fa] disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

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
