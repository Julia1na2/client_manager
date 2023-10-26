import { Test, TestingModule } from '@nestjs/testing';
import { ChangeLanguageMiddleware } from '../change-language.middleware';

describe('ChangeLanguageMiddleware', () => {
  let middleware: ChangeLanguageMiddleware;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [ChangeLanguageMiddleware],
    }).compile();

    middleware = moduleRef.get<ChangeLanguageMiddleware>(ChangeLanguageMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });
});
