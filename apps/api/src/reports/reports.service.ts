import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getAppointmentsReport(clinicId: string, dateFrom: Date, dateTo: Date) {
    const appointments = await this.prisma.appointment.findMany({
      where: { clinicId, datetime: { gte: dateFrom, lte: dateTo } },
      select: {
        id: true,
        status: true,
        service: true,
        dentistId: true,
        datetime: true,
      },
    })

    const total = appointments.length

    // byStatus
    const statusMap: Record<string, number> = {}
    for (const a of appointments) {
      statusMap[a.status] = (statusMap[a.status] ?? 0) + 1
    }
    const byStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }))

    const concluded = statusMap['CONCLUIDA'] ?? 0
    const missed = statusMap['FALTA'] ?? 0
    const canceled = statusMap['CANCELADA'] ?? 0
    const attendanceBase = concluded + missed
    const attendanceRate = attendanceBase === 0 ? 0 : Math.round((concluded / attendanceBase) * 100)
    const cancelRate = total === 0 ? 0 : Math.round((canceled / total) * 100)

    // Dentist names
    const dentistIds = [...new Set(appointments.map((a) => a.dentistId))]
    const dentistUsers = dentistIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: dentistIds } },
          select: { id: true, name: true },
        })
      : []
    const dentistMap = Object.fromEntries(dentistUsers.map((u) => [u.id, u.name]))

    // byDentist
    const dentistAgg: Record<string, { total: number; concluded: number }> = {}
    for (const a of appointments) {
      const key = a.dentistId
      if (!dentistAgg[key]) dentistAgg[key] = { total: 0, concluded: 0 }
      dentistAgg[key].total++
      if (a.status === 'CONCLUIDA') dentistAgg[key].concluded++
    }
    const byDentist = Object.entries(dentistAgg).map(([id, v]) => ({
      dentistName: dentistMap[id] ?? id,
      total: v.total,
      concluded: v.concluded,
    }))

    // byService
    const serviceMap: Record<string, number> = {}
    for (const a of appointments) {
      serviceMap[a.service] = (serviceMap[a.service] ?? 0) + 1
    }
    const byService = Object.entries(serviceMap)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)

    // byDayOfWeek
    const dowMap: Record<number, number> = {}
    for (const a of appointments) {
      const dow = new Date(a.datetime).getDay()
      dowMap[dow] = (dowMap[dow] ?? 0) + 1
    }
    const byDayOfWeek = DAY_LABELS.map((day, i) => ({ day, count: dowMap[i] ?? 0 }))

    // evolution by date
    const evolMap: Record<string, number> = {}
    for (const a of appointments) {
      const d = isoDate(new Date(a.datetime))
      evolMap[d] = (evolMap[d] ?? 0) + 1
    }
    const evolution = Object.entries(evolMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

    return {
      total,
      byStatus,
      attendanceRate,
      cancelRate,
      byDentist,
      byService,
      byDayOfWeek,
      evolution,
    }
  }

  async getRevenueReport(clinicId: string, dateFrom: Date, dateTo: Date) {
    const entries = await this.prisma.financialEntry.findMany({
      where: { clinicId, createdAt: { gte: dateFrom, lte: dateTo } },
      select: {
        amount: true,
        type: true,
        status: true,
        category: true,
        dentistId: true,
        paymentMethod: true,
        dueDate: true,
      },
    })

    const paid = entries.filter((e) => e.status === 'PAGO')
    const totalRevenue = paid.filter((e) => e.type === 'RECEITA').reduce((s, e) => s + e.amount, 0)
    const totalExpenses = paid.filter((e) => e.type === 'DESPESA').reduce((s, e) => s + e.amount, 0)
    const netProfit = totalRevenue - totalExpenses
    const pendingTotal = entries
      .filter((e) => e.type === 'RECEITA' && e.status === 'PENDENTE')
      .reduce((s, e) => s + e.amount, 0)
    const overdueTotal = entries
      .filter((e) => e.type === 'RECEITA' && e.status === 'VENCIDO')
      .reduce((s, e) => s + e.amount, 0)

    // byMonth (last 6 months relative to dateTo)
    const byMonth = await this.buildRevenueByMonth(clinicId, dateTo)

    // byDentist
    const dentistIds = [...new Set(entries.filter((e) => e.dentistId).map((e) => e.dentistId as string))]
    const dentistUsers = dentistIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: dentistIds } },
          select: { id: true, name: true },
        })
      : []
    const dentistMap = Object.fromEntries(dentistUsers.map((u) => [u.id, u.name]))

    const dentistRevMap: Record<string, number> = {}
    for (const e of paid.filter((e) => e.type === 'RECEITA' && e.dentistId)) {
      const key = e.dentistId as string
      dentistRevMap[key] = (dentistRevMap[key] ?? 0) + e.amount
    }
    const byDentist = Object.entries(dentistRevMap).map(([id, revenue]) => ({
      dentistName: dentistMap[id] ?? id,
      revenue,
    }))

    // byCategory
    const catMap: Record<string, number> = {}
    for (const e of paid.filter((e) => e.type === 'RECEITA')) {
      const cat = e.category ?? 'Outros'
      catMap[cat] = (catMap[cat] ?? 0) + e.amount
    }
    const byCategory = Object.entries(catMap).map(([category, total]) => ({ category, total }))

    // byPaymentMethod
    const pmMap: Record<string, number> = {}
    for (const e of paid.filter((e) => e.type === 'RECEITA' && e.paymentMethod)) {
      const pm = e.paymentMethod as string
      pmMap[pm] = (pmMap[pm] ?? 0) + e.amount
    }
    const byPaymentMethod = Object.entries(pmMap).map(([method, total]) => ({ method, total }))

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      byMonth,
      byDentist,
      byCategory,
      byPaymentMethod,
      pendingTotal,
      overdueTotal,
    }
  }

  private async buildRevenueByMonth(clinicId: string, dateTo: Date) {
    const result = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(dateTo)
      d.setMonth(d.getMonth() - i)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      const label = start.toLocaleString('pt-BR', { month: 'short', year: '2-digit' })

      const entries = await this.prisma.financialEntry.findMany({
        where: { clinicId, status: 'PAGO', createdAt: { gte: start, lte: end } },
        select: { amount: true, type: true },
      })
      const revenue = entries.filter((e) => e.type === 'RECEITA').reduce((s, e) => s + e.amount, 0)
      const expenses = entries.filter((e) => e.type === 'DESPESA').reduce((s, e) => s + e.amount, 0)
      result.push({ month: label, revenue, expenses, profit: revenue - expenses })
    }
    return result
  }

  async getLeadsReport(clinicId: string, dateFrom: Date, dateTo: Date) {
    const leads = await this.prisma.lead.findMany({
      where: { clinicId, createdAt: { gte: dateFrom, lte: dateTo } },
      select: { id: true, source: true, stage: true, createdAt: true, updatedAt: true },
    })

    const totalLeads = leads.length

    // bySource
    const sourceMap: Record<string, number> = {}
    for (const l of leads) sourceMap[l.source] = (sourceMap[l.source] ?? 0) + 1
    const bySource = Object.entries(sourceMap).map(([source, count]) => ({ source, count }))

    // byStage
    const stageMap: Record<string, number> = {}
    for (const l of leads) stageMap[l.stage] = (stageMap[l.stage] ?? 0) + 1
    const stageOrder = ['NOVO', 'CONTATADO', 'AGENDADO', 'ATIVO', 'RECORRENTE']
    const byStage = stageOrder.map((stage) => ({ stage, count: stageMap[stage] ?? 0 }))

    // conversionRate: leads at ATIVO or RECORRENTE
    const converted = leads.filter((l) => l.stage === 'ATIVO' || l.stage === 'RECORRENTE').length
    const conversionRate = totalLeads === 0 ? 0 : Math.round((converted / totalLeads) * 100)

    // averageTimeToConvert
    const convertedLeads = leads.filter((l) => l.stage === 'ATIVO' || l.stage === 'RECORRENTE')
    let averageTimeToConvert = 0
    if (convertedLeads.length > 0) {
      const totalDays = convertedLeads.reduce((sum, l) => {
        const days = (new Date(l.updatedAt).getTime() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        return sum + days
      }, 0)
      averageTimeToConvert = Math.round(totalDays / convertedLeads.length)
    }

    // evolution by date
    const evolMap: Record<string, number> = {}
    for (const l of leads) {
      const d = isoDate(new Date(l.createdAt))
      evolMap[d] = (evolMap[d] ?? 0) + 1
    }
    const evolution = Object.entries(evolMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

    return { totalLeads, bySource, byStage, conversionRate, averageTimeToConvert, evolution }
  }

  async getDentistsReport(clinicId: string, dateFrom: Date, dateTo: Date) {
    const dentists = await this.prisma.user.findMany({
      where: { clinicId, role: 'DENTISTA', active: true },
      select: { id: true, name: true },
    })

    const dentistData = await Promise.all(
      dentists.map(async (d) => {
        const appointments = await this.prisma.appointment.findMany({
          where: { clinicId, dentistId: d.id, datetime: { gte: dateFrom, lte: dateTo } },
          select: { status: true, datetime: true },
        })

        const totalAppointments = appointments.length
        const concluded = appointments.filter((a) => a.status === 'CONCLUIDA').length
        const canceled = appointments.filter((a) => a.status === 'CANCELADA').length
        const attended = appointments.filter((a) => a.status === 'FALTA').length + concluded
        const attendanceRate = attended === 0 ? 0 : Math.round((concluded / attended) * 100)

        // Days with appointments
        const activeDays = new Set(appointments.map((a) => isoDate(new Date(a.datetime)))).size
        const avgAppointmentsPerDay = activeDays === 0 ? 0 : Math.round((totalAppointments / activeDays) * 10) / 10

        const revenueAgg = await this.prisma.financialEntry.aggregate({
          where: { clinicId, dentistId: d.id, type: 'RECEITA', status: 'PAGO', createdAt: { gte: dateFrom, lte: dateTo } },
          _sum: { amount: true },
        })
        const revenue = revenueAgg._sum.amount ?? 0

        return { id: d.id, name: d.name, totalAppointments, concluded, canceled, attendanceRate, revenue, avgAppointmentsPerDay }
      }),
    )

    return { dentists: dentistData }
  }

  async getPatientsReport(clinicId: string, dateFrom: Date, dateTo: Date) {
    const totalPatients = await this.prisma.patient.count({ where: { clinicId } })
    const newPatients = await this.prisma.patient.count({
      where: { clinicId, createdAt: { gte: dateFrom, lte: dateTo } },
    })

    // Returning patients: those with 2+ appointments in the period
    const appts = await this.prisma.appointment.findMany({
      where: { clinicId, datetime: { gte: dateFrom, lte: dateTo }, status: 'CONCLUIDA' },
      select: { patientId: true },
    })
    const apptCountByPatient: Record<string, number> = {}
    for (const a of appts) {
      apptCountByPatient[a.patientId] = (apptCountByPatient[a.patientId] ?? 0) + 1
    }
    const returningPatients = Object.values(apptCountByPatient).filter((c) => c >= 2).length

    // byAgeGroup
    const allPatients = await this.prisma.patient.findMany({
      where: { clinicId, birthDate: { not: null } },
      select: { birthDate: true },
    })
    const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51+': 0 }
    const now = new Date()
    for (const p of allPatients) {
      if (!p.birthDate) continue
      const age = Math.floor((now.getTime() - new Date(p.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      if (age <= 18) ageGroups['0-18']++
      else if (age <= 35) ageGroups['19-35']++
      else if (age <= 50) ageGroups['36-50']++
      else ageGroups['51+']++
    }
    const byAgeGroup = Object.entries(ageGroups).map(([group, count]) => ({ group, count }))

    // topServices
    const serviceMap: Record<string, number> = {}
    for (const a of appts) {
      // need service from appointments
    }
    const apptsFull = await this.prisma.appointment.findMany({
      where: { clinicId, datetime: { gte: dateFrom, lte: dateTo }, status: 'CONCLUIDA' },
      select: { service: true },
    })
    for (const a of apptsFull) serviceMap[a.service] = (serviceMap[a.service] ?? 0) + 1
    const topServices = Object.entries(serviceMap)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // retentionRate: patients with appts in period vs total patients
    const patientsWithAppts = Object.keys(apptCountByPatient).length
    const retentionRate = totalPatients === 0 ? 0 : Math.round((patientsWithAppts / totalPatients) * 100)

    return { totalPatients, newPatients, returningPatients, byAgeGroup, topServices, retentionRate }
  }
}
