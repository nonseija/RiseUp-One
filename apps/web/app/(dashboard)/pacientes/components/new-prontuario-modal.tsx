'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import api from '@/lib/api'
import TeethInput from './teeth-input'
import FileUpload from './file-upload'

const RECORD_TYPES = [
  { value: 'CONSULTA', label: 'Consulta' },
  { value: 'RETORNO', label: 'Retorno' },
  { value: 'EMERGENCIA', label: 'Emergência' },
  { value: 'AVALIACAO', label: 'Avaliação' },
  { value: 'PROCEDIMENTO', label: 'Procedimento' },
] as const

const schema = z.object({
  type: z.enum(['CONSULTA', 'RETORNO', 'EMERGENCIA', 'AVALIACAO', 'PROCEDIMENTO']),
  title: z.string().min(2, 'Título obrigatório'),
  notes: z.string().min(1, 'Notas clínicas obrigatórias'),
  dentistId: z.string().min(1, 'Dentista obrigatório'),
})

type FormData = z.infer<typeof schema>

interface Props {
  patientId: string
  onClose: () => void
  onSaved: () => void
}

export default function NewProntuarioModal({ patientId, onClose, onSaved }: Props) {
  const [teeth, setTeeth] = useState<string[]>([])
  const [procedures, setProcedures] = useState<string[]>([])
  const [procInput, setProcInput] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'CONSULTA' },
  })

  const addProcedure = () => {
    const p = procInput.trim()
    if (p && !procedures.includes(p)) setProcedures((prev) => [...prev, p])
    setProcInput('')
  }

  const onSubmit = async (data: FormData) => {
    const formData = new FormData()
    formData.append('patientId', patientId)
    formData.append('dentistId', data.dentistId)
    formData.append('type', data.type)
    formData.append('title', data.title)
    formData.append('notes', data.notes)
    teeth.forEach((t) => formData.append('teeth[]', t))
    procedures.forEach((p) => formData.append('procedures[]', p))
    files.forEach((f) => formData.append('files', f))

    await api.post('/api/medical-records', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8eaed] px-5 py-4">
          <h2 className="text-base font-semibold text-[#111111]">Novo Prontuário</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#888888] hover:bg-[#f7f8fa]"
          >
            <X size={15} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 space-y-4 overflow-y-auto p-5"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#555555]">Tipo</label>
              <select
                {...register('type')}
                className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
              >
                {RECORD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#555555]">Dentista (ID) *</label>
              <input
                {...register('dentistId')}
                placeholder="ID do dentista"
                className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
              />
              {errors.dentistId && (
                <p className="mt-0.5 text-xs text-red-500">{errors.dentistId.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">Título *</label>
            <input
              {...register('title')}
              placeholder="Ex: Extração dente 18"
              className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
            {errors.title && <p className="mt-0.5 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">Dentes tratados</label>
            <TeethInput value={teeth} onChange={setTeeth} />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">Procedimentos</label>
            <div className="mb-1.5 flex flex-wrap gap-1">
              {procedures.map((p) => (
                <span
                  key={p}
                  className="flex items-center gap-1 rounded-full border border-[#e8eaed] px-2 py-0.5 text-xs text-[#555555]"
                >
                  {p}
                  <button
                    type="button"
                    onClick={() => setProcedures((prev) => prev.filter((x) => x !== p))}
                    className="text-[#aaaaaa] hover:text-red-400"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={procInput}
                onChange={(e) => setProcInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProcedure() } }}
                placeholder="Ex: Anestesia, Extração..."
                className="flex-1 rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
              />
              <button
                type="button"
                onClick={addProcedure}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: '#29d9d5' }}
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">
              Notas clínicas *
            </label>
            <textarea
              {...register('notes')}
              rows={4}
              placeholder="Descreva o atendimento..."
              className="w-full resize-none rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
            />
            {errors.notes && <p className="mt-0.5 text-xs text-red-500">{errors.notes.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#555555]">
              Arquivos (imagens / PDFs)
            </label>
            <FileUpload files={files} onChange={setFiles} />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#e8eaed] py-2 text-sm font-medium text-[#555555] hover:bg-[#f7f8fa]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl py-2 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: '#29d9d5' }}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Prontuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
