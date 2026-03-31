interface Service {
  id: string
  name: string
  description?: string | null
  duration: number
  price?: number | null
}

interface Props {
  services: Service[]
  selected: Service | null
  onSelect: (s: Service) => void
  primaryColor: string
}

function fmtDuration(min: number) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h${m}min` : `${h}h`
}

export default function ServiceSelector({ services, selected, onSelect, primaryColor }: Props) {
  if (services.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-[#888888]">
        Nenhum serviço disponível no momento.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#888888]">Selecione o serviço desejado:</p>
      {services.map((svc) => {
        const isSelected = selected?.id === svc.id
        return (
          <button
            key={svc.id}
            onClick={() => onSelect(svc)}
            className="w-full rounded-xl border-2 p-4 text-left transition-all"
            style={{
              borderColor: isSelected ? primaryColor : '#e8eaed',
              backgroundColor: isSelected ? `${primaryColor}10` : '#ffffff',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-[#111111]">{svc.name}</p>
                {svc.description && (
                  <p className="mt-0.5 text-xs text-[#888888]">{svc.description}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-[#888888]">{fmtDuration(svc.duration)}</p>
                {svc.price != null && (
                  <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                    {svc.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                )}
              </div>
            </div>
            {isSelected && (
              <div className="mt-2 flex justify-end">
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Selecionado
                </span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
