import { IsNotEmpty, IsString } from 'class-validator';
import { UserDto } from './user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto extends UserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
