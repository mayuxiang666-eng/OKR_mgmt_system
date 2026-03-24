import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateObjectiveDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['critical', 'high', 'medium', 'low'])
  priority?: 'critical' | 'high' | 'medium' | 'low';

  @IsOptional()
  @IsIn(['not_started', 'in_progress', 'completed', 'blocked', 'behind'])
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'behind';

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
  @IsDateString()
  lastReviewDate?: string;

  @IsOptional()
  @IsDateString()
  plannedNextReviewDate?: string;
}
