import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { VerifyType } from "~/entity/users/verify.entity";

export class VerifyRequestDto {
  @IsEnum(VerifyType)
  type: VerifyType; // EMAIL, PHONE, PAYMENT, etc.

  @IsNotEmpty()
  value: string; // email, phone, paymentId
}

export class VerifyConfirmDto {
  @IsEnum(VerifyType)
  type: VerifyType;

  @IsNotEmpty()
  value: string;

  @IsNotEmpty()
  code: string;
}
