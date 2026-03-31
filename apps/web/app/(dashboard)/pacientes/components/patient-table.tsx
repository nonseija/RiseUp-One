'use client'

import { useRouter } from 'next/navigation'
import { FileText, Edit, Link } from 'lucide-react'
import type { Patient } from '../page'

interface Props {
  patients: Patient[]
  isLoading: boolean
  onAnamnesisLink: (patientId: string) => void
}

function calcAge(birthDate?: string) {
  if (!birthDate) return null
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

export default function PatientTable({ patients, isLoading, onAnamnesisLink }: Props) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-[#29d9d5] border-t-transparent"
        />
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-[#e8eaed] bg-white">
        <p className="text-sm text-[#aaaaaa]">Nenhum paciente encontrado</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8eaed] bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e8eaed] bg-[#f7f8fa]">
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Paciente</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Telefone</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">E-mail</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Idade</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-[#888888]">Cadastro</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-[#888888]">Ações</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p, i) => (
            <tr
              key={p.id}
              className={`border-b border-[#f0f0f0] hover:bg-[#f7f8fa] ${i === patients.length - 1 ? 'border-0' : ''}`}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: '#29d9d5' }}
                  >
                    {p.name[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-[#111111]">{p.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-[#555555]">{p.phone}</td>
              <td className="px-4 py-3 text-[#555555]">{p.email ?? '—'}</td>
              <td className="px-4 py-3 text-[#555555]">
                {calcAge(p.birthDate) !== null ? `${calcAge(p.birthDate)} anos` : '—'}
              </td>
              <td className="px-4 py-3 text-[#888888]">
                {new Date(p.createdAt).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    title="Ver prontuário"
                    onClick={() => router.push(`/pacientes/${p.id}`)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[#888888] hover:bg-[#f0fffe] hover:text-[#29d9d5]"
                  >
                    <FileText size={14} />
                  </button>
                  <button
                    title="Editar"
                    onClick={() => router.push(`/pacientes/${p.id}`)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[#888888] hover:bg-[#f7f8fa]"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    title="Enviar link de anamnese"
                    onClick={() => onAnamnesisLink(p.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[#888888] hover:bg-[#f7f8fa]"
                  >
                    <Link size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
