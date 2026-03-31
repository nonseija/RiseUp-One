import { IsString, IsEmail, IsOptional, IsBoolean, IsInt, IsArray, IsNumber, IsHexColor, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateClinicDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsString() phone?: string
  @IsOptional() @IsEmail() email?: string
  @IsOptional() @IsString() address?: string
  @IsOptional() @IsString() logoUrl?: string
}

export class UpdateClinicSettingsDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsString() phone?: string
  @IsOptional() @IsEmail() email?: string
  @IsOptional() @IsString() address?: string
  @IsOptional() @IsString() logoUrl?: string
  @IsOptional() @IsArray() @IsInt({ each: true }) workingDays?: number[]
  @IsOptional() @IsString() workingHoursStart?: string
  @IsOptional() @IsString() workingHoursEnd?: string
  @IsOptional() @IsInt() @Min(15) @Max(240) @Type(() => Number) slotDuration?: number
  @IsOptional() @IsBoolean() bookingEnabled?: boolean
  @IsOptional() @IsString() bookingMessage?: string
  @IsOptional() @IsString() primaryColor?: string
}

export class CreateClinicServiceDto {
  @IsString() name: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsInt() @Min(5) @Type(() => Number) duration?: number
  @IsOptional() @IsNumber() @Type(() => Number) price?: number
  @IsOptional() @IsBoolean() active?: boolean
}

export class UpdateClinicServiceDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @IsString() description?: string
  @IsOptional() @IsInt() @Min(5) @Type(() => Number) duration?: number
  @IsOptional() @IsNumber() @Type(() => Number) price?: number
  @IsOptional() @IsBoolean() active?: boolean
}
