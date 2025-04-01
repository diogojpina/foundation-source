import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ManagementGroup } from '../entities/management.group';
import { Repository } from 'typeorm';
import { AddMembersDto, CreateManagementGroupDto } from '../dtos';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ManagementGroupService {
  constructor(
    @InjectRepository(ManagementGroup)
    private readonly managementGroupRepository: Repository<ManagementGroup>,
  ) {}

  async search(): Promise<ManagementGroup[]> {
    return await this.managementGroupRepository.find();
  }

  async get(id: number): Promise<ManagementGroup> {
    const group = await this.managementGroupRepository.findOne({
      where: { id },
      relations: {
        members: true,
        expenses: true,
      },
    });

    if (!group)
      throw new HttpException(
        'Management group not found!',
        HttpStatus.BAD_REQUEST,
      );

    return group;
  }

  async create(dto: CreateManagementGroupDto): Promise<ManagementGroup> {
    return await this.managementGroupRepository.save(dto);
  }

  async addMembers(id: number, dto: AddMembersDto): Promise<boolean> {
    const group = await this.get(id);

    for (const memberId of dto.memberIds) {
      const member = new User();
      member.id = memberId;
      group.members.push(member);
    }

    await this.managementGroupRepository.save(group);

    return true;
  }
}
