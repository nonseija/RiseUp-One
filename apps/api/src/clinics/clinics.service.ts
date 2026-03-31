import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateClinicSettingsDto, CreateClinicServiceDto, UpdateClinicServiceDto } from './dto/update-clinic.dto'
import { PublicBookingDto } from './dto/public-booking.dto'

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  // ─── Public: data ───────────────────────────────────────────────────────────

  async getPublicData(slug: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { slug },
      include: {
        services: { where: { active: true }, orderBy: { name: 'asc' } },
        users: { where: { role: 'DENTISTA', active: true }, select: { id: true, name: true } },
        settings: true,
      },
    })
    if (!clinic) throw new NotFoundException('Clínica não encontrada')
    if (!clinic.settings?.bookingEnabled) throw new ForbiddenException('Agendamento desativado')
    return {
      name: clinic.name,
      slug: clinic.slug,
      logoUrl: clinic.logoUrl,
      phone: clinic.phone,
      services: clinic.services,
      dentists: clinic.users,
      settings: clinic.settings,
    }
  }

  // ─── Public: available slots ─────────────────────────────────────────────────

  async getPublicSlots(slug: string, dentistId: string, date: string, serviceId?: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { slug },
      include: { settings: true },
    })
    if (!clinic) throw new NotFoundException('Clínica não encontrada')

    const settings = clinic.settings
    if (!settings) return { slots: [] }

    // Check working day
    const dateObj = new Date(date + 'T12:00:00')
    const dayOfWeek = dateObj.getDay()
    if (!settings.workingDays.includes(dayOfWeek)) return { slots: [] }

    // Get service duration
    let slotDurationMin = settings.slotDuration
    if (serviceId) {
      const svc = await this.prisma.clinicService.findFirst({
        where: { id: serviceId, clinicId: clinic.id, active: true },
      })
      if (svc) slotDurationMin = svc.duration
    }

    // Generate all possible slots
    const [startH, startM] = settings.workingHoursStart.split(':').map(Number)
    const [endH, endM] = settings.workingHoursEnd.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    const allSlots: string[] = []
    for (let m = startMinutes; m + slotDurationMin <= endMinutes; m += settings.slotDuration) {
      const h = Math.floor(m / 60)
      const min = m % 60
      allSlots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`)
    }

    // Get existing appointments for dentist on that date
    const dayStart = new Date(date + 'T00:00:00')
    const dayEnd = new Date(date + 'T23:59:59')

    const dentistIds = dentistId === 'any'
      ? (await this.prisma.user.findMany({ where: { clinicId: clinic.id, role: 'DENTISTA', active: true }, select: { id: true } })).map(u => u.id)
      : [dentistId]

    const appointments = await this.prisma.appointment.findMany({
      where: {
        clinicId: clinic.id,
        dentistId: { in: dentistIds },
        datetime: { gte: dayStart, lte: dayEnd },
        status: { in: ['AGENDADA', 'CONFIRMADA'] },
      },
      select: { datetime: true, duration: true, dentistId: true },
    })

    // Filter past slots if today
    const now = new Date()
    const isToday = date === now.toISOString().slice(0, 10)

    const available = allSlots.filter((slot) => {
      // Skip past slots
      if (isToday) {
        const [sh, sm] = slot.split(':').map(Number)
        const slotTotalMin = sh * 60 + sm
        const nowTotalMin = now.getHours() * 60 + now.getMinutes()
        if (slotTotalMin <= nowTotalMin) return false
      }

      const [sh, sm] = slot.split(':').map(Number)
      const slotStartMin = sh * 60 + sm
      const slotEndMin = slotStartMin + slotDurationMin

      // Check against all appointments
      for (const appt of appointments) {
        const apptDate = new Date(appt.datetime)
        const apptStartMin = apptDate.getHours() * 60 + apptDate.getMinutes()
        const apptEndMin = apptStartMin + appt.duration
        if (slotStartMin < apptEndMin && slotEndMin > apptStartMin) return false
      }
      return true
    })

    return { slots: available, slotDuration: slotDurationMin }
  }

  // ─── Public: create booking ──────────────────────────────────────────────────

  async createPublicBooking(slug: string, dto: PublicBookingDto) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { slug },
      include: { settings: true },
    })
    if (!clinic) throw new NotFoundException('Clínica não encontrada')
    if (!clinic.settings?.bookingEnabled) throw new ForbiddenException('Agendamento desativado')

    // Validate slot still available
    const { slots } = await this.getPublicSlots(slug, dto.dentistId, dto.date, dto.serviceId)
    if (!slots.includes(dto.time)) {
      throw new BadRequestException('Horário indisponível. Por favor, escolha outro horário.')
    }

    // Get service name and duration
    const service = await this.prisma.clinicService.findFirst({
      where: { id: dto.serviceId, clinicId: clinic.id },
    })
    if (!service) throw new NotFoundException('Serviço não encontrado')

    // Find or create patient by phone
    let patient = await this.prisma.patient.findFirst({
      where: { clinicId: clinic.id, phone: dto.patientPhone },
    })
    if (!patient) {
      patient = await this.prisma.patient.create({
        data: {
          clinicId: clinic.id,
          name: dto.patientName,
          phone: dto.patientPhone,
          email: dto.patientEmail,
        },
      })
    }

    // Create appointment
    const [h, m] = dto.time.split(':').map(Number)
    const datetime = new Date(`${dto.date}T${dto.time}:00`)

    const appointment = await this.prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        patientId: patient.id,
        dentistId: dto.dentistId,
        datetime,
        duration: service.duration,
        status: 'AGENDADA',
        service: service.name,
        notes: dto.notes,
      },
    })

    // Create or find lead with source AGENDAMENTO_ONLINE
    const existingLead = await this.prisma.lead.findFirst({
      where: { clinicId: clinic.id, phone: dto.patientPhone },
    })
    if (!existingLead) {
      await this.prisma.lead.create({
        data: {
          clinicId: clinic.id,
          name: dto.patientName,
          phone: dto.patientPhone,
          email: dto.patientEmail,
          source: 'AGENDAMENTO_ONLINE',
          stage: 'AGENDADO',
        },
      })
    }

    return {
      success: true,
      appointment: {
        id: appointment.id,
        service: service.name,
        date: dto.date,
        time: dto.time,
        duration: service.duration,
      },
      patient: { name: patient.name, phone: patient.phone },
    }
  }

  // ─── Private: settings ───────────────────────────────────────────────────────

  async getSettings(clinicId: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      include: { settings: true },
    })
    if (!clinic) throw new NotFoundException()
    return clinic
  }

  async updateSettings(clinicId: string, dto: UpdateClinicSettingsDto) {
    const { name, phone, email, address, logoUrl, ...settingsData } = dto

    // Update clinic fields
    await this.prisma.clinic.update({
      where: { id: clinicId },
      data: { name, phone, email, address, logoUrl },
    })

    // Upsert settings
    const settings = await this.prisma.clinicSettings.upsert({
      where: { clinicId },
      create: { clinicId, ...settingsData },
      update: settingsData,
    })

    return settings
  }

  // ─── Private: services ───────────────────────────────────────────────────────

  async listServices(clinicId: string) {
    return this.prisma.clinicService.findMany({
      where: { clinicId },
      orderBy: { name: 'asc' },
    })
  }

  async createService(clinicId: string, dto: CreateClinicServiceDto) {
    return this.prisma.clinicService.create({
      data: { clinicId, ...dto },
    })
  }

  async updateService(id: string, clinicId: string, dto: UpdateClinicServiceDto) {
    const svc = await this.prisma.clinicService.findFirst({ where: { id, clinicId } })
    if (!svc) throw new NotFoundException()
    return this.prisma.clinicService.update({ where: { id }, data: dto })
  }

  async deleteService(id: string, clinicId: string) {
    const svc = await this.prisma.clinicService.findFirst({ where: { id, clinicId } })
    if (!svc) throw new NotFoundException()
    await this.prisma.clinicService.delete({ where: { id } })
  }

  // ─── Private: team ───────────────────────────────────────────────────────────

  async listUsers(clinicId: string) {
    return this.prisma.user.findMany({
      where: { clinicId },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      orderBy: { name: 'asc' },
    })
  }

  async inviteUser(clinicId: string, dto: { name: string; email: string; role: string }) {
    const exists = await this.prisma.user.findFirst({ where: { email: dto.email } })
    if (exists) throw new BadRequestException('E-mail já cadastrado')
    const bcrypt = await import('bcrypt')
    const tempPassword = Math.random().toString(36).slice(-8)
    const password = await bcrypt.hash(tempPassword, 10)
    return this.prisma.user.create({
      data: {
        clinicId,
        name: dto.name,
        email: dto.email,
        role: dto.role as any,
        password,
      },
      select: { id: true, name: true, email: true, role: true, active: true },
    })
  }

  async toggleUserActive(id: string, clinicId: string, active: boolean) {
    const user = await this.prisma.user.findFirst({ where: { id, clinicId } })
    if (!user) throw new NotFoundException()
    return this.prisma.user.update({
      where: { id },
      data: { active },
      select: { id: true, active: true },
    })
  }
}
