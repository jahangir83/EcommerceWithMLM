import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { AuthenticateRequest } from 'src/common/types/user.type';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('User')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post('profile/create')
  @Roles(UserRole.ADMIN, UserRole.USER)
  @ApiOperation({ summary: 'Create user profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully.' })
  @ApiResponse({ status: 400, description: 'Profile already exists.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async createProfile(
    @Body() profileDto: CreateProfileDto,
    @Req() req: AuthenticateRequest,
  ) {
    // try {
    return await this.userService.createProfile(req.user.id, profileDto);
    // } catch (error) {
    //   throw error;
    // }
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
  async updateProfile(
    @Body() profileDto: UpdateProfileDto,
    @Req() req: AuthenticateRequest,
  ) {

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
