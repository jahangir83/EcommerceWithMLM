import { IsEmail, IsString, MinLength, IsPhoneNumber, IsOptional } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class RegisterDto {
  
  @ApiProperty({
    type:"string",
    required:true,
  })
  @IsString()
  username:string

  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
    format: "email",
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: "User password",
    example: "password123",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty({
    description: "User phone number",
    example: "+8801631551301",
  })
  @IsPhoneNumber()
  phone: string

  @IsOptional()
  @IsString()
  avater:string

  @ApiPropertyOptional({
    description: "Referral code from existing user",
    example: "REF123456",
  })
  @IsOptional()
  @IsString()
  referralCode?: string
}


