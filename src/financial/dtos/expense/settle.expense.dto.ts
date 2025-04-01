import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';

export class SettleExpenseDto {
  @ApiProperty()
  @IsArray()
  @Type(() => Number)
  memberIds: number[];
}
