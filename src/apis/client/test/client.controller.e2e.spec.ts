import { ClientService } from './../client.service';
import { ClientRepository } from './../../../repositories/client.repository';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RepositoryModule } from '../../../repositories/repository.module';
import { ClientModule } from '../client.module';
import { ClientValidator } from '../client.validator';
import { ClientController } from '../client.controller';
import { ChangeLanguageMiddleware } from '../../../commons/middlewares/change-language.middleware';
import { Client } from '../entities/client.entity';
import {AcceptLanguageResolver,HeaderResolver,I18nModule,QueryResolver} from 'nestjs-i18n';
import { config } from '../../../config/config';
import * as path from 'path';
import { HelperModule } from '../../../helpers/helper.module';
import { UpdateClientDto, createClientDto } from '../dtos/client.dto';
import * as supertest from 'supertest';
import { CustomBoostrap } from '../../../config/boostrap.config';
import { ClientHelper } from '../../../helpers/client.helper';
import { Service } from '../../../apis/service/entities/service.entity';
import { ClientScope } from '../../../commons/enums/constants.enum';
import { IsAdminMiddlewareMock } from '../../../commons/middlewares/tests/__mocks__/is-admin.middleware';

describe('ClientController', () => {
  let app: INestApplication;
  const baseUrl = `/api/v1/clients`;
  let clientHelper: ClientHelper;
  let clientService: ClientService;
  let clientRepository: ClientRepository;
  let clientValidator: ClientValidator;
  let clientController: ClientController;
  let clientEntity: Client;
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
        HelperModule,
        ClientModule,
      ],
      providers: [Client, ClientValidator],
    }).compile();

    app = moduleRef
      .createNestApplication()
      .use(new ChangeLanguageMiddleware().use)
      .use(new IsAdminMiddlewareMock().use);
    await app.init();

    clientHelper = moduleRef.get<ClientHelper>(ClientHelper);
    clientController = moduleRef.get<ClientController>(ClientController);
    clientService = moduleRef.get<ClientService>(ClientService);
    clientRepository = moduleRef.get<ClientRepository>(ClientRepository);
    clientValidator = moduleRef.get<ClientValidator>(ClientValidator);

    await new ClientRepository().resetClient();
    clientEntity = await CustomBoostrap.client();
    serviceEntity = await CustomBoostrap.service();
    await CustomBoostrap.customer();
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(clientHelper).toBeDefined();
    expect(clientService).toBeDefined();
    expect(clientRepository).toBeDefined();
    expect(clientValidator).toBeDefined();
    expect(clientController).toBeDefined();
  });

  describe(`POST ${baseUrl}`, () => {
    it('checks if client creation was successful.', async () => {
      const requestBody: createClientDto = {
        friendlyName: 'Testing1',
        scope: ClientScope.WEB,
        serviceId: serviceEntity.id
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
      expect(response.body.message).toBe('Client created successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(typeof response.body.data.id).toBe('number');
      expect(response.body.data.friendlyName).toBeDefined();
      expect(typeof response.body.data.friendlyName).toBe('string');
      expect(response.body.data.secretKey).toBeDefined();
      expect(typeof response.body.data.secretKey).toBe('string');
      expect(response.body.data.scope).toBeDefined();
      expect(typeof response.body.data.scope).toBe('string');
      expect(response.body.data.serviceId).toBeDefined();
      expect(typeof response.body.data.serviceId).toBe('number');
      expect(response.body.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.createdAt))).toBe(false);
      expect(response.body.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.updatedAt))).toBe(false);
    });
  });

  describe(`GET ${baseUrl}/:clientId`, () => {
    it('checks if client retrieval was successful.', async () => {
      const response = await supertest(app.getHttpServer())
        .get(`${baseUrl}/${clientEntity.id}`)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Client retrieved successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(typeof response.body.data.id).toBe('number');
      expect(response.body.data.friendlyName).toBeDefined();
      expect(typeof response.body.data.friendlyName).toBe('string');
      expect(response.body.data.createdBy).toBeDefined();
      expect(typeof response.body.data.createdBy).toBe('number');
      expect(response.body.data.serviceId).toBeDefined();
      expect(typeof response.body.data.serviceId).toBe('number');
      expect(response.body.data.scope).toBeDefined();
      expect(typeof response.body.data.scope).toBe('string');
      expect(response.body.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.createdAt))).toBe(false);
      expect(response.body.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.updatedAt))).toBe(false);
    });
  });

  describe(`GET ${baseUrl}`, () => {
    it('checks if client retrieval were successful.', async () => {
      const response = await supertest(app.getHttpServer())
        .get(baseUrl)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Clients retrieved successfully');
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
      expect(response.body.data.data[0].friendlyName).toBeDefined();
      expect(typeof response.body.data.data[0].friendlyName).toBe('string');
      expect(response.body.data.data[0].createdBy).toBeDefined();
      expect(typeof response.body.data.data[0].createdBy).toBe('number');
      expect(response.body.data.data[0].status).toBeDefined();
      expect(typeof response.body.data.data[0].status).toBe('string');
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
    it('checks if client history retrieval were successful.', async () => {
      const response = await supertest(app.getHttpServer())
        .get(`${baseUrl}/history`)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Client histories retrieved successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.count).toBeDefined();
      expect(typeof response.body.data.count).toBe('number');
      expect(response.body.data.totalCount).toBeDefined();
      expect(typeof response.body.data.totalCount).toBe('number');
      expect(response.body.data.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0].clientHistoryId).toBeDefined();
      expect(typeof response.body.data.data[0].clientHistoryId).toBe('number');
      expect(response.body.data.data[0].clientId).toBeDefined();
      expect(typeof response.body.data.data[0].clientId).toBe('number');
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

  describe(`PUT ${baseUrl}/:clientId`, () => {
    it('checks if clients update was successful.', async () => {
      const requestBody: UpdateClientDto = {
        reason: 'Test on updates',
        friendlyName: 'example',
      };

      const response = await supertest(app.getHttpServer())
        .put(`${baseUrl}/${clientEntity.id}`)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestBody);

      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Client updated successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(typeof response.body.data.id).toBe('number');
      expect(response.body.data.friendlyName).toBeDefined();
      expect(typeof response.body.data.friendlyName).toBe('string');
      expect(response.body.data.serviceId).toBeDefined();
      expect(typeof response.body.data.serviceId).toBe('number');
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
