import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lead } from '../leads/leads.entity';

@Entity('lead_history')
export class LeadHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Lead, (lead) => lead.histories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lead_id' })
  lead!: Lead;

  @Column({ length: 255 })
  action!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}