import type { LeadStage } from '../types'
import { STAGE_META } from '../types'

export default function StageBadge({ stage }: { stage: LeadStage }) {
  const meta = STAGE_META[stage]
  return (
    <span
      style={{
        backgroundColor: meta.bg,
        color: meta.color,
        border: meta.border ?? 'none',
        fontWeight: meta.fontWeight ?? 600,
        borderRadius: 6,
        padding: '3px 10px',
        fontSize: 11,
        display: 'inline-block',
        lineHeight: '1.4',
      }}
    >
      {meta.label}
    </span>
  )
}
