import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class LoginDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
    format: "email",
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({
    type:'string',
    description:"User phone number with country code required",
    required:true,
    example:"+8801631551301"
  })
  @IsString()
  phone:string

  @ApiProperty({
    description: "User password",
    example: "password123",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string
}
