'use client'

import { useState, useCallback, useEffect } from 'react'
import { Users, Plus, Search } from 'lucide-react'
import api from '@/lib/api'
import PatientTable from './components/patient-table'
import PatientFormModal from './components/patient-form-modal'

export interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  birthDate?: string
  createdAt: string
}

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const loadPatients = useCallback(async (q?: string) => {
    setIsLoading(true)
    try {
      const params = q ? { q } : {}
      const { data } = await api.get<Patient[]>('/api/patients', { params })
      setPatients(data)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => void loadPatients(search || undefined), 300)
    return () => clearTimeout(t)
  }, [search, loadPatients])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: '#f0fffe', border: '1.5px solid rgba(41,217,213,0.25)' }}
          >
            <Users size={20} style={{ color: '#29d9d5' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#111111]">Pacientes</h1>
            <p className="text-xs text-[#888888]">
              {patients.length} paciente{patients.length !== 1 ? 's' : ''} cadastrado{patients.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: '#29d9d5' }}
        >
          <Plus size={15} />
          Novo Paciente
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaaaaa]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          className="w-full rounded-xl border border-[#e8eaed] bg-white py-2 pl-9 pr-3 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
        />
      </div>

      {/* Table */}
      <PatientTable
        patients={patients}
        isLoading={isLoading}
        onAnamnesisLink={async (patientId) => {
          try {
            const { data } = await api.post<{ link: string }>(
              `/api/medical-records/anamnesis/${patientId}`,
            )
            await navigator.clipboard.writeText(data.link)
            alert('Link copiado para a área de transferência!')
          } catch {
            alert('Erro ao gerar link')
          }
        }}
      />

      {showModal && (
        <PatientFormModal
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false)
            void loadPatients(search || undefined)
          }}
        />
      )}
    </div>
  )
}
