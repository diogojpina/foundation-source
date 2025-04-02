import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TestUtil } from '../util/test.util';
import { CreateManagementGroupDto } from '../../src/financial/dtos/management.group/create.management.group.dto';
import { AddMembersDto } from '../../src/financial/dtos';

describe('ManagementGroupController (e2e)', () => {
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

  it('/management-group (GET)', async () => {
    return request(app.getHttpServer()).get('/management-group').expect(200);
  });

  it('/management-group/:id (GET)', async () => {
    return request(app.getHttpServer()).get('/management-group/1').expect(200);
  });

  it('/management-group (CREATE)', async () => {
    const dto = new CreateManagementGroupDto();
    dto.name = 'Group 2';

    return request(app.getHttpServer())
      .post('/management-group')
      .send(dto)
      .expect(201);
  });

  it('/management-group/addMembers/:id (CREATE)', async () => {
    const dto = new AddMembersDto();
    dto.memberIds = [3];

    return request(app.getHttpServer())
      .post('/management-group/add-members/1')
      .send(dto)
      .expect(201);
  });

  it('/management-group/add-members/:id (CREATE)', async () => {
    const dto = new AddMembersDto();
    dto.memberIds = [3];

    return request(app.getHttpServer())
      .post('/management-group/add-members/1')
      .send(dto)
      .expect(201);
  });

  it('/management-group/balance/:id (CREATE)', async () => {
    return request(app.getHttpServer())
      .get('/management-group/balance/1')
      .send()
      .expect(200);
  });
});
