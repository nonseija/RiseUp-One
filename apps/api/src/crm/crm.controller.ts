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
import { CrmService } from './crm.service'
import { CreateLeadDto } from './dto/create-lead.dto'
import { UpdateLeadDto } from './dto/update-lead.dto'
import { MoveLeadDto } from './dto/move-lead.dto'
import { QueryLeadsDto } from './dto/query-leads.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../auth/guards/tenant.guard'
import { CurrentClinic } from '../auth/decorators/current-clinic.decorator'
import { IsString } from 'class-validator'

class AddNoteDto {
  @IsString()
  content: string
}

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('crm/leads')
export class CrmController {
  constructor(private crm: CrmService) {}

  @Get('funnel')
  getFunnel(@CurrentClinic() clinicId: string) {
    return this.crm.getFunnel(clinicId)
  }

  @Get()
  findAll(@CurrentClinic() clinicId: string, @Query() query: QueryLeadsDto) {
    return this.crm.findAll(clinicId, query)
  }

  @Post()
  create(@CurrentClinic() clinicId: string, @Body() dto: CreateLeadDto) {
    return this.crm.create(clinicId, dto)
  }

  @Get(':id')
  findOne(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.crm.findOne(clinicId, id)
  }

  @Patch(':id')
  update(
    @CurrentClinic() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.crm.update(clinicId, id, dto)
  }

  @Patch(':id/stage')
  moveStage(
    @CurrentClinic() clinicId: string,
    @Param('id') id: string,
    @Body() dto: MoveLeadDto,
  ) {
    return this.crm.moveStage(clinicId, id, dto)
  }

  @Post(':id/note')
  addNote(
    @CurrentClinic() clinicId: string,
    @Param('id') id: string,
    @Body() dto: AddNoteDto,
  ) {
    return this.crm.addNote(clinicId, id, dto.content)
  }

  @Post(':id/convert')
  convertToPatient(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.crm.convertToPatient(clinicId, id)
  }

  @Delete(':id')
  remove(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.crm.remove(clinicId, id)
  }
}
