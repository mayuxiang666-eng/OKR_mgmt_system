import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { OkrService } from './okr.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { CreateObjectiveDto } from './dto/create-objective.dto';
import { CreateKeyResultDto } from './dto/create-key-result.dto';
import { UpdateKrProgressDto } from './dto/update-kr-progress.dto';
import { CreateAlignmentDto } from './dto/create-alignment.dto';

@Controller()
export class OkrController {
  constructor(private readonly okrService: OkrService) {}

  @Post('okr/cycles')
  createCycle(@Body() body: CreateCycleDto) {
    return this.okrService.createCycle(body);
  }

  @Get('okr/cycles')
  listCycles(@Query('status') status?: string) {
    return this.okrService.listCycles(status);
  }

  @Get('okr/cycles/:id')
  getCycle(@Param('id') id: string) {
    return this.okrService.listCycles().then((cycles) => cycles.find((cycle: { id: string }) => cycle.id === id));
  }

  @Post('objectives')
  createObjective(@Body() body: CreateObjectiveDto) {
    return this.okrService.createObjective(body);
  }

  @Get('objectives')
  listObjectives(@Query('cycleId') cycleId?: string, @Query('cycle_id') cycleIdLegacy?: string) {
    return this.okrService.listObjectives(cycleId ?? cycleIdLegacy);
  }

  @Get('objectives/:id')
  getObjective(@Param('id') id: string) {
    return this.okrService.getObjective(id);
  }

  @Post('key-results')
  createKeyResult(@Body() body: CreateKeyResultDto) {
    return this.okrService.createKeyResult(body);
  }

  @Patch('key-results/:id/progress')
  updateKrProgress(@Param('id') id: string, @Body() body: UpdateKrProgressDto) {
    return this.okrService.updateKrProgress(id, body);
  }

  @Get('key-results')
  listKeyResults(@Query('objectiveId') objectiveId?: string, @Query('objective_id') objectiveIdLegacy?: string) {
    return this.okrService.listKeyResults(objectiveId ?? objectiveIdLegacy);
  }

  @Get('key-results/:id')
  getKeyResult(@Param('id') id: string) {
    return this.okrService.getKeyResult(id);
  }

  @Post('alignments')
  createAlignment(@Body() body: CreateAlignmentDto) {
    return this.okrService.createAlignment(body);
  }

  @Get('alignments')
  listAlignments(
    @Query('parentObjectiveId') parentObjectiveId?: string,
    @Query('parent_objective_id') parentObjectiveIdLegacy?: string,
  ) {
    return this.okrService.listAlignments(parentObjectiveId ?? parentObjectiveIdLegacy);
  }
}


