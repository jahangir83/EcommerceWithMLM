import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID, IsObject } from "class-validator"

export class CreateCategoryDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  image?: string

  @IsOptional()
  @IsString()
  icon?: string

  @IsOptional()
  @IsUUID()
  parentId?: string

  @IsOptional()
  @IsNumber()
  sortOrder?: number

  @IsOptional()
  @IsObject()
  seoData?: any
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  image?: string

  @IsOptional()
  @IsString()
  icon?: string

  @IsOptional()
  @IsUUID()
  parentId?: string

  @IsOptional()
  @IsNumber()
  sortOrder?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsObject()
  seoData?: any
}
