'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { getToken } from '@/lib/auth'
import api from '@/lib/api'

export interface ChatMessage {
  id: string
  conversationId: string
  body: string
  fromMe: boolean
  status: string
  timestamp: string
}

export interface Conversation {
  id: string
  clinicId: string
  channel: 'WHATSAPP' | 'INSTAGRAM'
  externalId: string
  patientId?: string
  leadId?: string
  unreadCount: number
  contactName?: string
  contactPhone?: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}

export function useChat(clinicId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversationState] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const socketRef = useRef<Socket | null>(null)

  // Connect socket
  useEffect(() => {
    if (!clinicId) return
    const token = getToken()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

    const socket = io(`${apiUrl}/chat`, {
      auth: { token },
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('joinClinic', clinicId)
    })

    socket.on('newMessage', ({ conversationId, message }: { conversationId: string; message: ChatMessage }) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev
        if (prev.length > 0 && prev[0].conversationId === conversationId) {
          return [...prev, message]
        }
        return prev
      })
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [message], updatedAt: message.timestamp }
            : c,
        ).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      )
    })

    socket.on('conversationUpdated', (updated: Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
      )
      setSelectedConversationState((prev) =>
        prev?.id === updated.id ? { ...prev, ...updated } : prev,
      )
    })

    socket.on('newConversation', (conv: Conversation) => {
      setConversations((prev) => [conv, ...prev])
    })

    return () => {
      socket.disconnect()
    }
  }, [clinicId])

  // Fetch conversations
  const fetchConversations = useCallback(
    async (channel?: string, q?: string) => {
      if (!clinicId) return
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (channel) params.set('channel', channel)
        if (q) params.set('q', q)
        const res = await api.get<Conversation[]>(
          `/api/chat/conversations${params.toString() ? `?${params}` : ''}`,
        )
        setConversations(res.data)
      } catch {
        setConversations([])
      } finally {
        setIsLoading(false)
      }
    },
    [clinicId],
  )

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Select conversation and load messages
  const selectConversation = useCallback(
    async (conv: Conversation) => {
      setSelectedConversationState(conv)
      socketRef.current?.emit('joinConversation', conv.id)

      try {
        const res = await api.get<ChatMessage[]>(`/api/chat/conversations/${conv.id}/messages`)
        setMessages(res.data)
        // Mark as read
        await api.post(`/api/chat/conversations/${conv.id}/read`)
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)),
        )
      } catch {
        setMessages([])
      }
    },
    [],
  )

  const sendMessage = useCallback(
    async (body: string) => {
      if (!selectedConversation) return
      // Optimistic
      const optimistic: ChatMessage = {
        id: `opt-${Date.now()}`,
        conversationId: selectedConversation.id,
        body,
        fromMe: true,
        status: 'SENT',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimistic])
      try {
        const res = await api.post<ChatMessage>(
          `/api/chat/conversations/${selectedConversation.id}/messages`,
          { body },
        )
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? res.data : m)),
        )
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      }
    },
    [selectedConversation],
  )

  return {
    conversations,
    selectedConversation,
    messages,
    selectConversation,
    sendMessage,
    fetchConversations,
    isLoading,
  }
}
