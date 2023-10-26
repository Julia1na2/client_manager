import { CustomerRepository } from './../../../repositories/customer.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { IsUserMiddleware } from '../is-user.middleware';

describe('IsUserMiddleware', () => {
  let middleware: IsUserMiddleware;
  let customerRepository: CustomerRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [IsUserMiddleware, CustomerRepository],
    }).compile();

    middleware = moduleRef.get<IsUserMiddleware>(IsUserMiddleware);
    customerRepository = moduleRef.get<CustomerRepository>(CustomerRepository);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
    expect(customerRepository).toBeDefined();
  });
});
