import { UserDto } from './user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto extends UserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
