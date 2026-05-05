import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LeadHistoryService } from './lead-history.service';

@Controller('lead-history')
export class LeadHistoryController {
  constructor(private readonly historyService: LeadHistoryService) {}

  @Get(':leadId')
  findByLead(@Param('leadId', ParseIntPipe) leadId: number) {
    return this.historyService.findByLead(leadId);
  }
}
