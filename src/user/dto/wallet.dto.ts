import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { WalletType } from "~/common/enums/common.enum";



export class CreateWalletDto {
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;

  @IsNumber({}, { message: 'balance must be a number' })
  @Min(0, { message: 'balance cannot be negative' })
  balance: number;

  @IsEnum(WalletType, { message: 'Invalid walletType' })
  walletType: WalletType;

  @IsString({ message: 'currency must be a string' })
  currency: string;
}


export class UpdateWalletDto {
  @IsOptional()
  @IsNumber({}, { message: 'balance must be a number' })
  @Min(0, { message: 'balance cannot be negative' })
  balance?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}
