import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(clinicId: string) {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      todayAppointments,
      thisMonthRevenue,
      prevMonthRevenue,
      activeLeads,
      leadsNew,
      attendanceConcluida,
      attendanceFalta,
      recentConversations,
      crmFunnel,
      recentLeads,
    ] = await Promise.all([
      // Today's appointments with patient name
      this.prisma.appointment.findMany({
        where: { clinicId, datetime: { gte: todayStart, lt: todayEnd } },
        include: { patient: { select: { name: true } } },
        orderBy: { datetime: 'asc' },
      }),

      // This month revenue (PAGO)
      this.prisma.financialEntry.aggregate({
        where: { clinicId, status: 'PAGO', paidAt: { gte: thisMonthStart } },
        _sum: { amount: true },
      }),

      // Previous month revenue
      this.prisma.financialEntry.aggregate({
        where: {
          clinicId,
          status: 'PAGO',
          paidAt: { gte: prevMonthStart, lt: thisMonthStart },
        },
        _sum: { amount: true },
      }),

      // Active leads (not RECORRENTE)
      this.prisma.lead.count({
        where: { clinicId, stage: { not: 'RECORRENTE' } },
      }),

      // Leads awaiting contact
      this.prisma.lead.count({ where: { clinicId, stage: 'NOVO' } }),

      // Attendance CONCLUIDA last 30 days
      this.prisma.appointment.count({
        where: { clinicId, status: 'CONCLUIDA', datetime: { gte: thirtyDaysAgo } },
      }),

      // Attendance FALTA last 30 days
      this.prisma.appointment.count({
        where: { clinicId, status: 'FALTA', datetime: { gte: thirtyDaysAgo } },
      }),

      // Last 5 conversations with last message
      this.prisma.conversation.findMany({
        where: { clinicId },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
      }),

      // CRM funnel counts by stage
      this.prisma.lead.groupBy({
        by: ['stage'],
        where: { clinicId },
        _count: { _all: true },
      }),

      // 3 most recent leads
      this.prisma.lead.findMany({
        where: { clinicId },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, phone: true, stage: true, source: true, createdAt: true },
      }),
    ])

    // Fetch patient/lead names for conversations
    const patientIds = recentConversations
      .filter((c) => c.patientId)
      .map((c) => c.patientId as string)
    const leadIds = recentConversations
      .filter((c) => c.leadId)
      .map((c) => c.leadId as string)

    const [patients, leads] = await Promise.all([
      patientIds.length > 0
        ? this.prisma.patient.findMany({
            where: { id: { in: patientIds } },
            select: { id: true, name: true },
          })
        : [],
      leadIds.length > 0
        ? this.prisma.lead.findMany({
            where: { id: { in: leadIds } },
            select: { id: true, name: true },
          })
        : [],
    ])

    const patientMap = Object.fromEntries(patients.map((p) => [p.id, p.name]))
    const leadMap = Object.fromEntries(leads.map((l) => [l.id, l.name]))

    // Revenue growth
    const monthRevenue = thisMonthRevenue._sum.amount ?? 0
    const prevRevenue = prevMonthRevenue._sum.amount ?? 0
    const revenueGrowth =
      prevRevenue === 0
        ? 0
        : Math.round(((monthRevenue - prevRevenue) / prevRevenue) * 100)

    // Attendance rate
    const totalAttendance = attendanceConcluida + attendanceFalta
    const attendanceRate =
      totalAttendance === 0 ? 0 : Math.round((attendanceConcluida / totalAttendance) * 100)

    // CRM funnel
    const stageOrder = ['NOVO', 'CONTATADO', 'AGENDADO', 'ATIVO', 'RECORRENTE']
    const funnelMap = Object.fromEntries(
      crmFunnel.map((item) => [item.stage, item._count._all]),
    )
    const crmFunnelResult = Object.fromEntries(stageOrder.map((s) => [s, funnelMap[s] ?? 0]))

    // Recent messages
    const recentMessages = recentConversations.map((conv) => {
      const name =
        (conv.patientId && patientMap[conv.patientId]) ||
        (conv.leadId && leadMap[conv.leadId]) ||
        conv.externalId
      const lastMsg = conv.messages[0]
      return {
        id: conv.id,
        name,
        channel: conv.channel,
        lastMessage: lastMsg?.body ?? '',
        unread: lastMsg != null && !lastMsg.fromMe,
      }
    })

    // Today's appointments
    const appointmentsTodayList = todayAppointments.map((apt) => ({
      id: apt.id,
      datetime: apt.datetime,
      patientName: apt.patient.name,
      service: apt.service,
      status: apt.status,
      duration: apt.duration,
    }))

    return {
      appointmentsToday: todayAppointments.length,
      appointmentsTodayList,
      monthRevenue,
      revenueGrowth,
      activeLeads,
      leadsAwaitingContact: leadsNew,
      attendanceRate,
      recentMessages,
      crmFunnel: crmFunnelResult,
      recentLeads,
    }
  }
}
