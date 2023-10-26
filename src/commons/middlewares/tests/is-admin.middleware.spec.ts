import { CustomerRepository } from './../../../repositories/customer.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { IsAdminMiddleware } from '../is-admin.middleware';

describe('IsAdminMiddleware', () => {
  let middleware: IsAdminMiddleware;
  let customerRepository: CustomerRepository;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [IsAdminMiddleware, CustomerRepository],
    }).compile();

    middleware = moduleRef.get<IsAdminMiddleware>(IsAdminMiddleware);
    customerRepository = moduleRef.get<CustomerRepository>(CustomerRepository);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
    expect(customerRepository).toBeDefined();
  });
});
