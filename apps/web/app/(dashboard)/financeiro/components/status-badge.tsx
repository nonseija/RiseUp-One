type Status = 'PENDENTE' | 'PAGO' | 'VENCIDO'

const META: Record<Status, { label: string; color: string; bg: string }> = {
  PENDENTE: { label: 'Pendente', color: '#f59e0b', bg: '#fffbeb' },
  PAGO:     { label: 'Pago',     color: '#2a9d5c', bg: '#f0faf4' },
  VENCIDO:  { label: 'Vencido', color: '#dc2626', bg: '#fef2f2' },
}

export default function StatusBadge({ status }: { status: string }) {
  const m = META[status as Status] ?? META.PENDENTE
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ color: m.color, backgroundColor: m.bg }}
    >
      {m.label}
    </span>
  )
}
