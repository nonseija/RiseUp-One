'use client'

import { useState, useEffect } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface Props {
  slug: string
  dentistId: string
  date: string
  serviceId: string
  selected: string
  onSelect: (time: string) => void
  primaryColor: string
}

export default function TimeSelector({ slug, dentistId, date, serviceId, selected, onSelect, primaryColor }: Props) {
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!date) return
    setLoading(true)
    const params = new URLSearchParams({ dentistId, date, serviceId })
    fetch(`${API}/api/public/${slug}/slots?${params}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }, [slug, dentistId, date, serviceId])

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-[#888888]">
        Carregando horários...
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm font-medium text-[#111111]">Sem horários disponíveis</p>
        <p className="mt-1 text-xs text-[#888888]">Escolha outra data ou dentista.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-3 text-sm text-[#888888]">
        {slots.length} horário{slots.length !== 1 ? 's' : ''} disponível{slots.length !== 1 ? 'is' : ''}:
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => {
          const isSelected = selected === slot
          return (
            <button
              key={slot}
              onClick={() => onSelect(slot)}
              className="rounded-xl border-2 py-3 text-sm font-semibold transition"
              style={{
                borderColor: isSelected ? primaryColor : '#e8eaed',
                backgroundColor: isSelected ? primaryColor : '#ffffff',
                color: isSelected ? '#ffffff' : '#111111',
              }}
            >
              {slot}
            </button>
          )
        })}
      </div>
    </div>
  )
}
