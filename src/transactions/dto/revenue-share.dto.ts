import { IsUUID, IsNumber, Min, IsOptional, IsString } from "class-validator";
import { RevenueShareInterface, TransactionInterface } from "~/common/types/transaction.type";



type RevenueShareDto = Omit<RevenueShareInterface, 'id' | 'createdAt' | 'updatedAt' | 'status'> ;

/**
 * DTO for creating a new RevenueShare.
 */
export class CreateRevenueShareDto implements RevenueShareDto {
    @IsUUID('4', { message: 'transactionId must be a valid UUID' })
    transactionId: string;

    @IsUUID('4', { message: 'recipientUserId must be a valid UUID' })
    recipientUserId: string;

    @IsNumber({}, { message: 'generationLevel must be a number' })
    @Min(0, { message: 'generationLevel cannot be negative' })
    generationLevel: number;

    @IsNumber({}, { message: 'amount must be a number' })
    @Min(0, { message: 'amount cannot be negative' })
    amount: number;
}

/**
 * DTO for updating an existing RevenueShare.
 */
export class UpdateRevenueShareDto {
    @IsOptional()
    @IsString({ message: 'status must be a string' })
    status?: string;
}
