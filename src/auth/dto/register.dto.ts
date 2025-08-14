import { IsEmail, IsString, MinLength, IsPhoneNumber, IsOptional } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class RegisterDto {
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
    example: "+1234567890",
  })
  @IsPhoneNumber()
  phone: string

  @ApiProperty({
    description: "User first name",
    example: "John",
  })
  @IsString()
  firstName: string

  @ApiProperty({
    description: "User last name",
    example: "Doe",
  })
  @IsString()
  lastName: string

  @ApiPropertyOptional({
    description: "Referral code from existing user",
    example: "REF123456",
  })
  @IsOptional()
  @IsString()
  referralCode?: string
}
