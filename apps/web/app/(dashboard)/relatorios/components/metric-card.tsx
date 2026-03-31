interface Props {
  label: string
  value: string | number
  sub?: string
  color?: string
  icon?: React.ReactNode
}

export default function MetricCard({ label, value, sub, color = '#111111', icon }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#e8eaed] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#888888]">{label}</span>
        {icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f0fffe]">
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-xs text-[#888888]">{sub}</p>}
    </div>
  )
}
