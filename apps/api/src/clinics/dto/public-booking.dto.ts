import { IsString, IsEmail, IsOptional, Matches } from 'class-validator'

export class PublicBookingDto {
  @IsString() patientName: string
  @IsString() patientPhone: string
  @IsOptional() @IsEmail() patientEmail?: string
  @IsString() dentistId: string
  @IsString() serviceId: string
  @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/) date: string
  @IsString() @Matches(/^\d{2}:\d{2}$/) time: string
  @IsOptional() @IsString() notes?: string
}
