// src/modules/courses/dto/create-course.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional, IsString, ValidateNested, IsArray, IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { UserStatus } from "~/common/enums/common.enum";
import { generationPriceInterface } from "~/common/types/services.type";
import { PartialType } from "@nestjs/mapped-types";

class GenerationPriceDto implements generationPriceInterface {
  @ApiProperty()
  @IsNumber()
  generation: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsString()
  content: string;
}

export class CreateServiceDto {
  @ApiProperty()
  @IsString()
  price: string;

  @ApiProperty()
  @IsString()
  serviceName: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty({ enum: UserStatus, default: UserStatus.ADVANCED_ASSOCIATE })
  @IsEnum(UserStatus)
  serviceStatus: UserStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ type: [GenerationPriceDto], required: false })
  //   @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GenerationPriceDto)
  generationPrice: GenerationPriceDto[];

  @ApiProperty({ default: false })
  @IsBoolean()
  isGenerationPriceActive: boolean;
}



export class CreateUddoktaDto extends CreateServiceDto {
  // Additional properties specific to Uddokta can be added here
}

export class CreateCourseDto extends CreateServiceDto {
  // Additional properties specific to Course can be added here
}

export class CreateSubscriptionDto extends CreateServiceDto {
  // Additional properties specific to Subscription can be added here
}

export class UpdateServiceDto extends CreateServiceDto {
  @IsOptional()
  @IsString()
  id?: string; // ID of the service to update
}

export class UpdateUddoktaDto extends PartialType(UpdateServiceDto) { }

export class UpdateCourseDto extends PartialType(UpdateServiceDto) { }

export class UpdateSubscriptionDto extends PartialType(UpdateServiceDto) { }