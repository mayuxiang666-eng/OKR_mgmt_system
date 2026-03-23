import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAlignmentDto {
  @IsString()
  parentObjectiveId!: string;

  @IsString()
  childObjectiveId!: string;

  @IsOptional()
  @IsIn(['parent_child', 'contributes_to', 'supports'])
  relation?: 'parent_child' | 'contributes_to' | 'supports';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  weight?: number;
}
