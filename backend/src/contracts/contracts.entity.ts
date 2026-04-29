import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Order } from '../orders/orders.entity';

export enum ContractStatus {
  PENDING = 'PENDING',
  OTP_SENT = 'OTP_SENT',
  VERIFIED = 'VERIFIED',
  SIGNED = 'SIGNED',
  LOCKED = 'LOCKED',
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.contracts, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'contract_code', unique: true, length: 50 })
  contractCode!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.PENDING,
  })
  status!: ContractStatus;

  @Column({ name: 'signed_at', type: 'timestamp', nullable: true })
  signedAt!: Date;

  @Column({ name: 'failed_verify_attempts', default: 0 })
  failedVerifyAttempts!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}