'use client'

import { CheckCircle, Clock } from 'lucide-react'

interface Anamnesis {
  completedAt?: string | null
  allergies?: string | null
  medications?: string | null
  illnesses?: string | null
  surgeries?: string | null
  pregnant?: boolean | null
  smoker?: boolean | null
  notes?: string | null
}

interface Props {
  anamnesis?: Anamnesis | null
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <span className="text-xs font-semibold text-[#555555]">{label}: </span>
      <span className="text-xs text-[#888888]">{value}</span>
    </div>
  )
}

export default function AnamuseSummary({ anamnesis }: Props) {
  if (!anamnesis) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-[#f7f8fa] px-4 py-3">
        <Clock size={14} className="text-[#aaaaaa]" />
        <p className="text-xs text-[#888888]">Anamnese não preenchida</p>
      </div>
    )
  }

  if (!anamnesis.completedAt) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3">
        <Clock size={14} className="text-amber-500" />
        <p className="text-xs text-amber-600">Link de anamnese enviado — aguardando preenchimento</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#e8eaed] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <CheckCircle size={14} style={{ color: '#29d9d5' }} />
        <span className="text-xs font-semibold text-[#111111]">Anamnese preenchida</span>
        <span className="text-xs text-[#888888]">
          em {new Date(anamnesis.completedAt).toLocaleDateString('pt-BR')}
        </span>
      </div>
      <div className="space-y-1.5">
        <Row label="Alergias" value={anamnesis.allergies} />
        <Row label="Medicamentos" value={anamnesis.medications} />
        <Row label="Doenças" value={anamnesis.illnesses} />
        <Row label="Cirurgias" value={anamnesis.surgeries} />
        {anamnesis.pregnant !== null && anamnesis.pregnant !== undefined && (
          <Row label="Gestante" value={anamnesis.pregnant ? 'Sim' : 'Não'} />
        )}
        {anamnesis.smoker !== null && anamnesis.smoker !== undefined && (
          <Row label="Fumante" value={anamnesis.smoker ? 'Sim' : 'Não'} />
        )}
        <Row label="Obs." value={anamnesis.notes} />
      </div>
    </div>
  )
}
