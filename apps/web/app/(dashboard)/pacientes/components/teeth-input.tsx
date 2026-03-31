'use client'

import { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface Props {
  value: string[]
  onChange: (teeth: string[]) => void
}

export default function TeethInput({ value, onChange }: Props) {
  const [input, setInput] = useState('')

  const addTooth = (raw: string) => {
    const teeth = raw
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t && !value.includes(t))
    if (teeth.length > 0) onChange([...value, ...teeth])
    setInput('')
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTooth(input)
    }
  }

  const remove = (tooth: string) => onChange(value.filter((t) => t !== tooth))

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap gap-1">
        {value.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: '#f0fffe', color: '#29d9d5', border: '1px solid rgba(41,217,213,0.3)' }}
          >
            {t}
            <button onClick={() => remove(t)} className="hover:text-red-400">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => input && addTooth(input)}
        placeholder="11, 12, 21... (Enter para adicionar)"
        className="w-full rounded-xl border border-[#e8eaed] px-3 py-2 text-sm text-[#111111] placeholder:text-[#aaaaaa] focus:outline-none focus:ring-2 focus:ring-[#29d9d5]/30"
      />
    </div>
  )
}
