import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { AuthenticateRequest } from 'src/common/types/user.type';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ProfileUploadConfig } from '~/config/multer.config';

@ApiTags('User')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('profile/create')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Create user profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully.' })
  @ApiResponse({ status: 400, description: 'Profile already exists.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiBody({type: CreateProfileDto})
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'nidFront', maxCount: 1 },
    { name: 'nidBack', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 },
  ],
    ProfileUploadConfig))
  async createProfile(
    @Body() profileDto: CreateProfileDto,
    @Req() req: AuthenticateRequest,
    @UploadedFiles() files: {
      nidFront?: Express.Multer.File[];
      nidBack?: Express.Multer.File[];
      profilePhoto?: Express.Multer.File[];
    }
  ) {
    try {
      if (files?.nidFront?.[0]) {
        profileDto.nidFront = files.nidFront[0].path;
      }
      if (files?.nidBack?.[0]) {
        profileDto.nidBack = files.nidBack[0].path;
      }
      if (files?.profilePhoto?.[0]) {
        profileDto.profilePhoto = files.profilePhoto[0].path;
      }
    } catch (error) {
      throw new BadRequestException("File system error")
    }
    return await this.userService.createProfile(req.user.id, profileDto);

  }

  @Get('profile')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.VENDOR)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })



  async getProfile(@Req() req: AuthenticateRequest) {
    try {
      return await this.userService.getProfile(req.user.id);
    } catch (error) {
      throw error;
    }
  }

  @Put('profile/update')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  @ApiResponse({ status: 404, description: 'Profile not found.' })
  @ApiBody({type:UpdateProfileDto})
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'nidFront', maxCount: 1 },
    { name: 'nidBack', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 },
  ],
    ProfileUploadConfig))

  async updateProfile(
    @Body() profileDto: UpdateProfileDto,
    @Req() req: AuthenticateRequest,
    @UploadedFiles() files: Express.Multer.File[],
  ) {

    try {
      if (files?.length) {
        files.forEach(file => {
          if (file.fieldname === 'nidFront') profileDto.nidFront = file.path;
          if (file.fieldname === 'nidBack') profileDto.nidBack = file.path;
          if (file.fieldname === 'profilePhoto') profileDto.profilePhoto = file.path;
        });
      }
    } catch (error) {
      throw new BadRequestException("File system error")
    }
    return await this.userService.updateProfile(req.user.id, profileDto);

  }

  @Get('direct-referrals')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Get direct referrals of a user' })
  @ApiResponse({ status: 200, description: 'Direct referrals fetched successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getReferrals(@Req() req: AuthenticateRequest) {
    try {
      return await this.userService.getDirectReferrals(req.user.id);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users (excluding admins & developers)' })
  @ApiResponse({ status: 200, description: 'List of users fetched successfully.' })
  async getAllUsers() {
    try {
      return await this.userService.getAllUsers();
    } catch (error) {
      throw error;
    }
  }
}
