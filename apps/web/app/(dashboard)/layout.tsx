import { UserProvider } from '@/contexts/user-context'
import LayoutShell from './components/layout-shell'

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <LayoutShell>{children}</LayoutShell>
    </UserProvider>
  )
}
