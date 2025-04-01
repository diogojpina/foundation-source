import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty } from 'class-validator';

export class AddMembersDto {
  @ApiProperty()
  @IsArray()
  @Type(() => Number)
  @IsNotEmpty()
  memberIds: number[];
}
