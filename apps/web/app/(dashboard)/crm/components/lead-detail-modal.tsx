'use client'

import { useState } from 'react'
import { X, Phone, Mail, MessageSquare, UserCheck, Trash2 } from 'lucide-react'
import type { Lead, LeadStage } from '../types'
import { STAGE_META, STAGES } from '../types'
import SourceBadge from './source-badge'
import StageBadge from './stage-badge'
import api from '@/lib/api'

interface Props {
  lead: Lead
  onClose: () => void
  onUpdated: (lead: Lead) => void
  onDeleted: (id: string) => void
  onConverted: (leadId: string, patientId: string) => void
}

export default function LeadDetailModal({ lead, onClose, onUpdated, onDeleted, onConverted }: Props) {
  const [loading, setLoading] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'info' | 'atividade'>('info')

  const changeStage = async (stage: LeadStage) => {
    if (stage === lead.stage) return
    setLoading(true)
    setError('')
    try {
      const res = await api.patch<Lead>(`/api/crm/leads/${lead.id}/stage`, { stage })
      onUpdated(res.data)
    } catch {
      setError('Erro ao mover etapa')
    } finally {
      setLoading(false)
    }
  }

  const addNote = async () => {
    if (!noteText.trim()) return
    setLoading(true)
    try {
      await api.post(`/api/crm/leads/${lead.id}/note`, { content: noteText })
      const res = await api.get<Lead>(`/api/crm/leads/${lead.id}`)
      onUpdated(res.data)
      setNoteText('')
    } catch {
      setError('Erro ao adicionar nota')
    } finally {
      setLoading(false)
    }
  }

  const convert = async () => {
    if (!confirm('Converter este lead em paciente?')) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post<{ patient: { id: string }; leadId: string }>(
        `/api/crm/leads/${lead.id}/convert`,
      )
      onConverted(res.data.leadId, res.data.patient.id)
      onClose()
    } catch {
      setError('Erro ao converter')
    } finally {
      setLoading(false)
    }
  }

  const deleteLead = async () => {
    if (!confirm('Excluir este lead?')) return
    setLoading(true)
    try {
      await api.delete(`/api/crm/leads/${lead.id}`)
      onDeleted(lead.id)
      onClose()
    } catch {
      setError('Erro ao excluir')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
        style={{ border: '1px solid #e8eaed', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #e8eaed', backgroundColor: '#f0fffe' }}
        >
          <div>
            <h2 className="text-base font-semibold text-[#111111]">{lead.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <SourceBadge source={lead.source} />
              <StageBadge stage={lead.stage} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#888888] hover:bg-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#e8eaed]">
          {(['info', 'atividade'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 text-xs font-semibold capitalize transition-colors"
              style={{
                color: tab === t ? '#29d9d5' : '#888888',
                borderBottom: tab === t ? '2px solid #29d9d5' : '2px solid transparent',
              }}
            >
              {t === 'info' ? 'Informações' : 'Atividade'}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {tab === 'info' ? (
            <div className="space-y-5 px-6 py-5">
              {/* Contact */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#555555]">
                  <Phone size={14} className="text-[#29d9d5]" />
                  {lead.phone}
                </div>
                {lead.email && (
                  <div className="flex items-center gap-2 text-sm text-[#555555]">
                    <Mail size={14} className="text-[#29d9d5]" />
                    {lead.email}
                  </div>
                )}
              </div>

              {/* Notes */}
              {lead.notes && (
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
                    Observações
                  </p>
                  <p className="text-sm text-[#555555]">{lead.notes}</p>
                </div>
              )}

              {/* Stage mover */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#888888]">
                  Mover Etapa
                </p>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((s) => {
                    const meta = STAGE_META[s]
                    const isActive = s === lead.stage
                    return (
                      <button
                        key={s}
                        onClick={() => changeStage(s)}
                        disabled={loading}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity disabled:opacity-50"
                        style={{
                          backgroundColor: isActive ? meta.bg : '#f7f8fa',
                          color: isActive ? meta.color : '#888888',
                          border: isActive ? `1px solid ${meta.color}40` : '1px solid #e8eaed',
                        }}
                      >
                        {meta.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Created */}
              <p className="text-xs text-[#aaaaaa]">
                Criado em {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ) : (
            <div className="px-6 py-5">
              {/* Add note */}
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNote()}
                  placeholder="Adicionar nota..."
                  className="flex-1 rounded-lg border border-[#e8eaed] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
                />
                <button
                  onClick={addNote}
                  disabled={loading || !noteText.trim()}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#29d9d5' }}
                >
                  <MessageSquare size={14} />
                </button>
              </div>

              {/* Activity list */}
              <div className="space-y-3">
                {lead.activities.length === 0 && (
                  <p className="text-center text-sm text-[#aaaaaa]">Nenhuma atividade</p>
                )}
                {lead.activities.map((act) => (
                  <div key={act.id} className="flex gap-3">
                    <div
                      className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: '#29d9d5' }}
                    />
                    <div>
                      <p className="text-sm text-[#111111]">{act.content}</p>
                      <p className="text-xs text-[#aaaaaa]">
                        {new Date(act.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="px-6 pb-2 text-sm text-red-500">{error}</p>}

        {/* Footer actions */}
        <div className="flex gap-2 border-t border-[#e8eaed] px-6 py-4">
          <button
            onClick={convert}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#f0faf4', color: '#2a9d5c' }}
          >
            <UserCheck size={14} />
            Converter em Paciente
          </button>
          <button
            onClick={deleteLead}
            disabled={loading}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-red-50 disabled:opacity-50"
            style={{ color: '#dc2626' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
