'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import type { Conversation } from '@/hooks/use-chat'
import ConversationItem from './conversation-item'

type ChannelFilter = 'ALL' | 'WHATSAPP' | 'INSTAGRAM'

interface Props {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (conv: Conversation) => void
  onFilter: (channel?: string, q?: string) => void
  isLoading: boolean
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onFilter,
  isLoading,
}: Props) {
  const [channel, setChannel] = useState<ChannelFilter>('ALL')
  const [search, setSearch] = useState('')

  const handleChannelChange = (c: ChannelFilter) => {
    setChannel(c)
    onFilter(c === 'ALL' ? undefined : c, search || undefined)
  }

  const handleSearch = (q: string) => {
    setSearch(q)
    onFilter(channel === 'ALL' ? undefined : channel, q || undefined)
  }

  return (
    <div
      className="flex h-full flex-col border-r border-[#e8eaed] bg-white"
      style={{ width: 320, flexShrink: 0 }}
    >
      {/* Header */}
      <div className="border-b border-[#e8eaed] px-4 py-3">
        <h2 className="text-sm font-semibold text-[#111111]">Mensagens</h2>

        {/* Channel filter tabs */}
        <div className="mt-2 flex rounded-lg border border-[#e8eaed] p-0.5">
          {(['ALL', 'WHATSAPP', 'INSTAGRAM'] as ChannelFilter[]).map((c) => (
            <button
              key={c}
              onClick={() => handleChannelChange(c)}
              className="flex-1 rounded-md py-1 text-[11px] font-medium transition-colors"
              style={{
                backgroundColor: channel === c ? '#f0fffe' : 'transparent',
                color: channel === c ? '#1fb8b4' : '#888888',
              }}
            >
              {c === 'ALL' ? 'Todos' : c === 'WHATSAPP' ? 'WhatsApp' : 'Instagram'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mt-2">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar conversa..."
            className="h-8 w-full rounded-lg border border-[#e8eaed] pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-[#29d9d5]/40"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2"
              style={{ borderColor: '#29d9d5', borderTopColor: 'transparent' }}
            />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-xs text-[#aaaaaa]">Nenhuma conversa</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isSelected={conv.id === selectedId}
              onClick={() => onSelect(conv)}
            />
          ))
        )}
      </div>
    </div>
  )
}
