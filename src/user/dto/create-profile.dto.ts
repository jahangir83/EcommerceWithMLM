import { IsNotEmpty, IsObject, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address of the user' })
  @IsString()
  email: string;

  @ApiPropertyOptional({ example: 'Mr. Doe', description: 'Father’s name' })
  @IsOptional()
  @IsString({ message: 'Father name must be a valid string.' })
  fatherName?: string;

  @ApiPropertyOptional({ example: 'Mrs. Doe', description: 'Mother’s name' })
  @IsOptional()
  @IsString({ message: 'Mother name must be a valid string.' })
  motherName?: string;

  @ApiPropertyOptional({ example: '1995-08-21', description: 'Birth date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'Birth date must be a valid date string (YYYY-MM-DD).' })
  birthDate?: Date;

  @ApiPropertyOptional({ example: 'male', enum: ['male', 'female', 'other'], description: 'Gender' })
  @IsOptional()
  @IsString({ message: 'Gender must be one of: male, female, other.' })
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({ example: 'Islam', description: 'Religion of the user' })
  @IsOptional()
  @IsString({ message: 'Religion must be a valid string.' })
  religion?: string;

  @ApiPropertyOptional({ example: 'single', enum: ['single', 'married', 'divorced'], description: 'Marital status' })
  @IsOptional()
  @IsString({ message: 'Marital status must be one of: single, married, divorced.' })
  maritalStatus?: 'single' | 'married' | 'divorced';

  @ApiPropertyOptional({ example: '1995123456789', description: 'National ID number' })
  @IsOptional()
  @IsString({ message: 'National ID must be a valid string.' })
  nationalId?: string;

  @ApiPropertyOptional({ example: '23.8103, 90.4125', description: 'Geographical location (lat, long)' })
  @IsOptional()
  @IsString({ message: 'Geo location must be a valid string.' })
  geoLocation?: string;

  @ApiPropertyOptional({ example: 'Dhaka', description: 'Division' })
  @IsOptional()
  @IsString()
  division?: string;

  @ApiPropertyOptional({ example: 'Dhaka', description: 'District' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'Savar', description: 'Upazila' })
  @IsOptional()
  @IsString()
  upazila?: string;

  @ApiPropertyOptional({ example: 'Ashulia', description: 'Union' })
  @IsOptional()
  @IsString()
  union?: string;

  @ApiPropertyOptional({ example: 'Boro Bari', description: 'Village' })
  @IsOptional()
  @IsString()
  village?: string;

  @ApiPropertyOptional({ example: 'Ashulia Post Office', description: 'Post office' })
  @IsOptional()
  @IsString()
  postOffice?: string;

  @ApiPropertyOptional({ example: 'Mirpur Road', description: 'Road' })
  @IsOptional()
  @IsString()
  road?: string;

  @ApiPropertyOptional({ example: 'House 12/A', description: 'House number' })
  @IsOptional()
  @IsString()
  houseNo?: string;

  @ApiPropertyOptional({ example: '1207', description: 'Postal code' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({
    example: 'Extra information in JSON format',
    type:"array"
  })
  @IsOptional()
  @IsString()
  extraInfo?: JSON;

  @ApiPropertyOptional({ example: 'nid-front.png', description: 'Front side of NID (image path or URL)' })
  @IsOptional()
  @IsString()
  nidFront: string;

  @ApiPropertyOptional({ example: 'nid-back.png', description: 'Back side of NID (image path or URL)' })
  @IsOptional()
  @IsString()
  nidBack: string;

  @ApiPropertyOptional({ example: 'O+', description: 'Blood group' })
  @IsOptional()
  @IsString()
  blood: string;

  @ApiPropertyOptional({ example: '23.8103, 90.4125', description: 'Geolocation string' })
  @IsOptional()
  @IsString()
  geolocation: string;

  @ApiPropertyOptional({ example: 'profile.jpg', description: 'Profile photo (path or URL)' })
  @IsOptional()
  @IsString()
  profilePhoto?: string;
}
