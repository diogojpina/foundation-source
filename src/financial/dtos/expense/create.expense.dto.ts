import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  groupId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  payerId: number;

  @ApiProperty()
  @IsArray()
  @Type(() => Number)
  @IsOptional()
  splitMemberIdsToExclude?: number[];
}
