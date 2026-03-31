import { IsEnum, IsOptional, IsString } from 'class-validator'
import { LeadSource, LeadStage } from '@prisma/client'

export class QueryLeadsDto {
  @IsString()
  @IsOptional()
  q?: string

  @IsEnum(LeadStage)
  @IsOptional()
  stage?: LeadStage

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource
}
