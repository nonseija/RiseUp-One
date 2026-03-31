'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUser } from '@/contexts/user-context'
import { useChat } from '@/hooks/use-chat'

import ConversationList from './components/conversation-list'
import MessageThread from './components/message-thread'
import ContactInfo from './components/contact-info'
import EmptyState from './components/empty-state'

function ChatPageInner() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const _initialChannel = searchParams.get('channel') ?? undefined
  const [showProfile, setShowProfile] = useState(false)

  const {
    conversations,
    selectedConversation,
    messages,
    selectConversation,
    sendMessage,
    fetchConversations,
    isLoading,
  } = useChat(user?.clinic.id)

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#f7f8fa]">
      {/* Left panel — conversation list */}
      <ConversationList
        conversations={conversations}
        selectedId={selectedConversation?.id}
        onSelect={(conv) => {
          void selectConversation(conv)
          setShowProfile(false)
        }}
        onFilter={(channel, q) => fetchConversations(channel, q)}
        isLoading={isLoading}
      />

      {/* Center panel — message thread */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {selectedConversation ? (
          <MessageThread
            conversation={selectedConversation}
            messages={messages}
            onSend={sendMessage}
            onViewProfile={() => setShowProfile((v) => !v)}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Right panel — contact info (collapsible) */}
      {showProfile && selectedConversation && (
        <ContactInfo
          conversation={selectedConversation}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  )
}
