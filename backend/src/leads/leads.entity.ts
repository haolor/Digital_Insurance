import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { LeadHistory } from '../lead-history/lead-history.entity';

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  WON = 'WON',
  LOST = 'LOST',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ length: 50, nullable: true })
  source!: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status!: LeadStatus;

  @ManyToOne(() => User, (user) => user.assignedLeads, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedTo!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => LeadHistory, (history) => history.lead)
  histories!: LeadHistory[];
}