import { IsAdminMiddlewareMock } from './../../../commons/middlewares/tests/__mocks__/is-admin.middleware';
import { Customer } from './../../customer/entities/customer.entity';
import { SaveServiceParams } from './../../../repositories/entities/service.entity';
import { ServiceRepository } from './../../../repositories/service.repository';
import { AlertConfigurationModule } from '../alert-configuration.module';
import { AlertConfigurationController } from '../alert-configuration.controller';
import { AlertConfigurationValidator } from '../alert-configuration.validator';
import { AlertConfigurationRepository } from '../../../repositories/alert-configuration.repository';
import { AlertConfigurationService } from '../alert-configuration.service';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RepositoryModule } from '../../../repositories/repository.module';
import { ChangeLanguageMiddleware } from '../../../commons/middlewares/change-language.middleware';
import { CreateAlertConfigurationDto, UpdateAlertConfigurationDto } from '../dtos/alert-configuration.dto';
import * as supertest from 'supertest';
import { config } from '../../../config/config';
import { HeaderResolver, I18nModule, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'path';
import { AlertConfiguration } from '../entities/alert-configuration.entity';
import { CustomBoostrap } from '../../../config/boostrap.config';
import { Service } from '../../../apis/service/entities/service.entity';

describe('AlertConfigurationController', () => {
  let app: INestApplication;
  const baseUrl = `/api/v1/alert-configurations`;
  let serviceRepository: ServiceRepository;
  let alertConfigurationService: AlertConfigurationService;
  let alertConfigurationRepository: AlertConfigurationRepository;
  let alertConfigurationValidator: AlertConfigurationValidator;
  let alertConfigurationController: AlertConfigurationController;
  let alertConfigurationEntity: AlertConfiguration;
  let authToken = 'Testing...';
  let globalTester: Customer;

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
        AlertConfigurationModule,
      ],
      providers: [AlertConfiguration, AlertConfigurationValidator],
    }).compile();

    app = moduleRef
      .createNestApplication()
      .use(new ChangeLanguageMiddleware().use)
      .use(new IsAdminMiddlewareMock().use);
    await app.init();

    alertConfigurationController = moduleRef.get<AlertConfigurationController>(AlertConfigurationController);
    alertConfigurationService = moduleRef.get<AlertConfigurationService>(AlertConfigurationService);
    alertConfigurationRepository = moduleRef.get<AlertConfigurationRepository>(AlertConfigurationRepository);
    serviceRepository = moduleRef.get<ServiceRepository>(ServiceRepository);
    alertConfigurationValidator = moduleRef.get<AlertConfigurationValidator>(AlertConfigurationValidator);

    await new AlertConfigurationRepository().resetAlertConfiguration();
    alertConfigurationEntity = await CustomBoostrap.alertConfig();
    globalTester = await CustomBoostrap.customer();
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(serviceRepository).toBeDefined();
    expect(alertConfigurationService).toBeDefined();
    expect(alertConfigurationRepository).toBeDefined();
    expect(alertConfigurationValidator).toBeDefined();
    expect(alertConfigurationController).toBeDefined();
  });

  describe(`POST ${baseUrl}`, () => {
    let newServiceEntity = null as Service | null;

    beforeAll(async () => {
      const newServiceParam: SaveServiceParams = {
        code: 'service-xxxxx-new',
        friendlyName: 'Testing Me now',
        description: 'This is a test 123',
        maxClientCount: 6,
        createdBy: globalTester.id,
      }
      newServiceEntity = await serviceRepository.retrieveService({ code: newServiceParam.code });
      if (!newServiceEntity) newServiceEntity = await serviceRepository.saveServiceAndHistory(newServiceParam);
    });

    it('checks if alert-configuration creation was successful.', async () => {
      const requestBody: CreateAlertConfigurationDto = {
        sendEmail: true,
        sendSlackAlert: true,
        serviceId: newServiceEntity?.id,
        emailAddressRecipients: ["lise@gmail.com"],
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
      expect(response.body.message).toBe('Alert configuration created successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(typeof response.body.data.id).toBe('number');
      expect(response.body.data.createdBy).toBeDefined();
      expect(typeof response.body.data.createdBy).toBe('number');
      expect(response.body.data.sendEmail).toBeDefined();
      expect(typeof response.body.data.sendEmail).toBe('boolean');
      expect(response.body.data.sendSlackAlert).toBeDefined();
      expect(typeof response.body.data.sendSlackAlert).toBe('boolean');
      expect(response.body.data.serviceId).toBeDefined();
      expect(typeof response.body.data.serviceId).toBe('number');
      expect(response.body.data.emailAddressRecipients).toBeDefined();
      expect(typeof response.body.data.emailAddressRecipients).toBe('string');
      expect(response.body.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.createdAt))).toBe(false);
      expect(response.body.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.updatedAt))).toBe(false);
    });
  });

  describe(`GET ${baseUrl}`, () => {
    it('checks if alerts retrieval were successful.', async () => {
      const response = await supertest(app.getHttpServer())
        .get(baseUrl)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Alert configuration retrieved successfully');
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
      expect(response.body.data.data[0].createdBy).toBeDefined();
      expect(typeof response.body.data.data[0].createdBy).toBe('number');
      expect(response.body.data.data[0].sendEmail).toBeDefined();
      expect(typeof response.body.data.data[0].sendEmail).toBe('boolean')
      expect(response.body.data.data[0].sendSlackAlert).toBeDefined();
      expect(typeof response.body.data.data[0].sendSlackAlert).toBe('boolean')
      expect(response.body.data.data[0].serviceId).toBeDefined();
      expect(typeof response.body.data.data[0].serviceId).toBe('number');
      expect(response.body.data.data[0].emailAddressRecipients).toBeDefined();
      expect(typeof response.body.data.data[0].emailAddressRecipients).toBe('string')
      expect(response.body.data.data[0].createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.data[0].createdAt))).toBe(false);
      expect(response.body.data.data[0].updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.data[0].updatedAt))).toBe(false);
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
      expect(response.body.message).toBe('Alert configuration histories retrieved successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.count).toBeDefined();
      expect(typeof response.body.data.count).toBe('number');
      expect(response.body.data.totalCount).toBeDefined();
      expect(typeof response.body.data.totalCount).toBe('number');
      expect(response.body.data.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0].alertConfigurationHistoryId).toBeDefined();
      expect(typeof response.body.data.data[0].alertConfigurationHistoryId).toBe('number');
      expect(response.body.data.data[0].alertConfigurationId).toBeDefined();
      expect(typeof response.body.data.data[0].alertConfigurationId).toBe('number');
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

  describe(`PUT ${baseUrl}/:alertConfigurationId`, () => {
    it('checks if Alerts update was successful.', async () => {
      const requestBody: UpdateAlertConfigurationDto = {
        reason: 'This is an update',
        sendEmail: false,
      };
      const response = await supertest(app.getHttpServer())
        .put(`${baseUrl}/${alertConfigurationEntity.id}`)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestBody);

      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Alert configuration updated successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(typeof response.body.data.id).toBe('number');
      expect(response.body.data.createdBy).toBeDefined();
      expect(typeof response.body.data.createdBy).toBe('number');
      expect(response.body.data.sendEmail).toBeDefined();
      expect(typeof response.body.data.sendEmail).toBe('boolean');
      expect(response.body.data.sendSlackAlert).toBeDefined();
      expect(typeof response.body.data.sendSlackAlert).toBe('boolean');
      expect(response.body.data.serviceId).toBeDefined();
      expect(typeof response.body.data.serviceId).toBe('number');
      expect(response.body.data.emailAddressRecipients).toBeDefined();
      expect(typeof response.body.data.emailAddressRecipients).toBe('string');
      expect(response.body.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.createdAt))).toBe(false);
      expect(response.body.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.updatedAt))).toBe(false);
    });
  });
})
