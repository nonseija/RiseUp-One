import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Channel } from '@prisma/client'
import { QueryConversationsDto } from './dto/query-conversations.dto'

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getConversations(clinicId: string, filters: QueryConversationsDto) {
    const where: Record<string, unknown> = { clinicId }
    if (filters.channel) where['channel'] = filters.channel
    if (filters.q) {
      where['OR'] = [
        { contactName: { contains: filters.q, mode: 'insensitive' } },
        { contactPhone: { contains: filters.q } },
      ]
    }
    return this.prisma.conversation.findMany({
      where,
      include: {
        messages: { orderBy: { timestamp: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async getMessages(conversationId: string, clinicId: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, clinicId },
    })
    if (!conv) throw new NotFoundException('Conversa não encontrada')
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: 'asc' },
    })
  }

  async sendMessage(conversationId: string, clinicId: string, body: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, clinicId },
    })
    if (!conv) throw new NotFoundException('Conversa não encontrada')

    const message = await this.prisma.message.create({
      data: { conversationId, body, fromMe: true },
    })

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return { message, conversation: conv }
  }

  async markAsRead(conversationId: string, clinicId: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, clinicId },
    })
    if (!conv) throw new NotFoundException('Conversa não encontrada')
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    })
  }

  async findOrCreateConversation(
    clinicId: string,
    channel: Channel,
    externalId: string,
    contactName: string,
    contactPhone: string,
  ) {
    const existing = await this.prisma.conversation.findFirst({
      where: { clinicId, channel, externalId },
    })
    if (existing) return { conversation: existing, isNew: false }

    // Try to link to existing patient or lead by phone
    const patient = await this.prisma.patient.findFirst({
      where: { clinicId, phone: contactPhone },
    })
    const lead = !patient
      ? await this.prisma.lead.findFirst({ where: { clinicId, phone: contactPhone } })
      : null

    const conversation = await this.prisma.conversation.create({
      data: {
        clinicId,
        channel,
        externalId,
        contactName,
        contactPhone,
        patientId: patient?.id,
        leadId: lead?.id,
      },
    })

    return { conversation, isNew: true }
  }

  async receiveInboundMessage(
    clinicId: string,
    channel: Channel,
    externalId: string,
    contactName: string,
    contactPhone: string,
    body: string,
  ) {
    const { conversation, isNew } = await this.findOrCreateConversation(
      clinicId,
      channel,
      externalId,
      contactName,
      contactPhone,
    )

    const message = await this.prisma.message.create({
      data: { conversationId: conversation.id, body, fromMe: false },
    })

    const updatedConversation = await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { unreadCount: { increment: 1 }, updatedAt: new Date() },
    })

    return { message, conversation: updatedConversation, isNew }
  }

  async getConversationById(conversationId: string, clinicId: string) {
    return this.prisma.conversation.findFirst({
      where: { id: conversationId, clinicId },
      include: { messages: { orderBy: { timestamp: 'asc' } } },
    })
  }
}
