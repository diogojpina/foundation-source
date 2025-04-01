import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ExpenseService } from '../services/expense.service';
import { CreateExpenseDto } from '../dtos/expense';
import { Expense } from '../entities/expense';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  async search(): Promise<Expense[]> {
    return await this.expenseService.search();
  }

  @Get('/:id')
  async get(@Param('id') id: number): Promise<Expense> {
    return await this.expenseService.get(id);
  }

  @Post()
  async create(@Body() dto: CreateExpenseDto): Promise<Expense> {
    return await this.expenseService.create(dto);
  }

  @Post('/batch')
  @UseInterceptors(FileInterceptor('file'))
  async createBatch(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 3000000 }),
          new FileTypeValidator({ fileType: 'text/csv' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<boolean> {
    return await this.expenseService.createBatch(file.buffer);
  }
}
