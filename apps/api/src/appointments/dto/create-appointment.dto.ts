import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateAppointmentDto {
  @IsString()
  patientId: string

  @IsString()
  dentistId: string

  @IsDateString()
  datetime: string

  @Type(() => Number)
  @IsInt()
  @Min(15)
  duration: number

  @IsString()
  service: string

  @IsOptional()
  @IsString()
  notes?: string

  /** If the patient came from a lead, update lead stage to AGENDADO */
  @IsOptional()
  @IsString()
  leadId?: string
}
