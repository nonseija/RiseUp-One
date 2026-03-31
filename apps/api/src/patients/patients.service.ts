import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePatientDto } from './dto/create-patient.dto'
import { UpdatePatientDto } from './dto/update-patient.dto'

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  findAll(clinicId: string, q?: string) {
    const where: Record<string, unknown> = { clinicId }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
      ]
    }
    return this.prisma.patient.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        birthDate: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
      take: 100,
    })
  }

  async findOne(clinicId: string, id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, clinicId },
      include: {
        appointments: {
          orderBy: { datetime: 'desc' },
          take: 20,
          select: {
            id: true,
            datetime: true,
            service: true,
            status: true,
            duration: true,
            dentistId: true,
          },
        },
      },
    })
    if (!patient) throw new NotFoundException('Paciente não encontrado')
    return patient
  }

  search(clinicId: string, q: string) {
    return this.prisma.patient.findMany({
      where: {
        clinicId,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
        ],
      },
      select: { id: true, name: true, phone: true, email: true },
      orderBy: { name: 'asc' },
      take: 10,
    })
  }

  create(clinicId: string, dto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        clinicId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        notes: dto.notes,
      },
      select: { id: true, name: true, phone: true, email: true, birthDate: true },
    })
  }

  async update(clinicId: string, id: string, dto: UpdatePatientDto) {
    await this.findOne(clinicId, id)
    return this.prisma.patient.update({
      where: { id },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
      select: { id: true, name: true, phone: true, email: true, birthDate: true },
    })
  }
}
