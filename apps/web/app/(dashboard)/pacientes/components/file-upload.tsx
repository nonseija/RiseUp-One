'use client'

import { useCallback, useState } from 'react'
import { Upload, X, FileText } from 'lucide-react'

interface Props {
  files: File[]
  onChange: (files: File[]) => void
}

export default function FileUpload({ files, onChange }: Props) {
  const [isDragging, setIsDragging] = useState(false)

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      const valid = Array.from(newFiles).filter(
        (f) => allowed.includes(f.type) && f.size <= 10 * 1024 * 1024,
      )
      const combined = [...files, ...valid].slice(0, 5)
      onChange(combined)
    },
    [files, onChange],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      addFiles(e.dataTransfer.files)
    },
    [addFiles],
  )

  const remove = (index: number) => {
    const next = [...files]
    next.splice(index, 1)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-6 text-center transition-colors"
        style={{
          borderColor: isDragging ? '#29d9d5' : '#e8eaed',
          backgroundColor: isDragging ? '#f0fffe' : '#fafafa',
        }}
      >
        <Upload size={20} className="mb-2 text-[#aaaaaa]" />
        <p className="text-xs text-[#888888]">Arraste arquivos ou</p>
        <label className="mt-1 cursor-pointer text-xs font-semibold" style={{ color: '#29d9d5' }}>
          clique para selecionar
          <input
            type="file"
            className="sr-only"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </label>
        <p className="mt-1 text-[10px] text-[#aaaaaa]">JPG, PNG, WEBP, PDF · max 10 MB · até 5 arquivos</p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((f, i) => (
            <div key={i} className="relative overflow-hidden rounded-lg border border-[#e8eaed]">
              {f.type.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={URL.createObjectURL(f)}
                  alt={f.name}
                  className="h-20 w-full object-cover"
                />
              ) : (
                <div className="flex h-20 items-center justify-center bg-[#f7f8fa]">
                  <FileText size={24} className="text-[#888888]" />
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[#555555] shadow-sm hover:text-red-500"
              >
                <X size={10} />
              </button>
              <p className="truncate bg-white px-1 py-0.5 text-[10px] text-[#888888]">{f.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
