import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { User } from '../users/user.entity';
import { OrderItem } from '../product-services';

@Entity('revenue_shares')
export class RevenueShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipientUserId' })
  recipientUser: User;

  @Column('int')
  generationLevel: number;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column({ default: 'pending' })
  status: string;
  
  @ManyToOne(() => OrderItem)
  orderItem: OrderItem;

  @CreateDateColumn() createdAt: Date;
}
