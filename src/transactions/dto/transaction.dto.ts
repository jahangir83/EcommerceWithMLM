import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import {
  TransactionDirection,
  TransactionStatus,
  TransactionType,
  ValueType,
} from '~/common/enums/common.enum';
import {
  JournalEntryInterface,
  TransactionInterface,
} from '~/common/types/transaction.type';

type TransactionDto = Omit<
  TransactionInterface,
  'id' | 'createdAt' | 'updatedAt' | 'journalEntries'
>;

type JournalEntryDto = Omit<
  JournalEntryInterface,
  'id' | 'createdAt' | 'updatedAt' | 'transaction' | 'wallet'
> & {
  walletId: string; // Assuming walletId is a string
};

/**
 * DTO for creating a new Transaction.
 */
export class CreateTransactionDto implements TransactionDto {
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;

  @IsEnum(TransactionType, { message: 'Invalid transaction type' })
  type: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus, { message: 'Invalid transaction status' })
  status: TransactionStatus;

  @IsEnum(ValueType, { message: 'Invalid value type' })
  valueType: ValueType;

  //currency is required for all transactions
  @IsString({ message: 'currency must be a string' })
  currency: string;

  @IsEnum(TransactionDirection, {
    message: 'direction must be either credit or debit',
  })
  direction: TransactionDirection;

  @IsOptional()
  @IsString({ message: 'relatedService must be a string' })
  relatedService?: string;

  //journal entries are optional but can be included
  @IsOptional()
  @IsObject({ message: 'journalEntries must be a valid object' })
  journalEntries?: JournalEntryDto[] | undefined;

  @IsOptional()
  @IsString({ message: 'relatedEntityId must be a string' })
  relatedEntityId?: string;

  @IsNumber({}, { message: 'amount must be a number' })
  @Min(0, { message: 'amount cannot be negative' })
  amount: number;

  @IsOptional()
  @IsObject({ message: 'metadata must be a valid object' })
  metadata?: object;

  // Optional fields for old and new balance
  @IsOptional()
  @IsNumber({}, { message: 'oldBalance must be a number' })
  oldBalance: number;

  @IsOptional()
  @IsNumber({}, { message: 'newBalance must be a number' })
  newBalance: number;
}

/**
 * DTO for updating an existing Transaction.
 */
export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(TransactionStatus, { message: 'Invalid transaction status' })
  status?: TransactionStatus;
}

// export class CreateJournalEntryDto {
//   accountId!: string;
//   debit?: number;
//   credit?: number;
//   currency!: string;
// }

// export class CreateTransactionDto {
//   userId?: string;
//   walletId?: string;
//   type!: string;
//   valueType!: string;
//   amount!: number;
//   currency!: string;
//   direction!: string;
//   relatedService?: string;
//   relatedEntityId?: string;
//   metadata?: any;
//   journalEntries?: CreateJournalEntryDto[];
//   oldBalance?: number;
//   newBalance?: number;
// }

// export class CreateOrderDto {
//   productId!: string;
//   quantity!: number;
//   totalAmount!: number;
//   currency?: string;
// }
