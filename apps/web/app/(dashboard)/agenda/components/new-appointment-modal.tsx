'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Search } from 'lucide-react'
import type { Appointment, DentistOption, PatientSuggestion } from '../types'
import api from '@/lib/api'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  patientId:   z.string().min(1, 'Selecione um paciente'),
  patientName: z.string(),
  dentistId:   z.string().min(1, 'Selecione um dentista'),
  date:        z.string().min(1, 'Selecione a data'),
  time:        z.string().min(1, 'Selecione o horário'),
  service:     z.string().min(1, 'Informe o procedimento'),
  duration:    z.coerce.number().int().min(15),
  notes:       z.string().optional(),
  leadId:      z.string().optional(),
})

type FormData = z.infer<typeof schema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean
  onClose: () => void
  defaultDate?: string
  defaultTime?: string
  onCreated: (apt: Appointment) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewAppointmentModal({
  isOpen,
  onClose,
  defaultDate,
  defaultTime,
  onCreated,
}: Props) {
  const [dentists, setDentists] = useState<DentistOption[]>([])
  const [slots, setSlots] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<PatientSuggestion[]>([])
  const [showSugg, setShowSugg] = useState(false)
  const [serverError, setServerError] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: defaultDate ?? '',
      time: defaultTime ?? '',
      duration: 60,
    },
  })

  const watchedDentistId = watch('dentistId')
  const watchedDate = watch('date')
  const watchedPatientName = watch('patientName')

  // Load dentists on mount
  useEffect(() => {
    api.get<DentistOption[]>('/api/appointments/dentists').then((r) => setDentists(r.data)).catch(() => {})
  }, [])

  // Load slots when dentist + date change
  useEffect(() => {
    if (!watchedDentistId || !watchedDate) { setSlots([]); return }
    api
      .get<string[]>(`/api/appointments/slots?dentistId=${watchedDentistId}&date=${watchedDate}`)
      .then((r) => {
        setSlots(r.data)
        if (defaultTime && r.data.includes(defaultTime)) setValue('time', defaultTime)
      })
      .catch(() => setSlots([]))
  }, [watchedDentistId, watchedDate, defaultTime, setValue])

  // Patient search debounce
  useEffect(() => {
    if (!watchedPatientName || watchedPatientName.length < 2) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(() => {
      api
        .get<PatientSuggestion[]>(`/api/patients/search?q=${encodeURIComponent(watchedPatientName)}`)
        .then((r) => setSuggestions(r.data))
        .catch(() => setSuggestions([]))
    }, 300)
    return () => clearTimeout(timer)
  }, [watchedPatientName])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSugg(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectPatient = (p: PatientSuggestion) => {
    setValue('patientId', p.id)
    setValue('patientName', p.name)
    setShowSugg(false)
    setSuggestions([])
  }

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      const datetime = new Date(`${data.date}T${data.time}:00`).toISOString()
      const res = await api.post<Appointment>('/api/appointments', {
        patientId: data.patientId,
        dentistId: data.dentistId,
        datetime,
        duration: data.duration,
        service: data.service,
        notes: data.notes,
        leadId: data.leadId,
      })
      onCreated(res.data)
      reset()
      onClose()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setServerError(e.response?.data?.message ?? 'Erro ao criar consulta')
    }
  }

  if (!isOpen) return null

  const FieldErr = ({ msg }: { msg?: string }) =>
    msg ? <p className="mt-0.5 text-xs text-red-500">{msg}</p> : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl"
        style={{ border: '1px solid #e8eaed', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #e8eaed', backgroundColor: '#f0fffe' }}
        >
          <h2 className="text-base font-semibold text-[#111111]">Nova Consulta</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#888888] hover:bg-white"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          {/* Patient autocomplete */}
          <div ref={searchRef}>
            <label className="mb-1 block text-xs font-semibold text-[#555555]">Paciente</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
              <input
                type="text"
                placeholder="Buscar paciente por nome ou telefone..."
                {...register('patientName')}
                onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                onChange={(e) => {
                  setValue('patientName', e.target.value)
                  setValue('patientId', '')
                  setShowSugg(true)
                }}
                className="w-full rounded-lg border py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
                style={{ borderColor: errors.patientId ? '#ef4444' : '#e8eaed' }}
                autoComplete="off"
              />
            </div>
            <input type="hidden" {...register('patientId')} />

            {/* Suggestions dropdown */}
            {showSugg && suggestions.length > 0 && (
              <div
                className="relative z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#e8eaed] bg-white shadow-lg"
              >
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPatient(p)}
                    className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-[#f0fffe]"
                  >
                    <span className="text-sm font-medium text-[#111111]">{p.name}</span>
                    <span className="text-xs text-[#888888]">{p.phone}</span>
                  </button>
                ))}
              </div>
            )}
            <FieldErr msg={errors.patientId?.message} />
          </div>

          {/* Dentist */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555555]">Dentista</label>
            <select
              {...register('dentistId')}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
              style={{ borderColor: errors.dentistId ? '#ef4444' : '#e8eaed' }}
            >
              <option value="">Selecionar dentista...</option>
              {dentists.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <FieldErr msg={errors.dentistId?.message} />
          </div>

          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#555555]">Data</label>
              <input
                type="date"
                {...register('date')}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
                style={{ borderColor: errors.date ? '#ef4444' : '#e8eaed' }}
              />
              <FieldErr msg={errors.date?.message} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#555555]">Horário</label>
              <select
                {...register('time')}
                disabled={slots.length === 0}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40 disabled:bg-[#f7f8fa] disabled:text-[#aaa]"
                style={{ borderColor: errors.time ? '#ef4444' : '#e8eaed' }}
              >
                <option value="">
                  {watchedDentistId && watchedDate
                    ? slots.length === 0
                      ? 'Sem horários livres'
                      : 'Selecionar...'
                    : 'Selecione dentista e data'}
                </option>
                {slots.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <FieldErr msg={errors.time?.message} />
            </div>
          </div>

          {/* Service */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555555]">Procedimento</label>
            <input
              type="text"
              placeholder="Ex: Limpeza, Canal, Extração..."
              {...register('service')}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
              style={{ borderColor: errors.service ? '#ef4444' : '#e8eaed' }}
            />
            <FieldErr msg={errors.service?.message} />
          </div>

          {/* Duration */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555555]">Duração</label>
            <select
              {...register('duration')}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
              style={{ borderColor: '#e8eaed' }}
            >
              {[30, 45, 60, 90].map((m) => (
                <option key={m} value={m}>{m} minutos</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#555555]">Observações</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Observações opcionais..."
              className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
              style={{ borderColor: '#e8eaed' }}
            />
          </div>

          {serverError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#e8eaed] py-2.5 text-sm font-medium text-[#555555] hover:bg-[#f7f8fa]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: '#29d9d5' }}
            >
              {isSubmitting ? 'Agendando...' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
