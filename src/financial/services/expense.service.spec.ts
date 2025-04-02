import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { Repository } from 'typeorm';
import { ExpenseService } from './expense.service';
import { Expense } from '../entities/expense';
import { QUEUE_ENUM } from '../../common/enum/queue.enum';
import { getQueueToken } from '@nestjs/bullmq';
import { CreateExpenseDto } from '../dtos';
import { User } from '../../user/entities/user.entity';
import { ManagementGroup } from '../entities/management.group';
import { ManagementGroupService } from './management.group.service';
import { UserService } from '../../user/services/user.service';
import { NotificationService } from './notification.service';
import { SettleExpenseDto } from '../dtos/expense/settle.expense.dto';
import { ExpenseSplit } from '../entities/expense.split';
import { ExpenseSplitStatus } from '../enums/expanse.split.status.enum';

const moduleMocker = new ModuleMocker(global);

const group = new ManagementGroup();
group.id = 1;
group.name = 'Group 1';
group.members = [];

const payer1 = new User();
payer1.id = 1;

const payer2 = new User();
payer2.id = 2;

group.members.push(payer1, payer2);

const expense1 = new Expense();
expense1.group = group;
expense1.name = 'Expense 1';
expense1.amount = 20;
expense1.payer = payer1;
expense1.splits = [];

const split1 = new ExpenseSplit();
split1.payer = payer1;
split1.amount = 10;
split1.percentage = 50;
split1.status = ExpenseSplitStatus.OPEN;

const split2 = new ExpenseSplit();
split2.payer = payer2;
split2.amount = 10;
split2.percentage = 50;
split2.status = ExpenseSplitStatus.OPEN;
expense1.splits.push(split1, split2);

const expense2 = new Expense();
expense2.group = group;
expense2.name = 'Expense 2';
expense2.amount = 30;

const expenses = [expense1, expense2];

describe('ExpenseService', () => {
  let service: ExpenseService;
  let expenseRepository: Repository<Expense>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpenseService],
    })
      .useMocker((token) => {
        if (token === 'ExpenseRepository') {
          return {
            find: jest.fn().mockResolvedValue(Promise.resolve(expenses)),
            findOne: jest.fn().mockResolvedValue(Promise.resolve(expenses[0])),
            save: jest.fn().mockResolvedValue(Promise.resolve(expenses[0])),
          };
        }

        if (token === ManagementGroupService) {
          return {
            getSimple: jest.fn().mockResolvedValue(Promise.resolve(group)),
            getMembers: jest
              .fn()
              .mockResolvedValue(Promise.resolve(group.members)),
          };
        }

        if (token === UserService) {
          return {
            getSimple: jest.fn().mockResolvedValue(Promise.resolve(payer1)),
          };
        }

        if (token === NotificationService) {
          return {
            notifyNewExpense: jest.fn().mockResolvedValue(''),
            notifyExpenseSplitSettled: jest.fn().mockResolvedValue(''),
          };
        }

        if (token === 'BullQueue_expense') {
          return getQueueToken(QUEUE_ENUM.EXPENSE);
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

    service = module.get<ExpenseService>(ExpenseService);
    expenseRepository = module.get('ExpenseRepository');
  });

  describe('search', () => {
    it('should return an expense array', async () => {
      expect(await service.search()).toHaveLength(2);
    });
  });

  describe('get', () => {
    it('should return an expense', async () => {
      expect(await service.get(1)).toBe(expenses[0]);
    });

    it('should throw an error', () => {
      jest
        .spyOn(expenseRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(null));

      expect(service.get(42)).rejects.toThrow(/not found/);
    });
  });

  describe('create', () => {
    it('should create an expense', async () => {
      const dto = new CreateExpenseDto();
      Object.assign(dto, {
        groupId: expense1.group.id,
        name: expense1.name,
        amount: expense1.amount,
        payerId: expense1.payer.id,
      });

      const expense = await service.create(dto);
      expect(expense.id).toBe(expense1.id);
    });
  });

  describe('createBatch', () => {
    it('should create expenses from a csv buffer', async () => {
      const buffer = Buffer.from(
        'groupId;name;amount;payerId;splitMemberIdsToExclude',
      );
      buffer.write('1;bill 1;30;1;');
      buffer.write('1;bill 2;29.99;1;2,3');

      const response = await service.createBatch(buffer);
      expect(response).toBeTruthy();
    });
  });

  describe('settle', () => {
    it('should settle an expense splits', async () => {
      const dto = new SettleExpenseDto();
      dto.memberIds = [1];

      const expense = await service.settle(expense1.id, dto);
      expect(expense.id).toBe(expense1.id);
    });
  });
});
