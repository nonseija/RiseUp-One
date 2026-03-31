import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator'
import { RecordType } from '@prisma/client'

export class UpdateMedicalRecordDto {
  @IsEnum(RecordType)
  @IsOptional()
  type?: RecordType

  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  notes?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  teeth?: string[]

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  procedures?: string[]
}
