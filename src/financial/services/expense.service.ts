import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from '../entities/expense';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from '../dtos/expense';
import { UserService } from 'src/user/services/user.service';
import { ManagementGroupService } from './management.group.service';
import { parse } from 'csv-parse';
import { NotificationService } from './notification.service';
import { ExpenseSplit } from '../entities/expense.split';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly managementGroupService: ManagementGroupService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  async search(): Promise<Expense[]> {
    return await this.expenseRepository.find();
  }

  async get(id: number): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: {
        group: true,
        payer: true,
      },
    });

    if (!expense)
      throw new HttpException('Expense not found!', HttpStatus.BAD_REQUEST);

    return expense;
  }

  async create(dto: CreateExpenseDto): Promise<Expense> {
    const expense = new Expense();
    Object.assign(expense, dto);

    expense.group = await this.managementGroupService.getSimple(dto.groupId);
    expense.payer = await this.userService.getSimple(dto.payerId);

    await this.split(expense, dto.splitMemberIdsToExclude || []);

    await this.expenseRepository.save(expense);

    await this.notificationService.notifyNewExpense(expense);

    return expense;
  }

  async createBatch(buffer: Buffer): Promise<boolean> {
    const dtos = await this.parseCsv(buffer);
    for (const dto of dtos) {
      await this.create(dto);
    }
    return true;
  }

  private async split(
    expense: Expense,
    splitMemberIdsToExclude: number[],
  ): Promise<void> {
    const groupMembers = await this.managementGroupService.getMembers(
      expense.group.id,
    );

    const selectedMembers =
      splitMemberIdsToExclude.length === 0
        ? groupMembers
        : groupMembers.filter(
            (member) => !splitMemberIdsToExclude.includes(member.id),
          );

    const percentage = Math.floor(100 / selectedMembers.length);
    const percentageExtra = 100 - selectedMembers.length * percentage;

    expense.splits = [];
    for (const member of selectedMembers) {
      const split = new ExpenseSplit();
      split.payer = member;

      split.percentage = percentage;
      if (expense.splits.length === 0 && percentageExtra > 0) {
        split.percentage = percentage + percentageExtra;
      }

      split.amount = expense.amount * (split.percentage / 100);

      expense.splits.push(split);
    }
  }

  private async parseCsv(buffer: Buffer): Promise<CreateExpenseDto[]> {
    const csvPromise = new Promise<CreateExpenseDto[]>((resolve, reject) => {
      parse(
        buffer,
        { delimiter: ',', columns: true },
        function (
          err,
          rows: {
            groupId: string;
            name: string;
            amount: string;
            payerId: string;
          }[],
        ) {
          if (err) reject(err);

          const data: CreateExpenseDto[] = [];
          rows.map((row) => {
            data.push({
              groupId: parseInt(row.groupId),
              name: row.name,
              amount: parseFloat(row.amount),
              payerId: parseInt(row.payerId),
            });
          });

          resolve(data);
        },
      );
    });

    return csvPromise;
  }
}
