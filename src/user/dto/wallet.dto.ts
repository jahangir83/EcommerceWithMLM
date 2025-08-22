import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator"
import { WalletType } from "~/common/enums/common.enum"

export class CreateWalletDto {
  @ApiProperty({
    description: "The UUID of the user who owns this wallet",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsUUID("4", { message: "userId must be a valid UUID" })
  userId: string

  @ApiProperty({
    description: "Initial balance of the wallet (cannot be negative)",
    example: 1000,
    minimum: 0,
  })
  @IsNumber({}, { message: "balance must be a number" })
  @Min(0, { message: "balance cannot be negative" })
  balance: number

  @ApiProperty({
    description: "Type of wallet",
    enum: WalletType,
    example: WalletType.MONEY, // Replace with one of your enum values
  })
  @IsEnum(WalletType, { message: "Invalid walletType" })
  walletType: WalletType

  @ApiProperty({
    description: "Currency type of the wallet",
    example: "USD",
  })
  @IsString({ message: "currency must be a string" })
  currency: string
}

export class UpdateWalletDto {
  @ApiPropertyOptional({
    description: "Updated wallet balance (cannot be negative)",
    example: 5000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: "balance must be a number" })
  @Min(0, { message: "balance cannot be negative" })
  balance?: number

  @ApiPropertyOptional({
    description: "Indicates if the wallet is active",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "isActive must be a boolean" })
  isActive?: boolean
}
