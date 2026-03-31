interface BookingResult {
  appointment: {
    service: string
    date: string
    time: string
    duration: number
  }
  patient: { name: string; phone: string }
}

interface Props {
  result: BookingResult
  dentistName: string
  primaryColor: string
  onReset: () => void
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const names = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
  return `${d} de ${names[m - 1]} de ${y}`
}

export default function BookingSuccess({ result, dentistName, primaryColor, onReset }: Props) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      {/* Check icon */}
      <div
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: `${primaryColor}15` }}
      >
        <svg
          className="h-10 w-10"
          fill="none"
          stroke={primaryColor}
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-[#111111]">Agendamento confirmado!</h2>
      <p className="mt-1 text-sm text-[#888888]">
        Você receberá uma confirmação no WhatsApp em breve.
      </p>

      {/* Summary card */}
      <div className="mt-6 w-full rounded-xl border border-[#e8eaed] bg-[#f7f8fa] p-4 text-left">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#888888]">
          Resumo do agendamento
        </p>
        <div className="space-y-2">
          <Row label="Serviço" value={result.appointment.service} />
          <Row label="Profissional" value={dentistName} />
          <Row label="Data" value={fmtDate(result.appointment.date)} />
          <Row label="Horário" value={result.appointment.time} />
          <Row label="Duração" value={`${result.appointment.duration} min`} />
          <Row label="Paciente" value={result.patient.name} />
          <Row label="Telefone" value={result.patient.phone} />
        </div>
      </div>

      <button
        onClick={onReset}
        className="mt-6 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        style={{ backgroundColor: primaryColor }}
      >
        Fazer outro agendamento
      </button>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-[#888888]">{label}</span>
      <span className="font-medium text-[#111111]">{value}</span>
    </div>
  )
}
