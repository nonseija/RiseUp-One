'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { getToken } from '@/lib/auth'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const token = getToken()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

    const socket = io(`${apiUrl}/chat`, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    })

    socketRef.current = socket

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))

    return () => {
      socket.disconnect()
    }
  }, [])

  return { socket: socketRef.current, isConnected }
}
