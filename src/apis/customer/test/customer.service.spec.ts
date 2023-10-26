import { CustomerValidator } from './../customer.validator';
import { CustomerRepository } from './../../../repositories/customer.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryModule } from '../../../repositories/repository.module';
import { CustomerService } from '../customer.service';
import { CustomBoostrap } from '../../../config/boostrap.config';
import { Customer } from '../entities/customer.entity';
import { UpdateCustomerDto } from '../dtos/customer.dto';

describe('Testing CustomerService', () => {
  let customerService: CustomerService;
  let customerRepository: CustomerRepository;
  let customerValidator: CustomerValidator;
  let i18n: any = { t: (messageKey: string) => messageKey };
  let customerEntity: Customer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RepositoryModule],
      providers: [CustomerService, CustomerValidator],
    }).compile();

    customerService = module.get<CustomerService>(CustomerService);
    customerRepository = module.get<CustomerRepository>(CustomerRepository);
    customerValidator = module.get<CustomerValidator>(CustomerValidator);
  });

  beforeAll(async () => {
    await new CustomerRepository().resetCustomer();
    customerEntity = await CustomBoostrap.customer();
  });

  afterAll(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(customerService).toBeDefined();
    expect(customerRepository).toBeDefined();
    expect(customerValidator).toBeDefined();
  });

  describe('Test retrieving a single customer', () => {
    // * check for customer not found
    it('check for customer not found', async () => {
      const responseData = await customerService.findCustomer(723, i18n);

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(404);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('customer.customerNotFound');
    });

    // * checking if customer retrieval was successful
    it('checking if customer retrieval was successful.', async () => {
      const responseData = await customerService.findCustomer(customerEntity.id,i18n);

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(200);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('customer.customerRetrievedSuccessfully');
      expect(responseData.data).toBeDefined();
      expect(responseData.data.id).toBeDefined();
      expect(typeof responseData.data.id).toBe('number');
      expect(responseData.data.username).toBeDefined();
      expect(typeof responseData.data.username).toBe('string');
      expect(responseData.data.nellysCoinUserId).toBeDefined();
      expect(typeof responseData.data.nellysCoinUserId).toBe('number');
      expect(responseData.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.createdAt))).toBe(false);
      expect(responseData.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.updatedAt))).toBe(false);
    });
  });

  describe('Test retrieving customers', () => {
    // * checking if customers retrieval were successful
    it('checking if customers retrieval were successful.', async () => {
      const responseData = await customerService.findCustomers({}, i18n);

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(200);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('customer.customersRetrievedSuccessfully');
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
      expect(responseData.data.data[0].username).toBeDefined();
      expect(typeof responseData.data.data[0].username).toBe('string');
      expect(responseData.data.data[0].nellysCoinUserId).toBeDefined();
      expect(typeof responseData.data.data[0].nellysCoinUserId).toBe('number');
      expect(responseData.data.data[0].createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.data[0].createdAt))).toBe(false,);
      expect(responseData.data.data[0].updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.data[0].updatedAt))).toBe(false,
      );
    });
  });

  describe('Test updating a customer', () => {
    let newCustomerEntity: any = null;
    const newCustomerParams = {
      username: 'newPaul',
      nellysCoinUserId: 11,
      language: 'fr',
      emailAddress: 'paul@gmail.com',
      status: 'confirmed',
      type: 'client',
    };

    beforeAll(async () => {
      newCustomerEntity = await customerRepository.retrieveCustomer({ username: newCustomerParams.username });
      if (!newCustomerEntity) {
        newCustomerEntity = await customerRepository.saveCustomer(newCustomerParams);
      }
    });

    // * checking for customer not found error for nellysCoinUserId
    it('checking for customer not found error for nellysCoinUserId.', async () => {
      const requestBody: UpdateCustomerDto = {
        oldUsername: customerEntity.username,
        newUsername: 'rine',
      };
      const responseData = await customerService.updateCustomerByNellysCoinId(
        789779,
        requestBody,
        i18n,
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(404);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('customer.customerNotFound');
    });

    // * checking for customer not found error for oldUsername
    it('checking for customer not found error for oldUsername.', async () => {
      const requestBody: UpdateCustomerDto = {
        oldUsername: 'customerEntity.username',
        newUsername: 'rine',
      };
      const responseData = await customerService.updateCustomerByNellysCoinId(
        customerEntity.nellysCoinUserId,
        requestBody,
        i18n,
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(404);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('customer.customerNotFound');
    });

    // * checking for customer with existing username error
    it('checking for customer with existing username error.', async () => {
      const requestBody: UpdateCustomerDto = {
        oldUsername: customerEntity.username,
        newUsername: newCustomerEntity.username,
      };

      const responseData = await customerService.updateCustomerByNellysCoinId(
        customerEntity.nellysCoinUserId,
        requestBody,
        i18n,
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(400);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('customer.customerWithUsernameAlreadyExists');
    });

    // * checking if customer update was successful
    it('checking if customer update was successful.', async () => {
      const requestBody: UpdateCustomerDto = {
        oldUsername: customerEntity.username,
        newUsername: 'juliana',
      }
      const responseData = await customerService.updateCustomerByNellysCoinId(
        customerEntity.nellysCoinUserId,
        requestBody,
        i18n
      );

      expect(responseData.status).toBeDefined();
      expect(responseData.status).toBe(200);
      expect(responseData.message).toBeDefined();
      expect(responseData.message).toBe('customer.customerUpdatedSuccessfully');
      expect(responseData.data).toBeDefined();
      expect(responseData.data.id).toBeDefined();
      expect(typeof responseData.data.id).toBe('number')
      expect(responseData.data.username).toBeDefined();
      expect(typeof responseData.data.username).toBe('string')
      expect(responseData.data.emailAddress).toBeDefined();
      expect(typeof responseData.data.emailAddress).toBe('string')
      expect(responseData.data.status).toBeDefined();
      expect(typeof responseData.data.status).toBe('string');
      expect(responseData.data.type).toBeDefined();
      expect(typeof responseData.data.type).toBe('string');
      expect(responseData.data.createdAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.createdAt))).toBe(false);
      expect(responseData.data.updatedAt).toBeDefined();
      expect(Number.isNaN(Date.parse(responseData.data.updatedAt))).toBe(false);
    });
  });
});
