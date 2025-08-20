import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { Wallet } from './wallet.entity';
import { Withdrawal } from '../product-services/withdrawal.entity';
import { Transaction } from '../transactions/transaction.entity';
import { UserRole } from 'src/common/enums/role.enum';
import { UserStatus } from '~/common/enums/common.enum';
import { UserInterface } from '~/common/types/user.type';
import { Course, Subscription, Uddokta } from '../product-services';
import { Payment } from '~/payments/entities/payment.entity';
import { Order } from '~/orders/entities/order.entity';
import { Verify } from './verify.entity';

@Entity('users')
export class User implements UserInterface {
  @PrimaryGeneratedColumn('uuid') @Index()
  id: string;
  @Column()
  username: string;
  @Column({ nullable: true, unique: true })
  email: string;
  @Column({ unique: true })
  phone: string;
  @Column()
  password: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;
  @Column({ nullable: true })
  avatar: string;

  @Column({ unique: true, nullable: true })
  referralCode: string;

  @Column({ nullable: true, type: 'uuid' })
  referredById: string;

  @OneToMany(() => User, (u) => u.referredBy)
  referrals: User[];

  @ManyToOne(() => User, (u) => u.referrals)
  @JoinColumn({ name: 'referredById' })
  referredBy: User;

  // 👇 This is the missing part
  @OneToMany(() => Verify, (verify) => verify.user, {
    cascade: true,
  })
  verifications: Verify[];

  @Column({ default: 0 }) generation: number;
  @Column({ default: 0 }) leadershipId: number;
  @Column({ default: '' }) designation: string;
  @Column({ default: 0 }) totalDirectReferrals: number;

  @Column({ default: false }) isActive: boolean;
  @Column({ type: 'enum', enum: UserStatus, nullable: true })
  status: UserStatus;

  @Column({ default: false }) isPhoneVerified: boolean;
  @Column({ default: false }) isEmailVerified: boolean;
  @Column({ default: false }) isReferralCodeUsed: boolean;

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile: UserProfile;

  // subscriptions ... keep your mappings
  // ...

  @OneToMany(() => Wallet, (w) => w.user) wallets: Wallet[];
  @OneToMany(() => Order, (o) => o.user) orders: Order[];
  @OneToMany(() => Payment, (p) => p.user) payments: Payment[];
  @OneToMany(() => Withdrawal, (w) => w.user) withdrawals: Withdrawal[];
  @OneToMany(() => Transaction, (t) => t.user) transactions: Transaction[];

  @ManyToOne(() => Course, (c) => c.users, { nullable: true })
  @JoinColumn({ name: 'courseId' })
  course: Course | null;
  @ManyToOne(() => Uddokta, (u) => u.users, { nullable: true })
  @JoinColumn({ name: 'uddoktaId' })
  uddokta: Uddokta | null;

  @ManyToOne(() => Subscription, (s) => s.users, { nullable: true })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription | null;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
