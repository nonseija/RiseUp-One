import { Module } from '@nestjs/common'
import { InstagramController } from './instagram.controller'
import { InstagramService } from './instagram.service'
import { ChatModule } from '../chat/chat.module'

@Module({
  imports: [ChatModule],
  controllers: [InstagramController],
  providers: [InstagramService],
  exports: [InstagramService],
})
export class InstagramModule {}
