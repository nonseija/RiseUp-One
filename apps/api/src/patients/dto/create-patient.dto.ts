import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class CreatePatientDto {
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  name: string

  @IsString()
  @MinLength(10, { message: 'Telefone inválido' })
  phone: string

  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  email?: string

  @IsOptional()
  @IsDateString()
  birthDate?: string

  @IsOptional()
  @IsString()
  notes?: string
}
