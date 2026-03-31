'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Phone, Mail } from 'lucide-react'
import type { Lead } from '../types'
import SourceBadge from './source-badge'

interface Props {
  lead: Lead
  onClick: (lead: Lead) => void
}

export default function LeadCard({ lead, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(lead)}
      className="cursor-grab rounded-xl border border-[#e8eaed] bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-[#111111] leading-tight">{lead.name}</p>
        <SourceBadge source={lead.source} />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-[#888888]">
          <Phone size={11} />
          <span>{lead.phone}</span>
        </div>
        {lead.email && (
          <div className="flex items-center gap-1.5 text-xs text-[#888888]">
            <Mail size={11} />
            <span className="truncate">{lead.email}</span>
          </div>
        )}
      </div>
      {lead.notes && (
        <p className="mt-2 line-clamp-2 text-xs text-[#aaaaaa]">{lead.notes}</p>
      )}
    </div>
  )
}
