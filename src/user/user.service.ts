import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, In } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfile, User } from '~/entity/index';
import { UserRole } from '~/common/enums/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepo: Repository<UserProfile>,
  ) { }

  async getProfile(userId: string): Promise<UserProfile> {
    const profile = await this.userProfileRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) throw new NotFoundException('Profile not found!.');

    return profile;
  }

  async createProfile(
    userId: string,
    profileDto: CreateProfileDto,
  ): Promise<UserProfile> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) throw new NotFoundException('User not found!.');
    if (user.profile) throw new BadRequestException('Profile already exists.');

    const profile = this.userProfileRepo.create({ ...profileDto, user });

    return this.userProfileRepo.save(profile);
  }

  async updateProfile(
    userId: string,
    profileDto: UpdateProfileDto,
  ): Promise<any> {
    const profile = await this.userProfileRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!profile) throw new NotFoundException('Profile not found!.');

    Object.assign(profile, profileDto);
    return this.userProfileRepo.save(profile);
  }

  async getDirectReferrals(
    userId: string,
  ): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId },

      relations: ['referrals'],

    });

    if (!user) throw new NotFoundException('User not found!.');

    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepo.find({
      where: {
        role: Not(In([UserRole.DEVELOPER, UserRole.ADMIN])), // Exclude DEVELOPER and ADMIN roles
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        generation: true,
        designation: true,
        status: true,
        totalDirectReferrals: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        referredBy: {
          id: true,
          username: true,
        }
      },
      relations: ['referredBy'],

      order: {
        updatedAt: 'DESC',
      },
    });
  }
}
