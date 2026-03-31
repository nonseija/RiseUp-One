import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { RegisterClinicDto } from './dto/register-clinic.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterClinicDto) {
    console.log('REGISTER PAYLOAD:', JSON.stringify(dto))
    try {
      const slug = dto.clinicName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')

      console.log('SLUG GERADO:', slug)

      const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } })
      if (existingUser) throw new ConflictException('Email já cadastrado')

      const hashedPassword = await bcrypt.hash(dto.password, 10)

      const clinic = await this.prisma.clinic.create({
        data: {
          name: dto.clinicName,
          slug,
          users: {
            create: {
              name: dto.adminName,
              email: dto.email,
              password: hashedPassword,
              role: 'ADMIN',
            },
          },
        },
        include: { users: true },
      })

      console.log('CLINIC CRIADA:', clinic.id)

      const user = clinic.users[0]
      const accessToken = this.jwtService.sign(
        { sub: user.id, clinicId: clinic.id, role: user.role, email: user.email },
        { expiresIn: '15m', secret: this.config.get<string>('JWT_SECRET') ?? 'supersecret' },
      )
      const refreshToken = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '7d', secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'refreshsecret' },
      )

      const refreshTokenHash = await bcrypt.hash(refreshToken, 10)
      await this.prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash } })

      return {
        accessToken,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        clinic: { id: clinic.id, name: clinic.name, slug: clinic.slug },
      }
    } catch (error) {
      console.error('REGISTER ERROR:', (error as Error).message)
      console.error('ERROR CODE:', (error as { code?: string }).code)
      console.error('ERROR DETAIL:', (error as { meta?: unknown }).meta)
      throw error
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { clinic: true },
    })

    if (!user || !user.active) throw new UnauthorizedException('Credenciais inválidas')

    const passwordMatch = await bcrypt.compare(dto.password, user.password)
    if (!passwordMatch) throw new UnauthorizedException('Credenciais inválidas')

    const tokens = await this.generateTokens(user.id, user.clinicId, user.role, user.email)
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken)

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
        clinic: { name: user.clinic.name, slug: user.clinic.slug },
      },
    }
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })

    if (!user || !user.refreshTokenHash) throw new UnauthorizedException('Acesso negado')

    const tokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash)
    if (!tokenMatches) throw new UnauthorizedException('Token de atualização inválido')

    const tokens = await this.generateTokens(user.id, user.clinicId, user.role, user.email)
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken)

    return tokens
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    })
    return { message: 'Logout realizado com sucesso' }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            email: true,
            logoUrl: true,
          },
        },
      },
    })

    if (!user) throw new NotFoundException('Usuário não encontrado')
    return user
  }

  private async generateTokens(userId: string, clinicId: string, role: string, email: string) {
    const payload = { sub: userId, clinicId, role, email }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET') ?? 'supersecret',
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '15m',
      }),
      this.jwtService.signAsync(
        { sub: userId },
        {
          secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'refreshsecret',
          expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
        },
      ),
    ])

    return { accessToken, refreshToken }
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10)
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    })
  }
}
