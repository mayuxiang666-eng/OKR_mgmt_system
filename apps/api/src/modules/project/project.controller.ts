import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

@Controller()
export class ProjectController {
  @Post('initiatives')
  createInitiative(@Body() body: any) {
    return { id: 'init_1', progress: 0.1, health: 'on_track', ...body };
  }

  @Get('initiatives')
  listInitiatives(@Query('kr_id') krId?: string) {
    return [
      { id: 'init_1', name: 'Reflow oven closed-loop', kr_id: krId || 'kr_1', progress: 0.3, contribution_weight: 0.7 },
    ];
  }

  @Post('projects')
  createProject(@Body() body: any) {
    return { id: 'proj_1', progress: 0.2, ...body };
  }

  @Get('projects/:id')
  getProject(@Param('id') id: string) {
    return {
      id,
      name: 'Line 1 SPC rollout',
      progress: 0.25,
      kr_links: [{ kr_id: 'kr_1', weight: 0.5 }],
      tasks: [{ id: 'task_1', title: 'Sensor calibration', status: 'in_progress', progress: 0.4 }],
    };
  }

  @Post('tasks')
  createTask(@Body() body: any) {
    return { id: 'task_1', status: 'not_started', progress: 0, ...body };
  }

  @Get('tasks')
  listTasks(@Query('initiative_id') initiativeId?: string) {
    return [
      { id: 'task_1', initiative_id: initiativeId || 'init_1', title: 'SOP update', status: 'in_progress', progress: 0.5 },
    ];
  }
}
