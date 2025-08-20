import { IsNotEmpty, IsObject, IsOptional, IsString, IsDateString } from 'class-validator';
import { ProfileInterface } from 'src/common/types/user.type';

/**
 * DTO for creating a user profile.
 * This class defines the structure of the data required to create a new user profile.
 */

type CreateProfileDtoInterface = Omit<
  ProfileInterface,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

export class CreateProfileDto implements CreateProfileDtoInterface {

  @IsString()
  fullName: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString({ message: 'Father name must be a valid string.' })
  fatherName?: string;

  @IsOptional()
  @IsString({ message: 'Mother name must be a valid string.' })
  motherName?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Birth date must be a valid date string (YYYY-MM-DD).' })
  birthDate?: Date;

  @IsOptional()
  @IsString({ message: 'Gender must be one of: male, female, other.' })
  gender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsString({ message: 'Religion must be a valid string.' })
  religion?: string;

  @IsOptional()
  @IsString({ message: 'Marital status must be one of: single, married, divorced.' })
  maritalStatus?: 'single' | 'married' | 'divorced';

  @IsOptional()
  @IsString({ message: 'National ID must be a valid string.' })
  nationalId?: string;

  @IsOptional()
  @IsString({ message: 'Geo location must be a valid string.' })
  geoLocation?: string;

  @IsOptional()
  @IsString({ message: 'Division must be a valid string.' })
  division?: string;

  @IsOptional()
  @IsString({ message: 'District must be a valid string.' })
  district?: string;

  @IsOptional()
  @IsString({ message: 'Upazila must be a valid string.' })
  upazila?: string;

  @IsOptional()
  @IsString({ message: 'Union must be a valid string.' })
  union?: string;

  @IsOptional()
  @IsString({ message: 'Village must be a valid string.' })
  village?: string;

  @IsOptional()
  @IsString({ message: 'Post office must be a valid string.' })
  postOffice?: string;

  @IsOptional()
  @IsString({ message: 'Road must be a valid string.' })
  road?: string;

  @IsOptional()
  @IsString({ message: 'House number must be a valid string.' })
  houseNo?: string;

  @IsOptional()
  @IsString({ message: 'Postal code must be a valid string.' })
  postalCode?: string;

  @IsOptional()
  @IsObject({ message: 'Extra info must be a valid JSON object.' })
  extraInfo?: JSON;

  @IsOptional()
  @IsString()
  nidFront: string;

  @IsOptional()
  @IsString()
  nidBack: string;

  @IsOptional() @IsString() profilePhoto?: string;
}
