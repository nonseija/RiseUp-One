import type { LeadSource } from '../types'
import { SOURCE_META } from '../types'

export default function SourceBadge({ source }: { source: LeadSource }) {
  const meta = SOURCE_META[source]
  return (
    <span
      style={{
        backgroundColor: meta.bg,
        color: meta.color,
        border: meta.border ?? 'none',
        fontWeight: 600,
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
