import { IsAdminMiddlewareMock } from './../../../commons/middlewares/tests/__mocks__/is-admin.middleware';
import { ServiceModule } from './../service.module';
import { ServiceController } from './../service.controller';
import { ServiceValidator } from './../service.validator';
import { ServiceRepository } from './../../../repositories/service.repository';
import { Service } from '../entities/service.entity';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RepositoryModule } from '../../../repositories/repository.module';
import { ChangeLanguageMiddleware } from '../../../commons/middlewares/change-language.middleware';
import { CustomBoostrap } from '../../../config/boostrap.config';
import { UpdateServiceDto, createServiceDto } from '../dtos/service.dto';
import * as supertest from 'supertest';
import { config } from '../../../config/config';
import {
  HeaderResolver,
  I18nModule,
  QueryResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import * as path from 'path';

describe('ServiceController', () => {
  let app: INestApplication;
  const baseUrl = `/api/v1/services`;
  let service: Service;
  let serviceRepository: ServiceRepository;
  let serviceValidator: ServiceValidator;
  let serviceController: ServiceController;
  let serviceEntity: Service;
  let authToken = 'Testing...';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RepositoryModule,
        I18nModule.forRoot({
          fallbackLanguage: config.appDefaultLanguage!,
          loaderOptions: {
            path: path.join(process.cwd(), '/src', '/i18n/'),
            watch: true,
          },
          resolvers: [
            {
              use: HeaderResolver,
              options: ['lang', 'Accept-Language', 'language'],
            },
            {
              use: QueryResolver,
              options: ['lang', 'Accept-Language', 'language'],
            },
            AcceptLanguageResolver,
          ],
        }),
        ServiceModule,
      ],
      providers: [Service, ServiceValidator],
    }).compile();

    app = moduleRef
      .createNestApplication()
      .use(new ChangeLanguageMiddleware().use)
      .use(new IsAdminMiddlewareMock().use);
    await app.init();

    serviceController = moduleRef.get<ServiceController>(ServiceController);
    service = moduleRef.get<Service>(Service);
    serviceRepository = moduleRef.get<ServiceRepository>(ServiceRepository);
    serviceValidator = moduleRef.get<ServiceValidator>(ServiceValidator);

    await new ServiceRepository().resetService();
    serviceEntity = await CustomBoostrap.service();
    await CustomBoostrap.customer();
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(serviceRepository).toBeDefined();
    expect(serviceValidator).toBeDefined();
    expect(serviceController).toBeDefined();
  });

  describe(`POST ${baseUrl}`, () => {
    it('checks if service creation was successful.', async () => {
      const requestBody: createServiceDto = {
        friendlyName: 'My test',
        description: 'This is a test by juliana',
        maxClientCount: 5,
      };
      const response = await supertest(app.getHttpServer())
        .post(baseUrl)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestBody);

      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBeDefined();
      expect(response.body.message).toBe('Service created successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(typeof response.body.data.id).toBe('number');
      expect(response.body.data.code).toBeDefined();
      expect(typeof response.body.data.code).toBe('string');
      expect(response.body.data.createdBy).toBeDefined();
      expect(typeof response.body.data.createdBy).toBe('number');
      expect(response.body.data.description).toBeDefined();
      expect(typeof response.body.data.description).toBe('string');
      expect(response.body.data.maxClientCount).toBeDefined();
      expect(typeof response.body.data.maxClientCount).toBe('number');
      expect(response.body.data.maxClientCount).toBe(5);
      expect(response.body.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.createdAt))).toBe(
        false,
      );
      expect(response.body.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.updatedAt))).toBe(
        false,
      );
    });
  });

  describe(`GET ${baseUrl}/:serviceId`, () => {
    it('checks if service retrieval was successful.', async () => {
      const response = await supertest(app.getHttpServer())
        .get(`${baseUrl}/${serviceEntity.id}`)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Service retrieved successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(typeof response.body.data.id).toBe('number');
      expect(response.body.data.code).toBeDefined();
      expect(typeof response.body.data.code).toBe('string');
      expect(response.body.data.createdBy).toBeDefined();
      expect(typeof response.body.data.createdBy).toBe('number');
      expect(response.body.data.description).toBeDefined();
      expect(typeof response.body.data.description).toBe('string');
      expect(response.body.data.maxClientCount).toBeDefined();
      expect(typeof response.body.data.maxClientCount).toBe('number');
      expect(response.body.data.maxClientCount).toBe(2);
      expect(response.body.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.createdAt))).toBe(false);
      expect(response.body.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.updatedAt))).toBe(false);
    });
  });

  describe(`GET ${baseUrl}`, () => {
    it('checks if services retrieval were successful.', async () => {
      const response = await supertest(app.getHttpServer())
        .get(baseUrl)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Services retrieved successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.count).toBeDefined();
      expect(typeof response.body.data.count).toBe('number');
      expect(response.body.data.totalCount).toBeDefined();
      expect(typeof response.body.data.totalCount).toBe('number');
      expect(response.body.data.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0].id).toBeDefined();
      expect(typeof response.body.data.data[0].id).toBe('number');
      expect(response.body.data.data[0].code).toBeDefined();
      expect(typeof response.body.data.data[0].code).toBe('string');
      expect(response.body.data.data[0].createdBy).toBeDefined();
      expect(typeof response.body.data.data[0].createdBy).toBe('number');
      expect(response.body.data.data[0].description).toBeDefined();
      expect(typeof response.body.data.data[0].description).toBe('string');
      expect(response.body.data.data[0].maxClientCount).toBeDefined();
      expect(typeof response.body.data.data[0].maxClientCount).toBe('number');
      expect(response.body.data.data[0].maxClientCount).toBe(2);
      expect(response.body.data.data[0].createdAt).toBeDefined();
      expect(
        Number.isNaN(Date.parse(response.body.data.data[0].createdAt)),
      ).toBe(false);
      expect(response.body.data.data[0].updatedAt).toBeDefined();
      expect(
        Number.isNaN(Date.parse(response.body.data.data[0].updatedAt)),
      ).toBe(false);
    });
  });

  describe(`GET ${baseUrl}/history`, () => {
    it('checks if service history retrieval were successful.', async () => {
      const response = await supertest(app.getHttpServer())
        .get(`${baseUrl}/history`)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();
      
      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Service histories retrieved successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.count).toBeDefined();
      expect(typeof response.body.data.count).toBe('number');
      expect(response.body.data.totalCount).toBeDefined();
      expect(typeof response.body.data.totalCount).toBe('number');
      expect(response.body.data.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0].serviceHistoryId).toBeDefined();
      expect(typeof response.body.data.data[0].serviceHistoryId).toBe('number');
      expect(response.body.data.data[0].serviceId).toBeDefined();
      expect(typeof response.body.data.data[0].serviceId).toBe('number');
      expect(response.body.data.data[0].createdBy).toBeDefined();
      expect(typeof response.body.data.data[0].createdBy).toBe('string');
      expect(response.body.data.data[0].updatedBy).toBeDefined();
      expect(response.body.data.data[0].data).toBeDefined();
      expect(typeof response.body.data.data[0].data).toBe('string');
      expect(response.body.data.data[0].startDate).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.data[0].startDate))).toBe(false);
      expect(response.body.data.data[0].endDate).toBeDefined();
      expect(response.body.data.data[0].createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.data[0].createdAt))).toBe(false);
      expect(response.body.data.data[0].updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.data[0].updatedAt))).toBe(false);
    });
  });

  describe(`PUT ${baseUrl}/:serviceId`, () => {
    it('checks if services update was successful.', async () => {
      const requestBody: UpdateServiceDto = {
        reason: 'This is an update',
        friendlyName: 'API client service',
      };
      const response = await supertest(app.getHttpServer())
        .put(`${baseUrl}/${serviceEntity.id}`)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestBody);

      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Service updated successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(typeof response.body.data.id).toBe('number');
      expect(response.body.data.code).toBeDefined();
      expect(typeof response.body.data.code).toBe('string');
      expect(response.body.data.createdBy).toBeDefined();
      expect(typeof response.body.data.createdBy).toBe('number');
      expect(response.body.data.description).toBeDefined();
      expect(typeof response.body.data.description).toBe('string');
      expect(response.body.data.maxClientCount).toBeDefined();
      expect(typeof response.body.data.maxClientCount).toBe('number');
      expect(response.body.data.maxClientCount).toBe(2);
      expect(response.body.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.createdAt))).toBe(
        false,
      );
      expect(response.body.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.updatedAt))).toBe(
        false,
      );
    });
  });
});
