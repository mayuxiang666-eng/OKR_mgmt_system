import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateObjectiveDto {
  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsString()
  cycleId?: string;

  @IsString()
  title!: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsIn(['critical', 'high', 'medium', 'low'])
  priority?: 'critical' | 'high' | 'medium' | 'low';

  @IsOptional()
  @IsIn(['not_started', 'in_progress', 'completed', 'blocked', 'behind'])
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'behind';

  @IsOptional()
  @IsString()
  ownerUserId?: string;

  @IsOptional()
  @IsString()
  ownerTeamId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  lastReviewDate?: string;

  @IsOptional()
  @IsDateString()
  plannedNextReviewDate?: string;
}
