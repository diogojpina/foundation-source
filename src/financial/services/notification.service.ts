import { Injectable } from '@nestjs/common';
import { Expense } from '../entities/expense';
import { MailService } from '@app/mail';
import { ManagementGroupService } from './management.group.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly mailService: MailService,
    private readonly managementGroupService: ManagementGroupService,
  ) {}

  async notifyNewExpense(expense: Expense): Promise<void> {
    const members = await this.managementGroupService.getMembers(
      expense.group.id,
    );

    const messageData = {
      expenseName: expense.name,
      expenseCreatedAt: expense.createdAt,
      groupName: expense.group.name,
    };

    for (const member of members) {
      await this.mailService.sendEmail(
        member.email,
        'New Expense',
        messageData,
      );
    }
  }

  async notifyExpenseSettled(expense: Expense): Promise<void> {
    const members = await this.managementGroupService.getMembers(
      expense.group.id,
    );

    const messageData = {
      expenseName: expense.name,
      expenseCreatedAt: expense.createdAt,
      groupName: expense.group.name,
    };

    for (const member of members) {
      await this.mailService.sendEmail(
        member.email,
        'Expense Settled',
        messageData,
      );
    }
  }
}
