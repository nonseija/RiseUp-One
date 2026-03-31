import { UserProvider } from '@/contexts/user-context'
import LayoutShell from '@/app/(dashboard)/components/layout-shell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <LayoutShell>{children}</LayoutShell>
    </UserProvider>
  )
}
