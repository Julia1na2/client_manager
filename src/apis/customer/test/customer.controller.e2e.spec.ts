import { IsAdminMiddlewareMock } from './../../../commons/middlewares/tests/__mocks__/is-admin.middleware';
import { CustomerModule } from './../customer.module';
import { CustomerController } from './../customer.controller';
import { CustomerValidator } from './../customer.validator';
import { CustomerRepository } from './../../../repositories/customer.repository';
import { CustomerService } from './../customer.service';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { RepositoryModule } from '../../../repositories/repository.module';
import { ChangeLanguageMiddleware } from '../../../commons/middlewares/change-language.middleware';
import { Customer } from '../entities/customer.entity';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { config } from '../../../config/config';
import * as supertest from 'supertest';
import { UpdateCustomerDto } from '../dtos/customer.dto';
import * as path from 'path';
import { CustomBoostrap } from '../../../config/boostrap.config';

describe('CustomerController', () => {
  let app: INestApplication;
  const baseUrl = `/api/v1/customers`;
  let customerService: CustomerService;
  let customerRepository: CustomerRepository;
  let customerValidator: CustomerValidator;
  let customerController: CustomerController;
  let customerEntity: Customer;
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
        CustomerModule,
      ],
      providers: [Customer, CustomerValidator],
    }).compile();

    app = moduleRef
      .createNestApplication()
      .use(new ChangeLanguageMiddleware().use)
      .use(new IsAdminMiddlewareMock().use);
    await app.init();

    customerController = moduleRef.get<CustomerController>(CustomerController);
    customerService = moduleRef.get<CustomerService>(CustomerService);
    customerRepository = moduleRef.get<CustomerRepository>(CustomerRepository);
    customerValidator = moduleRef.get<CustomerValidator>(CustomerValidator);

    await new CustomerRepository().resetCustomer();
    customerEntity = await CustomBoostrap.customer();
  });

  afterAll(async () => jest.clearAllMocks());

  it('should be defined', () => {
    expect(customerService).toBeDefined();
    expect(customerRepository).toBeDefined();
    expect(customerValidator).toBeDefined();
    expect(customerController).toBeDefined();
  });

  describe(`GET ${baseUrl}/:customerId`, () => {
    it('checks if customer retrieval was successful.', async () => {
      const response = await supertest(app.getHttpServer())
        .get(`${baseUrl}/${customerEntity.id}`)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Customer retrieved successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(typeof response.body.data.id).toBe('number');
      expect(response.body.data.username).toBeDefined();
      expect(typeof response.body.data.username).toBe('string');
      expect(response.body.data.nellysCoinUserId).toBeDefined();
      expect(typeof response.body.data.nellysCoinUserId).toBe('number');
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

  describe(`GET ${baseUrl}`, () => {
    it('checks if customers retrieval were successful.', async () => {
      const response = await supertest(app.getHttpServer())
        .get(baseUrl)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Customers retrieved successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.count).toBeDefined();
      expect(typeof response.body.data.count).toBe('number');
      expect(response.body.data.totalCount).toBeDefined();
      expect(typeof response.body.data.totalCount).toBe('number');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
      expect(response.body.data.data[0].id).toBeDefined();
      expect(typeof response.body.data.data[0].id).toBe('number');
      expect(response.body.data.data[0].username).toBeDefined();
      expect(typeof response.body.data.data[0].username).toBe('string');
      expect(response.body.data.data[0].nellysCoinUserId).toBeDefined();
      expect(typeof response.body.data.data[0].nellysCoinUserId).toBe('number');
      expect(response.body.data.data[0].createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.data[0].createdAt))).toBe(false);
      expect(response.body.data.data[0].updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.data[0].updatedAt))).toBe(false);
    });
  });

  describe(`PUT ${baseUrl}/:nellysCoinUserId`, () => {
    it('checks if customer update was successful.', async () => {
      const requestBody: UpdateCustomerDto = {
        oldUsername: customerEntity.username,
        newUsername: 'Mick'
      }
      const response = await supertest(app.getHttpServer())
        .put(`${baseUrl}/${customerEntity.nellysCoinUserId}`)
        .set('client-id', `${config.nellysCoinClientId}`)
        .set('client-secret', `${config.nellysCoinClientSecret}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestBody);

      expect(response.statusCode).toBeDefined();
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Customer updated successfully');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(typeof response.body.data.id).toBe('number');
      expect(response.body.data.username).toBeDefined();
      expect(typeof response.body.data.username).toBe('string');
      expect(response.body.data.emailAddress).toBeDefined();
      expect(typeof response.body.data.emailAddress).toBe('string');
      expect(response.body.data.status).toBeDefined();
      expect(typeof response.body.data.status).toBe('string');
      expect(response.body.data.type).toBeDefined();
      expect(typeof response.body.data.type).toBe('string');
      expect(response.body.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.createdAt))).toBe(false);
      expect(response.body.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(response.body.data.updatedAt))).toBe(false);
    });
  });
});
