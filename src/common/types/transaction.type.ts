import { User } from '~/entity';
import {
  TransactionDirection,
  TransactionStatus,
  TransactionType,
  ValueType,
} from '../enums/common.enum';
import { WalletInterface } from './user.type';
import { Wallet } from '~/entity/users';
import { Transaction } from '~/entity/transactions/transaction.entity';

export interface TransactionInterface {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  valueType: ValueType;
  relatedService?: string;
  relatedEntityId?: string;
  amount: number;
  currency: string;
  direction: TransactionDirection;
  metadata?: object;
  user?: User; // Reference to User entity
  journalEntries?: JournalEntryInterface[]; // Reference to JournalEntry entities

  oldBalance: number; // Optional field for old balance
  newBalance: number; // Optional field for new balance

  createdAt: Date;
  updatedAt: Date;
}

// Interface for the RevenueShare entity
export interface RevenueShareInterface {
  id: string;
  generationLevel: number;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the JournalEntry entity
export interface JournalEntryInterface {
  id: string;
  transaction: Transaction; // Reference to Transaction entity
  wallet: Wallet; // Reference to Wallet entity\
  debit: number;
  credit: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}
