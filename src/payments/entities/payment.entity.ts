import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, { nullable: false })
  order: Order;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column()
  amount: number;

  @Column({ nullable: true })
  method: string; // card, bkash, nagad, stripe

  @Column({ nullable: true })
  gatewayReference: string;

  @Column({ type: 'json', nullable: true })
  gatewayResponse: any;

  @CreateDateColumn()
  createdAt: Date;
}
