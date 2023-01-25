import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestController } from './test.controller';

describe('Cats', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
  });

  it(`/GET list`, async () => {
    return await request(app.getHttpServer())
      .get(
        '/test/list?page=2&limit=10&filter=%7B%22userName%22%3A%20%7B%22%24regex%22%3A%20%22%5Etest%22%7D%7D',
      )
      .expect(200)
      .expect({ data: [], pagination: { total: 1, limit: 10, page: 0 } });
  });

  afterAll(async () => {
    await app.close();
  });
});
