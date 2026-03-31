import { MessageSquare } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: '#f0fffe', border: '1.5px solid rgba(41,217,213,0.25)' }}
      >
        <MessageSquare size={28} color="#29d9d5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#111111]">Selecione uma conversa</p>
        <p className="text-xs text-[#888888]">Escolha uma conversa na lista para começar</p>
      </div>
    </div>
  )
}
