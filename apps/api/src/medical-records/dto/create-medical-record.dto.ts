import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator'
import { RecordType } from '@prisma/client'

export class CreateMedicalRecordDto {
  @IsString()
  patientId: string

  @IsString()
  dentistId: string

  @IsString()
  @IsOptional()
  appointmentId?: string

  @IsEnum(RecordType)
  @IsOptional()
  type?: RecordType

  @IsString()
  title: string

  @IsString()
  notes: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  teeth?: string[]

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  procedures?: string[]
}
