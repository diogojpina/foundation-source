import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { Repository } from 'typeorm';
import { ManagementGroup } from '../entities/management.group';
import { ManagementGroupService } from './management.group.service';
import { User } from '../../user/entities/user.entity';
import { AddMembersDto, CreateManagementGroupDto } from '../dtos';
import { Expense } from '../entities/expense';
import { ExpenseSplit } from '../entities/expense.split';
import { ExpenseSplitStatus } from '../enums/expanse.split.status.enum';

const moduleMocker = new ModuleMocker(global);

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

describe('ManagementGroupService', () => {
  let service: ManagementGroupService;
  let managementGroupRepository: Repository<ManagementGroup>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManagementGroupService],
    })
      .useMocker((token) => {
        if (token === 'ManagementGroupRepository') {
          return {
            find: jest.fn().mockResolvedValue(Promise.resolve(groups)),
            findOne: jest.fn().mockResolvedValue(Promise.resolve(groups[0])),
            save: jest.fn().mockResolvedValue(Promise.resolve(groups[0])),
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

    service = module.get<ManagementGroupService>(ManagementGroupService);
    managementGroupRepository = module.get('ManagementGroupRepository');
  });

  describe('search', () => {
    it('should return a management group array', async () => {
      expect(await service.search()).toHaveLength(2);
    });
  });

  describe('get', () => {
    it('should return a management group', async () => {
      expect(await service.get(1)).toBe(groups[0]);
    });

    it('should throw an error', () => {
      jest
        .spyOn(managementGroupRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(null));

      expect(service.get(42)).rejects.toThrow(/not found/);
    });
  });

  describe('getSimple', () => {
    it('should return a management group', async () => {
      expect(await service.getSimple(1)).toBe(groups[0]);
    });

    it('should throw an error', () => {
      jest
        .spyOn(managementGroupRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(null));

      expect(service.getSimple(42)).rejects.toThrow(/not found/);
    });
  });

  describe('create', () => {
    it('should create an expense', async () => {
      const dto = new CreateManagementGroupDto();
      Object.assign(dto, {
        name: 'Group 1',
      });

      const group = await service.create(dto);
      expect(group.id).toBe(group1.id);
    });
  });

  describe('addMembers', () => {
    it('should return true', async () => {
      jest
        .spyOn(managementGroupRepository, 'findOne')
        .mockImplementation(() =>
          Promise.resolve(Object.assign(new ManagementGroup(), group1)),
        );

      const dto = new AddMembersDto();
      dto.memberIds = [3];

      const result = await service.addMembers(group1.id, dto);
      expect(result).toBeTruthy();
    });
  });

  describe('calcBalance', () => {
    it('should return a Map of balances', async () => {
      group1.members = [member1, member2];
      const balances = await service.calcBalance(group1.id);

      expect(balances[0].total).toBe(10);
      expect(balances[1].total).toBe(-10);
    });
  });
});
