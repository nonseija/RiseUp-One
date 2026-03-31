import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { WhatsappService } from './whatsapp.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../auth/guards/tenant.guard'
import { CurrentClinic } from '../auth/decorators/current-clinic.decorator'
import { ConfigService } from '@nestjs/config'

@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private whatsapp: WhatsappService,
    private config: ConfigService,
  ) {}

  @Get('webhook')
  verifyWebhook(@Query() query: Record<string, string>) {
    // Evolution API webhook verification (returns challenge or OK)
    return query['hub.challenge'] ?? 'ok'
  }

  @Post('webhook')
  receiveWebhook(
    @Body() payload: unknown,
    @Query('clinicId') clinicId: string,
  ) {
    // clinicId passed as query param when registering the webhook URL
    const cid = clinicId ?? this.config.get<string>('DEFAULT_CLINIC_ID') ?? ''
    void this.whatsapp.processWebhook(payload as Parameters<WhatsappService['processWebhook']>[0], cid)
    return { ok: true }
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('send')
  sendMessage(
    @CurrentClinic() _clinicId: string,
    @Body() body: { phone: string; message: string },
  ) {
    return this.whatsapp.sendMessage(body.phone, body.message)
  }
}
