import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Wallet } from '../users/wallet.entity';

@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Transaction, (tx) => tx.journalEntries)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  // we use Wallet as the account for simplicity (could be system accounts)
  @ManyToOne(() => Wallet, { nullable: false })
  @JoinColumn({ name: 'accountId' })
  account: Wallet;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  debit: number;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  credit: number;

  @Column({ length: 10 }) currency: string;
  @CreateDateColumn() createdAt: Date;
}
