import { IsUUID, IsNumber, Min, IsOptional, IsString } from "class-validator";

/**
 * DTO for creating a new JournalEntry.
 */
export class CreateJournalEntryDto {
  @IsUUID('4', { message: 'transactionId must be a valid UUID' })
  transactionId: string;

  @IsUUID('4', { message: 'accountId must be a valid UUID' })
  accountId: string;

  @IsNumber({}, { message: 'debit must be a number' })
  @Min(0, { message: 'debit cannot be negative' })
  debit: number;

  @IsNumber({}, { message: 'credit must be a number' })
  @Min(0, { message: 'credit cannot be negative' })
  credit: number;

  @IsString({ message: 'currency must be a string' })
  currency: string;
}

/**
 * DTO for updating an existing JournalEntry.
 */
export class UpdateJournalEntryDto {
  // Not common to update a journal entry, but here's a placeholder.
  // The 'updatedAt' field will be handled by TypeORM's decorator.
  @IsOptional()
  @IsNumber({}, { message: 'debit must be a number' })
  @Min(0, { message: 'debit cannot be negative' })
  debit?: number;

  @IsOptional()
  @IsNumber({}, { message: 'credit must be a number' })
  @Min(0, { message: 'credit cannot be negative' })
  credit?: number;
}
