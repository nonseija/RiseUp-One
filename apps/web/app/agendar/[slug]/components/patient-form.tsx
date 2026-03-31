'use client'

import { useState, ChangeEvent } from 'react'

export interface PatientData {
  name: string
  phone: string
  email: string
  notes: string
  agreedToPrivacy: boolean
}

interface Props {
  data: PatientData
  onChange: (data: PatientData) => void
  primaryColor: string
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export default function PatientForm({ data, onChange, primaryColor }: Props) {
  function set(field: keyof PatientData, value: string | boolean) {
    onChange({ ...data, [field]: value })
  }

  function handlePhone(e: ChangeEvent<HTMLInputElement>) {
    set('phone', maskPhone(e.target.value))
  }

  const inputClass =
    'w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 placeholder:text-[#cccccc]'

  return (
    <div className="space-y-4" style={{ ['--brand' as string]: primaryColor }}>
      <p className="text-sm text-[#888888]">Preencha seus dados para confirmar o agendamento:</p>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#555555]">
          Nome completo <span className="text-red-500">*</span>
        </label>
        <input
          className={inputClass}
          placeholder="Seu nome completo"
          value={data.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#555555]">
          Telefone <span className="text-red-500">*</span>
        </label>
        <input
          className={inputClass}
          placeholder="(00) 00000-0000"
          value={data.phone}
          onChange={handlePhone}
          inputMode="tel"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#555555]">
          E-mail <span className="text-[#888888]">(opcional)</span>
        </label>
        <input
          className={inputClass}
          placeholder="seu@email.com"
          type="email"
          value={data.email}
          onChange={(e) => set('email', e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#555555]">
          Observações <span className="text-[#888888]">(opcional)</span>
        </label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={3}
          placeholder="Alguma informação adicional..."
          value={data.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded"
          checked={data.agreedToPrivacy}
          onChange={(e) => set('agreedToPrivacy', e.target.checked)}
          style={{ accentColor: primaryColor }}
        />
        <span className="text-xs text-[#555555]">
          Concordo com a{' '}
          <span className="underline" style={{ color: primaryColor }}>
            política de privacidade
          </span>{' '}
          e autorizo o uso dos meus dados para fins de agendamento.
        </span>
      </label>
    </div>
  )
}
