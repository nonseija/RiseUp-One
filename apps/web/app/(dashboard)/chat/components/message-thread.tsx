'use client'

import { useEffect, useRef } from 'react'
import { User } from 'lucide-react'
import type { Conversation, ChatMessage } from '@/hooks/use-chat'
import ChannelBadge from './channel-badge'
import MessageBubble from './message-bubble'
import MessageInput from './message-input'

interface Props {
  conversation: Conversation
  messages: ChatMessage[]
  onSend: (body: string) => void
  onViewProfile: () => void
}

export default function MessageThread({ conversation, messages, onSend, onViewProfile }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Thread header */}
      <div className="flex items-center justify-between border-b border-[#e8eaed] bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: '#29d9d5' }}
          >
            {(conversation.contactName ?? '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111111]">
              {conversation.contactName ?? conversation.contactPhone ?? 'Desconhecido'}
            </p>
            <div className="flex items-center gap-1.5">
              <ChannelBadge channel={conversation.channel} />
              {conversation.contactPhone && (
                <span className="text-xs text-[#888888]">{conversation.contactPhone}</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onViewProfile}
          className="flex items-center gap-1.5 rounded-lg border border-[#e8eaed] px-3 py-1.5 text-xs font-medium text-[#555555] hover:bg-[#f7f8fa]"
        >
          <User size={13} />
          Ver perfil
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-[#aaaaaa]">Nenhuma mensagem ainda</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={onSend} />
    </div>
  )
}
