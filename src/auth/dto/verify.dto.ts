import { IsEnum, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { VerifyType } from "~/entity/users/verify.entity";

export class VerifyRequestDto {
  @ApiProperty({
    enum: VerifyType,
    description: "Type of verification (EMAIL, PHONE, PAYMENT, etc.)",
    example: VerifyType.PHONE,
  })
  @IsEnum(VerifyType)
  type: VerifyType;

  @ApiProperty({
    description: "Value to verify (email, phone number, or paymentId)",
    example: "+1234567890",
  })
  @IsNotEmpty()
  value: string;
}

export class VerifyConfirmDto {
  @ApiProperty({
    enum: VerifyType,
    description: "Type of verification",
    example: VerifyType.EMAIL,
  })
  @IsEnum(VerifyType)
  type: VerifyType;

  @ApiProperty({
    description: "Value to verify (email, phone, or paymentId)",
    example: "test@example.com",
  })
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: "Verification code received by the user",
    example: "123456",
  })
  @IsNotEmpty()
  code: string;
}
