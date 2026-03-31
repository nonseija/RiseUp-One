import { Module } from '@nestjs/common'
import { MedicalRecordsService } from './medical-records.service'
import { MedicalRecordsController } from './medical-records.controller'
import { AnamnesisController } from './anamnesis.controller'
import { StorageModule } from '../storage/storage.module'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [MedicalRecordsController, AnamnesisController],
  providers: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
