import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async findAll(@Query('userId') userId: string) {
    if (!userId) return [];
    return this.notificationService.findAllForUser(userId);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Patch('read-all')
  async markAllRead(@Query('userId') userId: string) {
    if (!userId) return { count: 0 };
    return this.notificationService.markAllAsRead(userId);
  }
}
