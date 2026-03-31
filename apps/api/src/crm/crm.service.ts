import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLeadDto } from './dto/create-lead.dto'
import { UpdateLeadDto } from './dto/update-lead.dto'
import { MoveLeadDto } from './dto/move-lead.dto'
import { QueryLeadsDto } from './dto/query-leads.dto'
import { LeadStage } from '@prisma/client'

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async findAll(clinicId: string, query: QueryLeadsDto) {
    const where: Record<string, unknown> = { clinicId }
    if (query.stage) where['stage'] = query.stage
    if (query.source) where['source'] = query.source
    if (query.q) {
      where['OR'] = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { phone: { contains: query.q } },
        { email: { contains: query.q, mode: 'insensitive' } },
      ]
    }
    return this.prisma.lead.findMany({
      where,
      include: { activities: { orderBy: { createdAt: 'desc' }, take: 5 } },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async findOne(clinicId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, clinicId },
      include: { activities: { orderBy: { createdAt: 'desc' } } },
    })
    if (!lead) throw new NotFoundException('Lead não encontrado')
    return lead
  }

  async create(clinicId: string, dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: { ...dto, clinicId },
      include: { activities: true },
    })
  }

  async update(clinicId: string, id: string, dto: UpdateLeadDto) {
    await this.findOne(clinicId, id)
    return this.prisma.lead.update({
      where: { id },
      data: dto,
      include: { activities: { orderBy: { createdAt: 'desc' } } },
    })
  }

  async moveStage(clinicId: string, id: string, dto: MoveLeadDto) {
    const lead = await this.findOne(clinicId, id)
    const prevStage = lead.stage
    const updated = await this.prisma.lead.update({
      where: { id },
      data: { stage: dto.stage },
      include: { activities: { orderBy: { createdAt: 'desc' } } },
    })
    await this.prisma.leadActivity.create({
      data: {
        leadId: id,
        type: 'stage_change',
        content: `Movido de ${prevStage} para ${dto.stage}`,
      },
    })
    return updated
  }

  async addNote(clinicId: string, id: string, content: string) {
    await this.findOne(clinicId, id)
    return this.prisma.leadActivity.create({
      data: { leadId: id, type: 'note', content },
    })
  }

  async remove(clinicId: string, id: string) {
    await this.findOne(clinicId, id)
    await this.prisma.leadActivity.deleteMany({ where: { leadId: id } })
    return this.prisma.lead.delete({ where: { id } })
  }

  async convertToPatient(clinicId: string, id: string) {
    const lead = await this.findOne(clinicId, id)
    return this.prisma.$transaction(async (tx) => {
      const patient = await tx.patient.create({
        data: {
          clinicId,
          name: lead.name,
          phone: lead.phone,
          email: lead.email ?? undefined,
        },
      })
      await tx.lead.update({
        where: { id },
        data: { stage: LeadStage.ATIVO },
      })
      await tx.leadActivity.create({
        data: {
          leadId: id,
          type: 'conversion',
          content: `Convertido para paciente (ID: ${patient.id})`,
        },
      })
      return { patient, leadId: id }
    })
  }

  async getFunnel(clinicId: string) {
    const stages = Object.values(LeadStage)
    const results = await Promise.all(
      stages.map((stage) =>
        this.prisma.lead.count({ where: { clinicId, stage } }),
      ),
    )
    return stages.map((stage, i) => ({ stage, count: results[i] }))
  }
}
