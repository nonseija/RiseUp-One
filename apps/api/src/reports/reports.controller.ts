import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ReportsService } from './reports.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../auth/guards/tenant.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentClinic } from '../auth/decorators/current-clinic.decorator'

function parseDateRange(dateFrom?: string, dateTo?: string) {
  const now = new Date()
  const from = dateFrom ? new Date(dateFrom) : new Date(now.getFullYear(), now.getMonth(), 1)
  const to = dateTo ? new Date(dateTo) : now
  to.setHours(23, 59, 59, 999)
  return { from, to }
}

@Controller('reports')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('ADMIN', 'FINANCEIRO')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get('appointments')
  appointments(
    @CurrentClinic() clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const { from, to } = parseDateRange(dateFrom, dateTo)
    return this.service.getAppointmentsReport(clinicId, from, to)
  }

  @Get('revenue')
  revenue(
    @CurrentClinic() clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const { from, to } = parseDateRange(dateFrom, dateTo)
    return this.service.getRevenueReport(clinicId, from, to)
  }

  @Get('leads')
  leads(
    @CurrentClinic() clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const { from, to } = parseDateRange(dateFrom, dateTo)
    return this.service.getLeadsReport(clinicId, from, to)
  }

  @Get('dentists')
  dentists(
    @CurrentClinic() clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const { from, to } = parseDateRange(dateFrom, dateTo)
    return this.service.getDentistsReport(clinicId, from, to)
  }

  @Get('patients')
  patients(
    @CurrentClinic() clinicId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const { from, to } = parseDateRange(dateFrom, dateTo)
    return this.service.getPatientsReport(clinicId, from, to)
  }
}
