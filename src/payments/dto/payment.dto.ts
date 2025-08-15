import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, IsObject, Min } from "class-validator"
import { PaymentStatus } from "../entities/payment.entity"


export class CreatePaymentDto {
  @IsUUID()
  orderId: string

  @IsNumber()
  @Min(0)
  amount: number

  @IsOptional()
  @IsString()
  currency?: string

  @IsString()
  method: string

  @IsOptional()
  @IsString()
  gatewayReference?: string

  @IsOptional()
  @IsObject()
  metadata?: any
}

export class PaymentFilterDto {
  @IsOptional()
  @IsNumber()
  page?: number

  @IsOptional()
  @IsNumber()
  limit?: number

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus

  @IsOptional()
  @IsString()
  method?: string

  @IsOptional()
  @IsString()
  startDate?: string

  @IsOptional()
  @IsString()
  endDate?: string

  @IsOptional()
  @IsString()
  sortBy?: string

  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC"
}
