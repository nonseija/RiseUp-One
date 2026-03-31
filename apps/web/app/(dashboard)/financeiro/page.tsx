'use client'

import { useState, useCallback, useEffect } from 'react'
import { DollarSign, Plus } from 'lucide-react'
import api from '@/lib/api'
import SummaryCards from './components/summary-cards'
import EntriesTable from './components/entries-table'
import ReceivableList from './components/receivable-list'
import ExpensesChart from './components/expenses-chart'
import NewEntryModal from './components/new-entry-modal'
import type { FinancialEntry, FinancialSummary, Filters } from './types'

type Tab = 'lancamentos' | 'receber' | 'despesas'

const TABS: { id: Tab; label: string }[] = [
  { id: 'lancamentos', label: 'Lançamentos' },
  { id: 'receber', label: 'A Receber' },
  { id: 'despesas', label: 'Despesas' },
]

const PAGE_SIZE = 20

interface EntriesResponse {
  total: number
  page: number
  pageSize: number
  items: FinancialEntry[]
}

export default function FinanceiroPage() {
  const now = new Date()
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [entries, setEntries] = useState<FinancialEntry[]>([])
  const [total, setTotal] = useState(0)
  const [entriesLoading, setEntriesLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('lancamentos')
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState<Filters>({ page: 1 })

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true)
    try {
      const { data } = await api.get<FinancialSummary>('/api/financial/summary', {
        params: { month: now.getMonth() + 1, year: now.getFullYear() },
      })
      setSummary(data)
    } catch {
      // ignore
    } finally {
      setSummaryLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadEntries = useCallback(async (f: Filters) => {
    setEntriesLoading(true)
    try {
      const params: Record<string, string | number> = {
        page: f.page,
        pageSize: PAGE_SIZE,
      }
      if (f.q) params.q = f.q
      if (f.type) params.type = f.type
      if (f.status) params.status = f.status
      if (f.dateFrom) params.dateFrom = f.dateFrom
      if (f.dateTo) params.dateTo = f.dateTo

      const { data } = await api.get<EntriesResponse>('/api/financial', { params })
      setEntries(data.items)
      setTotal(data.total)
    } catch {
      // ignore
    } finally {
      setEntriesLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSummary()
  }, [loadSummary])

  useEffect(() => {
    const t = setTimeout(() => void loadEntries(filters), filters.q ? 300 : 0)
    return () => clearTimeout(t)
  }, [filters, loadEntries])

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este lançamento?')) return
    try {
      await api.delete(`/api/financial/${id}`)
      void loadEntries(filters)
      void loadSummary()
    } catch {
      alert('Erro ao remover lançamento')
    }
  }

  const handleRefresh = () => {
    void loadEntries(filters)
    void loadSummary()
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: '#f0fffe', border: '1.5px solid rgba(41,217,213,0.25)' }}
          >
            <DollarSign size={20} style={{ color: '#29d9d5' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#111111]">Financeiro</h1>
            <p className="text-xs text-[#888888]">
              {now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: '#29d9d5' }}
        >
          <Plus size={15} />
          Novo Lançamento
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-6">
        <SummaryCards summary={summary ?? {
          totalReceitas: 0, totalDespesas: 0, saldo: 0,
          receitasPendentes: 0, receitasVencidas: 0,
          receitasPorCategoria: [], evolucaoMensal: [],
        }} isLoading={summaryLoading} />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-[#e8eaed]">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                borderColor: active ? '#29d9d5' : 'transparent',
                color: active ? '#29d9d5' : '#888888',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Lançamentos tab */}
      {activeTab === 'lancamentos' && (
        <EntriesTable
          entries={entries}
          total={total}
          page={filters.page}
          pageSize={PAGE_SIZE}
          filters={filters}
          isLoading={entriesLoading}
          onFiltersChange={(partial) =>
            setFilters((prev) => ({ ...prev, ...partial }))
          }
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          onRefresh={handleRefresh}
          onDelete={handleDelete}
        />
      )}

      {/* A Receber tab */}
      {activeTab === 'receber' && (
        <ReceivableList
          entries={entries}
          isLoading={entriesLoading}
          onRefresh={handleRefresh}
        />
      )}

      {/* Despesas tab */}
      {activeTab === 'despesas' && (
        <ExpensesChart entries={entries} isLoading={entriesLoading} />
      )}

      {showModal && (
        <NewEntryModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false)
            handleRefresh()
          }}
        />
      )}
    </div>
  )
}
