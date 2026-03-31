import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator'
import { Role } from '@prisma/client'

export class CreateUserDto {
  @IsString()
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  name: string

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string

  @IsEnum(Role, { message: 'Role inválida' })
  role: Role
}
