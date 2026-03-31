import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Queue } from 'bullmq'

export interface ReminderJobData {
  appointmentId: string
  patientName: string
  datetime: Date
  type: '48h' | '2h'
}

export interface SenderJobData {
  externalId: string
  body: string
}

@Injectable()
export class BullMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BullMQService.name)
  appointmentReminders: Queue<ReminderJobData>
  whatsappSender: Queue<SenderJobData>
  instagramSender: Queue<SenderJobData>

  constructor(private config: ConfigService) {}

  onModuleInit() {
    try {
      const connection = this.getConnection()
      const opts = { removeOnComplete: 100, removeOnFail: 500 }

      this.appointmentReminders = new Queue<ReminderJobData>('appointment-reminders', {
        connection,
        defaultJobOptions: opts,
      })
      this.whatsappSender = new Queue<SenderJobData>('whatsapp-sender', {
        connection,
        defaultJobOptions: opts,
      })
      this.instagramSender = new Queue<SenderJobData>('instagram-sender', {
        connection,
        defaultJobOptions: opts,
      })

      this.logger.log('BullMQ queues initialized')
    } catch (err) {
      this.logger.warn(`BullMQ init failed (Redis unavailable?): ${(err as Error).message}`)
    }
  }

  async addReminderJob(data: ReminderJobData, delay: number) {
    if (!this.appointmentReminders) return
    await this.appointmentReminders.add('sendReminder', data, { delay })
    this.logger.debug(`Queued ${data.type} reminder for ${data.patientName}`)
  }

  async addSenderJob(queue: 'whatsapp-sender' | 'instagram-sender', data: SenderJobData) {
    const q = queue === 'whatsapp-sender' ? this.whatsappSender : this.instagramSender
    if (!q) return
    await q.add('send', data)
  }

  async onModuleDestroy() {
    await Promise.all([
      this.appointmentReminders?.close(),
      this.whatsappSender?.close(),
      this.instagramSender?.close(),
    ])
  }

  private getConnection() {
    const url = this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379'
    const parsed = new URL(url)
    return { host: parsed.hostname, port: Number(parsed.port) || 6379 }
  }
}
