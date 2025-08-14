import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ProfileInterface, UserInterface } from 'src/common/types/user.type';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * DTO for creating a user profile.
 * This class defines the structure of the data required to create a new user profile.
 */

type CreateProfileDtoInterface = Omit<ProfileInterface, 'id' | 'userId'>;

export class CreateProfileDto implements CreateProfileDtoInterface {
  createdAt: Date;
  updatedAt: Date;
  user?: UserInterface | undefined;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  fatherName?: string;

  @IsOptional()
  @IsString()
  motherName?: string;

  @IsOptional()
  birthDate?: Date;

  @IsOptional()
  @IsString()
  gender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsString()
  maritalStatus?: 'single' | 'married' | 'divorced';

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  geoLocation?: string;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  upazila?: string;

  @IsOptional()
  @IsString()
  union?: string;

  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsString()
  postOffice?: string;

  @IsOptional()
  @IsString()
  road?: string;

  @IsOptional()
  @IsString()
  houseNo?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsObject()
  extraInfo?: JSON;


}
