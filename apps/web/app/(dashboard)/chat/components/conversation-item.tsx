import type { Conversation } from '@/hooks/use-chat'
import ChannelBadge from './channel-badge'

interface Props {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
}

function initials(name?: string) {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function ConversationItem({ conversation, isSelected, onClick }: Props) {
  const hasUnread = conversation.unreadCount > 0
  const lastMsg = conversation.messages?.[0]

  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors"
      style={{
        backgroundColor: isSelected ? '#f0fffe' : hasUnread ? '#fafffe' : 'transparent',
        borderLeft: isSelected ? '3px solid #29d9d5' : '3px solid transparent',
      }}
    >
      {/* Avatar */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: '#29d9d5' }}
      >
        {initials(conversation.contactName)}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className="truncate text-sm"
            style={{ fontWeight: hasUnread ? 700 : 500, color: '#111111' }}
          >
            {conversation.contactName ?? conversation.contactPhone ?? 'Desconhecido'}
          </span>
          <span className="flex-shrink-0 text-[10px] text-[#aaaaaa]">
            {formatTime(conversation.updatedAt)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-[#888888]">
            {lastMsg ? `${lastMsg.fromMe ? 'Você: ' : ''}${lastMsg.body}` : 'Nenhuma mensagem'}
          </p>
          <div className="flex flex-shrink-0 items-center gap-1">
            <ChannelBadge channel={conversation.channel} />
            {hasUnread && (
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ backgroundColor: '#29d9d5' }}
              >
                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
