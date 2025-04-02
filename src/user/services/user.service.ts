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

  async get(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        expensesPaid: true,
        expensesSplited: true,
      },
    });

    if (!user)
      throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);

    return user;
  }

  async getSimple(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user)
      throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);

    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existingUsers = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    console.log('existingUsers', existingUsers);

    if (existingUsers)
      throw new HttpException('Email already exists.', HttpStatus.NOT_FOUND);

    return await this.userRepository.save(dto);
  }
}
