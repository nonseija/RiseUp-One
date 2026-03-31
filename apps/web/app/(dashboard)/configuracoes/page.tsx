'use client'

import { useState, useEffect, useRef } from 'react'
import { Settings } from 'lucide-react'
import api from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClinicData {
  name: string; slug: string; phone?: string; email?: string; address?: string; logoUrl?: string
  settings?: {
    workingDays: number[]; workingHoursStart: string; workingHoursEnd: string
    slotDuration: number; bookingEnabled: boolean; bookingMessage?: string; primaryColor: string
  } | null
}

interface ClinicService { id: string; name: string; description?: string; duration: number; price?: number; active: boolean }
interface TeamUser { id: string; name: string; email: string; role: string; active: boolean }

type Tab = 'clinica' | 'agendamento' | 'servicos' | 'equipe'
const TABS: { id: Tab; label: string }[] = [
  { id: 'clinica', label: 'Clínica' },
  { id: 'agendamento', label: 'Agendamento Online' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'equipe', label: 'Equipe' },
]

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const ROLES = ['ADMIN', 'RECEPCIONISTA', 'DENTISTA', 'FINANCEIRO']
const ROLE_LABEL: Record<string, string> = { ADMIN: 'Admin', RECEPCIONISTA: 'Recepcionista', DENTISTA: 'Dentista', FINANCEIRO: 'Financeiro' }
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
const SLOTS = [15, 30, 45, 60, 90, 120]

// ─── Shared components ────────────────────────────────────────────────────────

function SaveBtn({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      disabled={loading}
      onClick={onClick}
      className="rounded-xl px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: '#29d9d5' }}
    >
      {loading ? 'Salvando...' : 'Salvar alterações'}
    </button>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#555555]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#e8eaed] bg-white px-4 py-2.5 text-sm text-[#111111] outline-none focus:border-[#29d9d5] focus:ring-2 focus:ring-[#29d9d5]/20"
      />
    </div>
  )
}

function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' }) {
  if (!msg) return null
  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${type === 'ok' ? 'bg-[#2a9d5c]' : 'bg-red-500'}`}>
      {msg}
    </div>
  )
}

// ─── Service Modal ────────────────────────────────────────────────────────────

interface ServiceModalProps {
  service: Partial<ClinicService> | null
  onClose: () => void
  onSave: (d: Partial<ClinicService>) => Promise<void>
}

function ServiceModal({ service, onClose, onSave }: ServiceModalProps) {
  const [form, setForm] = useState({
    name: service?.name ?? '',
    description: service?.description ?? '',
    duration: service?.duration ?? 60,
    price: service?.price != null ? String(service.price) : '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave({ ...form, duration: Number(form.duration), price: form.price ? Number(form.price) : undefined })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-base font-semibold text-[#111111]">
          {service?.id ? 'Editar serviço' : 'Novo serviço'}
        </h3>
        <div className="space-y-3">
          <InputField label="Nome *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Ex: Consulta inicial" />
          <InputField label="Descrição" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Descrição breve do serviço" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#555555]">Duração (min)</label>
              <input
                type="number"
                min={5}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full rounded-xl border border-[#e8eaed] px-4 py-2.5 text-sm outline-none focus:border-[#29d9d5]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#555555]">Preço (opcional)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0,00"
                className="w-full rounded-xl border border-[#e8eaed] px-4 py-2.5 text-sm outline-none focus:border-[#29d9d5]"
              />
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-[#e8eaed] px-4 py-2 text-sm text-[#555555] hover:bg-[#f7f8fa]">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()} className="rounded-xl bg-[#29d9d5] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

interface InviteModalProps { onClose: () => void; onSave: (d: { name: string; email: string; role: string }) => Promise<void> }

function InviteModal({ onClose, onSave }: InviteModalProps) {
  const [form, setForm] = useState({ name: '', email: '', role: 'RECEPCIONISTA' })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-base font-semibold text-[#111111]">Convidar usuário</h3>
        <div className="space-y-3">
          <InputField label="Nome *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <InputField label="E-mail *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#555555]">Função</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-xl border border-[#e8eaed] px-4 py-2.5 text-sm outline-none focus:border-[#29d9d5]"
            >
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-[#e8eaed] px-4 py-2 text-sm text-[#555555] hover:bg-[#f7f8fa]">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.email.trim()} className="rounded-xl bg-[#29d9d5] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? 'Convidando...' : 'Convidar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('clinica')
  const [clinic, setClinic] = useState<ClinicData | null>(null)
  const [services, setServices] = useState<ClinicService[]>([])
  const [team, setTeam] = useState<TeamUser[]>([])

  // Clinic form
  const [clinicForm, setClinicForm] = useState({ name: '', phone: '', email: '', address: '', logoUrl: '' })
  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    workingDays: [1, 2, 3, 4, 5] as number[],
    workingHoursStart: '08:00', workingHoursEnd: '18:00',
    slotDuration: 60, bookingEnabled: true, bookingMessage: '', primaryColor: '#29d9d5',
  })

  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [serviceModal, setServiceModal] = useState<Partial<ClinicService> | null | false>(false)
  const [inviteModal, setInviteModal] = useState(false)

  function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Load data
  useEffect(() => {
    api.get<ClinicData>('/api/clinics/settings').then(({ data }) => {
      setClinic(data)
      setClinicForm({
        name: data.name ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        address: data.address ?? '',
        logoUrl: data.logoUrl ?? '',
      })
      if (data.settings) {
        setSettingsForm({
          workingDays: data.settings.workingDays,
          workingHoursStart: data.settings.workingHoursStart,
          workingHoursEnd: data.settings.workingHoursEnd,
          slotDuration: data.settings.slotDuration,
          bookingEnabled: data.settings.bookingEnabled,
          bookingMessage: data.settings.bookingMessage ?? '',
          primaryColor: data.settings.primaryColor,
        })
      }
    }).catch(() => {})
    api.get<ClinicService[]>('/api/clinics/services').then(({ data }) => setServices(data)).catch(() => {})
    api.get<TeamUser[]>('/api/clinics/team').then(({ data }) => setTeam(data)).catch(() => {})
  }, [])

  async function saveClinic() {
    setSaving(true)
    try {
      await api.patch('/api/clinics/settings', { ...clinicForm, ...settingsForm })
      showToast('Configurações salvas com sucesso!')
    } catch {
      showToast('Erro ao salvar configurações.', 'err')
    } finally { setSaving(false) }
  }

  async function saveService(data: Partial<ClinicService>) {
    try {
      if (serviceModal && 'id' in serviceModal && serviceModal.id) {
        const { data: updated } = await api.patch<ClinicService>(`/api/clinics/services/${serviceModal.id}`, data)
        setServices((s) => s.map((x) => x.id === updated.id ? updated : x))
      } else {
        const { data: created } = await api.post<ClinicService>('/api/clinics/services', data)
        setServices((s) => [...s, created])
      }
      setServiceModal(false)
      showToast('Serviço salvo!')
    } catch { showToast('Erro ao salvar serviço.', 'err') }
  }

  async function toggleService(svc: ClinicService) {
    try {
      const { data } = await api.patch<ClinicService>(`/api/clinics/services/${svc.id}`, { active: !svc.active })
      setServices((s) => s.map((x) => x.id === data.id ? data : x))
    } catch { showToast('Erro ao atualizar serviço.', 'err') }
  }

  async function deleteService(id: string) {
    if (!confirm('Remover este serviço?')) return
    try {
      await api.delete(`/api/clinics/services/${id}`)
      setServices((s) => s.filter((x) => x.id !== id))
      showToast('Serviço removido.')
    } catch { showToast('Erro ao remover.', 'err') }
  }

  async function inviteUser(data: { name: string; email: string; role: string }) {
    try {
      const { data: user } = await api.post<TeamUser>('/api/clinics/team/invite', data)
      setTeam((t) => [...t, user])
      setInviteModal(false)
      showToast('Usuário convidado!')
    } catch { showToast('Erro ao convidar usuário.', 'err') }
  }

  async function toggleUser(user: TeamUser) {
    try {
      const { data } = await api.patch<TeamUser>(`/api/clinics/team/${user.id}/toggle`, { active: !user.active })
      setTeam((t) => t.map((u) => u.id === data.id ? { ...u, active: data.active } : u))
    } catch { showToast('Erro ao atualizar usuário.', 'err') }
  }

  function toggleDay(day: number) {
    setSettingsForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter((d) => d !== day)
        : [...f.workingDays, day].sort(),
    }))
  }

  const bookingUrl = clinic ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/agendar/${clinic.slug}` : ''

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: '#f0fffe', border: '1.5px solid rgba(41,217,213,0.25)' }}
        >
          <Settings size={20} style={{ color: '#29d9d5' }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#111111]">Configurações</h1>
          <p className="text-xs text-[#888888]">Gerencie sua clínica, agendamento e equipe</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-[#e8eaed]">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ borderColor: active ? '#29d9d5' : 'transparent', color: active ? '#29d9d5' : '#888888' }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab: Clínica ── */}
      {activeTab === 'clinica' && (
        <div className="max-w-xl space-y-5">
          <div className="rounded-xl border border-[#e8eaed] bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#111111]">Informações da clínica</h2>
            <div className="space-y-4">
              <InputField label="Nome da clínica" value={clinicForm.name} onChange={(v) => setClinicForm({ ...clinicForm, name: v })} />
              <InputField label="Telefone" value={clinicForm.phone} onChange={(v) => setClinicForm({ ...clinicForm, phone: v })} placeholder="(00) 0000-0000" />
              <InputField label="E-mail" value={clinicForm.email} onChange={(v) => setClinicForm({ ...clinicForm, email: v })} type="email" />
              <InputField label="Endereço" value={clinicForm.address} onChange={(v) => setClinicForm({ ...clinicForm, address: v })} placeholder="Rua, número, bairro..." />
              <InputField label="URL do logotipo" value={clinicForm.logoUrl} onChange={(v) => setClinicForm({ ...clinicForm, logoUrl: v })} placeholder="https://..." />
              {clinicForm.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={clinicForm.logoUrl} alt="Logo preview" className="h-16 w-16 rounded-xl object-cover border border-[#e8eaed]" />
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <SaveBtn loading={saving} onClick={saveClinic} />
          </div>
        </div>
      )}

      {/* ── Tab: Agendamento Online ── */}
      {activeTab === 'agendamento' && (
        <div className="max-w-xl space-y-5">
          <div className="rounded-xl border border-[#e8eaed] bg-white p-5">
            {/* Toggle */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#111111]">Agendamento público</p>
                <p className="text-xs text-[#888888]">Permite pacientes agendarem online</p>
              </div>
              <button
                onClick={() => setSettingsForm({ ...settingsForm, bookingEnabled: !settingsForm.bookingEnabled })}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                style={{ backgroundColor: settingsForm.bookingEnabled ? '#29d9d5' : '#e8eaed' }}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow"
                  style={{ transform: settingsForm.bookingEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                />
              </button>
            </div>

            {/* Working days */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-[#555555]">Dias de funcionamento</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(i)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium transition"
                    style={{
                      borderColor: settingsForm.workingDays.includes(i) ? '#29d9d5' : '#e8eaed',
                      backgroundColor: settingsForm.workingDays.includes(i) ? '#29d9d5' : '#ffffff',
                      color: settingsForm.workingDays.includes(i) ? '#ffffff' : '#555555',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Working hours */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#555555]">Horário de início</label>
                <select
                  value={settingsForm.workingHoursStart}
                  onChange={(e) => setSettingsForm({ ...settingsForm, workingHoursStart: e.target.value })}
                  className="w-full rounded-xl border border-[#e8eaed] px-3 py-2.5 text-sm outline-none focus:border-[#29d9d5]"
                >
                  {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#555555]">Horário de fim</label>
                <select
                  value={settingsForm.workingHoursEnd}
                  onChange={(e) => setSettingsForm({ ...settingsForm, workingHoursEnd: e.target.value })}
                  className="w-full rounded-xl border border-[#e8eaed] px-3 py-2.5 text-sm outline-none focus:border-[#29d9d5]"
                >
                  {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            {/* Slot duration */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-[#555555]">Duração padrão do slot</label>
              <select
                value={settingsForm.slotDuration}
                onChange={(e) => setSettingsForm({ ...settingsForm, slotDuration: Number(e.target.value) })}
                className="w-full rounded-xl border border-[#e8eaed] px-3 py-2.5 text-sm outline-none focus:border-[#29d9d5]"
              >
                {SLOTS.map((s) => <option key={s} value={s}>{s} min</option>)}
              </select>
            </div>

            {/* Welcome message */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium text-[#555555]">Mensagem de boas-vindas</label>
              <textarea
                rows={2}
                value={settingsForm.bookingMessage}
                onChange={(e) => setSettingsForm({ ...settingsForm, bookingMessage: e.target.value })}
                placeholder="Ex: Bem-vindo! Agende sua consulta com facilidade."
                className="w-full resize-none rounded-xl border border-[#e8eaed] px-4 py-2.5 text-sm outline-none focus:border-[#29d9d5]"
              />
            </div>

            {/* Booking link */}
            {clinic && (
              <div className="rounded-xl border border-[#e8eaed] bg-[#f7f8fa] p-3">
                <p className="mb-1.5 text-xs font-medium text-[#555555]">Link público de agendamento</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 truncate text-xs text-[#888888]">{bookingUrl}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(bookingUrl).then(() => showToast('Link copiado!'))}
                    className="shrink-0 rounded-lg border border-[#e8eaed] bg-white px-3 py-1.5 text-xs font-medium text-[#555555] hover:bg-[#f0f0f0]"
                  >
                    Copiar
                  </button>
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-lg border border-[#29d9d5] px-3 py-1.5 text-xs font-medium text-[#29d9d5] hover:bg-[#f0fffe]"
                  >
                    Ver página
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <SaveBtn loading={saving} onClick={saveClinic} />
          </div>
        </div>
      )}

      {/* ── Tab: Serviços ── */}
      {activeTab === 'servicos' && (
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#888888]">{services.length} serviço{services.length !== 1 ? 's' : ''} cadastrado{services.length !== 1 ? 's' : ''}</p>
            <button
              onClick={() => setServiceModal({})}
              className="rounded-xl bg-[#29d9d5] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              + Novo Serviço
            </button>
          </div>
          {services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#e8eaed] py-12 text-center">
              <p className="text-sm text-[#888888]">Nenhum serviço cadastrado</p>
              <p className="mt-1 text-xs text-[#aaaaaa]">Crie serviços para exibir na página de agendamento</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[#e8eaed] bg-white overflow-hidden">
              {services.map((svc, i) => (
                <div key={svc.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-[#f0f0f0]' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111111]">{svc.name}</p>
                    <p className="text-xs text-[#888888]">
                      {svc.duration} min
                      {svc.price != null && ` · ${svc.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                      {svc.description && ` · ${svc.description}`}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleService(svc)}
                    className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: svc.active ? '#e8faf4' : '#f5f5f5',
                      color: svc.active ? '#2a9d5c' : '#888888',
                    }}
                  >
                    {svc.active ? 'Ativo' : 'Inativo'}
                  </button>
                  <button
                    onClick={() => setServiceModal(svc)}
                    className="rounded-lg border border-[#e8eaed] px-3 py-1.5 text-xs text-[#555555] hover:bg-[#f7f8fa]"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteService(svc.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Equipe ── */}
      {activeTab === 'equipe' && (
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#888888]">{team.length} usuário{team.length !== 1 ? 's' : ''}</p>
            <button
              onClick={() => setInviteModal(true)}
              className="rounded-xl bg-[#29d9d5] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              + Convidar usuário
            </button>
          </div>
          <div className="rounded-xl border border-[#e8eaed] bg-white overflow-hidden">
            {team.map((user, i) => (
              <div key={user.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-[#f0f0f0]' : ''}`}>
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: '#29d9d5' }}
                >
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#111111]">{user.name}</p>
                  <p className="truncate text-xs text-[#888888]">{user.email}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#f0f0f0] px-2.5 py-1 text-xs font-medium text-[#555555]">
                  {ROLE_LABEL[user.role] ?? user.role}
                </span>
                <button
                  onClick={() => toggleUser(user)}
                  className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: user.active ? '#e8faf4' : '#f5f5f5',
                    color: user.active ? '#2a9d5c' : '#888888',
                  }}
                >
                  {user.active ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            ))}
            {team.length === 0 && (
              <div className="py-12 text-center text-sm text-[#888888]">Nenhum usuário na equipe</div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {serviceModal !== false && (
        <ServiceModal
          service={serviceModal}
          onClose={() => setServiceModal(false)}
          onSave={saveService}
        />
      )}
      {inviteModal && (
        <InviteModal onClose={() => setInviteModal(false)} onSave={inviteUser} />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  )
}
