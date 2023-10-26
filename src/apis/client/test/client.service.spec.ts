import { ClientRepository } from './../../../repositories/client.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryModule } from '../../../repositories/repository.module';
import { ClientService } from '../client.service';
import { ClientValidator } from '../client.validator';
import { Client } from '../entities/client.entity';
import { CustomBoostrap } from '../../../config/boostrap.config';
import { UpdateClientDto, createClientDto } from '../dtos/client.dto';
import { ClientScope} from '../../../commons/enums/constants.enum';
import { Customer } from '../../../apis/customer/entities/customer.entity';
import { HelperModule } from '../../../helpers/helper.module';

describe('Testing ClientService', () => {
  let clientService: ClientService;
  let clientRepository: ClientRepository;
  let clientValidator: ClientValidator;
  let i18n: any = { t: (messageKey: string) => messageKey };
  let clientEntity: Client;
  let newClientEntity: Client;
  let globalTester: Customer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RepositoryModule, HelperModule],
      providers: [ClientService, ClientValidator],
    }).compile();

    clientService = module.get<ClientService>(ClientService);
    clientRepository = module.get<ClientRepository>(ClientRepository);
    clientValidator = module.get<ClientValidator>(ClientValidator);
  });

  beforeAll(async () => {
    await new ClientRepository().resetClient();
    clientEntity = await CustomBoostrap.client();
    globalTester = await CustomBoostrap.customer();
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(clientService).toBeDefined();
    expect(clientRepository).toBeDefined();
    expect(clientValidator).toBeDefined();
  });

  describe('Test creating a client', () => {

    // * checking if client creation error with existing friendlyName
    it('checking if client creation error with existing friendlyName.', async () => {
      const requestBody: createClientDto = {
        friendlyName: clientEntity.friendlyName,
        scope: ClientScope.WEB,
        serviceId: clientEntity.serviceId,
        ipWhitelist: ["192.24.12.0/22"],
      };
      const data = await clientService.createClient(requestBody, i18n, globalTester);

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('client.clientWithFriendlyNameAlreadyExists');
    });

    // * checking if client creation error with invalid clientScope
    it('checking if client creation error with invalid ClientScope', async () => {
      const requestBody: createClientDto = {
        friendlyName: 'leana',
        scope: 'OK',
        serviceId: clientEntity.serviceId,
        ipWhitelist: ["192.24.12.0"],
      };
      const data = await clientService.createClient(requestBody, i18n, globalTester);

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('client.invalidClientScope');
    });

    // * checking if client creation error with shouldApplyIpCheck set to true
    it('checking if client creation error with shouldApplyIpCheck set to true', async () => {
      const requestBody: createClientDto = {
        friendlyName: 'lise',
        scope: ClientScope.WEB,
        serviceId: clientEntity.serviceId,
        shouldApplyIPCheck: true,
      };
      const data = await clientService.createClient(requestBody, i18n, globalTester);

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('client.theIpWhitelistIsRequired');
    });

    // * checking if client creation error with empty IPWhiteList
    it('checking if client creation error with empty IPWhiteList', async () => {
      const requestBody: createClientDto = {
        friendlyName: 'lise',
        scope: ClientScope.WEB,
        serviceId: clientEntity.serviceId,
        shouldApplyIPCheck: true,
        ipWhitelist: [],
      };
      const data = await clientService.createClient(requestBody, i18n, globalTester);

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('client.theIPWhiteListCanNotBeEmpty');
    });

    // * checking if client creation error with non existing serviceId
    it('checking if client creation error with non existing serviceId', async () => {
      const requestBody: createClientDto = {
        friendlyName: clientEntity.friendlyName,
        scope: ClientScope.WEB,
        ipWhitelist: ["192.24.12.0"],
        serviceId: 97897,
      };
      const data = await clientService.createClient(requestBody, i18n, globalTester);

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('service.serviceNotFound');
    });

    // * checking if client creation was successful
    it('checking if client creation was successful.', async () => {
      const requestBody: createClientDto = {
        friendlyName: 'My test',
        scope: ClientScope.WEB,
        serviceId: (await CustomBoostrap.service()).id,
        shouldExpire: false,
        shouldApplyIPCheck: false,
        ipWhitelist: ["192.24.12.0/22"],
      };
      const responseData = await clientService.createClient(requestBody, i18n, globalTester);

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(201);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('client.clientCreatedSuccessfully');
      expect(responseData.data).toBeDefined();
      expect(responseData.data.id).toBeDefined();
      expect(typeof responseData.data.id).toBe('number');
      expect(responseData.data.friendlyName).toBeDefined();
      expect(typeof responseData.data.friendlyName).toBe('string');
      expect(responseData.data.scope).toBeDefined();
      expect(typeof responseData.data.scope).toBe('string');
      expect(responseData.data.secretKey).toBeDefined();
      expect(typeof responseData.data.secretKey).toBe('string');
      expect(responseData.data.serviceId).toBeDefined();
      expect(typeof responseData.data.serviceId).toBe('number');
      expect(responseData.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.createdAt))).toBe(false);
      expect(responseData.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.updatedAt))).toBe(false);

      newClientEntity = responseData.data;
    });
  });

    describe('Test retrieving a single client', () => {
      //*checking if client not found error
      it('checking if client not found error', async () => {
        const responseData = await clientService.findClient(6783, i18n, globalTester);

        expect(responseData.status).toBeDefined();
        expect(responseData.status).toBe(404);
        expect(responseData.message).toBeDefined();
        expect(responseData.message).toBe('client.clientNotFound');
      });

      // * checking if client retrieval was successful
      it('checking if client retrieval was successful.', async () => {
        const responseData = await clientService.findClient(clientEntity.id, i18n, globalTester);

        expect(responseData.status).toBeDefined();
        expect(responseData.status).toBe(200);
        expect(responseData.message).toBeDefined();
        expect(responseData.message).toBe('client.clientRetrievedSuccessfully');
        expect(responseData.data).toBeDefined();
        expect(responseData.data.id).toBeDefined();
        expect(typeof responseData.data.id).toBe('number');
        expect(responseData.data.friendlyName).toBeDefined();
        expect(typeof responseData.data.friendlyName).toBe('string');
        expect(responseData.data.createdBy).toBeDefined();
        expect(typeof responseData.data.createdBy).toBe('number');
        expect(responseData.data.scope).toBeDefined();
        expect(typeof responseData.data.scope).toBe('string');
        expect(responseData.data.serviceId).toBeDefined();
        expect(typeof responseData.data.serviceId).toBe('number');
        expect(Number.isNaN(Date.parse(responseData.data.createdAt))).toBe(false);
        expect(responseData.data.updatedAt).toBeDefined();
        expect(Number.isNaN(Date.parse(responseData.data.updatedAt))).toBe(false);
      });
    });

    describe('Test retrieving clients', () => {
      // * checking if clients retrieval were successful

      it('checking if clients retrieval were successful.', async () => {
        const responseData = await clientService.findClients({}, i18n, globalTester);

        expect(responseData.status).toBeDefined();
        expect(responseData.status).toBe(200);
        expect(responseData.message).toBeDefined();
        expect(responseData.message).toBe('client.clientsRetrievedSuccessfully');
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
        expect(responseData.data.data[0].friendlyName).toBeDefined();
        expect(typeof responseData.data.data[0].friendlyName).toBe('string');
        expect(responseData.data.data[0].createdBy).toBeDefined();
        expect(typeof responseData.data.data[0].createdBy).toBe('number');
        expect(responseData.data.data[0].scope).toBeDefined();
        expect(typeof responseData.data.data[0].scope).toBe('string');
        expect(responseData.data.data[0].serviceId).toBeDefined();
        expect(typeof responseData.data.data[0].serviceId).toBe('number');
        expect(responseData.data.data[0].createdAt).toBeDefined();
        expect(Number.isNaN(Date.parse(responseData.data.data[0].createdAt))).toBe(false);
        expect(responseData.data.data[0].updatedAt).toBeDefined();
        expect(Number.isNaN(Date.parse(responseData.data.data[0].updatedAt))).toBe(false);
      });
    });

    describe('Test retrieving all client histories', () => {
      // * checking if client histories retrieval were successful
      it('checking if client histories retrieval were successful', async () => {
        const responseData = await clientService.findClientHistories({}, i18n, globalTester);

        expect(responseData.status).toBeDefined();
        expect(responseData.status).toBe(200);
        expect(responseData.message).toBeDefined();
        expect(responseData.message).toBe('client.clientHistoriesRetrievedSuccessfully');
        expect(responseData.data).toBeDefined();
        expect(responseData.data.count).toBeDefined();
        expect(typeof responseData.data.count).toBe('number');
        expect(responseData.data.totalCount).toBeDefined();
        expect(typeof responseData.data.totalCount).toBe('number');
        expect(responseData.data.data).toBeDefined();
        expect(Array.isArray(responseData.data.data)).toBe(true);
        expect(responseData.data.data.length).toBeGreaterThan(0);
        expect(responseData.data.data[0].clientHistoryId).toBeDefined();
        expect(typeof responseData.data.data[0].clientHistoryId).toBe('number');
        expect(responseData.data.data[0].clientId).toBeDefined();
        expect(typeof responseData.data.data[0].clientId).toBe('number');
        expect(responseData.data.data[0].createdBy).toBeDefined();
        expect(typeof responseData.data.data[0].createdBy).toBe('string');
        expect(responseData.data.data[0].updatedBy).toBeDefined();
        expect(responseData.data.data[0].data).toBeDefined();
        expect(typeof responseData.data.data[0].data).toBe('string');
        expect(responseData.data.data[0].startDate).toBeDefined();
        expect(Number.isNaN(Date.parse(responseData.data.data[0].startDate))).toBe(false);
        expect(responseData.data.data[0].endDate).toBeDefined();
        expect(responseData.data.data[0].createdAt).toBeDefined();
        expect(Number.isNaN(Date.parse(responseData.data.data[0].createdAt))).toBe(false);
        expect(responseData.data.data[0].updatedAt).toBeDefined();
        expect(Number.isNaN(Date.parse(responseData.data.data[0].updatedAt))).toBe(false);
      });
    });

    describe('Test updating a client', () => {
      // * checking for client not found error
      it('checking for client not found error.', async () => {
        const requestBody: UpdateClientDto = {
          reason: 'This is an update',
          friendlyName: 'lora',
        };
        const responseData = await clientService.updateClient(
          4353,
          requestBody,
          i18n,
          globalTester,
        );

        expect(responseData.status).toBeDefined();
        expect(responseData.status).toBe(404);
        expect(responseData.message).toBeDefined();
        expect(responseData.message).toBe('client.clientNotFound');
      });

      // * checking for client with existing friendlyname error
      it('checking for client with existing friendlyname error.', async () => {
        const requestBody: UpdateClientDto = {
          reason: 'This is an update',
          friendlyName: clientEntity.friendlyName,
        };
        const responseData = await clientService.updateClient(
          newClientEntity.id,
          requestBody,
          i18n,
          globalTester,
        );

        expect(responseData.status).toBeDefined();
        expect(responseData.status).toBe(400);
        expect(responseData.message).toBeDefined();
        expect(responseData.message).toBe('client.clientWithFriendlyNameAlreadyExists');
      });

      // * checking if client update was successful
      it('checking if client update was successful.', async () => {
        const requestBody: UpdateClientDto = {
          reason: 'This is an update',
          friendlyName: 'juliana',
        };

        const responseData = await clientService.updateClient(
          clientEntity.id,
          requestBody,
          i18n,
          globalTester,
        );

        expect(responseData.status).toBeDefined();
        expect(responseData.status).toBe(200);
        expect(responseData.message).toBeDefined();
        expect(responseData.message).toBe('client.clientUpdatedSuccessfully');
        expect(responseData.data).toBeDefined();
        expect(responseData.data.id).toBeDefined();
        expect(typeof responseData.data.id).toBe('number');
        expect(responseData.data.friendlyName).toBeDefined();
        expect(typeof responseData.data.friendlyName).toBe('string');
        expect(responseData.data.serviceId).toBeDefined();
        expect(typeof responseData.data.serviceId).toBe('number');
        expect(responseData.data.createdAt).toBeDefined();
        expect(Number.isNaN(Date.parse(responseData.data.createdAt))).toBe(false);
        expect(responseData.data.updatedAt).toBeDefined();
        expect(Number.isNaN(Date.parse(responseData.data.updatedAt))).toBe(false);
      });
    });
  });
