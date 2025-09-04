import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/index';
import { DataSource, Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserRole } from 'src/common/enums/role.enum';
import { CreateAdminDto } from './dto/admin.dto';
import { LeaderShipDisignation } from '../entity/users/leadership-digisnation.entity';
import { UserInactiveException } from '~/common/exceptions/user-inactive.exception';
import { VerifyService } from './verify.service';
import { Verify, VerifyType } from '~/entity/users/verify.entity';




@Injectable()
export class AuthService {


  constructor(

    private dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    // @InjectRepository(Verify)
    // private readonly verifyRepo: Repository<Verify>,
    private readonly jwtService: JwtService,
    private readonly verifyService: VerifyService,
  ) { }


  public parseExpires(expr: string): number {
    const m = String(expr).match(/^(\d+)([smhd])$/i);
    if (!m) return Number(expr) || 0;
    const v = Number(m[1]);
    const unit = m[2].toLowerCase();
    switch (unit) {
      case 's': return v;
      case 'm': return v * 60;
      case 'h': return v * 3600;
      case 'd': return v * 86400;
      default: return 0;
    }
  }

  async register(dto: RegisterDto): Promise<any> {
    try {
      const existingUser = await this.userRepo.findOne({
        where: { phone: dto.phone },
      });

      if (existingUser) {

        throw new ConflictException('Phone number already registered');

      }

      if (!await this.verifyService.isVerified(VerifyType.PHONE, dto.phone)) {
        throw new ConflictException("Phone number not verified yet.")
      }


      // --- END STEP 1 ---

      let isActive = false;
      let referredBy: User | null = null;

      if (dto.referralCode) {
        referredBy = await this.userRepo.findOne({
          where: { referralCode: dto.referralCode },
        });

        if (!referredBy) {
          throw new UnauthorizedException('Invalid referral code');
        }


      }
      isActive = true; // User becomes active if referred
      const hashed = await bcrypt.hash(dto.password, 10);

      const user = this.userRepo.create({
        username: dto.username,
        phone: dto.phone,
        password: hashed,
        avatar: dto.avatar,
        isActive,
        referredBy: referredBy ?? undefined,
        referredById: referredBy?.id,
        generation: referredBy ? referredBy.generation + 1 : 0,
      });

      // Save new user first
      const { id, phone, role } = await this.userRepo.save(user);

      // Update referrer's stats if exists
      // This part should be wrapped in a transaction along with the newUser save
      // for atomicity in a real application, but for now, this works.
      if (referredBy) {
        referredBy.totalDirectReferrals += 1;
        await this.userRepo.save(referredBy);
        // await this.updateLeadership(referredBy); // Call updateLeadership here
      }

      const { access_token, expires_in, token_type, refresh_token } = await this.issueTokens({ id, phone, role })
      return {
        user: {
          id: user.id,
          role: user.role,
          username: user.username,
          phone: user.phone,
          avatar: user.avatar,
          referralCode: user.referralCode,
          isActive: user.isActive,

        },
        access_token,
        expires_in,
        token_type,
        refresh_token
      }

    } catch (e) {
      throw e
    }

  }



  async validateUser(dto: LoginDto): Promise<Pick<User, "id" | "phone" |
    "role" | "referralCode">> {

    const user = await this.userRepo.findOne({
      where: [
        {
          phone: dto.phone
        },
        { phone: `+88${dto.phone}` }
      ],
      select: {
        id: true,
        phone: true,
        role: true,
        referralCode: true,
        password: true,
        isActive: true
      }
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UserInactiveException();
    }

    const payload: Pick<User, "id" | "phone" | "role" | "referralCode"> = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      referralCode: user.referralCode,
    };

    return payload;

  }


  async issueTokens(user: Pick<User, "id" | "phone" | "role">) {
    const payload = { sub: user.id, role: user.role, phone: user.phone };

    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'access_secret_dev',
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15d',
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_dev',
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
    });

    return {
      access_token,
      refresh_token,
      token_type: 'Bearer',
      expires_in: this.parseExpires(process.env.JWT_ACCESS_EXPIRES || '15m'),
    };
  }


  generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase(); // e.g., 'K9X3T2'
  }

  /**
   * 
   * @param user 
   * This method updates the user's leadership level based on their total direct referrals.
   */
  async updateLeadership(user: User, visited = new Set<string>()) {
    // --- Safety net: Prevent infinite recursion in case of circular referrals
    if (visited.has(user.id)) return;
    visited.add(user.id);

    // --- Stop early if user doesn't meet minimum condition to even check leadership
    if (user.totalDirectReferrals <= 10) return;

    // --- Get the next leadership level definition
    const nextLeadership = await this.dataSource
      .getRepository(LeaderShipDisignation)
      .findOne({
        where: { id: user.leadershipId + 1 },
      });

    if (!nextLeadership) return; // No higher level available

    // --- Check if all targets are met
    const targetResults: Record<string, boolean> = {};

    for (const target of nextLeadership.target) {
      const repo = this.dataSource.getRepository(target.model);

      // Make sure the method exists in the repo
      if (typeof repo[target.method] !== "function") {
        console.warn(`Method ${target.method} not found in model ${target.model}`);
        targetResults[target.targetName] = false;
        continue;
      }

      const result = await repo[target.method](target.query);

      if (target.targetType === "number") {
        targetResults[target.targetName] = Number(result) >= Number(target.value);
      } else {
        targetResults[target.targetName] = result === target.value;
      }
    }

    const allTargetsMet = Object.values(targetResults).every(Boolean);

    // --- Promote user if all targets are satisfied
    if (allTargetsMet) {
      user.leadershipId = nextLeadership.id;
      user.designation = nextLeadership.name;
      await this.userRepo.save(user);

      // Recursively try to update the parent (upline)
      if (user.referredById) {
        const parentUser = await this.userRepo.findOne({
          where: { id: user.referredById },
          relations: ["referredBy"],
        });

        if (parentUser) {
          await this.updateLeadership(parentUser, visited);
        }
      }
    }
  }


  /**
   * Assigns a referral code to a user.
   * @param dto - The data transfer object containing user ID and referral code.
   * @returns A success message.
   */
  async assignReferralCode(dto: { userId: string, referralCode: string }) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the user is already active or already has a referral code
    // The original code uses an OR, which means if either is true, it throws
    if (user.isActive || user.referralCode) {
      throw new BadRequestException('User already active or has a referral code');
    }

    const referredBy = await this.userRepo.findOne({
      where: { referralCode: dto.referralCode },
      relations: ['referrals'], // 'referrals' is the property name in User entity
    });

    if (!referredBy) {
      throw new NotFoundException('Referral code invalid or referrer not found');
    }

    // const newReferralCode = this.generateReferralCode();

    // Assign referral details to the new user
    user.referredBy = referredBy; // Establishes the relationship
    user.referredById = referredBy.id; // Sets the foreign key
    user.generation = referredBy.generation + 1; // Increment generation
    user.isActive = true; // Mark user as active
    // user.referralCode = newReferralCode; // Assign the new user's own referral code

    // Update the referrer's direct referral count
    referredBy.totalDirectReferrals += 1;

    // Save both entities in a single transaction if possible (TypeORM handles this for arrays)
    await this.userRepo.save([user, referredBy]);

    // Update leadership structure (e.g., for indirect referrals, bonus distribution)
    // await this.updateLeadership(referredBy);

    return { message: 'Referral assigned successfully' };
  }

  /**
   * Creates a root user with predefined credentials.
   * This method is intended for initial setup and should be protected.
   */
  async createRootUser() {
    try {

      // Check if a root user already exists
      // This prevents creating multiple root users, which could lead to conflicts.

      const existingRoot = await this.userRepo.findOne({
        where: { phone: '0000000000' },
      });
      if (existingRoot) return { message: 'Root user already exists' };

      const password = await bcrypt.hash('Jahangir9900', 10);

      // const rootUser = this.userRepo.create({
      //   name: 'Root Admin',
      //   email: 'root@system.com',
      //   phone: '0000000000',
      //   password,
      //   role: UserRole.ADMIN,
      //   isActive: true,
      //   referralCode: 'ROOT',
      //   generation: 0,
      //   leadershipLevel: 0,
      //   totalDirectReferrals: 0,
      // });

      // await this.userRepo.save(rootUser);
    } catch (error) {
      console.error('Error creating root user:', error);
      throw new BadRequestException('Failed to create root user');
    }
  }


  async createAdmin(dto: CreateAdminDto) {

    if (dto.secret !== "jahangir9900") {
      throw new BadRequestException('Invalid credentials provided');
    }

    // Check if an admin with the same phone or email already exists
    const existingAdmin = await this.userRepo.findOne({
      where:
        { phone: dto.phone }
    });
    if (existingAdmin) {
      throw new ConflictException('Admin with this phone or email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const admin = this.userRepo.create({
      username: dto.username,
      phone: dto.phone,
      password: hashedPassword,
      avatar: dto.avatar,
      referralCode: this.generateReferralCode(),
      role: dto.role,

    });
    admin.isActive = true; // Ensure the admin is active
    return this.userRepo.save(admin);
  }

  async createDeveloper(dto: CreateAdminDto) {

    try {
      if (dto.secret !== "jahangir9900") {
        throw new BadRequestException('Invalid credentials provided');
      }

      const existingDeveloper = await this.userRepo.findOne({
        where: { role: UserRole.DEVELOPER, phone: "+8801631551390" },
      })

      if (existingDeveloper) {
        return new BadRequestException('Developer already exists');
      }

      // const developer = this.userRepo.create({
      //   name: "MD Jahangir Alam",
      //   email: "jahangir.alam.dev83@gmail.com",
      //   phone: "+8801631551390",
      //   password: await bcrypt.hash(dto.password, 10),
      //   role: UserRole.DEVELOPER,
      //   isActive: true,
      //   referralCode: this.generateReferralCode(),
      //   generation: 0,
      //   leadershipLevel: 0,
      //   totalDirectReferrals: 0,
      //   wallet: 0,
      // });

      // await this.userRepo.save(developer);

      return { message: 'Thanks!' };
    } catch (error) {
      console.error('Error creating developer:', error);
      throw new BadRequestException('Failed to create developer');
    }
  }

  async refreshToken(dto: {}): Promise<{ token: string }> {
    // Example implementation: You should replace this with your actual logic.
    // For demonstration, we'll just return a dummy token.
    const token = this.jwtService.sign({ ...dto });
    return { token };
  }

  async sessionValidate(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException("User not found!")
    }

    return {
        id: user.id,
        role: user.role,
        username: user.username,
        phone: user.phone,
        avatar: user.avatar,
        referralCode: user.referralCode,
        isActive: user.isActive,
      
    }
  }

}
