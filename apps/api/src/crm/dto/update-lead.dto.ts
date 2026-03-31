import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator'
import { LeadSource } from '@prisma/client'

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  phone?: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource

  @IsString()
  @IsOptional()
  notes?: string
}
