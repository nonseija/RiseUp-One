interface Dentist {
  id: string
  name: string
}

interface Props {
  dentists: Dentist[]
  selected: Dentist | null
  onSelect: (d: Dentist) => void
  primaryColor: string
}

const ANY_DENTIST: Dentist = { id: 'any', name: 'Sem preferência' }

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export default function DentistSelector({ dentists, selected, onSelect, primaryColor }: Props) {
  const options = [ANY_DENTIST, ...dentists]

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#888888]">Escolha o profissional de sua preferência:</p>
      {options.map((dentist) => {
        const isSelected = selected?.id === dentist.id
        const isAny = dentist.id === 'any'
        return (
          <button
            key={dentist.id}
            onClick={() => onSelect(dentist)}
            className="flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all"
            style={{
              borderColor: isSelected ? primaryColor : '#e8eaed',
              backgroundColor: isSelected ? `${primaryColor}10` : '#ffffff',
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: isAny ? '#cccccc' : primaryColor }}
            >
              {isAny ? '?' : initials(dentist.name)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#111111]">{dentist.name}</p>
              {isAny && (
                <p className="text-xs text-[#888888]">Primeiro disponível no horário</p>
              )}
            </div>
            {isSelected && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                ✓
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
