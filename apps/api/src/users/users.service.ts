import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { randomBytes } from 'crypto'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
} as const

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll(clinicId: string) {
    return this.prisma.user.findMany({
      where: { clinicId },
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    })
  }

  async invite(clinicId: string, dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('E-mail já cadastrado')

    const tempPassword = randomBytes(8).toString('hex')
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    const user = await this.prisma.user.create({
      data: {
        clinicId,
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      },
      select: USER_SELECT,
    })

    // In production, send tempPassword via email
    return { ...user, temporaryPassword: tempPassword }
  }

  async update(clinicId: string, id: string, dto: UpdateUserDto) {
    await this.findOneInClinic(clinicId, id)

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: USER_SELECT,
    })
  }

  async deactivate(clinicId: string, id: string) {
    await this.findOneInClinic(clinicId, id)

    return this.prisma.user.update({
      where: { id },
      data: { active: false },
      select: USER_SELECT,
    })
  }

  private async findOneInClinic(clinicId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, clinicId } })
    if (!user) throw new NotFoundException('Usuário não encontrado nesta clínica')
    return user
  }
}
