import { Controller, Get, Query } from '@nestjs/common';

@Controller('dashboards')
export class DashboardController {
  @Get('executive')
  exec(@Query('cycle_id') cycleId?: string) {
    return {
      cycle_id: cycleId || 'cycle_1',
      top_risks: ['Oven drift', 'Supplier lot hold'],
      okr_burndown: [],
      at_risk_objectives: [{ id: 'obj_1', title: 'Reduce scrap', status: 'at_risk' }],
    };
  }

  @Get('team')
  team(@Query('team_id') teamId?: string) {
    return { team_id: teamId || 'team_1', okr_progress: 0.42, initiatives: [], risks: [] };
  }

  @Get('personal')
  personal() {
    return { my_objectives: [], my_tasks: [], checkin_reminders: [] };
  }
}
