import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { User } from '../../users/user.entity';

@Entity()
export class RevenueShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  receiver: User;

  @ManyToOne(() => OrderItem, { nullable: false })
  orderItem: OrderItem;

  @Column()
  level: number;

  @Column()
  amount: number;

  @Column({ default: false })
  isPaid: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
