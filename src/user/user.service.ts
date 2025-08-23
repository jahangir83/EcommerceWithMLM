import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, In } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfile, User } from '~/entity/index';
import { UserRole } from '~/common/enums/role.enum';
import { UserInterface } from '~/common/types/user.type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,
  ) { }

  async getProfile(userId: string): Promise<UserProfile> {
    try {
      const profile = await this.userProfileRepo.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
      });

      if (!profile) throw new NotFoundException('Profile not found!.');

      return profile;
    } catch (error) {
      throw error;
    }
  }

  async createProfile(userId: string, profileDto: CreateProfileDto): Promise<UserProfile> {

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) throw new NotFoundException('User not found!.');
    if (user.profile) throw new BadRequestException('Profile already exists.');


    // Check email uniqueness
    const existingProfile = await this.userProfileRepo.findOne({
      where: { email: profileDto.email },
    });
    if (existingProfile) {
      throw new BadRequestException('Email is already in use.');
    }

    try {
      const profile = this.userProfileRepo.create({ ...profileDto, user });
      return await this.userProfileRepo.save(profile);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to create prodile: ${error.message}`);
    }
  }

  async updateProfile(userId: string, profileDto: UpdateProfileDto): Promise<UserProfile> {
    try {
      const profile = await this.userProfileRepo.findOne({
        where: { user: { id: userId } },
      });

      if (!profile) {
        const user = await this.userRepo.findOneBy({ id: userId })
        if (!user) {
          throw new NotFoundException(`User not found`);
        }
        const profile = this.userProfileRepo.create({ ...profileDto, user });
        return await this.userProfileRepo.save(profile);

      }

      Object.assign(profile, profileDto);

      return await this.userProfileRepo.save(profile);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getDirectReferrals(userId: string): Promise<User> {
    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['referrals'],
      });

      if (!user) throw new NotFoundException('User not found!.');

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepo.find({
        where: {
          role: Not(In([UserRole.DEVELOPER, UserRole.ADMIN])),
        },
        select: {
          id: true,
          username: true,
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
          },
        },
        relations: ['referredBy'],
        order: {
          updatedAt: 'DESC',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
