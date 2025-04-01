import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from '../entities/expense';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from '../dtos/expense';
import { UserService } from 'src/user/services/user.service';
import { ManagementGroupService } from './management.group.service';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly managementGroupService: ManagementGroupService,
    private readonly userService: UserService,
  ) {}

  async create(dto: CreateExpenseDto): Promise<Expense> {
    const expense = new Expense();
    Object.assign(expense, dto);

    expense.group = await this.managementGroupService.get(dto.groupId);
    expense.payer = await this.userService.get(dto.payerId);

    return await this.expenseRepository.save(expense);
  }
}
