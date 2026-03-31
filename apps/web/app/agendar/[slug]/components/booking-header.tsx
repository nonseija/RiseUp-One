interface Props {
  clinicName: string
  logoUrl?: string | null
  primaryColor: string
}

export default function BookingHeader({ clinicName, logoUrl, primaryColor }: Props) {
  return (
    <div
      className="flex items-center gap-3 rounded-t-2xl p-5"
      style={{ backgroundColor: primaryColor }}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={clinicName} className="h-10 w-10 rounded-full object-cover" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-sm font-bold text-white">
          {clinicName.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-white/70">Agendamento Online</p>
        <h1 className="text-lg font-bold text-white">{clinicName}</h1>
      </div>
    </div>
  )
}
