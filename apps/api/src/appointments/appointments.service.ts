import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { BullMQService } from '../queues/bullmq.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { QueryAppointmentsDto } from './dto/query-appointments.dto'

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private bullmq: BullMQService,
  ) {}

  // ─── List ─────────────────────────────────────────────────────────────────

  async findAll(clinicId: string, filters: QueryAppointmentsDto) {
    const where: Record<string, unknown> = { clinicId }

    if (filters.dentistId) where.dentistId = filters.dentistId
    if (filters.status) where.status = filters.status

    if (filters.date) {
      const d = new Date(filters.date)
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const end = new Date(start.getTime() + 86_400_000)
      where.datetime = { gte: start, lt: end }
    } else if (filters.dateFrom || filters.dateTo) {
      const range: Record<string, Date> = {}
      if (filters.dateFrom) {
        const d = new Date(filters.dateFrom)
        range.gte = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      }
      if (filters.dateTo) {
        const d = new Date(filters.dateTo)
        range.lt = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
      }
      where.datetime = range
    }

    const page = Math.max(1, filters.page ?? 1)
    const limit = Math.min(200, filters.limit ?? 100)
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: { patient: { select: { id: true, name: true, phone: true } } },
        orderBy: { datetime: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.appointment.count({ where }),
    ])

    return { data, total, page, limit }
  }

  async findOne(clinicId: string, id: string) {
    const apt = await this.prisma.appointment.findFirst({
      where: { id, clinicId },
      include: { patient: { select: { id: true, name: true, phone: true, email: true } } },
    })
    if (!apt) throw new NotFoundException('Consulta não encontrada')
    return apt
  }

  findToday(clinicId: string) {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(start.getTime() + 86_400_000)
    return this.prisma.appointment.findMany({
      where: { clinicId, datetime: { gte: start, lt: end } },
      include: { patient: { select: { id: true, name: true, phone: true } } },
      orderBy: { datetime: 'asc' },
    })
  }

  // ─── Slots ────────────────────────────────────────────────────────────────

  async findSlots(clinicId: string, dentistId: string, date: string) {
    const target = new Date(date + 'T00:00:00')
    const dayStart = new Date(target.getFullYear(), target.getMonth(), target.getDate())
    const dayEnd = new Date(dayStart.getTime() + 86_400_000)

    const booked = await this.prisma.appointment.findMany({
      where: {
        clinicId,
        dentistId,
        status: { notIn: ['CANCELADA'] },
        datetime: { gte: dayStart, lt: dayEnd },
      },
      select: { datetime: true, duration: true },
    })

    const slots: string[] = []
    for (let hour = 8; hour <= 17; hour++) {
      const slotStart = new Date(dayStart)
      slotStart.setHours(hour, 0, 0, 0)
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000)

      const occupied = booked.some((apt) => {
        const aptStart = new Date(apt.datetime)
        const aptEnd = new Date(aptStart.getTime() + apt.duration * 60 * 1000)
        return aptStart < slotEnd && aptEnd > slotStart
      })

      if (!occupied) slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }

    return slots
  }

  // ─── Dentists helper ──────────────────────────────────────────────────────

  findDentists(clinicId: string) {
    return this.prisma.user.findMany({
      where: { clinicId, role: 'DENTISTA', active: true },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    })
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(clinicId: string, dto: CreateAppointmentDto) {
    const newStart = new Date(dto.datetime)
    const newEnd = new Date(newStart.getTime() + dto.duration * 60 * 1000)
    const dayStart = new Date(newStart.getFullYear(), newStart.getMonth(), newStart.getDate())
    const dayEnd = new Date(dayStart.getTime() + 86_400_000)

    // Conflict check — load day's appointments and check overlap in memory
    const dayBooked = await this.prisma.appointment.findMany({
      where: {
        clinicId,
        dentistId: dto.dentistId,
        status: { notIn: ['CANCELADA'] },
        datetime: { gte: dayStart, lt: dayEnd },
      },
      select: { datetime: true, duration: true },
    })

    const hasConflict = dayBooked.some((apt) => {
      const aptStart = new Date(apt.datetime)
      const aptEnd = new Date(aptStart.getTime() + apt.duration * 60 * 1000)
      return aptStart < newEnd && aptEnd > newStart
    })

    if (hasConflict) throw new ConflictException('Horário já ocupado para este profissional')

    const appointment = await this.prisma.appointment.create({
      data: {
        clinicId,
        patientId: dto.patientId,
        dentistId: dto.dentistId,
        datetime: newStart,
        duration: dto.duration,
        status: 'AGENDADA',
        service: dto.service,
        notes: dto.notes,
      },
      include: { patient: { select: { id: true, name: true, phone: true } } },
    })

    // If created from a lead, update lead stage
    if (dto.leadId) {
      await this.prisma.lead.updateMany({
        where: { id: dto.leadId, clinicId },
        data: { stage: 'AGENDADO' },
      })
    }

    // Enqueue reminders (only if appointment is in the future)
    const now = Date.now()
    const aptTime = newStart.getTime()
    const delay48h = aptTime - 48 * 60 * 60 * 1000 - now
    const delay2h = aptTime - 2 * 60 * 60 * 1000 - now
    const jobData = {
      appointmentId: appointment.id,
      patientName: appointment.patient.name,
      datetime: newStart,
    }

    if (delay48h > 0) await this.bullmq.addReminderJob({ ...jobData, type: '48h' }, delay48h)
    if (delay2h > 0) await this.bullmq.addReminderJob({ ...jobData, type: '2h' }, delay2h)

    return appointment
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(clinicId: string, id: string, dto: UpdateAppointmentDto) {
    await this.findOne(clinicId, id)
    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...dto,
        datetime: dto.datetime ? new Date(dto.datetime) : undefined,
      },
      include: { patient: { select: { id: true, name: true, phone: true } } },
    })
  }

  // ─── Cancel ───────────────────────────────────────────────────────────────

  async cancel(clinicId: string, id: string) {
    await this.findOne(clinicId, id)
    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELADA' },
      select: { id: true, status: true },
    })
  }
}
