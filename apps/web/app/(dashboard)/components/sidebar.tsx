'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Calendar,
  Users,
  TrendingUp,
  MessageCircle,
  Instagram,
  DollarSign,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import { useUser } from '@/contexts/user-context'
import api from '@/lib/api'
import { removeToken } from '@/lib/auth'

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/agenda', label: 'Agenda', icon: Calendar },
      { href: '/pacientes', label: 'Pacientes', icon: Users },
      { href: '/crm', label: 'CRM / Leads', icon: TrendingUp },
    ],
  },
  {
    label: 'Comunicação',
    items: [
      { href: '/whatsapp', label: 'WhatsApp', icon: MessageCircle },
      { href: '/instagram', label: 'Instagram', icon: Instagram },
    ],
  },
  {
    label: 'Gestão',
    items: [
      { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
      { href: '/prontuarios', label: 'Prontuários', icon: FileText },
      { href: '/relatorios', label: 'Relatórios', icon: BarChart2 },
    ],
  },
  {
    label: 'Config',
    items: [{ href: '/configuracoes', label: 'Configurações', icon: Settings }],
  },
]

interface SidebarProps {
  isMobileOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clinic } = useUser()

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {}
    removeToken()
    localStorage.removeItem('riseup_refresh_token')
    router.push('/login')
  }

  const sidebarContent = (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#29d9d5' }}>
      {/* Logo + clinic name */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.35)' }}
        >
          <svg width="20" height="20" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <path
              d="M18 4C10.268 4 4 10.268 4 18C4 25.732 10.268 32 18 32C25.732 32 32 25.732 32 18C32 10.268 25.732 4 18 4ZM18 8C21.314 8 24.314 9.344 26.485 11.515L11.515 26.485C9.344 24.314 8 21.314 8 18C8 12.477 12.477 8 18 8ZM18 28C14.686 28 11.686 26.656 9.515 24.485L24.485 9.515C26.656 11.686 28 14.686 28 18C28 23.523 23.523 28 18 28Z"
              fill="white"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">RiseUp</p>
          <p className="truncate text-xs text-white/60">{clinic?.name ?? '...'}</p>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-white/70 hover:bg-white/20 lg:hidden"
          aria-label="Fechar menu"
        >
          <X size={16} />
        </button>
      </div>

      <div className="h-px bg-white/20" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-white/50">
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#141414' : 'rgba(255,255,255,0.85)',
                    fontWeight: isActive ? 600 : 500,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'
                      e.currentTarget.style.color = '#ffffff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                    }
                  }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="h-px bg-white/20" />

      {/* User + Logout */}
      <div className="px-3 py-4">
        <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ backgroundColor: '#141414', color: '#29d9d5' }}
          >
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {user?.name ?? '...'}
            </p>
            <p className="truncate text-[10px] text-white/60">{user?.role ?? ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — desktop: fixed; mobile: slide-in */}
      <aside
        className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col transition-transform duration-200 lg:translate-x-0"
        style={{ transform: isMobileOpen ? 'translateX(0)' : undefined }}
        aria-label="Navegação principal"
      >
        <div
          className={`h-full ${isMobileOpen ? '' : '-translate-x-full lg:translate-x-0'} transition-transform duration-200`}
        >
          {sidebarContent}
        </div>
      </aside>
    </>
  )
}
