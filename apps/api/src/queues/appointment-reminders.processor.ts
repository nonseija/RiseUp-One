import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Worker } from 'bullmq'
import type { ReminderJobData } from './bullmq.service'

@Injectable()
export class AppointmentRemindersProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('AppointmentReminders')
  private worker: Worker<ReminderJobData>

  constructor(private config: ConfigService) {}

  onModuleInit() {
    try {
      const url = this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379'
      const parsed = new URL(url)
      const connection = { host: parsed.hostname, port: Number(parsed.port) || 6379 }

      this.worker = new Worker<ReminderJobData>(
        'appointment-reminders',
        async (job) => {
          const { patientName, datetime, type } = job.data
          const time = new Date(datetime).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
          this.logger.log(
            `[REMINDER ${type}] Enviar WhatsApp para paciente ${patientName} às ${time}`,
          )
        },
        { connection, concurrency: 5 },
      )

      this.worker.on('failed', (job, err) => {
        this.logger.error(`Job ${job?.id} failed: ${err.message}`)
      })

      this.logger.log('AppointmentReminders worker started')
    } catch (err) {
      this.logger.warn(`Worker init failed (Redis unavailable?): ${(err as Error).message}`)
    }
  }

  async onModuleDestroy() {
    await this.worker?.close()
  }
}
