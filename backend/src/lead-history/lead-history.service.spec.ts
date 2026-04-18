import { Test, TestingModule } from '@nestjs/testing';
import { LeadHistoryService } from './lead-history.service';

describe('LeadHistoryService', () => {
  let service: LeadHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadHistoryService],
    }).compile();

    service = module.get<LeadHistoryService>(LeadHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
