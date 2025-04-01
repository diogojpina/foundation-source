import { Body, Controller, Post } from '@nestjs/common';
import { ExpenseService } from '../services/expense.service';
import { CreateExpenseDto } from '../dtos/expense';
import { Expense } from '../entities/expense';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async create(@Body() dto: CreateExpenseDto): Promise<Expense> {
    return await this.expenseService.create(dto);
  }
}
