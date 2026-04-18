import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadHistoryController } from './lead-history.controller';
import { LeadHistoryService } from './lead-history.service';
import { LeadHistory } from './lead-history.entity';


@Module({
  imports: [TypeOrmModule.forFeature([LeadHistory])],
  controllers: [LeadHistoryController],
  providers: [LeadHistoryService]
})
export class LeadHistoryModule {}
