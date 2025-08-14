import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Wallet } from '../users/wallet.entity';

@Entity('account_balances')
export class AccountBalance {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'accountId' })
  account: Wallet;

  @Column('decimal', { precision: 18, scale: 2, default: 0 }) balance: number;
  @Column({ length: 10 }) currency: string;
  @UpdateDateColumn() updatedAt: Date;
}
