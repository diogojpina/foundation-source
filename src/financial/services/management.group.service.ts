import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ManagementGroup } from '../entities/management.group';
import { Repository } from 'typeorm';
import { AddMembersDto, CreateManagementGroupDto } from '../dtos';
import { User } from '../../user/entities/user.entity';
import { ExpenseSplitStatus } from '../enums/expanse.split.status.enum';

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

  async getSimple(id: number): Promise<ManagementGroup> {
    const group = await this.managementGroupRepository.findOne({
      where: { id },
    });

    if (!group)
      throw new HttpException(
        'Management group not found!',
        HttpStatus.BAD_REQUEST,
      );

    return group;
  }

  async getMembers(id: number): Promise<User[]> {
    const group = await this.managementGroupRepository.findOne({
      where: { id },
      relations: {
        members: true,
      },
      order: { id: 'ASC' },
    });

    if (!group) return [];

    const members: User[] = [];
    for (const member of group.members) {
      members.push(member);
    }
    return members;
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

  async calcBalance(id: number): Promise<Map<number, number>> {
    const group = await this.managementGroupRepository.findOne({
      where: { id },
      relations: {
        members: true,
        expenses: {
          payer: true,
          splits: {
            payer: true,
          },
        },
      },
    });

    if (!group)
      throw new HttpException(
        'Management group not found!',
        HttpStatus.BAD_REQUEST,
      );

    const membersMap = new Map<number, number>();
    group.members.map((member) => membersMap.set(member.id, 0));

    for (const expense of group.expenses) {
      const expensePayerAmount = membersMap.get(expense.payer.id);
      if (expensePayerAmount !== undefined)
        membersMap.set(expense.payer.id, expensePayerAmount + expense.amount);

      for (const split of expense.splits) {
        const splitPayerAmount = membersMap.get(split.payer.id);
        if (splitPayerAmount === undefined) continue;

        let newAmount = 0;
        if (split.status === ExpenseSplitStatus.SETTLED) {
          if (split.payer.id === expense.payer.id) {
            newAmount = splitPayerAmount - split.amount;
          } else {
            newAmount = splitPayerAmount + split.amount;
          }
        } else {
          newAmount = splitPayerAmount - split.amount;
        }
        membersMap.set(split.payer.id, newAmount);
      }
    }

    return membersMap;
  }
}
