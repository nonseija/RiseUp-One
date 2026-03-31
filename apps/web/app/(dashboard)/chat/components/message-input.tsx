'use client'

import { useRef, useState } from 'react'
import { Send } from 'lucide-react'

interface Props {
  onSend: (body: string) => void
}

export default function MessageInput({ onSend }: Props) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
    if (ref.current) {
      ref.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 120)}px`
    }
  }

  return (
    <div
      className="flex items-end gap-2 border-t border-[#e8eaed] bg-white px-4 py-3"
    >
      <textarea
        ref={ref}
        rows={1}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Digite uma mensagem... (Enter para enviar)"
        className="flex-1 resize-none rounded-xl border border-[#e8eaed] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#29d9d5]/40"
        style={{ minHeight: 44, maxHeight: 120 }}
      />
      <button
        onClick={submit}
        disabled={!text.trim()}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40"
        style={{ backgroundColor: '#29d9d5' }}
      >
        <Send size={16} />
      </button>
    </div>
  )
}
