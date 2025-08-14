import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { User } from '../users/user.entity';

export interface PaymentInterface {
  id: string;
  user: User;
  amount: number;
  currency: string;
  method: string; // e.g., 'credit_card', 'paypal'
  status: string; // e.g., 'pending', 'completed', 'failed'
  gatewayReference:string; // Reference from payment gateway
  createdAt: Date;
  updatedAt: Date;
}

@Entity('payments')
export class Payment implements PaymentInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column({ length: 10 })
  currency: string;

  @Column({ length: 50 })
  method: string; // e.g., 'credit_card', 'paypal'

   @Column({ nullable: true })
  gatewayReference: string;

  @Column({ default: 'pending' }) status: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
