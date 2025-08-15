import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '~/entity';

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCESS = "success",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  CAPTURED = 'captured'
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, { nullable: false })
  order: Order;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column()
  amount: number;

  @Column({ nullable: true })
  method: string; // card, bkash, nagad, stripe

    @Column({ length: 10 })
  currency: string;

  @Column({ nullable: true })
  gatewayReference: string;

  @Column({ type: 'json', nullable: true })
  gatewayResponse: any;

  @Column({type:"jsonb", nullable: true})
  metadata:any

 @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
