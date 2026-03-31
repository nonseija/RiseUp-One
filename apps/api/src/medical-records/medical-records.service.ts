import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { StorageService } from '../storage/storage.service'
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto'
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto'

interface AnamnesisData {
  allergies?: string
  medications?: string
  illnesses?: string
  surgeries?: string
  pregnant?: boolean
  smoker?: boolean
  notes?: string
}

@Injectable()
export class MedicalRecordsService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private config: ConfigService,
  ) {}

  findByPatient(patientId: string, clinicId: string) {
    return this.prisma.medicalRecord.findMany({
      where: { patientId, clinicId },
      include: {
        files: { orderBy: { createdAt: 'asc' } },
        anamnesis: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(
    clinicId: string,
    dto: CreateMedicalRecordDto,
    files: Express.Multer.File[],
  ) {
    const uploadedFiles = await Promise.all(
      files.map((f) => this.storage.uploadFile(f, 'records')),
    )

    return this.prisma.medicalRecord.create({
      data: {
        clinicId,
        patientId: dto.patientId,
        dentistId: dto.dentistId,
        appointmentId: dto.appointmentId,
        type: dto.type ?? 'CONSULTA',
        title: dto.title,
        notes: dto.notes,
        teeth: dto.teeth ?? [],
        procedures: dto.procedures ?? [],
        files: {
          create: uploadedFiles.map((u, i) => ({
            name: files[i].originalname,
            url: u.url,
            key: u.key,
            type: files[i].mimetype,
            size: files[i].size,
          })),
        },
      },
      include: { files: true },
    })
  }

  async update(id: string, clinicId: string, dto: UpdateMedicalRecordDto) {
    const record = await this.prisma.medicalRecord.findFirst({
      where: { id, clinicId },
    })
    if (!record) throw new NotFoundException('Prontuário não encontrado')

    return this.prisma.medicalRecord.update({
      where: { id },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.title && { title: dto.title }),
        ...(dto.notes && { notes: dto.notes }),
        ...(dto.teeth && { teeth: dto.teeth }),
        ...(dto.procedures && { procedures: dto.procedures }),
      },
      include: { files: true },
    })
  }

  async delete(id: string, clinicId: string) {
    const record = await this.prisma.medicalRecord.findFirst({
      where: { id, clinicId },
      include: { files: true },
    })
    if (!record) throw new NotFoundException('Prontuário não encontrado')

    await Promise.all(record.files.map((f) => this.storage.deleteFile(f.key)))

    await this.prisma.recordFile.deleteMany({ where: { medicalRecordId: id } })
    await this.prisma.medicalRecord.delete({ where: { id } })

    return { deleted: true }
  }

  async sendAnamnesisLink(patientId: string, clinicId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, clinicId },
    })
    if (!patient) throw new NotFoundException('Paciente não encontrado')

    let anamnesis = await this.prisma.anamnesis.findUnique({
      where: { patientId },
    })
    if (!anamnesis) {
      anamnesis = await this.prisma.anamnesis.create({
        data: { patientId },
      })
    }

    const baseUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'
    const link = `${baseUrl}/anamnese/${anamnesis.token}`

    return { token: anamnesis.token, link }
  }

  async getAnamnesisByToken(token: string) {
    const anamnesis = await this.prisma.anamnesis.findUnique({
      where: { token },
      include: { patient: { select: { name: true } } },
    })
    if (!anamnesis) throw new NotFoundException('Ficha não encontrada')
    return anamnesis
  }

  async completeAnamnesis(token: string, data: AnamnesisData) {
    const anamnesis = await this.prisma.anamnesis.findUnique({
      where: { token },
    })
    if (!anamnesis) throw new NotFoundException('Ficha não encontrada')
    if (anamnesis.completedAt) {
      throw new BadRequestException('Ficha já preenchida')
    }

    return this.prisma.anamnesis.update({
      where: { token },
      data: {
        ...data,
        completedAt: new Date(),
      },
    })
  }
}
