import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { WalletType } from '~/common/enums/common.enum';
import { Transaction } from '../transactions/transaction.entity';

@Entity('wallets')
@Unique(['user', 'walletType'])
export class Wallet {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'enum', enum: WalletType, default: WalletType.MONEY })
  walletType: WalletType;

  @Column({ nullable: true, default: 'BDT' }) currency: string;

  @ManyToOne(() => User, (user) => user.wallets) user: User;

  @OneToMany(() => Transaction, (t) => t.wallet) transactions: Transaction[];

  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
