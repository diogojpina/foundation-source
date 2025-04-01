import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagementGroup } from './entities/management.group';
import { Expense } from './entities/expense';
import { ExpenseSplit } from './entities/expense.split';
import { ManagementGroupController } from './controllers/management.group.controller';
import { ManagementGroupService } from './services/management.group.service';
import { ExpenseController } from './controllers/expense.controller';
import { ExpenseService } from './services/expense.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ManagementGroup, Expense, ExpenseSplit]),
    UserModule,
  ],
  controllers: [ManagementGroupController, ExpenseController],
  providers: [ManagementGroupService, ExpenseService],
})
export class FinancialModule {}
