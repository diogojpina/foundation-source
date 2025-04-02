import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagementGroup } from './entities/management.group';
import { Expense } from './entities/expense';
import { ExpenseSplit } from './entities/expense.split';
import { ManagementGroupController } from './controllers/management.group.controller';
import { ManagementGroupService } from './services/management.group.service';
import { ExpenseController } from './controllers/expense.controller';
import { ExpenseService } from './services/expense.service';
import { UserModule } from '../user/user.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_ENUM } from '../common/enum/queue.enum';
import { NotificationService } from './services/notification.service';
import { MailModule } from '@app/mail';
import { NotificationConsumer } from './consumers/notification.consumer';
import { CreateExpenseConsumer } from './consumers/create.expense.consumer';
import { MinioModule } from '@app/minio';

@Module({
  imports: [
    TypeOrmModule.forFeature([ManagementGroup, Expense, ExpenseSplit]),
    BullModule.registerQueue({
      name: QUEUE_ENUM.NOTIFICATION,
    }),
    BullModule.registerQueue({
      name: QUEUE_ENUM.EXPENSE,
    }),
    UserModule,
    MailModule,
    MinioModule,
  ],
  controllers: [ManagementGroupController, ExpenseController],
  providers: [
    ManagementGroupService,
    ExpenseService,
    NotificationService,
    NotificationConsumer,
    CreateExpenseConsumer,
  ],
})
export class FinancialModule {}
