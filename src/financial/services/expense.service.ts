import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from '../entities/expense';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from '../dtos/expense';
import { UserService } from '../../user/services/user.service';
import { ManagementGroupService } from './management.group.service';
import { parse } from 'csv-parse';
import { NotificationService } from './notification.service';
import { ExpenseSplit } from '../entities/expense.split';
import { SettleExpenseDto } from '../dtos/expense/settle.expense.dto';
import { ExpenseSplitStatus } from '../enums/expanse.split.status.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUE_ENUM } from '../../common/enum/queue.enum';
import { Queue } from 'bullmq';
import { JOB_ENUM } from '../../common/enum/job.enum';
import { MinioService } from '@app/minio';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly managementGroupService: ManagementGroupService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    @InjectQueue(QUEUE_ENUM.EXPENSE)
    private readonly queue: Queue,
    private readonly minioService: MinioService,
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
        splits: {
          payer: true,
        },
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

  async createBatch(file: Express.Multer.File): Promise<boolean> {
    this.minioService.uploadFile(file, Date.now() + '.csv');
    const buffer = file.buffer;
    const dtos = await this.parseCsv(buffer);
    for (const dto of dtos) {
      await this.queue.add(JOB_ENUM.EXPENSE.CREATE, dto, {
        removeOnComplete: true,
      });
    }
    return true;
  }

  async settle(id: number, dto: SettleExpenseDto): Promise<Expense> {
    const expense = await this.get(id);

    const selectedSplits = expense.splits.filter((split) =>
      dto.memberIds.includes(split.payer.id),
    );

    for (const split of selectedSplits) {
      if (split.status === ExpenseSplitStatus.SETTLED) continue;
      split.status = ExpenseSplitStatus.SETTLED;
      split.settledAt = new Date();

      await this.notificationService.notifyExpenseSplitSettled(expense, split);
    }

    await this.expenseRepository.save(expense);

    return expense;
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
        { delimiter: ';', columns: true },
        function (
          err,
          rows: {
            groupId: string;
            name: string;
            amount: string;
            payerId: string;
            splitMemberIdsToExclude: string;
          }[],
        ) {
          if (err) reject(err);

          const data: CreateExpenseDto[] = [];
          rows.map((row) => {
            const splitMemberIdsToExclude =
              row.splitMemberIdsToExclude === ''
                ? []
                : row.splitMemberIdsToExclude
                    .split(',')
                    .map((id) => parseInt(id));

            data.push({
              groupId: parseInt(row.groupId),
              name: row.name,
              amount: parseFloat(row.amount),
              payerId: parseInt(row.payerId),
              splitMemberIdsToExclude,
            });
          });

          resolve(data);
        },
      );
    });

    return csvPromise;
  }
}
