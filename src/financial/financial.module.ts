import { Module } from '@nestjs/common';
import { FinancialController } from './controllers/financial.controller';
import { FinancialService } from './services/financial.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagementGroup } from './entities/management.group';
import { Expense } from './entities/expense';
import { ExpenseSplit } from './entities/expense.split';

@Module({
  imports: [TypeOrmModule.forFeature([ManagementGroup, Expense, ExpenseSplit])],
  controllers: [FinancialController],
  providers: [FinancialService],
})
export class FinancialModule {}
