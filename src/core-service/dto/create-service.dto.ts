import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumberString, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { UserStatus } from '~/common/enums/common.enum';

export class CreateServiceDto {
    @ApiProperty({ example: 'Subcription or Uddokta or Course', description: 'Name of the  service name' })
    @IsString()
    @IsString()
    serviceName: string;

    @ApiProperty({ example: 29.99, description: 'Price of the subscription' })
    @IsNumber()
    @IsNumberString()
    price: string;

    @ApiProperty({ example: 'monthly', description: 'Billing type or cycle' })
    @IsString()
    @IsString()
    type: string;

    @ApiProperty({ enum: UserStatus, default: UserStatus.ADVANCED_ACCESS_USER })
    @IsEnum(UserStatus)
    @IsEnum(UserStatus)
    serviceStatus: UserStatus;

    @ApiProperty({ example: 'Access to all premium features', required: false })
    @IsOptional()
    @IsString()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 'https://example.com/image.png', required: false })
    @IsOptional()
    @IsString()
    @IsOptional()
    @IsString()
    image?: string;


    @ApiProperty({ default: true })
    @IsOptional()
    @IsBoolean()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}


export class CreateUddoktaDto extends CreateServiceDto {
    // Additional properties specific to Uddokta can be added here
}

export class CreateCourseDto extends CreateServiceDto {
    // Additional properties specific to Course can be added here
}

export class CreateSubscriptionDto extends CreateServiceDto {
    // Additional properties specific to Subscription can be added here
}

export class UpdateServiceDto extends CreateServiceDto {
    @IsOptional()
    @IsString()
    id?: string; // ID of the service to update
}

export class UpdateUddoktaDto extends UpdateServiceDto {

}

export class UpdateCourseDto extends UpdateServiceDto {

}

export class UpdateSubscriptionDto extends UpdateServiceDto {

}
