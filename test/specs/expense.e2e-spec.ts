import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestUtil } from '../util/test.util';
import { CreateExpenseDto } from '../../src/financial/dtos';
import { SettleExpenseDto } from '../../src/financial/dtos/expense/settle.expense.dto';

describe('ExpenseController (e2e)', () => {
  let app: INestApplication;
  let testUtil: TestUtil;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [TestUtil],
    }).compile();

    app = moduleFixture.createNestApplication();
    testUtil = moduleFixture.get<TestUtil>(TestUtil);
    await testUtil.realodDb();
    await app.init();
  });

  it('/expense (GET)', async () => {
    return request(app.getHttpServer()).get('/expense').expect(200);
  });

  it('/expense/:id (GET)', async () => {
    return request(app.getHttpServer()).get('/expense/1').expect(200);
  });

  it('/expense (CREATE)', async () => {
    const dto = new CreateExpenseDto();
    dto.groupId = 1;
    dto.payerId = 1;
    dto.name = 'Expense 10';
    dto.amount = 100;

    return request(app.getHttpServer()).post('/expense').send(dto).expect(201);
  });

  it('/expense (CREATE)', async () => {
    const dto = new CreateExpenseDto();
    dto.groupId = 1;
    dto.payerId = 1;
    dto.name = 'Expense 10';
    dto.amount = 100;

    return request(app.getHttpServer()).post('/expense').send(dto).expect(201);
  });

  it('/expense/batch (CREATE)', async () => {
    const dto = new CreateExpenseDto();
    dto.groupId = 1;
    dto.payerId = 1;
    dto.name = 'Expense 10';
    dto.amount = 100;

    return request(app.getHttpServer())
      .post('/expense/batch')
      .set('Content-Type', 'multipart/form-data')
      .attach('file', './test/fixtures/csv/expenses.csv')
      .expect(201);
  });

  it('/expense/settle/:id (CREATE)', async () => {
    const dto = new SettleExpenseDto();
    dto.memberIds = [1];

    return request(app.getHttpServer())
      .post('/expense/settle/1')
      .send(dto)
      .expect(201);
  });
});
