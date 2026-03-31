import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateEntryDto } from './dto/create-entry.dto'
import { UpdateEntryDto } from './dto/update-entry.dto'
import { QueryEntriesDto } from './dto/query-entries.dto'
import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client'

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  async findAll(clinicId: string, dto: QueryEntriesDto) {
    const page = parseInt(dto.page ?? '1', 10)
    const pageSize = parseInt(dto.pageSize ?? '20', 10)
    const skip = (page - 1) * pageSize

    const where: Prisma.FinancialEntryWhereInput = { clinicId }

    if (dto.type) where.type = dto.type
    if (dto.status) where.status = dto.status
    if (dto.dentistId) where.dentistId = dto.dentistId
    if (dto.patientId) where.patientId = dto.patientId
    if (dto.q) where.description = { contains: dto.q, mode: 'insensitive' }

    if (dto.dateFrom || dto.dateTo) {
      where.createdAt = {
        ...(dto.dateFrom ? { gte: new Date(dto.dateFrom) } : {}),
        ...(dto.dateTo ? { lte: new Date(dto.dateTo) } : {}),
      }
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.financialEntry.count({ where }),
      this.prisma.financialEntry.findMany({
        where,
        include: {
          patient: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ])

    return { total, page, pageSize, items }
  }

  async getSummary(clinicId: string, month: number, year: number) {
    const startOfMonth = new Date(year, month - 1, 1)
    const endOfMonth = new Date(year, month, 0, 23, 59, 59)

    const entries = await this.prisma.financialEntry.findMany({
      where: {
        clinicId,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    })

    const totalReceitas = entries
      .filter((e) => e.type === 'RECEITA' && e.status === 'PAGO')
      .reduce((sum, e) => sum + e.amount, 0)

    const totalDespesas = entries
      .filter((e) => e.type === 'DESPESA' && e.status === 'PAGO')
      .reduce((sum, e) => sum + e.amount, 0)

    const receitasPendentes = entries
      .filter((e) => e.type === 'RECEITA' && e.status === 'PENDENTE')
      .reduce((sum, e) => sum + e.amount, 0)

    const receitasVencidas = entries
      .filter((e) => e.type === 'RECEITA' && e.status === 'VENCIDO')
      .reduce((sum, e) => sum + e.amount, 0)

    // Receitas por categoria
    const categoryMap: Record<string, number> = {}
    for (const e of entries.filter((e) => e.type === 'RECEITA')) {
      const cat = e.category ?? 'Outros'
      categoryMap[cat] = (categoryMap[cat] ?? 0) + e.amount
    }
    const receitasPorCategoria = Object.entries(categoryMap).map(
      ([category, total]) => ({ category, total }),
    )

    // Evolução mensal — últimos 6 meses
    const evolucaoMensal = await this.buildEvolucaoMensal(clinicId, month, year)

    return {
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
      receitasPendentes,
      receitasVencidas,
      receitasPorCategoria,
      evolucaoMensal,
    }
  }

  private async buildEvolucaoMensal(
    clinicId: string,
    currentMonth: number,
    currentYear: number,
  ) {
    const months: { label: string; gte: Date; lte: Date }[] = []
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i
      let y = currentYear
      while (m <= 0) { m += 12; y -= 1 }
      months.push({
        label: new Date(y, m - 1, 1).toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
        gte: new Date(y, m - 1, 1),
        lte: new Date(y, m, 0, 23, 59, 59),
      })
    }

    const result = []
    for (const m of months) {
      const entries = await this.prisma.financialEntry.findMany({
        where: { clinicId, createdAt: { gte: m.gte, lte: m.lte } },
        select: { type: true, amount: true, status: true },
      })
      const receitas = entries
        .filter((e) => e.type === 'RECEITA' && e.status === 'PAGO')
        .reduce((s, e) => s + e.amount, 0)
      const despesas = entries
        .filter((e) => e.type === 'DESPESA' && e.status === 'PAGO')
        .reduce((s, e) => s + e.amount, 0)
      result.push({ month: m.label, receitas, despesas })
    }
    return result
  }

  create(clinicId: string, dto: CreateEntryDto) {
    const paidAt =
      dto.status === 'PAGO' && !dto.paidAt ? new Date() : dto.paidAt ? new Date(dto.paidAt) : undefined

    return this.prisma.financialEntry.create({
      data: {
        clinicId,
        type: dto.type ?? 'RECEITA',
        description: dto.description,
        amount: dto.amount,
        category: dto.category,
        patientId: dto.patientId,
        dentistId: dto.dentistId,
        appointmentId: dto.appointmentId,
        status: dto.status ?? 'PENDENTE',
        paymentMethod: dto.paymentMethod,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        paidAt,
        notes: dto.notes,
      },
      include: { patient: { select: { id: true, name: true } } },
    })
  }

  async update(id: string, clinicId: string, dto: UpdateEntryDto) {
    const entry = await this.prisma.financialEntry.findFirst({ where: { id, clinicId } })
    if (!entry) throw new NotFoundException('Lançamento não encontrado')

    const paidAt =
      dto.status === 'PAGO' && !entry.paidAt && !dto.paidAt
        ? new Date()
        : dto.paidAt
          ? new Date(dto.paidAt)
          : undefined

    return this.prisma.financialEntry.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.patientId !== undefined && { patientId: dto.patientId }),
        ...(dto.dentistId !== undefined && { dentistId: dto.dentistId }),
        ...(dto.appointmentId !== undefined && { appointmentId: dto.appointmentId }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.paymentMethod !== undefined && { paymentMethod: dto.paymentMethod }),
        ...(dto.dueDate !== undefined && { dueDate: new Date(dto.dueDate) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(paidAt && { paidAt }),
      },
      include: { patient: { select: { id: true, name: true } } },
    })
  }

  async markAsPaid(id: string, clinicId: string, paymentMethod?: PaymentMethod) {
    const entry = await this.prisma.financialEntry.findFirst({ where: { id, clinicId } })
    if (!entry) throw new NotFoundException('Lançamento não encontrado')

    return this.prisma.financialEntry.update({
      where: { id },
      data: {
        status: 'PAGO',
        paidAt: new Date(),
        ...(paymentMethod && { paymentMethod }),
      },
      include: { patient: { select: { id: true, name: true } } },
    })
  }

  async bulkUpdateStatus(ids: string[], clinicId: string, status: PaymentStatus) {
    const entries = await this.prisma.financialEntry.findMany({
      where: { id: { in: ids }, clinicId },
      select: { id: true },
    })
    const validIds = entries.map((e) => e.id)

    const paidAt = status === 'PAGO' ? { paidAt: new Date() } : {}

    await this.prisma.financialEntry.updateMany({
      where: { id: { in: validIds } },
      data: { status, ...paidAt },
    })

    return { updated: validIds.length }
  }

  async getOverdue(clinicId: string) {
    const now = new Date()

    // Mark as overdue first
    await this.prisma.financialEntry.updateMany({
      where: {
        clinicId,
        status: 'PENDENTE',
        dueDate: { lt: now },
      },
      data: { status: 'VENCIDO' },
    })

    return this.prisma.financialEntry.findMany({
      where: { clinicId, status: 'VENCIDO' },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: { dueDate: 'asc' },
    })
  }

  async remove(id: string, clinicId: string) {
    const entry = await this.prisma.financialEntry.findFirst({ where: { id, clinicId } })
    if (!entry) throw new NotFoundException('Lançamento não encontrado')
    await this.prisma.financialEntry.delete({ where: { id } })
    return { deleted: true }
  }
}
