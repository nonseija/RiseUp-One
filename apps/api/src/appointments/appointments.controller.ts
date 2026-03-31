import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { AppointmentsService } from './appointments.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { QueryAppointmentsDto } from './dto/query-appointments.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../auth/guards/tenant.guard'
import { CurrentClinic } from '../auth/decorators/current-clinic.decorator'

@Controller('appointments')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  // ── Static routes FIRST (before :id) ──────────────────────────────────────

  @Get('today')
  findToday(@CurrentClinic() clinicId: string) {
    return this.appointmentsService.findToday(clinicId)
  }

  @Get('slots')
  findSlots(
    @CurrentClinic() clinicId: string,
    @Query('dentistId') dentistId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.findSlots(clinicId, dentistId, date)
  }

  @Get('dentists')
  findDentists(@CurrentClinic() clinicId: string) {
    return this.appointmentsService.findDentists(clinicId)
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  @Get()
  findAll(@CurrentClinic() clinicId: string, @Query() query: QueryAppointmentsDto) {
    return this.appointmentsService.findAll(clinicId, query)
  }

  @Get(':id')
  findOne(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.appointmentsService.findOne(clinicId, id)
  }

  @Post()
  create(@CurrentClinic() clinicId: string, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(clinicId, dto)
  }

  @Patch(':id')
  update(
    @CurrentClinic() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(clinicId, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  cancel(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.appointmentsService.cancel(clinicId, id)
  }
}
