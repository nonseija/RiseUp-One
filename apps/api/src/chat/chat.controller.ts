import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { SendMessageDto } from './dto/send-message.dto'
import { QueryConversationsDto } from './dto/query-conversations.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../auth/guards/tenant.guard'
import { CurrentClinic } from '../auth/decorators/current-clinic.decorator'
import { BullMQService } from '../queues/bullmq.service'

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private chat: ChatService,
    private gateway: ChatGateway,
    private queues: BullMQService,
  ) {}

  @Get('conversations')
  getConversations(
    @CurrentClinic() clinicId: string,
    @Query() query: QueryConversationsDto,
  ) {
    return this.chat.getConversations(clinicId, query)
  }

  @Get('conversations/:id/messages')
  getMessages(
    @CurrentClinic() clinicId: string,
    @Param('id') id: string,
  ) {
    return this.chat.getMessages(id, clinicId)
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @CurrentClinic() clinicId: string,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    const { message, conversation } = await this.chat.sendMessage(id, clinicId, dto.body)

    // Enqueue to the right channel sender
    if (conversation.channel === 'WHATSAPP') {
      await this.queues.addSenderJob('whatsapp-sender', {
        externalId: conversation.externalId,
        body: dto.body,
      })
    } else {
      await this.queues.addSenderJob('instagram-sender', {
        externalId: conversation.externalId,
        body: dto.body,
      })
    }

    this.gateway.emitNewMessage(clinicId, id, message)
    return message
  }

  @Post('conversations/:id/read')
  async markAsRead(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    const conv = await this.chat.markAsRead(id, clinicId)
    this.gateway.emitConversationUpdated(clinicId, conv)
    return conv
  }
}
