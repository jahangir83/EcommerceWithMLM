import { IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { OrderStatus, PaymentMethod } from "~/entity"

export class OrderItemDto {
  @IsUUID()
  productId: string

  @IsNumber()
  @Min(1)
  quantity: number
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod

  @IsOptional()
  @IsObject()
  shippingAddress?: any

  @IsOptional()
  @IsObject()
  billingAddress?: any

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingAmount?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number

  @IsOptional()
  @IsString()
  couponCode?: string
}

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @IsOptional()
  @IsString()
  trackingNumber?: string

  @IsOptional()
  @IsObject()
  shippingAddress?: any

  @IsOptional()
  @IsObject()
  billingAddress?: any

  @IsOptional()
  @IsString()
  notes?: string
}

export class OrderFilterDto {
  @IsOptional()
  @IsNumber()
  page?: number

  @IsOptional()
  @IsNumber()
  limit?: number

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

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
