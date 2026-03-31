'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import api from '@/lib/api'

export type Clinic = {
  id: string
  name: string
  slug: string
  phone?: string | null
  email?: string | null
  logoUrl?: string | null
}

export type AuthUser = {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  clinic: Clinic
}

type UserContextValue = {
  user: AuthUser | null
  clinic: Clinic | null
  isLoading: boolean
  refetch: () => void
}

const UserContext = createContext<UserContextValue>({
  user: null,
  clinic: null,
  isLoading: true,
  refetch: () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = () => {
    setIsLoading(true)
    api
      .get<AuthUser>('/api/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <UserContext.Provider
      value={{ user, clinic: user?.clinic ?? null, isLoading, refetch: fetchUser }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
