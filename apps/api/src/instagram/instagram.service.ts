import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ChatService } from '../chat/chat.service'
import { ChatGateway } from '../chat/chat.gateway'

interface MetaWebhookPayload {
  object?: string
  entry?: Array<{
    messaging?: Array<{
      sender?: { id?: string }
      recipient?: { id?: string }
      message?: { text?: string; mid?: string }
    }>
  }>
}

@Injectable()
export class InstagramService {
  private readonly logger = new Logger(InstagramService.name)

  constructor(
    private config: ConfigService,
    private chatService: ChatService,
    private gateway: ChatGateway,
  ) {}

  verifyWebhook(query: Record<string, string>): string | null {
    const verifyToken = this.config.get<string>('META_VERIFY_TOKEN') ?? ''
    if (query['hub.verify_token'] === verifyToken) {
      return query['hub.challenge'] ?? 'ok'
    }
    return null
  }

  async processWebhook(payload: MetaWebhookPayload, clinicId: string) {
    if (payload.object !== 'instagram') return

    for (const entry of payload.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        const senderId = event.sender?.id
        const text = event.message?.text
        if (!senderId || !text) continue

        const { message, conversation, isNew } = await this.chatService.receiveInboundMessage(
          clinicId,
          'INSTAGRAM',
          senderId,
          `IG:${senderId}`,
          senderId,
          text,
        )

        this.gateway.emitNewMessage(clinicId, conversation.id, message)
        this.gateway.emitConversationUpdated(clinicId, conversation)
        if (isNew) this.gateway.emitNewConversation(clinicId, conversation)
      }
    }
  }

  async sendMessage(recipientId: string, body: string) {
    const accessToken = this.config.get<string>('META_ACCESS_TOKEN') ?? ''
    const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: body },
        }),
      })
      if (!res.ok) {
        this.logger.warn(`Instagram send failed: ${res.status}`)
      }
    } catch (err) {
      this.logger.error(`Instagram send error: ${(err as Error).message}`)
    }
  }
}
