import { Test, TestingModule } from '@nestjs/testing';
import { LeadHistoryController } from './lead-history.controller';

describe('LeadHistoryController', () => {
  let controller: LeadHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadHistoryController],
    }).compile();

    controller = module.get<LeadHistoryController>(LeadHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
