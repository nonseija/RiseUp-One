import { Global, Module } from '@nestjs/common'
import { BullMQService } from './bullmq.service'
import { AppointmentRemindersProcessor } from './appointment-reminders.processor'
import { MessageSendersProcessor } from './message-senders.processor'

@Global()
@Module({
  providers: [BullMQService, AppointmentRemindersProcessor, MessageSendersProcessor],
  exports: [BullMQService],
})
export class QueuesModule {}
