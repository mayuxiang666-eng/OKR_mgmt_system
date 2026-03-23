import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateCycleDto {
  @IsOptional()
  @IsString()
  orgId?: string;

  @IsString()
  name!: string;

  @IsIn(['quarterly', 'annual'])
  type!: 'quarterly' | 'annual';

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'closed', 'archived'])
  status?: 'draft' | 'active' | 'closed' | 'archived';
}
