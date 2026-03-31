import { IsEmail, IsString, IsOptional } from 'class-validator'

export class RegisterClinicDto {
  @IsString()
  clinicName: string

  @IsString()
  adminName: string

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string

  @IsString()
  password: string

  @IsString()
  @IsOptional()
  confirmPassword?: string
}
