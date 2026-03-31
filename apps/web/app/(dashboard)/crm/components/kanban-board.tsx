'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { Lead, LeadStage } from '../types'
import { STAGES } from '../types'
import KanbanColumn from './kanban-column'
import LeadCard from './lead-card'

interface Props {
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
  onStageDrop: (leadId: string, newStage: LeadStage) => void
}

export default function KanbanBoard({ leads, onLeadClick, onStageDrop }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const activeLead = activeId ? leads.find((l) => l.id === activeId) ?? null : null

  const byStage = STAGES.reduce<Record<LeadStage, Lead[]>>(
    (acc, s) => ({ ...acc, [s]: [] }),
    {} as Record<LeadStage, Lead[]>,
  )
  for (const lead of leads) {
    byStage[lead.stage].push(lead)
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string)
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const newStage = over.id as LeadStage
    const lead = leads.find((l) => l.id === active.id)
    if (lead && lead.stage !== newStage) {
      onStageDrop(lead.id, newStage)
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 pb-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            leads={byStage[stage]}
            onLeadClick={onLeadClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead && (
          <div className="rotate-2 opacity-90">
            <LeadCard lead={activeLead} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
