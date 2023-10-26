import { Customer } from './../../customer/entities/customer.entity';
import { SaveServiceParams } from './../../../repositories/entities/service.entity';
import { ServiceRepository } from './../../../repositories/service.repository';
import { AlertConfigurationRepository } from '../../../repositories/alert-configuration.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryModule } from '../../../repositories/repository.module';
import { AlertConfigurationService } from '../alert-configuration.service';
import { AlertConfigurationValidator } from '../alert-configuration.validator';
import {
  CreateAlertConfigurationDto,
  UpdateAlertConfigurationDto,
} from '../dtos/alert-configuration.dto';
import { AlertConfiguration } from '../entities/alert-configuration.entity';
import { CustomBoostrap } from '../../../config/boostrap.config';
import { Service } from '../../../apis/service/entities/service.entity';

describe('Testing AlertConfigurationService', () => {
  let alertConfigurationService: AlertConfigurationService;
  let alertConfigRepository: AlertConfigurationRepository;
  let alertConfigValidator: AlertConfigurationValidator;
  let serviceRepository: ServiceRepository;
  let i18n: any = { t: (messageKey: string) => messageKey };
  let alertConfigEntity: AlertConfiguration;
  let newAlertEntity: AlertConfiguration;
  let serviceEntity: Service;
  let globalTester: Customer;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RepositoryModule],
      providers: [AlertConfigurationService, AlertConfigurationValidator],
    }).compile();

    alertConfigurationService = module.get<AlertConfigurationService>(AlertConfigurationService);
    alertConfigRepository = module.get<AlertConfigurationRepository>(AlertConfigurationRepository);
    serviceRepository = module.get<ServiceRepository>(ServiceRepository);
    alertConfigValidator = module.get<AlertConfigurationValidator>(AlertConfigurationValidator);
  });

  beforeAll(async () => {
    await new AlertConfigurationRepository().resetAlertConfiguration();
    alertConfigEntity = await CustomBoostrap.alertConfig();
    serviceEntity = await CustomBoostrap.service();
    globalTester = await CustomBoostrap.customer();
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(alertConfigurationService).toBeDefined();
    expect(alertConfigRepository).toBeDefined();
    expect(serviceRepository).toBeDefined();
    expect(alertConfigValidator).toBeDefined();
  });

  describe('Test creating an alert-configuration', () => {
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
    })
    
    // * checking for alert-configuration creation with sendEmail set to true
    it('checking for alert-configuration creation error with sendEmail set to true', async () => {
      const requestBody: CreateAlertConfigurationDto = {
        sendEmail: true,
        sendSlackAlert: false,
      };
      const data = await alertConfigurationService.createAlertConfiguration(
        requestBody,
        i18n,
        globalTester,
      );

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('alert-configuration.theListOfEmailAddressRecipientsIsRequired');
    });

    // * checking for alert-configuration creation with emailRecipientAddress is empty error
    it('checking for alert-configuration creation with emailRecipientAddress is empty error', async () => {
      const requestBody: CreateAlertConfigurationDto = {
        sendEmail: true,
        sendSlackAlert: false,
        emailAddressRecipients: [],
      };
      const data = await alertConfigurationService.createAlertConfiguration(
        requestBody,
        i18n,
        globalTester
      );

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('alert-configuration.theListOfEmailAddressRecipientsCanNotBeEmpty');
    });

    // * checking for alert-configuration creation with service not found error
    it('checking for alert-configuration creation with service not found error', async () => {
      const requestBody: CreateAlertConfigurationDto = {
        sendSlackAlert: false,
        serviceId: 1000
      };
      const data = await alertConfigurationService.createAlertConfiguration(
        requestBody,
        i18n,
        globalTester
      );

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('service.serviceNotFound');
    });

    // * checking for alert-configuration creation with configuration already exists error
    it('checking for alert-configuration creation with configuration already exists error', async () => {
      const requestBody: CreateAlertConfigurationDto = {
        sendSlackAlert: false,
        serviceId: serviceEntity.id,
      };
      const data = await alertConfigurationService.createAlertConfiguration(
        requestBody,
        i18n,
        globalTester
      );

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('alert-configuration.alertConfigurationAlreadyExists');
    });

    // * checking for alertConfig creation was successful
    it('checking for alertConfig creation was successful.', async () => {
      const requestBody: CreateAlertConfigurationDto = {
        sendEmail: true,
        sendSlackAlert: true,
        serviceId: newServiceEntity?.id,
        emailAddressRecipients: ['juju@gmail.com'],
      };
      const responseData = await alertConfigurationService.createAlertConfiguration(
        requestBody,
        i18n,
        globalTester
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(201);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('alert-configuration.alertConfigurationCreatedSuccessfully');
      expect(responseData.data).toBeDefined();
      expect(responseData.data.id).toBeDefined();
      expect(typeof responseData.data.id).toBe('number');
      expect(responseData.data.createdBy).toBeDefined();
      expect(typeof responseData.data.createdBy).toBe('number');
      expect(responseData.data.sendEmail).toBeDefined();
      expect(typeof responseData.data.sendEmail).toBe('boolean');
      expect(responseData.data.sendSlackAlert).toBeDefined();
      expect(typeof responseData.data.sendSlackAlert).toBe('boolean');
      expect(responseData.data.serviceId).toBeDefined();
      expect(typeof responseData.data.serviceId).toBe('number');
      expect(responseData.data.emailAddressRecipients).toBeDefined();
      expect(typeof responseData.data.emailAddressRecipients).toBe('string');
      expect(responseData.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.createdAt))).toBe(false);
      expect(responseData.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.updatedAt))).toBe(false);

      newAlertEntity = responseData.data;
    });
  });

  describe('Test retrieving all alert configurations', () => {
    // * checking if alert configurations retrieval were successful
    it('checking if alert-configurations retrieval were successful', async () => {
      const responseData = await alertConfigurationService.findAlertConfigurations({}, i18n, globalTester);

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(200);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('alert-configuration.alertConfigurationsRetrievedSuccessfully');
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
      expect(responseData.data.data[0].createdBy).toBeDefined();
      expect(typeof responseData.data.data[0].createdBy).toBe('number');
      expect(responseData.data.data[0].sendEmail).toBeDefined();
      expect(typeof responseData.data.data[0].sendEmail).toBe('boolean');
      expect(responseData.data.data[0].sendSlackAlert).toBeDefined();
      expect(typeof responseData.data.data[0].sendSlackAlert).toBe('boolean');
      expect(responseData.data.data[0].serviceId).toBeDefined();
      expect(typeof responseData.data.data[0].serviceId).toBe('number');
      expect(responseData.data.data[0].emailAddressRecipients).toBeDefined();
      expect(typeof responseData.data.data[0].emailAddressRecipients).toBe('string');
      expect(responseData.data.data[0].createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.data[0].createdAt))).toBe(false);
      expect(responseData.data.data[0].updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.data[0].updatedAt))).toBe(false);
    });
  });

  describe('Test retrieving all alert configuration histories', () => {
    // * checking if alert configuration histories retrieval were successful
    it('checking if alert-configuration histories retrieval were successful', async () => {
      const responseData = await alertConfigurationService.findAlertConfigurationHistories({}, i18n, globalTester);

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(200);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('alert-configuration.alertConfigurationHistoriesRetrievedSuccessfully');
      expect(responseData.data).toBeDefined();
      expect(responseData.data.count).toBeDefined();
      expect(typeof responseData.data.count).toBe('number');
      expect(responseData.data.totalCount).toBeDefined();
      expect(typeof responseData.data.totalCount).toBe('number');
      expect(responseData.data.data).toBeDefined();
      expect(Array.isArray(responseData.data.data)).toBe(true);
      expect(responseData.data.data.length).toBeGreaterThan(0);
      expect(responseData.data.data[0].alertConfigurationHistoryId).toBeDefined();
      expect(typeof responseData.data.data[0].alertConfigurationHistoryId).toBe('number');
      expect(responseData.data.data[0].alertConfigurationId).toBeDefined();
      expect(typeof responseData.data.data[0].alertConfigurationId).toBe('number');
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

  describe('Test updating an Alert', () => {
    // * checking for alert not found error
    it('checking for alert not found error', async () => {
      const requestBody: UpdateAlertConfigurationDto = { reason: 'This is an update' };
      const responseData = await alertConfigurationService.updateAlertConfiguration(
        76475,
        requestBody,
        i18n,
        globalTester
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(404);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('alert-configuration.alertConfigurationNotFound');
    });

    // * checking for alert-configuration creation with sendEmail set to true
    it('checking for alert-configuration creation error with sendEmail set to true', async () => {
      const requestBody: UpdateAlertConfigurationDto = {
        reason: 'This is an update',
        sendEmail: true,
      };
      const data = await alertConfigurationService.updateAlertConfiguration(
        newAlertEntity.id,
        requestBody,
        i18n,
        globalTester
      );

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('alert-configuration.theListOfEmailAddressRecipientsIsRequired');
    });

    // * checking for alert-configuration creation with emailRecipientAddress is empty error
    it('checking for alert-configuration creation with emailRecipientAddress is empty error', async () => {
      const requestBody: UpdateAlertConfigurationDto = {
        reason: 'This is an update',
        sendEmail: true,
        emailAddressRecipients: [],
      };
      const data = await alertConfigurationService.updateAlertConfiguration(
        newAlertEntity.id,
        requestBody,
        i18n,
        globalTester
      );

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('alert-configuration.theListOfEmailAddressRecipientsCanNotBeEmpty');
    });

    // * checking for alert-configuration update with service not found error
    it('checking for alert-configuration update with service not found error', async () => {
      const requestBody: UpdateAlertConfigurationDto = {
        reason: 'This is an update',
        serviceId: 1000
      };
      const data = await alertConfigurationService.updateAlertConfiguration(
        newAlertEntity.id,
        requestBody,
        i18n,
        globalTester
      );

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('service.serviceNotFound');
    });

    // * checking for alert-configuration update with configuration already exists error
    it('checking for alert-configuration update with configuration already exists error', async () => {
      const requestBody: UpdateAlertConfigurationDto = {
        reason: 'This is an update',
        serviceId: serviceEntity.id,
      };
      const data = await alertConfigurationService.updateAlertConfiguration(
        newAlertEntity.id,
        requestBody,
        i18n,
        globalTester
      );

      expect(data.status).toBeDefined();
      expect(data.status).toBe(400);
      expect(data.message).toBeDefined();
      expect(data.message).toBe('alert-configuration.alertConfigurationAlreadyExists');
    });

    // * checking if alert-configuration update was successful
    it('checking if alert-configuration update was successful.', async () => {
      const requestBody: UpdateAlertConfigurationDto = {
        reason: 'This is an update',
        emailAddressRecipients: ['lise@gmail.com'],
      };

      const responseData = await alertConfigurationService.updateAlertConfiguration(
        alertConfigEntity.id,
        requestBody,
        i18n,
        globalTester
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(200);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('alert-configuration.alertConfigurationUpdatedSuccessfully');
      expect(responseData.data).toBeDefined();
      expect(responseData.data.id).toBeDefined();
      expect(typeof responseData.data.id).toBe('number');
      expect(responseData.data.createdBy).toBeDefined();
      expect(typeof responseData.data.createdBy).toBe('number');
      expect(responseData.data.sendEmail).toBeDefined();
      expect(typeof responseData.data.sendEmail).toBe('boolean');
      expect(responseData.data.sendSlackAlert).toBeDefined();
      expect(typeof responseData.data.sendSlackAlert).toBe('boolean');
      expect(responseData.data.serviceId).toBeDefined();
      expect(typeof responseData.data.serviceId).toBe('number');
      expect(responseData.data.emailAddressRecipients).toBeDefined();
      expect(typeof responseData.data.emailAddressRecipients).toBe('string');
      expect(responseData.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.createdAt))).toBe(false);
      expect(responseData.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.updatedAt))).toBe(false);
    });
  });
});
