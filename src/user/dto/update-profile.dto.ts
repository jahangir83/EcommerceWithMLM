import { IsObject, IsOptional, IsString } from 'class-validator';

import { CreateProfileDto } from './create-profile.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
