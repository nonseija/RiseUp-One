'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

const ILLNESS_OPTIONS = [
  'Diabetes',
  'Hipertensão',
  'Cardiopatia',
  'Asma / Bronquite',
  'Epilepsia',
  'Osteoporose',
  'Doença renal',
  'Doença hepática',
  'HIV / AIDS',
  'Câncer',
]

interface AnamnesisInfo {
  patient: { name: string }
  completedAt?: string | null
}

export default function AnamnesisPage() {
  const params = useParams()
  const token = params.token as string

  const [info, setInfo] = useState<AnamnesisInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [allergies, setAllergies] = useState('')
  const [medications, setMedications] = useState('')
  const [selectedIllnesses, setSelectedIllnesses] = useState<string[]>([])
  const [illnessOther, setIllnessOther] = useState('')
  const [surgeries, setSurgeries] = useState('')
  const [pregnant, setPregnant] = useState<boolean | null>(null)
  const [smoker, setSmoker] = useState<boolean | null>(null)
  const [notes, setNotes] = useState('')

  const apiBase =
    typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001')
      : 'http://localhost:3001'

  useEffect(() => {
    fetch(`${apiBase}/api/anamnesis/${token}`)
      .then((r) => r.json())
      .then((data: AnamnesisInfo) => {
        setInfo(data)
        if (data.completedAt) setSubmitted(true)
      })
      .catch(() => setInfo(null))
      .finally(() => setIsLoading(false))
  }, [token, apiBase])

  const toggleIllness = (illness: string) => {
    setSelectedIllnesses((prev) =>
      prev.includes(illness) ? prev.filter((i) => i !== illness) : [...prev, illness],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const illnessesStr = [
        ...selectedIllnesses,
        ...(illnessOther ? illnessOther.split(',').map((s) => s.trim()).filter(Boolean) : []),
      ].join(', ')

      await fetch(`${apiBase}/api/anamnesis/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allergies: allergies || undefined,
          medications: medications || undefined,
          illnesses: illnessesStr || undefined,
          surgeries: surgeries || undefined,
          pregnant: pregnant ?? undefined,
          smoker: smoker ?? undefined,
          notes: notes || undefined,
        }),
      })
      setSubmitted(true)
    } catch {
      alert('Erro ao enviar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#29d9d5] border-t-transparent" />
      </div>
    )
  }

  if (!info) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
        <div className="text-center">
          <p className="text-lg font-semibold text-[#111111]">Ficha não encontrada</p>
          <p className="mt-1 text-sm text-[#888888]">
            O link pode ter expirado ou é inválido.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: '#f0fffe' }}
          >
            <CheckCircle size={28} style={{ color: '#29d9d5' }} />
          </div>
          <h1 className="text-xl font-bold text-[#111111]">Ficha enviada com sucesso!</h1>
          <p className="mt-2 text-sm text-[#888888]">
            Obrigado, {info.patient.name}! Sua ficha de anamnese foi registrada.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 pt-6 text-center">
          <div
            className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold"
            style={{ backgroundColor: '#29d9d5' }}
          >
            R
          </div>
          <h1 className="text-xl font-bold text-[#111111]">Ficha de Anamnese</h1>
          <p className="mt-1 text-sm text-[#888888]">Olá, {info.patient.name}!</p>
          <p className="mt-0.5 text-xs text-[#aaaaaa]">
            Preencha as informações abaixo para nos ajudar a oferecer o melhor atendimento.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#111111]">
              Alergias
            </label>
            <textarea
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              rows={2}
              placeholder="Descreva alergias a medicamentos ou materiais..."
              className="w-full resize-none rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#111111]">
              Medicamentos em uso
            </label>
            <textarea
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              rows={2}
              placeholder="Liste os medicamentos que você toma regularmente..."
              className="w-full resize-none rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#111111]">
              Doenças / condições de saúde
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ILLNESS_OPTIONS.map((illness) => (
                <label
                  key={illness}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                  style={{
                    borderColor: selectedIllnesses.includes(illness)
                      ? '#29d9d5'
                      : '#e8eaed',
                    backgroundColor: selectedIllnesses.includes(illness)
                      ? '#f0fffe'
                      : 'white',
                    color: selectedIllnesses.includes(illness) ? '#29d9d5' : '#555555',
                  }}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedIllnesses.includes(illness)}
                    onChange={() => toggleIllness(illness)}
                  />
                  {illness}
                </label>
              ))}
            </div>
            <input
              value={illnessOther}
              onChange={(e) => setIllnessOther(e.target.value)}
              placeholder="Outras (separadas por vírgula)"
              className="mt-2 w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#111111]">
              Cirurgias anteriores
            </label>
            <textarea
              value={surgeries}
              onChange={(e) => setSurgeries(e.target.value)}
              rows={2}
              placeholder="Descreva cirurgias realizadas anteriormente..."
              className="w-full resize-none rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111111]">
                Gestante?
              </label>
              <div className="flex gap-2">
                {[
                  { label: 'Sim', value: true },
                  { label: 'Não', value: false },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setPregnant(opt.value)}
                    className="flex-1 rounded-xl border py-2 text-sm font-medium transition-colors"
                    style={{
                      borderColor: pregnant === opt.value ? '#29d9d5' : '#e8eaed',
                      backgroundColor: pregnant === opt.value ? '#f0fffe' : 'white',
                      color: pregnant === opt.value ? '#29d9d5' : '#555555',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#111111]">
                Fumante?
              </label>
              <div className="flex gap-2">
                {[
                  { label: 'Sim', value: true },
                  { label: 'Não', value: false },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setSmoker(opt.value)}
                    className="flex-1 rounded-xl border py-2 text-sm font-medium transition-colors"
                    style={{
                      borderColor: smoker === opt.value ? '#29d9d5' : '#e8eaed',
                      backgroundColor: smoker === opt.value ? '#f0fffe' : 'white',
                      color: smoker === opt.value ? '#29d9d5' : '#555555',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#111111]">
              Observações adicionais
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Informe qualquer outra condição relevante..."
              className="w-full resize-none rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: '#29d9d5' }}
          >
            {submitting ? 'Enviando...' : 'Enviar Ficha de Anamnese'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[#aaaaaa]">
          Suas informações são confidenciais e usadas apenas para fins clínicos.
        </p>
      </div>
    </div>
  )
}
