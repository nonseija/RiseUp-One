import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { AppointmentStatus } from '@prisma/client'

export class UpdateAppointmentDto {
  @IsOptional()
  @IsDateString()
  datetime?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  duration?: number

  @IsOptional()
  @IsEnum(AppointmentStatus, { message: 'Status inválido' })
  status?: AppointmentStatus

  @IsOptional()
  @IsString()
  service?: string

  @IsOptional()
  @IsString()
  notes?: string
}
