import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Entity,
} from 'typeorm';
import { ServiceInterface } from '~/common/types/services.type';
import { User } from '../users/user.entity';
import { UserStatus } from '~/common/enums/common.enum';

@Entity()
export class Subscription implements ServiceInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  price: string;

  @Column()
  serviceName: string;

  @Column()
  type: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ADVANCED_ACCESS_USER,
  })
  serviceStatus: UserStatus;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => User, (user: User) => user.subscription, {
    cascade: true,
  })
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
