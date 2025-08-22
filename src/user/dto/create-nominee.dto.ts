// dto/create-nominee.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';

export class CreateNomineeDto {
  @ApiProperty({ example: '017XXXXXXXX', description: 'Nominee phone number' })
  @IsNotEmpty()
  @Matches(/^01[3-9][0-9]{8}$/, { message: 'Phone must be a valid Bangladeshi number' })
  phone: string;

  @ApiProperty({ example: '1995123456789', description: 'NID Number' })
  @IsNotEmpty()
  @IsString()
  nidNumber: string;

  @ApiProperty({ example: 'Brother', description: 'Relation with the user' })
  @IsNotEmpty()
  @IsString()
  relation: string;

  @ApiProperty({ example: 'uuid-of-user', description: 'User ID of nominee owner' })
  @IsUUID()
  userId: string;
}



export class UpdateNomineeDto extends PartialType(CreateNomineeDto) {}