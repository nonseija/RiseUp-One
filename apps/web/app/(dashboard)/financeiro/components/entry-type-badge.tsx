export default function EntryTypeBadge({ type }: { type: string }) {
  const isReceita = type === 'RECEITA'
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{
        color: isReceita ? '#2a9d5c' : '#dc2626',
        backgroundColor: isReceita ? '#f0faf4' : '#fef2f2',
      }}
    >
      {isReceita ? 'Receita' : 'Despesa'}
    </span>
  )
}
