import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator'
import { EntryType, PaymentStatus } from '@prisma/client'

export class QueryEntriesDto {
  @IsEnum(EntryType)
  @IsOptional()
  type?: EntryType

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus

  @IsString()
  @IsOptional()
  dateFrom?: string

  @IsString()
  @IsOptional()
  dateTo?: string

  @IsString()
  @IsOptional()
  dentistId?: string

  @IsString()
  @IsOptional()
  patientId?: string

  @IsString()
  @IsOptional()
  q?: string

  @IsNumberString()
  @IsOptional()
  page?: string

  @IsNumberString()
  @IsOptional()
  pageSize?: string
}
