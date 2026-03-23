import { Body, Controller, Get, Post, Query } from '@nestjs/common';

@Controller('integrations')
export class IntegrationController {
  @Post()
  create(@Body() body: any) {
    return { id: 'int_1', status: 'active', ...body };
  }

  @Get()
  list(@Query('org_id') orgId?: string) {
    return [
      { id: 'int_1', org_id: orgId || 'org_1', type: 'sharepoint', status: 'active', last_synced_at: null },
    ];
  }
}
