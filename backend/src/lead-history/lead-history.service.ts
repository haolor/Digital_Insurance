import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadHistory } from './lead-history.entity';
import { Lead } from '../leads/leads.entity';

@Injectable()
export class LeadHistoryService {
  constructor(
    @InjectRepository(LeadHistory)
    private readonly historyRepository: Repository<LeadHistory>,
  ) {}

  async log(lead: Lead, action: string): Promise<LeadHistory> {
    const history = this.historyRepository.create({
      lead,
      action,
    });
    return this.historyRepository.save(history);
  }

  async findByLead(leadId: number): Promise<LeadHistory[]> {
    return this.historyRepository.find({
      where: { lead: { id: leadId } },
      order: { createdAt: 'DESC' },
    });
  }
}
