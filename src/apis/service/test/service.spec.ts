import { Customer } from './../../customer/entities/customer.entity';
import { CustomBoostrap } from './../../../config/boostrap.config';
import { ServiceValidator } from './../service.validator';
import { ServiceRepository } from './../../../repositories/service.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryModule } from '../../../repositories/repository.module';
import { UpdateServiceDto, createServiceDto } from '../dtos/service.dto';
import { Services } from '../service';
import { Service } from '../entities/service.entity';

describe('Testing Service', () => {
  let service: Services;
  let serviceRepository: ServiceRepository;
  let serviceValidator: ServiceValidator;
  let i18n: any = { t: (messageKey: string) => messageKey };
  let serviceEntity: Service;
  let newServiceEntity: Service;
  let globalTester: Customer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RepositoryModule],
      providers: [Services, ServiceValidator],
    }).compile();

    service = module.get<Services>(Services);
    serviceRepository = module.get<ServiceRepository>(ServiceRepository);
    serviceValidator = module.get<ServiceValidator>(ServiceValidator);
  });

  beforeAll(async () => {
    await new ServiceRepository().resetService();
    serviceEntity = await CustomBoostrap.service();
    globalTester = await CustomBoostrap.customer();
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(serviceRepository).toBeDefined();
    expect(serviceValidator).toBeDefined();
  });

  describe('Test creating a service', () => {
    // * checking if service creation error with existing friendlyName
    it('checking if service creation error with existing friendlyName.', async () => {
      const requestBody: createServiceDto = {
        friendlyName: serviceEntity.friendlyName,
        description: 'This is a test by juliana',
      };
      const data = await service.createService(requestBody, i18n, globalTester);

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('service.serviceWithFriendlyNameAlreadyExists');
    });

    // * checking if service creation was successful
    it('checking if service creation was successful.', async () => {
      const requestBody: createServiceDto = {
        friendlyName: 'Test1 ',
        description: 'This is a test by juliana',
        maxClientCount: 5,
      };
      const responseData = await service.createService(
        requestBody,
        i18n,
        globalTester,
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(201);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('service.serviceCreatedSuccessfully');
      expect(responseData.data).toBeDefined();
      expect(responseData.data.id).toBeDefined();
      expect(typeof responseData.data.id).toBe('number');
      expect(responseData.data.code).toBeDefined();
      expect(typeof responseData.data.code).toBe('string');
      expect(responseData.data.createdBy).toBeDefined();
      expect(typeof responseData.data.createdBy).toBe('number');
      expect(responseData.data.description).toBeDefined();
      expect(typeof responseData.data.description).toBe('string');
      expect(responseData.data.maxClientCount).toBeDefined();
      expect(typeof responseData.data.maxClientCount).toBe('number');
      expect(responseData.data.maxClientCount).toBe(5);
      expect(responseData.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.createdAt))).toBe(false);
      expect(responseData.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.updatedAt))).toBe(false);

      newServiceEntity = responseData.data;
    });
  });

  describe('Test retrieving a single service', () => {
    // * checking for service not found error
    it('checking for service not found error.', async () => {
      const responseData = await service.findService(
        99999999,
        i18n,
        globalTester,
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(404);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('service.serviceNotFound');
    });

    // * checking if service retrieval was successful
    it('checking if service retrieval was successful.', async () => {
      const responseData = await service.findService(
        serviceEntity.id,
        i18n,
        globalTester,
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(200);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('service.serviceRetrievedSuccessfully');
      expect(responseData.data).toBeDefined();
      expect(responseData.data.id).toBeDefined();
      expect(typeof responseData.data.id).toBe('number');
      expect(responseData.data.code).toBeDefined();
      expect(typeof responseData.data.code).toBe('string');
      expect(responseData.data.createdBy).toBeDefined();
      expect(typeof responseData.data.createdBy).toBe('number');
      expect(responseData.data.description).toBeDefined();
      expect(typeof responseData.data.description).toBe('string');
      expect(responseData.data.maxClientCount).toBeDefined();
      expect(typeof responseData.data.maxClientCount).toBe('number');
      expect(responseData.data.maxClientCount).toBe(2);
      expect(responseData.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.createdAt))).toBe(false);
      expect(responseData.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.updatedAt))).toBe(false);
    });
  });

  describe('Test retrieving services', () => {
    // * checking if services retrieval were successful
    it('checking if services retrieval were successful.', async () => {
      const responseData = await service.findServices({}, i18n, globalTester);

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(200);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe(
        'service.servicesRetrievedSuccessfully',
      );
      expect(responseData.data).toBeDefined();
      expect(responseData.data.count).toBeDefined();
      expect(typeof responseData.data.count).toBe('number');
      expect(responseData.data.totalCount).toBeDefined();
      expect(typeof responseData.data.totalCount).toBe('number');
      expect(responseData.data.data).toBeDefined();
      expect(Array.isArray(responseData.data.data)).toBe(true);
      expect(responseData.data.data.length).toBeGreaterThan(0);
      expect(responseData.data.data[0].id).toBeDefined();
      expect(typeof responseData.data.data[0].id).toBe('number');
      expect(responseData.data.data[0].code).toBeDefined();
      expect(typeof responseData.data.data[0].code).toBe('string');
      expect(responseData.data.data[0].createdBy).toBeDefined();
      expect(typeof responseData.data.data[0].createdBy).toBe('number');
      expect(responseData.data.data[0].description).toBeDefined();
      expect(typeof responseData.data.data[0].description).toBe('string');
      expect(responseData.data.data[0].maxClientCount).toBeDefined();
      expect(typeof responseData.data.data[0].maxClientCount).toBe('number');
      expect(responseData.data.data[0].maxClientCount).toBe(2);
      expect(responseData.data.data[0].createdAt).toBeDefined();
      expect(
        Number.isNaN(Date.parse(responseData.data.data[0].createdAt)),
      ).toBe(false);
      expect(responseData.data.data[0].updatedAt).toBeDefined();
      expect(
        Number.isNaN(Date.parse(responseData.data.data[0].updatedAt)),
      ).toBe(false);
    });
  });

  describe('Test retrieving all service histories', () => {
    // * checking if service histories retrieval were successful
    it('checking if service histories retrieval were successful', async () => {
      const responseData = await service.findServiceHistories(
        {},
        i18n,
        globalTester,
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(200);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe(
        'service.serviceHistoriesRetrievedSuccessfully',
      );
      expect(responseData.data).toBeDefined();
      expect(responseData.data.count).toBeDefined();
      expect(typeof responseData.data.count).toBe('number');
      expect(responseData.data.totalCount).toBeDefined();
      expect(typeof responseData.data.totalCount).toBe('number');
      expect(responseData.data.data).toBeDefined();
      expect(Array.isArray(responseData.data.data)).toBe(true);
      expect(responseData.data.data.length).toBeGreaterThan(0);
      expect(responseData.data.data[0].serviceHistoryId).toBeDefined();
      expect(typeof responseData.data.data[0].serviceHistoryId).toBe('number');
      expect(responseData.data.data[0].serviceId).toBeDefined();
      expect(typeof responseData.data.data[0].serviceId).toBe('number');
      expect(responseData.data.data[0].createdBy).toBeDefined();
      expect(typeof responseData.data.data[0].createdBy).toBe('string');
      expect(responseData.data.data[0].updatedBy).toBeDefined();
      expect(responseData.data.data[0].data).toBeDefined();
      expect(typeof responseData.data.data[0].data).toBe('string');
      expect(responseData.data.data[0].startDate).toBeDefined();
      expect(
        Number.isNaN(Date.parse(responseData.data.data[0].startDate)),
      ).toBe(false);
      expect(responseData.data.data[0].endDate).toBeDefined();
      expect(responseData.data.data[0].createdAt).toBeDefined();
      expect(
        Number.isNaN(Date.parse(responseData.data.data[0].createdAt)),
      ).toBe(false);
      expect(responseData.data.data[0].updatedAt).toBeDefined();
      expect(
        Number.isNaN(Date.parse(responseData.data.data[0].updatedAt)),
      ).toBe(false);
    });
  });

  describe('Test updating a service', () => {
    // * checking for service not found error
    it('checking for service not found error.', async () => {
      const requestBody: UpdateServiceDto = { reason: 'This is an update' };
      const responseData = await service.updateService(
        99999999,
        requestBody,
        i18n,
        globalTester,
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(404);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('service.serviceNotFound');
    });

    // * checking for service with existing friendly name error
    it('checking for service with existing friendly name error.', async () => {
      const requestBody: UpdateServiceDto = {
        reason: 'This is an update',
        friendlyName: serviceEntity.friendlyName,
      };
      const responseData = await service.updateService(
        newServiceEntity.id,
        requestBody,
        i18n,
        globalTester,
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(400);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe(
        'service.serviceWithFriendlyNameAlreadyExists',
      );
    });

    // * checking if service update was successful
    it('checking if service update was successful.', async () => {
      const requestBody: UpdateServiceDto = {
        reason: 'This is an update',
        friendlyName: 'API client service',
      };
      const responseData = await service.updateService(
        serviceEntity.id,
        requestBody,
        i18n,
        globalTester,
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(200);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('service.serviceUpdatedSuccessfully');
      expect(responseData.data).toBeDefined();
      expect(responseData.data.id).toBeDefined();
      expect(typeof responseData.data.id).toBe('number');
      expect(responseData.data.code).toBeDefined();
      expect(typeof responseData.data.code).toBe('string');
      expect(responseData.data.createdBy).toBeDefined();
      expect(typeof responseData.data.createdBy).toBe('number');
      expect(responseData.data.description).toBeDefined();
      expect(typeof responseData.data.description).toBe('string');
      expect(responseData.data.maxClientCount).toBeDefined();
      expect(typeof responseData.data.maxClientCount).toBe('number');
      expect(responseData.data.maxClientCount).toBe(2);
      expect(responseData.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.createdAt))).toBe(false);
      expect(responseData.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.updatedAt))).toBe(false);
    });
  });
});
