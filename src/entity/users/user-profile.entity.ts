import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ProfileInterface } from 'src/common/types/user.type';

// User profile
@Entity('profiles')
export class UserProfile implements ProfileInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({nullable:false})
  fullName: string;

  @Column({nullable:false})
  email: string;

  @Column({ nullable: true })
  fatherName?: string;

  @Column({ nullable: true })
  motherName?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender?: 'male' | 'female' | 'other';

  @Column({ nullable: true })
  religion?: string;

  @Column({ type: 'enum', enum: ['single', 'married', 'divorced'], nullable: true })
  maritalStatus?: 'single' | 'married' | 'divorced';

  @Column({ nullable: true })
  nationalId?: string;

  @Column({ nullable: true })
  geoLocation?: string;

  @Column({ nullable: true })
  division?: string;

  @Column({ nullable: true })
  district?: string;

  @Column({ nullable: true })
  upazila?: string;

  @Column({ nullable: true })
  union?: string;

  @Column({ nullable: true })
  village?: string;

  @Column({ nullable: true })
  postOffice?: string;

  @Column({ nullable: true })
  road?: string;

  @Column({ nullable: true })
  houseNo?: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ type: 'jsonb', nullable: true })
  extraInfo: JSON;

  @Column({nullable:true})
  nidFront: string;

  @Column({nullable:true})
  nidBack: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

}
