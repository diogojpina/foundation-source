import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from '../entities/expense';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from '../dtos/expense';
import { UserService } from 'src/user/services/user.service';
import { ManagementGroupService } from './management.group.service';
import { parse } from 'csv-parse';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly managementGroupService: ManagementGroupService,
    private readonly userService: UserService,
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

    expense.group = await this.managementGroupService.get(dto.groupId);
    expense.payer = await this.userService.get(dto.payerId);

    return await this.expenseRepository.save(expense);
  }

  async createBatch(buffer: Buffer): Promise<boolean> {
    const dtos = await this.parseCsv(buffer);
    for (const dto of dtos) {
      await this.create(dto);
    }
    return true;
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
