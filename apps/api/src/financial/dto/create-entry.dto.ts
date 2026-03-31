import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'
import { EntryType, PaymentMethod, PaymentStatus } from '@prisma/client'

export class CreateEntryDto {
  @IsEnum(EntryType)
  @IsOptional()
  type?: EntryType

  @IsString()
  description: string

  @IsNumber()
  @IsPositive()
  amount: number

  @IsString()
  @IsOptional()
  category?: string

  @IsString()
  @IsOptional()
  patientId?: string

  @IsString()
  @IsOptional()
  dentistId?: string

  @IsString()
  @IsOptional()
  appointmentId?: string

  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod

  @IsString()
  @IsOptional()
  dueDate?: string

  @IsString()
  @IsOptional()
  paidAt?: string

  @IsString()
  @IsOptional()
  notes?: string
}
