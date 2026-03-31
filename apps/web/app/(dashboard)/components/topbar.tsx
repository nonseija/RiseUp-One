'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Bell, Menu, ChevronDown, LogOut, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useUser } from '@/contexts/user-context'
import api from '@/lib/api'
import { removeToken } from '@/lib/auth'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/agenda': 'Agenda',
  '/pacientes': 'Pacientes',
  '/crm': 'CRM / Leads',
  '/whatsapp': 'WhatsApp',
  '/instagram': 'Instagram',
  '/financeiro': 'Financeiro',
  '/prontuarios': 'Prontuários',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações',
}

interface TopbarProps {
  onMenuToggle: () => void
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const pageTitle = PAGE_TITLES[pathname] ?? 'RiseUp'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {}
    removeToken()
    localStorage.removeItem('riseup_refresh_token')
    router.push('/login')
  }

  return (
    <header
      className="fixed right-0 top-0 z-30 flex h-16 items-center justify-between px-4 lg:left-60"
      style={{ backgroundColor: '#141414' }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-white">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10">
          <Bell size={18} />
          <span
            className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ backgroundColor: '#29d9d5' }}
          >
            3
          </span>
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
              style={{ backgroundColor: '#29d9d5', color: '#141414' }}
            >
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-white">{user?.name ?? '...'}</p>
              <p className="text-[10px] text-white/50">{user?.role ?? ''}</p>
            </div>
            <ChevronDown size={14} className="text-white/50" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#141414] py-1 shadow-xl">
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-xs font-semibold text-white">{user?.name}</p>
                <p className="truncate text-[10px] text-white/50">{user?.email}</p>
              </div>
              <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white">
                <User size={14} />
                Meu perfil
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/10"
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
