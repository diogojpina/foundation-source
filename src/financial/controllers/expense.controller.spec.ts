import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from '../services/expense.service';
import { ManagementGroup } from '../entities/management.group';
import { User } from '../../user/entities/user.entity';
import { Expense } from '../entities/expense';
import { ExpenseSplit } from '../entities/expense.split';
import { ExpenseSplitStatus } from '../enums/expanse.split.status.enum';
import { CreateExpenseDto } from '../dtos';
import { SettleExpenseDto } from '../dtos/expense/settle.expense.dto';
import { Readable } from 'stream';

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

describe('ExpenseController', () => {
  let expenseController: ExpenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
    })
      .useMocker((token) => {
        if (token === ExpenseService) {
          return {
            search: jest.fn().mockResolvedValue(Promise.resolve([expenses])),
            get: jest.fn().mockResolvedValue(Promise.resolve(expense1)),
            create: jest.fn().mockResolvedValue(Promise.resolve(expense1)),
            createBatch: jest
              .fn()
              .mockResolvedValue(Promise.resolve([expenses])),
            settle: jest.fn().mockResolvedValue(Promise.resolve(expense1)),
          };
        }
      })
      .compile();

    expenseController = module.get<ExpenseController>(ExpenseController);
  });

  describe('search', () => {
    it('should return an array of expense', async () => {
      expect(await expenseController.search()).toBe(expenses);
    });
  });

  describe('get', () => {
    it('should return an expense', async () => {
      expect(await expenseController.get(expense1.id)).toBe(expense1);
    });
  });

  describe('create', () => {
    it('should create an expense', async () => {
      const dto = new CreateExpenseDto();
      dto.groupId = expense1.group.id;
      dto.name = expense1.name;
      dto.amount = expense1.amount;
      dto.payerId = expense1.payer.id;
      dto.splitMemberIdsToExclude = [];

      const expense = await expenseController.create(dto);
      expect(expense).toBe(expense1);
    });
  });

  describe('createBatch', () => {
    it('should settle an expense split', async () => {
      const file: Express.Multer.File = {
        fieldname: 'test.csv',
        originalname: 'test.csv',
        buffer: Buffer.from(new ArrayBuffer(0)),
        encoding: '',
        mimetype: '',
        size: 0,
        stream: new Readable(),
        destination: '',
        filename: '',
        path: '',
      };

      const expenses = await expenseController.createBatch(file);
      expect(expenses).toBe(expenses);
    });
  });

  describe('settle', () => {
    it('should settle an expense split', async () => {
      const dto = new SettleExpenseDto();
      dto.memberIds = [payer1.id, payer2.id];

      const expense = await expenseController.settle(expense1.id, dto);
      expect(expense).toBe(expense1);
    });
  });
});
