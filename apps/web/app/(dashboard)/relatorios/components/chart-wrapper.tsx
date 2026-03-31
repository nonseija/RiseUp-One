interface Props {
  title: string
  isLoading: boolean
  children: React.ReactNode
  height?: number
}

export default function ChartWrapper({ title, isLoading, children, height = 300 }: Props) {
  return (
    <div className="rounded-xl border border-[#e8eaed] bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-[#111111]">{title}</h3>
      {isLoading ? (
        <div
          className="animate-pulse rounded-xl bg-[#f7f8fa]"
          style={{ height }}
        />
      ) : (
        children
      )}
    </div>
  )
}
