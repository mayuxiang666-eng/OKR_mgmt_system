import { Body, Controller, Get, Post, Query } from '@nestjs/common';

@Controller('reviews')
export class ReviewController {
  @Post()
  create(@Body() body: any) {
    return { id: 'rev_1', reviewed_at: new Date().toISOString(), ...body };
  }

  @Get()
  list(@Query('cycle_id') cycleId?: string) {
    return [
      { id: 'rev_1', cycle_id: cycleId || 'cycle_1', objective_id: 'obj_1', score: 0.8, comment: 'Good trend' },
    ];
  }
}
