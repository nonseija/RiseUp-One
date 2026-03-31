export interface FinancialEntry {
  id: string
  type: 'RECEITA' | 'DESPESA'
  description: string
  amount: number
  category?: string | null
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO'
  paymentMethod?: string | null
  dueDate?: string | null
  paidAt?: string | null
  notes?: string | null
  createdAt: string
  patient?: { id: string; name: string } | null
}

export interface FinancialSummary {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  receitasPendentes: number
  receitasVencidas: number
  receitasPorCategoria: { category: string; total: number }[]
  evolucaoMensal: { month: string; receitas: number; despesas: number }[]
}

export interface Filters {
  q?: string
  type?: 'RECEITA' | 'DESPESA'
  status?: 'PENDENTE' | 'PAGO' | 'VENCIDO'
  dateFrom?: string
  dateTo?: string
  page: number
}
