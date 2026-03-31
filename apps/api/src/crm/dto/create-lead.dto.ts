import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator'
import { LeadSource } from '@prisma/client'

export class CreateLeadDto {
  @IsString()
  name: string

  @IsString()
  phone: string

  @IsEmail()
  @IsOptional()
  email?: string

  @IsEnum(LeadSource)
  source: LeadSource

  @IsString()
  @IsOptional()
  notes?: string
}
