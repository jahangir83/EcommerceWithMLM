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
export class Course implements ServiceInterface {
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
    default: UserStatus.ADVANCED_ASSOCIATE,
  })
  serviceStatus: UserStatus;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, (user) => user.course, { cascade: true })
  users: User[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
