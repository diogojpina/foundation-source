import { Test, TestingModule } from '@nestjs/testing';
import { ManagementGroupController } from './management.group.controller';
import { User } from '../../user/entities/user.entity';
import { Expense } from '../entities/expense';
import { ExpenseSplit } from '../entities/expense.split';
import { ExpenseSplitStatus } from '../enums/expanse.split.status.enum';
import { ManagementGroup } from '../entities/management.group';
import { ManagementGroupService } from '../services/management.group.service';
import { AddMembersDto, CreateManagementGroupDto } from '../dtos';

const member1 = new User();
member1.id = 1;

const member2 = new User();
member2.id = 2;

const member3 = new User();
member2.id = 2;

const expense1 = new Expense();
expense1.payer = member1;
expense1.amount = 20;

const split1_1 = new ExpenseSplit();
split1_1.payer = member1;
split1_1.amount = 10;
split1_1.status = ExpenseSplitStatus.SETTLED;

const split2_1 = new ExpenseSplit();
split2_1.payer = member2;
split2_1.amount = 10;
split2_1.status = ExpenseSplitStatus.OPEN;

expense1.splits = [split1_1, split2_1];

const group1 = new ManagementGroup();
group1.id = 1;
group1.name = 'Group 1';
group1.members = [];
group1.members.push(member1, member2);
group1.expenses = [expense1];

const group2 = new ManagementGroup();
group2.id = 1;
group2.name = 'Group 2';
group2.members = [];
group2.members.push(member1, member2, member3);

const groups = [group1, group2];

const balanceMap = new Map<number, number>();
balanceMap.set(1, 10);
balanceMap.set(2, -10);

describe('ManagementGroupController', () => {
  let managementGroupController: ManagementGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagementGroupController],
    })
      .useMocker((token) => {
        if (token === ManagementGroupService) {
          return {
            search: jest.fn().mockResolvedValue(Promise.resolve([groups])),
            get: jest.fn().mockResolvedValue(Promise.resolve(group1)),
            create: jest.fn().mockResolvedValue(Promise.resolve(group1)),
            addMembers: jest.fn().mockResolvedValue(Promise.resolve(true)),
            calcBalance: jest
              .fn()
              .mockResolvedValue(Promise.resolve(balanceMap)),
          };
        }
      })
      .compile();

    managementGroupController = module.get<ManagementGroupController>(
      ManagementGroupController,
    );
  });

  describe('search', () => {
    it('should return an array of management groups', async () => {
      expect(await managementGroupController.search()).toBe(groups);
    });
  });

  describe('get', () => {
    it('should return an array of management groups', async () => {
      expect(await managementGroupController.get(group1.id)).toBe(group1);
    });
  });

  describe('create', () => {
    it('should create and return a management group', async () => {
      const dto = new CreateManagementGroupDto();
      dto.name = group1.name;

      const group = await managementGroupController.create(dto);
      expect(group.name).toBe(group1.name);
    });
  });

  describe('addMembers', () => {
    it('should addMembers to a management group', async () => {
      const dto = new AddMembersDto();
      dto.memberIds = [3];

      const result = await managementGroupController.addMembers(group1.id, dto);
      expect(result).toBeTruthy();
    });
  });

  describe('calcBalance', () => {
    it('should return a map balance', async () => {
      const dto = new AddMembersDto();
      dto.memberIds = [3];

      const balances = await managementGroupController.balance(group1.id);
      expect(balances).toHaveLength(2);
      expect(balances[0]).toBe(10);
      expect(balances[1]).toBe(-10);
    });
  });
});
