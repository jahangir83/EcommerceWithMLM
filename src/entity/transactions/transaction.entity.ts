import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Wallet } from '../users/wallet.entity';
import { JournalEntry } from './journal.entity';
import {
  TransactionDirection,
  TransactionStatus,
} from '~/common/enums/common.enum';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { nullable: true })
  @JoinColumn({ name: 'walletId' })
  wallet?: Wallet;

  @Column({ type: 'varchar' })
  type: string; // purchase, withdrawal, commission, point_income

  @Column({ type: 'enum', enum: ['money', 'points'] })
  valueType: string;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column({ length: 10 }) currency: string;

  // convenience fields for frontend
  @Column({ type: 'enum', enum: TransactionDirection })
  direction: TransactionDirection;

  @Column({ nullable: true })
  relatedService?: string;

  @Column({ nullable: true })
  relatedEntityId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  // audit snapshot
  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  oldBalance?: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  newBalance?: number;

  @OneToMany(() => JournalEntry, (je) => je.transaction)
  journalEntries: JournalEntry[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
