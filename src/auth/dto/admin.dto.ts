import { IsString, IsEmail, IsPhoneNumber, MinLength, IsOptional, IsEnum } from "class-validator";
import { UserRole } from "~/common/enums/role.enum";



export class CreateAdminDto{
    @IsString()
      username: string;
    
      @IsEmail()
      email: string;
    
      @IsPhoneNumber('BD') // Replace 'BD' with your country code or remove it for general validation
      phone: string;
    
      @MinLength(6)
      password: string;
    
      @IsOptional()
      @IsString()
      referralCode?: string;
    
      @IsOptional()
      @IsString()
      avatar?: string;

      @IsString({message:"You request is invalid"})
      secret: string;

      @IsEnum(UserRole, {message:"You request is invalid"})
      role: UserRole;
}
