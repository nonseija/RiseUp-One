'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, LayoutGrid, List, Search } from 'lucide-react'
import type { Lead, LeadStage } from './types'
import api from '@/lib/api'

import KanbanBoard from './components/kanban-board'
import LeadList from './components/lead-list'
import NewLeadModal from './components/new-lead-modal'
import LeadDetailModal from './components/lead-detail-modal'

type ViewMode = 'kanban' | 'list'

export default function CrmPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [newModal, setNewModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = search ? `?q=${encodeURIComponent(search)}` : ''
      const res = await api.get<Lead[]>(`/api/crm/leads${params}`)
      setLeads(res.data)
    } catch {
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(fetchLeads, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [fetchLeads, search])

  const handleCreated = (lead: Lead) => {
    setLeads((prev) => [lead, ...prev])
  }

  const handleUpdated = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
    if (selectedLead?.id === updated.id) setSelectedLead(updated)
  }

  const handleDeleted = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  const handleConverted = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: 'ATIVO' as LeadStage } : l)),
    )
  }

  const handleStageDrop = async (leadId: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l)),
    )
    try {
      const res = await api.patch<Lead>(`/api/crm/leads/${leadId}/stage`, { stage: newStage })
      setLeads((prev) => prev.map((l) => (l.id === leadId ? res.data : l)))
    } catch {
      fetchLeads()
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#f7f8fa]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8eaed] bg-white px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-[#111111]">CRM</h1>
          <span className="text-xs text-[#888888]">{leads.length} leads</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar lead..."
              className="h-9 rounded-lg border border-[#e8eaed] pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
            />
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg border border-[#e8eaed] bg-white p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
              style={{
                backgroundColor: viewMode === 'kanban' ? '#f0fffe' : 'transparent',
                color: viewMode === 'kanban' ? '#1fb8b4' : '#888888',
              }}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
              style={{
                backgroundColor: viewMode === 'list' ? '#f0fffe' : 'transparent',
                color: viewMode === 'list' ? '#1fb8b4' : '#888888',
              }}
            >
              <List size={15} />
            </button>
          </div>

          {/* New lead button */}
          <button
            onClick={() => setNewModal(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#29d9d5' }}
          >
            <Plus size={16} />
            Novo Lead
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-4 lg:p-6">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2"
              style={{ borderColor: '#29d9d5', borderTopColor: 'transparent' }}
            />
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            leads={leads}
            onLeadClick={setSelectedLead}
            onStageDrop={handleStageDrop}
          />
        ) : (
          <LeadList leads={leads} onLeadClick={setSelectedLead} />
        )}
      </div>

      {/* Modals */}
      <NewLeadModal
        isOpen={newModal}
        onClose={() => setNewModal(false)}
        onCreated={handleCreated}
      />

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
          onConverted={handleConverted}
        />
      )}
    </div>
  )
}
