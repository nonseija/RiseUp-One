import { Module } from '@nestjs/common'
import { ClinicsService } from './clinics.service'
import { ClinicsController, PublicClinicsController } from './clinics.controller'
import { StorageModule } from '../storage/storage.module'

@Module({
  imports: [StorageModule],
  controllers: [PublicClinicsController, ClinicsController],
  providers: [ClinicsService],
})
export class ClinicsModule {}
