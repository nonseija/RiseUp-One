'use client'

import { useState, useEffect, use } from 'react'
import BookingHeader from './components/booking-header'
import ServiceSelector from './components/service-selector'
import DentistSelector from './components/dentist-selector'
import DateSelector from './components/date-selector'
import TimeSelector from './components/time-selector'
import PatientForm, { type PatientData } from './components/patient-form'
import BookingSuccess from './components/booking-success'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface Service { id: string; name: string; description?: string | null; duration: number; price?: number | null }
interface Dentist { id: string; name: string }
interface ClinicSettings {
  workingDays: number[]; workingHoursStart: string; workingHoursEnd: string
  slotDuration: number; bookingEnabled: boolean; bookingMessage?: string | null; primaryColor: string
}
interface ClinicData {
  name: string; slug: string; logoUrl?: string | null
  services: Service[]; dentists: Dentist[]; settings: ClinicSettings
}
interface BookingResult {
  appointment: { service: string; date: string; time: string; duration: number }
  patient: { name: string; phone: string }
}

const STEP_LABELS = ['Serviço', 'Dentista', 'Data', 'Horário', 'Seus dados']
const EMPTY_PATIENT: PatientData = { name: '', phone: '', email: '', notes: '', agreedToPrivacy: false }

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const [clinic, setClinic] = useState<ClinicData | null>(null)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [patientData, setPatientData] = useState<PatientData>(EMPTY_PATIENT)
  const [result, setResult] = useState<BookingResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    fetch(`${API}/api/public/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('indisponível')
        return r.json()
      })
      .then(setClinic)
      .catch(() => setError('Agendamento indisponível ou clínica não encontrada.'))
  }, [slug])

  const primaryColor = clinic?.settings.primaryColor ?? '#29d9d5'

  function canContinue() {
    if (step === 1) return !!selectedService
    if (step === 2) return !!selectedDentist
    if (step === 3) return !!selectedDate
    if (step === 4) return !!selectedTime
    if (step === 5) return !!(patientData.name && patientData.phone && patientData.agreedToPrivacy)
    return false
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1)
      if (step === 3) setSelectedDate('')
      if (step === 4) setSelectedTime('')
    }
  }

  async function handleContinue() {
    if (step < 5) { setStep(step + 1); return }
    // Step 5 → submit
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch(`${API}/api/public/${slug}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientData.name,
          patientPhone: patientData.phone.replace(/\D/g, ''),
          patientEmail: patientData.email || undefined,
          dentistId: selectedDentist!.id === 'any' ? clinic!.dentists[0]?.id ?? '' : selectedDentist!.id,
          serviceId: selectedService!.id,
          date: selectedDate,
          time: selectedTime,
          notes: patientData.notes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Erro ao confirmar agendamento')
      setResult(data)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Erro ao confirmar agendamento')
    } finally {
      setSubmitting(false)
    }
  }

  function handleReset() {
    setStep(1)
    setSelectedService(null)
    setSelectedDentist(null)
    setSelectedDate('')
    setSelectedTime('')
    setPatientData(EMPTY_PATIENT)
    setResult(null)
    setSubmitError('')
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] p-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          <p className="text-lg font-semibold text-[#111111]">Indisponível</p>
          <p className="mt-1 text-sm text-[#888888]">{error}</p>
        </div>
      </div>
    )
  }

  if (!clinic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#29d9d5] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-4 py-8">
      <div className="mx-auto w-full max-w-[600px]">
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
          <BookingHeader clinicName={clinic.name} logoUrl={clinic.logoUrl} primaryColor={primaryColor} />

          {result ? (
            <div className="p-6">
              <BookingSuccess
                result={result}
                dentistName={
                  selectedDentist?.id === 'any' || !selectedDentist
                    ? (clinic.dentists[0]?.name ?? 'Primeiro disponível')
                    : selectedDentist.name
                }
                primaryColor={primaryColor}
                onReset={handleReset}
              />
            </div>
          ) : (
            <>
              {/* Stepper */}
              <div className="border-b border-[#e8eaed] px-6 pt-4 pb-3">
                <div className="flex items-center gap-1">
                  {STEP_LABELS.map((label, i) => {
                    const num = i + 1
                    const done = num < step
                    const active = num === step
                    return (
                      <div key={label} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: done || active ? primaryColor : '#f0f0f0',
                            color: done || active ? '#ffffff' : '#888888',
                          }}
                        >
                          {done ? '✓' : num}
                        </div>
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: active ? primaryColor : '#888888' }}
                        >
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#f0f0f0]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${((step - 1) / 4) * 100}%`, backgroundColor: primaryColor }}
                  />
                </div>
              </div>

              {/* Step content */}
              <div className="p-6">
                {clinic.settings.bookingMessage && step === 1 && (
                  <div
                    className="mb-4 rounded-xl p-3 text-sm"
                    style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                  >
                    {clinic.settings.bookingMessage}
                  </div>
                )}

                {step === 1 && (
                  <ServiceSelector
                    services={clinic.services}
                    selected={selectedService}
                    onSelect={setSelectedService}
                    primaryColor={primaryColor}
                  />
                )}
                {step === 2 && (
                  <DentistSelector
                    dentists={clinic.dentists}
                    selected={selectedDentist}
                    onSelect={setSelectedDentist}
                    primaryColor={primaryColor}
                  />
                )}
                {step === 3 && (
                  <DateSelector
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    workingDays={clinic.settings.workingDays}
                    primaryColor={primaryColor}
                  />
                )}
                {step === 4 && (
                  <TimeSelector
                    slug={slug}
                    dentistId={selectedDentist?.id ?? 'any'}
                    date={selectedDate}
                    serviceId={selectedService!.id}
                    selected={selectedTime}
                    onSelect={setSelectedTime}
                    primaryColor={primaryColor}
                  />
                )}
                {step === 5 && (
                  <PatientForm
                    data={patientData}
                    onChange={setPatientData}
                    primaryColor={primaryColor}
                  />
                )}

                {submitError && (
                  <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {submitError}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[#e8eaed] px-6 py-4">
                <button
                  onClick={handleBack}
                  disabled={step === 1}
                  className="rounded-xl border border-[#e8eaed] px-5 py-2.5 text-sm font-medium text-[#555555] transition hover:bg-[#f7f8fa] disabled:opacity-0"
                >
                  Voltar
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!canContinue() || submitting}
                  className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: primaryColor }}
                >
                  {submitting
                    ? 'Confirmando...'
                    : step === 5
                    ? 'Confirmar agendamento'
                    : 'Continuar'}
                </button>
              </div>
            </>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-[#aaaaaa]">Powered by RiseUp</p>
      </div>
    </div>
  )
}
