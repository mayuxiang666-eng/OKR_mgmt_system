import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateKeyResultDto {
  @IsString()
  objectiveId!: string;

  @IsString()
  title!: string;

  @IsString()
  metricType!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  baseline?: number;

  @Type(() => Number)
  @IsNumber()
  target!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  current?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  forecast?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  confidence?: number;

  @IsOptional()
  @IsIn(['on_track', 'at_risk', 'off_track'])
  status?: 'on_track' | 'at_risk' | 'off_track';

  @IsOptional()
  @IsIn(['manual', 'semi', 'auto'])
  calculationMode?: 'manual' | 'semi' | 'auto';
}
