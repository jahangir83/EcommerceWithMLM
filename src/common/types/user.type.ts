import { Request } from 'express';
import { UserRole } from '../enums/role.enum';
import { UserStatus, WalletType } from '../enums/common.enum';
import {
  Course,
  Subscription,
  Uddokta,
} from '~/entity/product-services';
import { Nominee } from '~/entity/users/nominee.entity';

export interface UserInterface {
  id: string;
  username: string;
  phone: string;
  password: string;
  role: UserRole;
  referralCode?: string | null;
  referredById?: string | null;
  referrals?: UserInterface[]; // recursive interface
  referredBy?: UserInterface | null; // optional and nullable
  generation: number;
  leadershipId?: number;
  designation?: string;
  totalDirectReferrals?: number;
  isActive: boolean;
  avatar?: string | null;
  status?: UserStatus;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  isReferralCodeUsed?: boolean;
  profile?: ProfileInterface | null;
  nominee?:Nominee | null
  subscriptionService?: Subscription | null; // optional and nullable

  uddokta?: Uddokta | null; // optional and nullable

  course?: Course | null; // optional and nullable

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProfileInterface {
  id: string;
  fullName: string;
  email: string;
  fatherName?: string;
  motherName?: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other';
  religion?: string;
  maritalStatus?: 'single' | 'married' | 'divorced';
  nationalId?: string;
  geoLocation?: string;
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  village?: string;
  postOffice?: string;
  road?: string;
  houseNo?: string;
  postalCode?: string;
  userId?: string;
  extraInfo?: JSON;
  user?: UserInterface; // optional and nullable
  nidFront: string;
  nidBack: string;

  blood: string;
  geolocation: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticateRequest extends Request {
  user: JwtPayload;
}

export interface WalletInterface {
  id: string;
  balance: number;
  walletType: WalletType;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface TargetType {
  targetName: string;
  targetType: 'number' | 'string';
  query: string;
  model: string;
  method: string;
  value: string;
}

export interface LeaderShipDisignationInterface {
  id: number;
  name: string;
  target: TargetType[];
  targetContent: string;
  description?: string;
  award: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
