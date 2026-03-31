import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { FinancialService } from './financial.service'
import { CreateEntryDto } from './dto/create-entry.dto'
import { UpdateEntryDto } from './dto/update-entry.dto'
import { QueryEntriesDto } from './dto/query-entries.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../auth/guards/tenant.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentClinic } from '../auth/decorators/current-clinic.decorator'
import { PaymentMethod, PaymentStatus } from '@prisma/client'

@Controller('financial')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles('FINANCEIRO', 'ADMIN')
export class FinancialController {
  constructor(private service: FinancialService) {}

  @Get()
  findAll(@CurrentClinic() clinicId: string, @Query() query: QueryEntriesDto) {
    return this.service.findAll(clinicId, query)
  }

  @Get('summary')
  getSummary(
    @CurrentClinic() clinicId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const now = new Date()
    return this.service.getSummary(
      clinicId,
      month ? parseInt(month, 10) : now.getMonth() + 1,
      year ? parseInt(year, 10) : now.getFullYear(),
    )
  }

  @Get('overdue')
  getOverdue(@CurrentClinic() clinicId: string) {
    return this.service.getOverdue(clinicId)
  }

  @Post()
  create(@CurrentClinic() clinicId: string, @Body() dto: CreateEntryDto) {
    return this.service.create(clinicId, dto)
  }

  @Patch('bulk-status')
  bulkUpdateStatus(
    @CurrentClinic() clinicId: string,
    @Body() body: { ids: string[]; status: PaymentStatus },
  ) {
    return this.service.bulkUpdateStatus(body.ids, clinicId, body.status)
  }

  @Patch(':id')
  update(
    @CurrentClinic() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEntryDto,
  ) {
    return this.service.update(id, clinicId, dto)
  }

  @Patch(':id/pay')
  markAsPaid(
    @CurrentClinic() clinicId: string,
    @Param('id') id: string,
    @Body() body: { paymentMethod?: PaymentMethod },
  ) {
    return this.service.markAsPaid(id, clinicId, body.paymentMethod)
  }

  @Delete(':id')
  remove(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.service.remove(id, clinicId)
  }
}
