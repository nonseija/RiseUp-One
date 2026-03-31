import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { PatientsService } from './patients.service'
import { CreatePatientDto } from './dto/create-patient.dto'
import { UpdatePatientDto } from './dto/update-patient.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../auth/guards/tenant.guard'
import { CurrentClinic } from '../auth/decorators/current-clinic.decorator'

@Controller('patients')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  // Static routes before :id
  @Get('search')
  search(@CurrentClinic() clinicId: string, @Query('q') q: string) {
    return this.patientsService.search(clinicId, q ?? '')
  }

  @Get()
  findAll(@CurrentClinic() clinicId: string, @Query('q') q?: string) {
    return this.patientsService.findAll(clinicId, q)
  }

  @Get(':id')
  findOne(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.patientsService.findOne(clinicId, id)
  }

  @Post()
  create(@CurrentClinic() clinicId: string, @Body() dto: CreatePatientDto) {
    return this.patientsService.create(clinicId, dto)
  }

  @Patch(':id')
  update(
    @CurrentClinic() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patientsService.update(clinicId, id, dto)
  }
}
