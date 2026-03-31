import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { PrismaModule } from './prisma/prisma.module'
import { QueuesModule } from './queues/queues.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { PatientsModule } from './patients/patients.module'
import { AppointmentsModule } from './appointments/appointments.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { CrmModule } from './crm/crm.module'
import { ChatModule } from './chat/chat.module'
import { WhatsappModule } from './whatsapp/whatsapp.module'
import { InstagramModule } from './instagram/instagram.module'
import { MedicalRecordsModule } from './medical-records/medical-records.module'
import { FinancialModule } from './financial/financial.module'
import { ReportsModule } from './reports/reports.module'
import { ClinicsModule } from './clinics/clinics.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
    PrismaModule,
    QueuesModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    AppointmentsModule,
    DashboardModule,
    CrmModule,
    ChatModule,
    WhatsappModule,
    InstagramModule,
    MedicalRecordsModule,
    FinancialModule,
    ReportsModule,
    ClinicsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
