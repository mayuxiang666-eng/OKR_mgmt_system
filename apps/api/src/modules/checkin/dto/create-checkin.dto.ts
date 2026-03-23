import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCheckinDto {
  @IsString()
  krId!: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsDateString()
  weekStartDate?: string;

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
  confidence?: number;

  @IsOptional()
  @IsIn(['on_track', 'at_risk', 'off_track'])
  risk?: 'on_track' | 'at_risk' | 'off_track';

  @IsOptional()
  @IsString()
  blocker?: string;

  @IsOptional()
  @IsString()
  comment?: string;
}
