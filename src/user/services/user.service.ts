import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/user';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existingUsers = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUsers)
      throw new HttpException('Email already exists.', HttpStatus.NOT_FOUND);

    return await this.userRepository.save(dto);
  }
}
