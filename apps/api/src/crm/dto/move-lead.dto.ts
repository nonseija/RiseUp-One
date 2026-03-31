import { IsEnum } from 'class-validator'
import { LeadStage } from '@prisma/client'

export class MoveLeadDto {
  @IsEnum(LeadStage)
  stage: LeadStage
}
