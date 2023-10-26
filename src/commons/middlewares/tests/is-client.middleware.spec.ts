import { ClientRepository } from '../../../repositories/client.repository';
import { IsClientMiddleware } from '../is-client.middleware';
import { Test, TestingModule } from '@nestjs/testing';

describe('IsClientMiddleware', () => {
  let middleware: IsClientMiddleware;
  let clientRepository: ClientRepository;
  
  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [IsClientMiddleware, ClientRepository],
    }).compile();

    middleware = moduleRef.get<IsClientMiddleware>(IsClientMiddleware);
    clientRepository = moduleRef.get<ClientRepository>(ClientRepository);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
    expect(clientRepository).toBeDefined();
  });
});
