'use client'

import { useDroppable } from '@dnd-kit/core'
import type { Lead, LeadStage } from '../types'
import { STAGE_META } from '../types'
import LeadCard from './lead-card'

interface Props {
  stage: LeadStage
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
}

export default function KanbanColumn({ stage, leads, onLeadClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const meta = STAGE_META[stage]

  return (
    <div className="flex w-64 flex-shrink-0 flex-col">
      {/* Column header */}
      <div
        className="mb-3 flex items-center justify-between rounded-lg px-3 py-2"
        style={{ backgroundColor: meta.bg }}
      >
        <span className="text-xs font-semibold" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
          style={{ backgroundColor: meta.color, color: '#fff' }}
        >
          {leads.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 rounded-xl p-2 transition-colors"
        style={{
          minHeight: 120,
          backgroundColor: isOver ? `${meta.color}12` : 'transparent',
          border: isOver ? `2px dashed ${meta.color}` : '2px dashed transparent',
        }}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
        ))}
        {leads.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-8">
            <p className="text-xs text-[#cccccc]">Solte aqui</p>
          </div>
        )}
      </div>
    </div>
  )
}
