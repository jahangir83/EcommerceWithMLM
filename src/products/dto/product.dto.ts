import { IsString, IsNumber, IsOptional, IsArray, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger"

export class CreateProductDto {
  @ApiProperty({
    description: "Product name",
    example: "iPhone 15 Pro",
  })
  @IsString()
  name: string

  @ApiProperty({
    description: "Product description",
    example: "Latest iPhone with advanced features",
  })
  @IsString()
  description: string

  @ApiProperty({
    description: "Product price",
    example: 999.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number

  @ApiProperty({
    description: "Available stock quantity",
    example: 50,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  stock: number

  @ApiProperty({
    description: "Category ID",
    example: 1,
  })
  @IsNumber()
  categoryId: number

  @ApiPropertyOptional({
    description: "Product images URLs",
    example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]

  @ApiPropertyOptional({
    description: "Product specifications",
    example: {
      weight: "174g",
      dimensions: "146.6 x 70.6 x 7.8 mm",
      color: "Space Black",
    },
  })
  @IsOptional()
  specifications?: Record<string, any>

  @ApiPropertyOptional({
    description: "Product tags for search",
    example: ["smartphone", "apple", "ios"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}


export class ProductFilterDto extends PartialType(CreateProductDto){}