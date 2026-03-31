import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import { InstagramService } from './instagram.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../auth/guards/tenant.guard'
import { CurrentClinic } from '../auth/decorators/current-clinic.decorator'
import { ConfigService } from '@nestjs/config'

@Controller('instagram')
export class InstagramController {
  constructor(
    private instagram: InstagramService,
    private config: ConfigService,
  ) {}

  @Get('webhook')
  verifyWebhook(@Query() query: Record<string, string>, @Res() res: Response) {
    const challenge = this.instagram.verifyWebhook(query)
    if (challenge !== null) {
      res.status(200).send(challenge)
    } else {
      res.status(403).send('Forbidden')
    }
  }

  @Post('webhook')
  receiveWebhook(
    @Body() payload: unknown,
    @Query('clinicId') clinicId: string,
  ) {
    const cid = clinicId ?? this.config.get<string>('DEFAULT_CLINIC_ID') ?? ''
    void this.instagram.processWebhook(
      payload as Parameters<InstagramService['processWebhook']>[0],
      cid,
    )
    return { ok: true }
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('send')
  sendMessage(
    @CurrentClinic() _clinicId: string,
    @Body() body: { recipientId: string; message: string },
  ) {
    return this.instagram.sendMessage(body.recipientId, body.message)
  }
}
