import { Module } from '@nestjs/common';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { OkrModule } from '../okr/okr.module';

@Module({
  imports: [OkrModule],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}
