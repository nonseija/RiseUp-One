import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Worker } from 'bullmq'
import type { SenderJobData } from './bullmq.service'

@Injectable()
export class MessageSendersProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('MessageSenders')
  private wppWorker: Worker<SenderJobData>
  private igWorker: Worker<SenderJobData>

  constructor(private config: ConfigService) {}

  onModuleInit() {
    try {
      const url = this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379'
      const parsed = new URL(url)
      const connection = { host: parsed.hostname, port: Number(parsed.port) || 6379 }

      this.wppWorker = new Worker<SenderJobData>(
        'whatsapp-sender',
        async (job) => {
          this.logger.log(`[WPP-SEND] → ${job.data.externalId}: "${job.data.body.slice(0, 50)}"`)
          // WhatsappService.sendMessage() is called in ChatController before enqueue,
          // so the worker here handles retry/logging
        },
        { connection, concurrency: 5 },
      )

      this.igWorker = new Worker<SenderJobData>(
        'instagram-sender',
        async (job) => {
          this.logger.log(`[IG-SEND] → ${job.data.externalId}: "${job.data.body.slice(0, 50)}"`)
        },
        { connection, concurrency: 5 },
      )

      this.wppWorker.on('failed', (job, err) =>
        this.logger.error(`WPP job ${job?.id} failed: ${err.message}`),
      )
      this.igWorker.on('failed', (job, err) =>
        this.logger.error(`IG job ${job?.id} failed: ${err.message}`),
      )

      this.logger.log('Message sender workers started')
    } catch (err) {
      this.logger.warn(`Sender workers init failed: ${(err as Error).message}`)
    }
  }

  async onModuleDestroy() {
    await Promise.all([this.wppWorker?.close(), this.igWorker?.close()])
  }
}
