import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { NotificationService } from './notification.service';
import { ManagementGroupService } from './management.group.service';
import { ManagementGroup } from '../entities/management.group';
import { User } from '../../user/entities/user.entity';
import { Expense } from '../entities/expense';
import { Queue } from 'bullmq';
import { ExpenseSplit } from '../entities/expense.split';
import { ExpenseSplitStatus } from '../enums/expanse.split.status.enum';

const moduleMocker = new ModuleMocker(global);

const member1 = new User();
member1.id = 1;

const member2 = new User();
member2.id = 2;

const group = new ManagementGroup();
group.id = 1;
group.name = 'Group 1';
group.members = [];

group.members.push(member1, member2);

const split1 = new ExpenseSplit();
split1.payer = member1;
split1.amount = 20;
split1.percentage = 50;
split1.status = ExpenseSplitStatus.SETTLED;
split1.settledAt = new Date();

const expense1 = new Expense();
expense1.group = group;
expense1.name = 'Expense 1';
expense1.amount = 20;
expense1.payer = member1;
expense1.splits = [split1];

describe('NotificationService', () => {
  let service: NotificationService;
  let queue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService],
    })
      .useMocker((token) => {
        if (token === ManagementGroupService) {
          return {
            getSimple: jest.fn().mockResolvedValue(Promise.resolve(group)),
            getMembers: jest
              .fn()
              .mockResolvedValue(Promise.resolve(group.members)),
          };
        }

        if (token === 'BullQueue_notification') {
          return {
            add: jest.fn(),
          };
        }

        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const mock = moduleMocker.generateFromMetadata(mockMetadata);
          return mock;
        }
      })
      .compile();

    service = module.get<NotificationService>(NotificationService);
    queue = module.get('BullQueue_notification');
  });

  describe('notifyNewExpense', () => {
    it('should call queue twice', async () => {
      await service.notifyNewExpense(expense1);
      expect(queue.add).toHaveBeenCalledTimes(2);
    });
  });

  describe('notifyExpenseSplitSettled', () => {
    it('should call queue once', async () => {
      await service.notifyExpenseSplitSettled(expense1, split1);
      expect(queue.add).toHaveBeenCalledTimes(1);
    });
  });
});
