import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { AppointmentStatus } from '@prisma/client'

export class QueryAppointmentsDto {
  /** Single day filter — YYYY-MM-DD */
  @IsOptional()
  @IsString()
  date?: string

  /** Week/range start — YYYY-MM-DD */
  @IsOptional()
  @IsString()
  dateFrom?: string

  /** Week/range end — YYYY-MM-DD (inclusive) */
  @IsOptional()
  @IsString()
  dateTo?: string

  @IsOptional()
  @IsString()
  dentistId?: string

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number
}
