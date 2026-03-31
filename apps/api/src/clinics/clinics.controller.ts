import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ClinicsService } from './clinics.service'
import { UpdateClinicSettingsDto, CreateClinicServiceDto, UpdateClinicServiceDto } from './dto/update-clinic.dto'
import { PublicBookingDto } from './dto/public-booking.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../auth/guards/tenant.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentClinic } from '../auth/decorators/current-clinic.decorator'
import { IsString, IsEmail } from 'class-validator'

class InviteUserDto {
  @IsString() name: string
  @IsEmail() email: string
  @IsString() role: string
}

class ToggleActiveDto {
  active: boolean
}

// ─── Public routes (no auth) ─────────────────────────────────────────────────

@Controller('public')
export class PublicClinicsController {
  constructor(private clinicsService: ClinicsService) {}

  @Get(':slug')
  getPublicData(@Param('slug') slug: string) {
    return this.clinicsService.getPublicData(slug)
  }

  @Get(':slug/slots')
  getSlots(
    @Param('slug') slug: string,
    @Query('dentistId') dentistId: string,
    @Query('date') date: string,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.clinicsService.getPublicSlots(slug, dentistId ?? 'any', date, serviceId)
  }

  @Post(':slug/book')
  @HttpCode(HttpStatus.CREATED)
  createBooking(@Param('slug') slug: string, @Body() dto: PublicBookingDto) {
    return this.clinicsService.createPublicBooking(slug, dto)
  }
}

// ─── Private routes (ADMIN) ──────────────────────────────────────────────────

@Controller('clinics')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('ADMIN')
export class ClinicsController {
  constructor(private clinicsService: ClinicsService) {}

  @Get('settings')
  getSettings(@CurrentClinic() clinicId: string) {
    return this.clinicsService.getSettings(clinicId)
  }

  @Patch('settings')
  updateSettings(@CurrentClinic() clinicId: string, @Body() dto: UpdateClinicSettingsDto) {
    return this.clinicsService.updateSettings(clinicId, dto)
  }

  @Get('services')
  listServices(@CurrentClinic() clinicId: string) {
    return this.clinicsService.listServices(clinicId)
  }

  @Post('services')
  createService(@CurrentClinic() clinicId: string, @Body() dto: CreateClinicServiceDto) {
    return this.clinicsService.createService(clinicId, dto)
  }

  @Patch('services/:id')
  updateService(
    @Param('id') id: string,
    @CurrentClinic() clinicId: string,
    @Body() dto: UpdateClinicServiceDto,
  ) {
    return this.clinicsService.updateService(id, clinicId, dto)
  }

  @Delete('services/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteService(@Param('id') id: string, @CurrentClinic() clinicId: string) {
    return this.clinicsService.deleteService(id, clinicId)
  }

  @Get('team')
  listUsers(@CurrentClinic() clinicId: string) {
    return this.clinicsService.listUsers(clinicId)
  }

  @Post('team/invite')
  inviteUser(@CurrentClinic() clinicId: string, @Body() dto: InviteUserDto) {
    return this.clinicsService.inviteUser(clinicId, dto)
  }

  @Patch('team/:id/toggle')
  toggleUser(
    @Param('id') id: string,
    @CurrentClinic() clinicId: string,
    @Body() dto: ToggleActiveDto,
  ) {
    return this.clinicsService.toggleUserActive(id, clinicId, dto.active)
  }
}
