import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { MedicalRecordsService } from './medical-records.service'

interface AnamnesisBody {
  allergies?: string
  medications?: string
  illnesses?: string
  surgeries?: string
  pregnant?: boolean
  smoker?: boolean
  notes?: string
}

@Controller('anamnesis')
export class AnamnesisController {
  constructor(private service: MedicalRecordsService) {}

  @Get(':token')
  getByToken(@Param('token') token: string) {
    return this.service.getAnamnesisByToken(token)
  }

  @Post(':token')
  complete(@Param('token') token: string, @Body() body: AnamnesisBody) {
    return this.service.completeAnamnesis(token, body)
  }
}
