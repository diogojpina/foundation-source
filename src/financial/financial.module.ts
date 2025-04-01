import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagementGroup } from './entities/management.group';
import { Expense } from './entities/expense';
import { ExpenseSplit } from './entities/expense.split';
import { ManagementGroupController } from './controllers/management.group.controller';
import { ManagementGroupService } from './services/management.group.service';

@Module({
  imports: [TypeOrmModule.forFeature([ManagementGroup, Expense, ExpenseSplit])],
  controllers: [ManagementGroupController],
  providers: [ManagementGroupService],
})
export class FinancialModule {}
