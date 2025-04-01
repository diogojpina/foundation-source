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
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_ENUM } from 'src/common/enum/queue.enum';
import { NotificationService } from './services/notification.service';
import { MailModule } from '@app/mail';
import { NotificationConsumer } from './consumers/notification.consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([ManagementGroup, Expense, ExpenseSplit]),
    BullModule.registerQueue({
      name: QUEUE_ENUM.NOTIFICATION,
    }),
    UserModule,
    MailModule,
  ],
  controllers: [ManagementGroupController, ExpenseController],
  providers: [
    ManagementGroupService,
    ExpenseService,
    NotificationService,
    NotificationConsumer,
  ],
})
export class FinancialModule {}
