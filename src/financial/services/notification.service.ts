import { Injectable } from '@nestjs/common';
import { Expense } from '../entities/expense';
import { ManagementGroupService } from './management.group.service';
import { InjectQueue } from '@nestjs/bullmq';
import { QUEUE_ENUM } from 'src/common/enum/queue.enum';
import { Queue } from 'bullmq';
import { EmailDto } from '../dtos/email/email.dto';
import { JOB_ENUM } from 'src/common/enum/job.enum';
import { ExpenseSplit } from '../entities/expense.split';

@Injectable()
export class NotificationService {
  constructor(
    private readonly managementGroupService: ManagementGroupService,
    @InjectQueue(QUEUE_ENUM.NOTIFICATION)
    private readonly queue: Queue,
  ) {}

  async notifyNewExpense(expense: Expense): Promise<void> {
    const members = await this.managementGroupService.getMembers(
      expense.group.id,
    );

    const messageData = {
      expenseName: expense.name,
      expenseAmount: expense.amount,
      expenseCreatedAt: expense.createdAt,
      groupName: expense.group.name,
    };

    for (const member of members) {
      const email: EmailDto = {
        to: member.email,
        subject: 'New Expense',
        mesage: messageData,
      };

      await this.queue.add(JOB_ENUM.NOTIFICATION.EMAIL, email, {
        removeOnComplete: true,
      });
    }
  }

  async notifyExpenseSplitSettled(
    expense: Expense,
    split: ExpenseSplit,
  ): Promise<void> {
    const messageData = {
      expenseName: expense.name,
      expenseAmount: expense.amount,
      expenseCreatedAt: expense.createdAt,
      groupName: expense.group.name,
      splitAmount: split.amount,
      splitSettledAt: split.settledAt,
    };

    const email: EmailDto = {
      to: split.payer.email,
      subject: 'Expense Split Settled',
      mesage: messageData,
    };

    await this.queue.add(JOB_ENUM.NOTIFICATION.EMAIL, email, {
      removeOnComplete: true,
    });
  }
}
