import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';

@Controller('checkins')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  create(@Body() body: CreateCheckinDto) {
    return this.checkinService.create(body);
  }

  @Get()
  list(@Query('krId') krId?: string, @Query('kr_id') krIdLegacy?: string) {
    return this.checkinService.list(krId ?? krIdLegacy);
  }
}
