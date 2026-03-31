import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { TenantGuard } from '../auth/guards/tenant.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentClinic } from '../auth/decorators/current-clinic.decorator'

@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@CurrentClinic() clinicId: string) {
    return this.usersService.findAll(clinicId)
  }

  @Post('invite')
  invite(@CurrentClinic() clinicId: string, @Body() dto: CreateUserDto) {
    return this.usersService.invite(clinicId, dto)
  }

  @Patch(':id')
  update(
    @CurrentClinic() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(clinicId, id, dto)
  }

  @Delete(':id')
  deactivate(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.usersService.deactivate(clinicId, id)
  }
}
