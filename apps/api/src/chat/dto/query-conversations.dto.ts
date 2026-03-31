import { IsEnum, IsOptional, IsString } from 'class-validator'
import { Channel } from '@prisma/client'

export class QueryConversationsDto {
  @IsEnum(Channel)
  @IsOptional()
  channel?: Channel

  @IsString()
  @IsOptional()
  q?: string
}
