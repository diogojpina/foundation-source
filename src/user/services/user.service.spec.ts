import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dtos';

const moduleMocker = new ModuleMocker(global);

const user1 = new User();
user1.id = 1;
user1.email = 'john@email.com';
user1.name = 'John Doe';
user1.managementGroups = [];
user1.expensesPaid = [];
user1.expensesSplited = [];

const user2 = new User();
user1.id = 1;
user1.email = 'jane@email.com';
user1.name = 'Jane Doe';

const users = [user1, user2];

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    })
      .useMocker((token) => {
        if (token === 'UserRepository') {
          return {
            findOne: jest.fn().mockResolvedValue(Promise.resolve(users[0])),
            save: jest.fn().mockResolvedValue(Promise.resolve(users[1])),
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

    service = module.get<UserService>(UserService);
    userRepository = module.get('UserRepository');
  });

  describe('get', () => {
    it('should return an user', async () => {
      expect(await service.get(1)).toBe(users[0]);
    });

    it('should throw an error', () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(null));

      expect(service.get(42)).rejects.toThrow(/not found/);
    });
  });

  describe('getSimple', () => {
    it('should return an user', async () => {
      expect(await service.getSimple(1)).toBe(users[0]);
    });

    it('should throw an error', () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(null));

      expect(service.getSimple(42)).rejects.toThrow(/not found/);
    });
  });

  describe('create', () => {
    it('should create an user', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(null));

      const dto: CreateUserDto = new CreateUserDto();
      Object.assign(dto, {
        name: user2.name,
        email: user2.email,
        password: '123456',
      });

      const user = await service.create(dto);
      expect(user.email).toBe(user2.email);
    });

    it('should throw an email exists error', () => {
      const dto: CreateUserDto = new CreateUserDto();
      Object.assign(dto, {
        name: user2.name,
        email: user2.email,
        password: '123456',
      });

      expect(service.create(dto)).rejects.toThrow(/already exists/);
    });
  });
});
