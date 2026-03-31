import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ChatService } from '../chat/chat.service'
import { ChatGateway } from '../chat/chat.gateway'
import { PrismaService } from '../prisma/prisma.service'

interface EvolutionPayload {
  event: string
  data?: {
    key?: { remoteJid?: string; fromMe?: boolean }
    message?: { conversation?: string; extendedTextMessage?: { text?: string } }
    pushName?: string
  }
}

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name)

  constructor(
    private config: ConfigService,
    private chatService: ChatService,
    private gateway: ChatGateway,
    private prisma: PrismaService,
  ) {}

  async processWebhook(payload: EvolutionPayload, clinicId: string) {
    if (payload.event !== 'messages.upsert') return

    const data = payload.data
    const remoteJid = data?.key?.remoteJid ?? ''
    const fromMe = data?.key?.fromMe ?? false

    if (fromMe) return // Skip outgoing echoes

    const phone = remoteJid.replace('@s.whatsapp.net', '').replace('@g.us', '')
    const pushName = data?.pushName ?? phone
    const body =
      data?.message?.conversation ??
      data?.message?.extendedTextMessage?.text ??
      ''

    if (!body || !phone) return

    // Auto-create lead if contact doesn't exist
    const patient = await this.prisma.patient.findFirst({ where: { phone } })
    const lead = !patient
      ? await this.prisma.lead.findFirst({ where: { phone } })
      : null

    if (!patient && !lead) {
      // Find any clinic (webhook doesn't carry clinicId — resolved from instance config)
      const clinic = await this.prisma.clinic.findFirst({ where: { id: clinicId } })
      if (clinic) {
        await this.prisma.lead.create({
          data: {
            clinicId,
            name: pushName,
            phone,
            source: 'WHATSAPP',
          },
        })
        this.logger.log(`Auto-created lead for ${pushName} (${phone})`)
      }
    }

    const { message, conversation, isNew } = await this.chatService.receiveInboundMessage(
      clinicId,
      'WHATSAPP',
      remoteJid,
      pushName,
      phone,
      body,
    )

    this.gateway.emitNewMessage(clinicId, conversation.id, message)
    this.gateway.emitConversationUpdated(clinicId, conversation)
    if (isNew) this.gateway.emitNewConversation(clinicId, conversation)
  }

  async sendMessage(phone: string, body: string) {
    const instance = this.config.get<string>('EVOLUTION_INSTANCE') ?? 'default'
    const apiKey = this.config.get<string>('EVOLUTION_API_KEY') ?? ''
    const baseUrl = this.config.get<string>('EVOLUTION_API_URL') ?? 'http://localhost:8080'

    const url = `${baseUrl}/message/sendText/${instance}`
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: apiKey },
        body: JSON.stringify({
          number: phone,
          options: { delay: 0 },
          textMessage: { text: body },
        }),
      })
      if (!res.ok) {
        this.logger.warn(`WhatsApp send failed: ${res.status}`)
      }
    } catch (err) {
      this.logger.error(`WhatsApp send error: ${(err as Error).message}`)
    }
  }
}
