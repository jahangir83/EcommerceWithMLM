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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { AuthenticateRequest } from 'src/common/types/user.type';
import { UpdateProfileDto } from './dto/update-profile.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Post('profile/create')
  @Roles(UserRole.ADMIN, UserRole.USER)
  createProfile(
    @Body() profileDto: CreateProfileDto,
    @Req() req: AuthenticateRequest,
  ) {
    return this.userService.createProfile(req.user.id, profileDto);
  }

  @Get('profile')
  @Roles(UserRole.ADMIN, UserRole.USER, UserRole.VENDOR)
  async getProfile(@Req() req: AuthenticateRequest) {
    return this.userService.getProfile(req.user.id);
  }

  @Put('profile/update')
  @Roles(UserRole.ADMIN, UserRole.USER)
  async updateProfile(
    @Body() profileDto: UpdateProfileDto,
    @Req() req: AuthenticateRequest,
  ) {
    return this.userService.updateProfile(req.user.id, profileDto);
  }

  @Get('get-all-direct-referrals')
  @Roles(UserRole.ADMIN, UserRole.USER)
  async getReferrals(@Req() req: AuthenticateRequest) {
    return this.userService.getDirectReferrals(req.user.id);
  }

  @Get('get-all-users')
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
