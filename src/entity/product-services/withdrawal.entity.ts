import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export interface WithdrawalInterface {
  id: string;
  user: User;
  amount: number;
  currency: string;
  status: string; // e.g., 'pending', 'completed', 'failed'
  createdAt: Date;
  updatedAt: Date;
}

@Entity('withdrawals')
export class Withdrawal implements WithdrawalInterface {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'userId' }) user: User;
  @Column('decimal', { precision: 18, scale: 2 }) amount: number;
  @Column({ length: 10 }) currency: string;
  @Column({ default: 'pending' }) status: string;
  @Column({ nullable: true }) method?: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
