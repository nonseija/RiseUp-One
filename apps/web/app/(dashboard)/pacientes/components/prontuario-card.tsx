'use client'

import { FileText, Image as ImageIcon, Stethoscope } from 'lucide-react'

type RecordType = 'CONSULTA' | 'RETORNO' | 'EMERGENCIA' | 'AVALIACAO' | 'PROCEDIMENTO'

const TYPE_META: Record<RecordType, { label: string; color: string; bg: string }> = {
  CONSULTA: { label: 'Consulta', color: '#29d9d5', bg: '#f0fffe' },
  RETORNO: { label: 'Retorno', color: '#6366f1', bg: '#f0f0ff' },
  EMERGENCIA: { label: 'Emergência', color: '#ef4444', bg: '#fff0f0' },
  AVALIACAO: { label: 'Avaliação', color: '#f59e0b', bg: '#fffbeb' },
  PROCEDIMENTO: { label: 'Procedimento', color: '#2a9d5c', bg: '#f0faf4' },
}

interface RecordFile {
  id: string
  name: string
  url: string
  type: string
}

export interface MedicalRecord {
  id: string
  type: RecordType
  title: string
  notes: string
  teeth: string[]
  procedures: string[]
  createdAt: string
  dentistId: string
  files: RecordFile[]
}

interface Props {
  record: MedicalRecord
}

export default function ProntuarioCard({ record }: Props) {
  const meta = TYPE_META[record.type] ?? TYPE_META.CONSULTA

  return (
    <div className="rounded-xl border border-[#e8eaed] bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Stethoscope size={14} style={{ color: meta.color }} />
          <span className="text-sm font-semibold text-[#111111]">{record.title}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ color: meta.color, backgroundColor: meta.bg }}
          >
            {meta.label}
          </span>
          <span className="text-xs text-[#888888]">
            {new Date(record.createdAt).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Notes */}
      {record.notes && (
        <p className="mb-3 text-sm leading-relaxed text-[#555555]">{record.notes}</p>
      )}

      {/* Teeth */}
      {record.teeth.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-1">
          <span className="text-xs font-semibold text-[#888888]">Dentes:</span>
          {record.teeth.map((t) => (
            <span
              key={t}
              className="rounded-lg px-1.5 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: '#f0fffe', color: '#29d9d5', border: '1px solid rgba(41,217,213,0.3)' }}
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Procedures */}
      {record.procedures.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1">
          <span className="text-xs font-semibold text-[#888888]">Procedimentos:</span>
          {record.procedures.map((p) => (
            <span
              key={p}
              className="rounded-full border border-[#e8eaed] px-2 py-0.5 text-xs text-[#555555]"
            >
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Files */}
      {record.files.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
          {record.files.map((f) => (
            <a
              key={f.id}
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="overflow-hidden rounded-lg border border-[#e8eaed] hover:opacity-80"
            >
              {f.type.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.url} alt={f.name} className="h-16 w-full object-cover" />
              ) : (
                <div className="flex h-16 flex-col items-center justify-center gap-1 bg-[#f7f8fa]">
                  <FileText size={18} className="text-[#888888]" />
                  <span className="px-1 text-center text-[10px] text-[#888888] line-clamp-1">{f.name}</span>
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      {record.files.length === 0 && record.teeth.length === 0 && record.procedures.length === 0 && (
        <div className="flex items-center gap-1 text-[#aaaaaa]">
          <ImageIcon size={12} />
          <span className="text-xs">Sem arquivos anexados</span>
        </div>
      )}
    </div>
  )
}
