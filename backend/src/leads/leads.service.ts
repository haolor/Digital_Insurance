import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Lead, LeadStatus } from './leads.entity';
import { CreateLeadDto, UpdateLeadDto } from './leads.dto';
import { LeadHistoryService } from '../lead-history/lead-history.service';
import { UsersService } from '../users/users.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadsRepository: Repository<Lead>,
    private readonly historyService: LeadHistoryService,
    private readonly usersService: UsersService,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const { assignedToId, ...rest } = createLeadDto;
    const lead = this.leadsRepository.create({
      ...rest,
      status: LeadStatus.NEW,
    });

    if (assignedToId) {
      lead.assignedTo = { id: assignedToId } as any;
    }

    const savedLead = await this.leadsRepository.save(lead);
    
    let action = 'Lead created';
    if (assignedToId) action = `Lead created and assigned to user ${assignedToId}`;
    
    await this.historyService.log(savedLead, action);
    return savedLead;
  }

  async findAll(): Promise<Lead[]> {
    return this.leadsRepository.find({ relations: ['assignedTo', 'histories'] });
  }

  async findOne(id: number): Promise<Lead> {
    const lead = await this.leadsRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'histories'],
    });
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    return lead;
  }

  async update(id: number, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);
    const { assignedToId, ...rest } = updateLeadDto;

    if (assignedToId) {
      lead.assignedTo = { id: assignedToId } as any;
    }

    Object.assign(lead, rest);
    const updatedLead = await this.leadsRepository.save(lead);
    
    let action = 'Lead updated';
    if (rest.status) action = `Status changed to ${rest.status}`;
    if (assignedToId) action = `Lead assigned to user ${assignedToId}`;
    
    await this.historyService.log(updatedLead, action);
    return updatedLead;
  }

  async remove(id: number): Promise<void> {
    const lead = await this.findOne(id);
    await this.leadsRepository.remove(lead);
  }

  async findUnassigned(): Promise<Lead[]> {
    return this.leadsRepository.find({
      where: { assignedTo: IsNull() },
    });
  }

  async convertToUser(id: number): Promise<any> {
    const lead = await this.findOne(id);
    if (lead.status === LeadStatus.WON) {
      throw new Error('Lead is already converted');
    }

    if (!lead.email) {
      throw new Error('Lead must have an email to be converted to user');
    }
    const defaultPassword = 'InitialPassword123!';
    const user = await this.usersService.createUser({
      name: lead.name,
      email: lead.email,
      password: defaultPassword, 
      role: 'CUSTOMER' as any,
    });
    lead.status = LeadStatus.WON;
    await this.leadsRepository.save(lead);
    await this.historyService.log(lead, `Lead converted to User: ${user.email}`);
    this.logger.log(`[Email Service] Welcome email sent to ${user.email} with temporary credentials.`);
    console.log(`[Email Service] Welcome email sent to ${user.email} with temporary credentials.`);

    return { user, lead, defaultPassword };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleAutoAssign() {
    this.logger.log('Running auto-assign leads cronjob...');
    const unassignedLeads = await this.findUnassigned();
    if (unassignedLeads.length === 0) return;

    const salesStaff = await this.usersService.findSalesStaff();
    if (salesStaff.length === 0) {
      this.logger.warn('No sales staff found for lead assignment');
      return;
    }

    for (const lead of unassignedLeads) {
      // Simple round-robin or random assignment
      const staff = salesStaff[Math.floor(Math.random() * salesStaff.length)];
      lead.assignedTo = staff;
      await this.leadsRepository.save(lead);
      await this.historyService.log(lead, `Lead auto-assigned to ${staff.name}`);
      this.logger.log(`Lead #${lead.id} auto-assigned to ${staff.name}`);
    }
  }
}
