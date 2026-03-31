import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { MedicalRecordsService } from './medical-records.service'
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto'
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../auth/guards/tenant.guard'
import { CurrentClinic } from '../auth/decorators/current-clinic.decorator'

const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]

@Controller('medical-records')
@UseGuards(JwtAuthGuard, TenantGuard)
export class MedicalRecordsController {
  constructor(private service: MedicalRecordsService) {}

  @Get('patient/:patientId')
  findByPatient(
    @CurrentClinic() clinicId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.service.findByPatient(patientId, clinicId)
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(new Error('Tipo de arquivo não permitido'), false)
        }
      },
    }),
  )
  create(
    @CurrentClinic() clinicId: string,
    @Body() dto: CreateMedicalRecordDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.service.create(clinicId, dto, files ?? [])
  }

  @Patch(':id')
  update(
    @CurrentClinic() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMedicalRecordDto,
  ) {
    return this.service.update(id, clinicId, dto)
  }

  @Delete(':id')
  delete(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.service.delete(id, clinicId)
  }

  @Post('anamnesis/:patientId')
  sendAnamnesisLink(
    @CurrentClinic() clinicId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.service.sendAnamnesisLink(patientId, clinicId)
  }
}
