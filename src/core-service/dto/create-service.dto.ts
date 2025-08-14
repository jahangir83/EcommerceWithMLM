import { IsString, IsNumberString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { UserStatus } from '~/common/enums/common.enum';

export class CreateServiceDto {
    @IsNumberString()
    price: string;

    @IsString()
    serviceName: string;

    @IsString()
    serviceType: string;

    @IsEnum(UserStatus)
    serviceStatus: UserStatus;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string;

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
