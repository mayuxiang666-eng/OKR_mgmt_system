import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { OkrModule } from './modules/okr/okr.module';
import { ProjectModule } from './modules/project/project.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { ReviewModule } from './modules/review/review.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OkrModule,
    ProjectModule,
    CheckinModule,
    ReviewModule,
    DashboardModule,
    IntegrationModule,
    NotificationModule,
  ],
})
export class AppModule {}
