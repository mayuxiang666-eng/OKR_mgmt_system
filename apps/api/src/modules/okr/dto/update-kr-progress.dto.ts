import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateKrProgressDto {
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
}
